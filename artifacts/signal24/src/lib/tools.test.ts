import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CERTIFICATE_TOOL, CREAMY_LAYER_TOOL, EWS_TOOL, evaluateCheck, type CheckAnswer } from './tools';
import { termsIn } from './glossary';

const all = (value: CheckAnswer, tool = CREAMY_LAYER_TOOL) => Object.fromEntries(tool.questions.map((question) => [question.id, value]));

test('creamy layer: no exclusion applies → clear', () => {
  const answers = { ...all('no'), 'central-list': 'yes' as const };
  assert.equal(evaluateCheck(CREAMY_LAYER_TOOL, answers).state, 'clear');
});

test('creamy layer: not on the Central List decides at once', () => {
  const outcome = evaluateCheck(CREAMY_LAYER_TOOL, { 'central-list': 'no' });
  assert.equal(outcome.state, 'excluded');
  assert.equal(outcome.state === 'excluded' && outcome.question.id, 'central-list');
});

test('creamy layer: a Group A parent excludes; later questions are not needed', () => {
  const outcome = evaluateCheck(CREAMY_LAYER_TOOL, { 'central-list': 'yes', constitutional: 'no', 'group-a': 'yes' });
  assert.equal(outcome.state === 'excluded' && outcome.question.id, 'group-a');
});

test('creamy layer: income of ₹8 lakh or more in three years excludes', () => {
  const answers = { ...all('no'), 'central-list': 'yes' as const, income: 'yes' as const };
  assert.equal(evaluateCheck(CREAMY_LAYER_TOOL, answers).state, 'excluded');
});

test('creamy layer: unsure about the Central List never gives a clear result', () => {
  const answers = { ...all('no'), 'central-list': 'unsure' as const };
  assert.equal(evaluateCheck(CREAMY_LAYER_TOOL, answers).state, 'unsure');
});

test('creamy layer: unanswered questions keep it incomplete', () => {
  assert.equal(evaluateCheck(CREAMY_LAYER_TOOL, { 'central-list': 'yes' }).state, 'incomplete');
});

test('EWS: every "no" qualifies; any asset or income limit rules out', () => {
  assert.equal(evaluateCheck(EWS_TOOL, all('no', EWS_TOOL)).state, 'clear');
  for (const question of EWS_TOOL.questions) {
    const outcome = evaluateCheck(EWS_TOOL, { ...all('no', EWS_TOOL), [question.id]: 'yes' });
    assert.equal(outcome.state === 'excluded' && outcome.question.id, question.id, question.id);
  }
});

test('certificate guide covers every category and purpose', () => {
  for (const category of CERTIFICATE_TOOL.categories) for (const purpose of CERTIFICATE_TOOL.purposes) {
    const advice = CERTIFICATE_TOOL.advice(category.id, purpose.id);
    assert.ok(advice.name.en && advice.name.hi && advice.checks.length, `${category.id}/${purpose.id}`);
  }
});

test('glossary finds terms in English and Hindi text', () => {
  const en = termsIn('The creamy layer test and the Central List of OBCs; the law was stayed.', 'en').map((term) => term.id);
  assert.ok(en.includes('creamy-layer') && en.includes('central-list') && en.includes('stay'), en.join());
  const hi = termsIn('क्रीमी लेयर और नौवीं अनुसूची', 'hi').map((term) => term.id);
  assert.ok(hi.includes('creamy-layer') && hi.includes('ninth-schedule'), hi.join());
});
