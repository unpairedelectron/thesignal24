import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import {
  canonicalStateName,
  getMapFeatureName,
  getStateLinkedStories,
  getStateNames,
  getStoriesForState,
  getUnmappedStateNames,
  isMapSelectionKey,
  mapPath,
  parseStateMap,
  stateNameKey,
  toggleStateSelection,
} from './state-map.ts';

const mapUrl = new URL('../../public/data/india-states-simplified.geojson', import.meta.url);
const mapData = JSON.parse(await readFile(mapUrl, 'utf8'));

test('published state names resolve to named GeoJSON features, including current aliases', () => {
  const features = parseStateMap(mapData);
  const mapNames = new Set(features.map(getMapFeatureName).filter(Boolean).map(stateNameKey));

  const currentNames = [
    'Andaman and Nicobar Islands',
    'Andhra Pradesh',
    'Dadra and Nagar Haveli and Daman and Diu',
    'Odisha',
    'Uttarakhand',
    'West Bengal',
  ];
  for (const stateName of currentNames) {
    assert.ok(mapNames.has(stateNameKey(stateName)), `${stateName} should match a map feature`);
  }

  assert.equal(canonicalStateName('Orissa'), 'Odisha');
  assert.equal(canonicalStateName('Uttaranchal'), 'Uttarakhand');
  assert.equal(canonicalStateName('Dadra and Nagar Haveli'), 'Dadra and Nagar Haveli and Daman and Diu');
  assert.equal(canonicalStateName('Daman and Diu'), 'Dadra and Nagar Haveli and Daman and Diu');
  assert.ok(mapNames.has(stateNameKey('Orissa')));
  assert.ok(mapNames.has(stateNameKey('Uttaranchal')));
  assert.deepEqual(getUnmappedStateNames(currentNames, features), []);
  assert.ok(features.every((feature) => mapPath(feature.geometry.coordinates).length > 0));
});

test('state-list and map selection return the same records and selection behavior', () => {
  const stories = [
    { id: 'odisha-current', state: 'Odisha' },
    { id: 'odisha-legacy', state: 'Orissa' },
    { id: 'uttarakhand-current', state: 'Uttarakhand' },
    { id: 'uttarakhand-legacy', state: 'Uttaranchal' },
    { id: 'dnhi-current', state: 'Dadra and Nagar Haveli and Daman and Diu' },
    { id: 'national', state: 'National' },
    { id: 'national-spaced', state: ' National ' },
  ];
  const linkedStories = getStateLinkedStories(stories);
  const states = getStateNames(linkedStories);
  assert.deepEqual(states, [
    'Dadra and Nagar Haveli and Daman and Diu',
    'Odisha',
    'Uttarakhand',
  ]);

  const featureNames = ['Orissa', 'Uttaranchal', 'Dadra and Nagar Haveli', 'Daman and Diu'];
  for (const featureName of featureNames) {
    const listName = states.find((stateName) => stateNameKey(stateName) === stateNameKey(featureName));
    assert.ok(listName, `${featureName} should resolve to a list state`);
    assert.deepEqual(
      getStoriesForState(linkedStories, listName).map((story) => story.id),
      getStoriesForState(linkedStories, canonicalStateName(featureName)).map((story) => story.id),
    );
    assert.equal(toggleStateSelection(null, listName), toggleStateSelection(null, featureName));
  }

  assert.equal(toggleStateSelection('Odisha', 'Orissa'), null);
  assert.equal(toggleStateSelection(null, 'Uttaranchal'), 'Uttarakhand');
});

test('missing or malformed GeoJSON is rejected without affecting the text state list', () => {
  const stories = [{ state: 'Odisha' }, { state: 'Uttarakhand' }];
  const invalidCollections = [
    null,
    { type: 'FeatureCollection', features: [] },
    { type: 'FeatureCollection', features: [{ properties: { NAME_1: 'Odisha' } }] },
    {
      type: 'FeatureCollection',
      features: [{
        properties: { NAME_1: 'Odisha' },
        geometry: { type: 'Polygon', coordinates: [[['bad', 20], [80, 21], [81, 22], [82, 23]]] },
      }],
    },
  ];

  for (const invalid of invalidCollections) {
    assert.throws(() => parseStateMap(invalid));
  }
  assert.deepEqual(getStateNames(getStateLinkedStories(stories)), ['Odisha', 'Uttarakhand']);
  assert.deepEqual(getUnmappedStateNames(['Telangana'], mapData.features), ['Telangana']);
});

test('mapped states expose Enter and Space keyboard activation', () => {
  assert.equal(isMapSelectionKey('Enter'), true);
  assert.equal(isMapSelectionKey(' '), true);
  assert.equal(isMapSelectionKey('Tab'), false);
  assert.equal(toggleStateSelection(null, 'Uttaranchal'), 'Uttarakhand');
});