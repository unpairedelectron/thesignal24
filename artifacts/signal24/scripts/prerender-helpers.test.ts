import assert from 'node:assert/strict';
import test from 'node:test';
import { isPublicIndexableStory, isSafePrerenderPath } from './prerender-helpers';

test('only published, indexable stories enter the public prerender set', () => {
  const published = { canonicalPath: '/articles/public-record', workflowStatus: 'published', indexable: true };
  assert.equal(isPublicIndexableStory(published), true);
  assert.equal(isPublicIndexableStory({ ...published, workflowStatus: 'draft' }), false);
  assert.equal(isPublicIndexableStory({ ...published, workflowStatus: 'review' }), false);
  assert.equal(isPublicIndexableStory({ ...published, indexable: false }), false);
});

test('prerender paths cannot escape the public output directory', () => {
  for (const path of ['/articles/../private', '/articles/%2e%2e/private', '/articles/%ZZ', '//outside/path', '/a\\b', '/a?query=1', '/a#fragment']) {
    assert.equal(isSafePrerenderPath(path), false, `Expected unsafe path to be rejected: ${path}`);
  }
  assert.equal(isSafePrerenderPath('/articles/a-source-linked-story'), true);
  assert.equal(isSafePrerenderPath('/hi/policies/a-policy-record'), true);
});
