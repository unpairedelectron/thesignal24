import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import {
  canonicalStateName,
  getMapFeatureName,
  getSelectedStateFromSearch,
  getStateLinkedStories,
  getStateNames,
  getStoriesForState,
  getUnmappedStateNames,
  isMapSelectionKey,
  mapPath,
  parseStateMap,
  searchWithSelectedState,
  stateNameKey,
  toggleStateSelection,
  urlWithSelectedState,
} from './state-map.ts';

const mapUrl = new URL('../../public/data/india-states-simplified.geojson', import.meta.url);
const mapData = JSON.parse(await readFile(mapUrl, 'utf8'));

test('all current states and union territories resolve to named GeoJSON features', () => {
  const features = parseStateMap(mapData);
  const mapNames = new Set(features.map(getMapFeatureName).filter(Boolean).map(stateNameKey));

  const currentNames = [
    'Andaman and Nicobar Islands',
    'Andhra Pradesh',
    'Arunachal Pradesh',
    'Assam',
    'Bihar',
    'Chandigarh',
    'Chhattisgarh',
    'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi',
    'Goa',
    'Gujarat',
    'Haryana',
    'Himachal Pradesh',
    'Jammu and Kashmir',
    'Jharkhand',
    'Karnataka',
    'Kerala',
    'Ladakh',
    'Lakshadweep',
    'Madhya Pradesh',
    'Maharashtra',
    'Manipur',
    'Meghalaya',
    'Mizoram',
    'Nagaland',
    'Odisha',
    'Puducherry',
    'Punjab',
    'Rajasthan',
    'Sikkim',
    'Tamil Nadu',
    'Telangana',
    'Tripura',
    'Uttar Pradesh',
    'Uttarakhand',
    'West Bengal',
  ];
  assert.equal(features.length, 36);
  assert.equal(new Set(features.map((feature) => feature.properties.shapeISO)).size, 36);
  for (const stateName of currentNames) {
    assert.ok(mapNames.has(stateNameKey(stateName)), `${stateName} should match a map feature`);
  }
  assert.deepEqual(getUnmappedStateNames(currentNames, features), []);

  assert.equal(canonicalStateName('Orissa'), 'Odisha');
  assert.equal(canonicalStateName('Uttaranchal'), 'Uttarakhand');
  assert.equal(canonicalStateName('Andaman and Nicobar'), 'Andaman and Nicobar Islands');
  assert.equal(canonicalStateName('Dadra and Nagar Haveli'), 'Dadra and Nagar Haveli and Daman and Diu');
  assert.equal(canonicalStateName('Daman and Diu'), 'Dadra and Nagar Haveli and Daman and Diu');
  assert.equal(canonicalStateName('Mahārāshtra'), 'Maharashtra');
  assert.equal(canonicalStateName('Telangāna'), 'Telangana');
  for (const legacyName of ['Orissa', 'Uttaranchal', 'Andaman and Nicobar', 'Dadra and Nagar Haveli', 'Daman and Diu']) {
    assert.ok(mapNames.has(stateNameKey(legacyName)), `${legacyName} should resolve to its current feature`);
  }
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

test('state selections round-trip through stable URL search values', () => {
  const states = ['Odisha', 'Uttarakhand', 'Atlantis'];

  assert.equal(getSelectedStateFromSearch('?topic=States&state=Orissa', states), 'Odisha');
  assert.equal(getSelectedStateFromSearch('?state=Atlantis', states), 'Atlantis');
  assert.equal(getSelectedStateFromSearch('?state=Kerala', states), null);
  assert.equal(getSelectedStateFromSearch('?topic=States', states), null);

  assert.equal(
    searchWithSelectedState('?topic=States&state=Orissa', 'Odisha'),
    '?topic=States&state=Odisha',
  );
  assert.equal(
    searchWithSelectedState('?topic=States&state=Odisha', null),
    '?topic=States',
  );
  assert.equal(searchWithSelectedState('', 'Mahārāshtra'), '?state=Maharashtra');
  assert.equal(searchWithSelectedState('?state=Odisha', null), '');
});

test('copied state URLs preserve the current page, other query values, and hash', () => {
  assert.equal(
    urlWithSelectedState(
      'https://signal24.example/archive?topic=States&page=2&state=Orissa#india-in-focus',
      'Maharashtra',
    ),
    'https://signal24.example/archive?topic=States&page=2&state=Maharashtra#india-in-focus',
  );
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
  assert.deepEqual(getUnmappedStateNames(['Telangana'], mapData.features), []);
  assert.deepEqual(getUnmappedStateNames(['Atlantis'], mapData.features), ['Atlantis']);
});

test('mapped states expose Enter and Space keyboard activation', () => {
  assert.equal(isMapSelectionKey('Enter'), true);
  assert.equal(isMapSelectionKey(' '), true);
  assert.equal(isMapSelectionKey('Tab'), false);
  assert.equal(toggleStateSelection(null, 'Uttaranchal'), 'Uttarakhand');
});