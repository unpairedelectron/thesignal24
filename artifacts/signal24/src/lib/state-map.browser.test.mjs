import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import { EventEmitter, once } from 'node:events';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { test } from 'node:test';
import {
  getMapFeatureName,
  getStateLinkedStories,
  getStateNames,
  getStoriesForState,
  stateNameKey,
} from './state-map.ts';

const baseUrl = new URL(
  process.env.SIGNAL24_BROWSER_TEST_URL
    ?? (process.env.REPLIT_DEV_DOMAIN
      ? `https://${process.env.REPLIT_DEV_DOMAIN}/`
      : 'http://localhost:80/'),
);
const snapshotExpression = (missingStateSlug) => `(() => {
  const buttons = [...document.querySelectorAll('button[data-testid^="button-map-state-"]')];
  const selectedButton = buttons.find((button) => button.getAttribute('aria-pressed') === 'true');
  const selectedMapShape = [...document.querySelectorAll('[data-testid^="map-state-shape-"]')]
    .find((shape) => shape.getAttribute('aria-pressed') === 'true');
  return {
    selectedState: selectedButton?.querySelector('span')?.textContent?.trim() ?? null,
    selectedMapState: selectedMapShape?.getAttribute('aria-label')?.replace(/^Select /, '') ?? null,
    focusedTestId: document.activeElement?.getAttribute('data-testid') ?? null,
    stateParam: new URLSearchParams(location.search).get('state'),
    recordTitles: [...document.querySelectorAll('#india-in-focus h3')].map((heading) => heading.textContent?.trim()),
    unmappedNote: document.querySelector('[data-testid="note-unmapped-map-states"]')?.textContent ?? '',
    unavailableNote: document.querySelector('[data-testid="note-unavailable-state"]')?.textContent ?? '',
    showAllFromUnavailable: Boolean(document.querySelector('[data-testid="button-show-all-states-from-unavailable"]')),
    missingStateHasMapShape: Boolean(document.querySelector('[data-testid="map-state-shape-${missingStateSlug}"]')),
  };
})()`;

class DevToolsConnection {
  constructor(socket) {
    this.socket = socket;
    this.events = new EventEmitter();
    this.nextId = 0;
    this.pending = new Map();
    socket.addEventListener('message', ({ data }) => {
      const message = JSON.parse(String(data));
      if (message.id) {
        const pending = this.pending.get(message.id);
        if (!pending) return;
        this.pending.delete(message.id);
        clearTimeout(pending.timeout);
        if (message.error) pending.reject(new Error(message.error.message));
        else pending.resolve(message.result);
      } else {
        this.events.emit('event', message);
      }
    });
    socket.addEventListener('close', () => {
      for (const pending of this.pending.values()) {
        clearTimeout(pending.timeout);
        pending.reject(new Error('Chromium closed the DevTools connection.'));
      }
      this.pending.clear();
    });
  }

  send(method, params = {}, sessionId) {
    const id = ++this.nextId;
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`Chromium DevTools command timed out: ${method}`));
      }, 15_000);
      this.pending.set(id, { resolve, reject, timeout });
      this.socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    });
  }

  waitForEvent(method, sessionId, timeoutMs = 15_000) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.events.off('event', handler);
        reject(new Error(`Timed out waiting for Chromium event: ${method}`));
      }, timeoutMs);
      const handler = (message) => {
        if (message.method !== method || (sessionId && message.sessionId !== sessionId)) return;
        clearTimeout(timeout);
        this.events.off('event', handler);
        resolve(message.params);
      };
      this.events.on('event', handler);
    });
  }
}

async function launchBrowser() {
  const executable = process.env.CHROMIUM_PATH ?? '/repl/tools/bin/chromium';
  assert.ok(existsSync(executable), `Chromium was not found at ${executable}; set CHROMIUM_PATH to its executable.`);
  const profileDir = await mkdtemp(join(tmpdir(), 'signal24-chromium-'));
  const processHandle = spawn(executable, [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--disable-background-networking',
    '--no-first-run',
    '--no-default-browser-check',
    '--remote-allow-origins=*',
    '--remote-debugging-port=0',
    `--user-data-dir=${profileDir}`,
    'about:blank',
  ], { stdio: ['ignore', 'ignore', 'pipe'] });
  let stderr = '';
  processHandle.stderr.setEncoding('utf8');

  const endpoint = await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(`Chromium did not start DevTools. ${stderr}`)), 15_000);
    processHandle.stderr.on('data', (chunk) => {
      stderr += chunk;
      const match = stderr.match(/DevTools listening on (ws:\/\/\S+)/);
      if (match) {
        clearTimeout(timeout);
        resolve(match[1]);
      }
    });
    processHandle.once('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    processHandle.once('exit', (code) => {
      clearTimeout(timeout);
      reject(new Error(`Chromium exited before DevTools started (code ${code}). ${stderr}`));
    });
  });
  const socket = new WebSocket(endpoint);
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Timed out connecting to Chromium DevTools.')), 10_000);
    socket.addEventListener('open', () => {
      clearTimeout(timeout);
      resolve();
    }, { once: true });
    socket.addEventListener('error', () => {
      clearTimeout(timeout);
      reject(new Error('Could not connect to Chromium DevTools.'));
    }, { once: true });
  });
  const connection = new DevToolsConnection(socket);
  const { targetId } = await connection.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await connection.send('Target.attachToTarget', { targetId, flatten: true });
  await connection.send('Page.enable', {}, sessionId);
  await connection.send('Runtime.enable', {}, sessionId);

  return {
    async evaluate(expression) {
      const response = await connection.send('Runtime.evaluate', {
        expression,
        awaitPromise: true,
        returnByValue: true,
      }, sessionId);
      if (response.exceptionDetails) {
        throw new Error(response.exceptionDetails.text ?? 'Browser expression failed.');
      }
      return response.result?.value ?? null;
    },
    async addScriptOnNewDocument(source) {
      await connection.send('Page.addScriptToEvaluateOnNewDocument', { source }, sessionId);
    },
    async navigate(url) {
      const loaded = connection.waitForEvent('Page.loadEventFired', sessionId);
      await connection.send('Page.navigate', { url }, sessionId);
      await loaded;
    },
    async reload() {
      const loaded = connection.waitForEvent('Page.loadEventFired', sessionId);
      await connection.send('Page.reload', {}, sessionId);
      await loaded;
    },
    async pressKey(key) {
      const keyInfo = key === 'Enter'
        ? { key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13 }
        : key === ' '
          ? { key: ' ', code: 'Space', windowsVirtualKeyCode: 32, nativeVirtualKeyCode: 32 }
          : key === 'Tab'
            ? { key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9, nativeVirtualKeyCode: 9 }
            : null;
      assert.ok(keyInfo, `Unsupported browser-test key: ${key}`);
      await connection.send('Input.dispatchKeyEvent', { type: 'keyDown', ...keyInfo }, sessionId);
      await connection.send('Input.dispatchKeyEvent', { type: 'keyUp', ...keyInfo }, sessionId);
    },
    async focusByTestId(testId) {
      return this.evaluate(`(() => {
        const element = [...document.querySelectorAll('[data-testid]')]
          .find((candidate) => candidate.getAttribute('data-testid') === ${JSON.stringify(testId)});
        element?.focus();
        return document.activeElement === element;
      })()`);
    },
    async tabToTestId(testId) {
      const focusedPrevious = await this.evaluate(`(() => {
        const focusable = [...document.querySelectorAll(
          'a[href], area[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])',
        )].filter((element) => element.getClientRects().length > 0);
        const targetIndex = focusable.findIndex((element) => element.getAttribute('data-testid') === ${JSON.stringify(testId)});
        if (targetIndex <= 0) return false;
        focusable[targetIndex - 1].focus();
        return document.activeElement === focusable[targetIndex - 1];
      })()`);
      assert.equal(focusedPrevious, true, `Could not move keyboard focus to the stop before ${testId}.`);
      await this.pressKey('Tab');
      return this.waitFor(
        `document.activeElement?.getAttribute('data-testid') ?? null`,
        (focusedTestId) => focusedTestId === testId,
        `keyboard focus on ${testId}`,
      );
    },
    async waitFor(expression, predicate, description) {
      const deadline = Date.now() + 30_000;
      let lastValue = null;
      while (Date.now() < deadline) {
        lastValue = await this.evaluate(expression);
        if (predicate(lastValue)) return lastValue;
        await delay(150);
      }
      throw new Error(`Timed out waiting for ${description}. Last browser state: ${JSON.stringify(lastValue)}`);
    },
    async close() {
      socket.close();
      if (processHandle.exitCode === null) {
        const exited = once(processHandle, 'exit').catch(() => {});
        processHandle.kill('SIGTERM');
        await Promise.race([exited, delay(2_000)]);
        if (processHandle.exitCode === null) processHandle.kill('SIGKILL');
      }
      await rm(profileDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
    },
  };
}

function slugify(value) {
  return value.toLocaleLowerCase('en-IN').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function expectedTitles(stories, stateName) {
  return getStoriesForState(
    stories.filter((story) => story.workflowStatus === 'published')
      .sort((a, b) => (b.publishedOn ?? b.recordDate ?? '').localeCompare(a.publishedOn ?? a.recordDate ?? '')),
    stateName,
  ).map((story) => story.title);
}

test('state links restore records across reload and browser history, including a list-only state', async (t) => {
  const archiveResponse = await fetch(new URL('/api/archive?limit=100', baseUrl));
  assert.equal(archiveResponse.ok, true, `Could not load the archive from ${new URL('/api/archive', baseUrl)}`);
  const archive = await archiveResponse.json();
  const mapResponse = await fetch(new URL('/data/india-states-simplified.geojson', baseUrl));
  assert.equal(mapResponse.ok, true, 'Could not load the local India map data.');
  assert.match(mapResponse.headers.get('content-type') ?? '', /json/i, 'The map URL must return GeoJSON, not the app shell.');
  const mapData = await mapResponse.json();
  const stateNames = getStateNames(getStateLinkedStories(archive.stories));
  const mapFeaturesByName = new Map(
    mapData.features.map((feature) => [stateNameKey(getMapFeatureName(feature) ?? ''), getMapFeatureName(feature)]),
  );
  const candidates = stateNames.filter((name) => mapFeaturesByName.has(stateNameKey(name)) && expectedTitles(archive.stories, name).length > 0);
  assert.ok(candidates.length >= 2, 'The published archive needs at least two map-linked states for this browser test.');
  const [listOnlyState, secondState] = candidates;
  const expectedListOnlyTitles = expectedTitles(archive.stories, listOnlyState);
  const expectedSecondTitles = expectedTitles(archive.stories, secondState);
  const removedStoryIds = getStoriesForState(archive.stories, listOnlyState).map((story) => story.id);
  const removedStoryIdSet = new Set(removedStoryIds);
  const expectedRecentTitles = getStateLinkedStories(archive.stories.filter(
    (story) => story.workflowStatus === 'published' && !removedStoryIdSet.has(story.id),
  ).sort((a, b) => (b.publishedOn ?? b.recordDate ?? '').localeCompare(a.publishedOn ?? a.recordDate ?? '')))
    .slice(0, 3).map((story) => story.title);
  const missingFeatureName = mapFeaturesByName.get(stateNameKey(listOnlyState));
  const missingStateSlug = slugify(listOnlyState);
  const browser = await launchBrowser();
  t.after(() => browser.close());

  const interceptMapScript = `(() => {
    const originalFetch = window.fetch.bind(window);
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      const requestUrl = typeof args[0] === 'string' ? args[0] : args[0]?.url;
      if (!response.ok || !requestUrl) return response;
      if (requestUrl.includes('/api/archive') && localStorage.getItem('signal24-hide-state-records') === 'true') {
        const data = await response.json();
        const removedStoryIds = ${JSON.stringify(removedStoryIds)};
        data.stories = data.stories.filter((story) => !removedStoryIds.includes(story.id));
        return new Response(JSON.stringify(data), { status: response.status, headers: { 'Content-Type': response.headers.get('content-type') ?? 'application/json' } });
      }
      if (!requestUrl.includes('india-states-simplified.geojson')) return response;
      const data = await response.json();
      const omittedName = ${JSON.stringify(missingFeatureName)};
      data.features = data.features.filter((feature) => (feature.properties?.NAME_1 ?? feature.properties?.name) !== omittedName);
      return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } });
    };
  })();`;
  await browser.addScriptOnNewDocument(interceptMapScript);
  const initialUrl = new URL(baseUrl);
  initialUrl.searchParams.set('state', listOnlyState);
  await browser.navigate(initialUrl.toString());

  const snapshotExpressionText = snapshotExpression(missingStateSlug);
  const waitForState = (stateName, expectedRecordTitles) => browser.waitFor(
    snapshotExpressionText,
    (snapshot) => snapshot?.selectedState === stateName
      && snapshot.stateParam === stateName
      && JSON.stringify(snapshot.recordTitles) === JSON.stringify(expectedRecordTitles),
    `state ${stateName} and its matching records`,
  );
  const assertStateControlsAligned = (snapshot, stateName, hasMapShape = true) => {
    assert.equal(snapshot.selectedState, stateName, 'The state-list aria-pressed value should match the selected state.');
    assert.equal(snapshot.stateParam, stateName, 'The address bar should match the selected state.');
    assert.equal(snapshot.selectedMapState, hasMapShape ? stateName : null, 'The map aria-pressed value should match the selected state when a shape exists.');
  };
  const clickState = async (stateName) => {
    const clicked = await browser.evaluate(`(() => {
      const button = [...document.querySelectorAll('button[data-testid^="button-map-state-"]')]
        .find((candidate) => candidate.querySelector('span')?.textContent?.trim() === ${JSON.stringify(stateName)});
      if (!button) return false;
      button.click();
      return true;
    })()`);
    assert.equal(clicked, true, `Could not select ${stateName} from the text state list.`);
  };

  let snapshot = await waitForState(listOnlyState, expectedListOnlyTitles);
  assert.equal(snapshot.missingStateHasMapShape, false, `${listOnlyState} should not have a rendered map shape in this test.`);
  assert.ok(snapshot.unmappedNote.includes(listOnlyState), 'The page should explain why this selected state has no matching map boundary.');

  await browser.reload();
  snapshot = await waitForState(listOnlyState, expectedListOnlyTitles);
  assert.equal(snapshot.missingStateHasMapShape, false, 'Reload should not make the list-only state depend on a map outline.');

  const firstListButton = `button-map-state-${slugify(listOnlyState)}`;
  const secondListButton = `button-map-state-${slugify(secondState)}`;
  await browser.tabToTestId(firstListButton);
  await browser.pressKey('Enter');
  snapshot = await waitForState(listOnlyState, expectedListOnlyTitles);
  assertStateControlsAligned(snapshot, listOnlyState, false);

  await browser.pressKey('Tab');
  snapshot = await browser.waitFor(
    snapshotExpressionText,
    (value) => value?.focusedTestId === secondListButton,
    `keyboard focus on the ${secondState} state-list button`,
  );
  await browser.pressKey(' ');
  snapshot = await waitForState(secondState, expectedSecondTitles);
  assertStateControlsAligned(snapshot, secondState);

  await browser.evaluate('history.back()');
  snapshot = await waitForState(listOnlyState, expectedListOnlyTitles);
  assertStateControlsAligned(snapshot, listOnlyState, false);
  assert.equal(snapshot.missingStateHasMapShape, false);
  await browser.evaluate('history.forward()');
  snapshot = await waitForState(secondState, expectedSecondTitles);
  assertStateControlsAligned(snapshot, secondState);

  const secondMapShape = `map-state-shape-${slugify(secondState)}`;
  const focusedMapShape = await browser.focusByTestId(secondMapShape);
  assert.equal(focusedMapShape, true, `The active map shape for ${secondState} should be focusable.`);
  await browser.pressKey('Enter');
  snapshot = await browser.waitFor(
    snapshotExpressionText,
    (value) => value?.selectedState === null && value.stateParam === null,
    'the all-states view after Enter on the selected map shape',
  );
  assert.equal(snapshot.selectedMapState, null, 'Enter should clear aria-pressed on the map shape.');
  await browser.pressKey(' ');
  snapshot = await waitForState(secondState, expectedSecondTitles);
  assertStateControlsAligned(snapshot, secondState);

  // Selecting the boundary-free state from its text-list entry must still work.
  assert.equal(await browser.focusByTestId(firstListButton), true, 'The list-only state button should be focusable.');
  await browser.pressKey(' ');
  snapshot = await waitForState(listOnlyState, expectedListOnlyTitles);
  assertStateControlsAligned(snapshot, listOnlyState, false);
  assert.equal(snapshot.missingStateHasMapShape, false);

  // A previously valid shared URL must not fall back to recent records if its state is no longer published.
  await browser.evaluate("localStorage.setItem('signal24-hide-state-records', 'true')");
  await browser.reload();
  snapshot = await browser.waitFor(
    snapshotExpressionText,
    (value) => value?.stateParam === listOnlyState && !value.selectedState
      && value.unavailableNote.includes(listOnlyState) && value.showAllFromUnavailable,
    `an unavailable-state explanation for ${listOnlyState}`,
  );
  assert.deepEqual(snapshot.recordTitles, [], 'An unavailable state link must not show recent records from other states.');
  assert.equal(snapshot.missingStateHasMapShape, false, 'An unavailable state must not appear selected on the map.');

  await browser.evaluate("document.querySelector('[data-testid=\"button-show-all-states-from-unavailable\"]')?.click()");
  await browser.waitFor(
    snapshotExpressionText,
    (value) => value?.stateParam === null && !value.selectedState
      && JSON.stringify(value.recordTitles) === JSON.stringify(expectedRecentTitles)
      && !value.unavailableNote,
    'the all-states view after clearing an unavailable state link',
  );
  await clickState(secondState);
  snapshot = await waitForState(secondState, expectedSecondTitles);
  assertStateControlsAligned(snapshot, secondState);
  assert.equal(snapshot.unavailableNote, '', 'Selecting a currently available state should clear the unavailable-link notice.');
});