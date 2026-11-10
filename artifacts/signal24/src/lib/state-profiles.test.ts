import assert from 'node:assert/strict';
import test from 'node:test';
import { REGIONS, STATE_PROFILES } from './states';

test('every state and Union Territory has a bilingual profile', () => {
  assert.equal(Object.keys(STATE_PROFILES).length, REGIONS.length);
  for (const region of REGIONS) {
    const profile = STATE_PROFILES[region.name];
    assert.ok(profile, `Missing profile for ${region.name}`);
    assert.ok(profile.status.en && profile.status.hi, `Missing bilingual status for ${region.name}`);
    assert.ok(profile.summary.en && profile.summary.hi, `Missing bilingual summary for ${region.name}`);
    assert.ok(profile.facts.length, `Missing dated facts for ${region.name}`);
  }
});

test('every region has a cited, dated fact and an editorial review target', () => {
  for (const region of REGIONS) {
    const profile = STATE_PROFILES[region.name];
    const fact = profile.facts.find((item) => item.source && item.review);
    assert.ok(fact, `Missing sourced reviewable fact for ${region.name}`);
    assert.match(fact.when, /^\d{4}(-\d{2}(-\d{2})?)?$/, `Invalid fact date for ${region.name}`);
    assert.match(fact.source!.url, /^https?:\/\//, `Source URL is missing for ${region.name}`);
    assert.ok(fact.review!.checkedOn, `Missing checked date for ${region.name}`);
    assert.ok(fact.review!.nextCheck.en && fact.review!.nextCheck.hi, `Missing bilingual next-check target for ${region.name}`);
  }
});
