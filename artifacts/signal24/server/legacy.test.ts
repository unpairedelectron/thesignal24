import assert from 'node:assert/strict';
import { test } from 'node:test';
import { legacyRoute } from './legacy';

test('old pages with an equivalent here are redirected', () => {
  assert.deepEqual(legacyRoute('/index.jsp'), { status: 301, location: '/' });
  assert.deepEqual(legacyRoute('/analysis'), { status: 301, location: '/archive' });
  assert.deepEqual(legacyRoute('/analysis/archive'), { status: 301, location: '/archive' });
  assert.deepEqual(legacyRoute('/contact'), { status: 301, location: '/about' });
  assert.deepEqual(legacyRoute('/hi/contact'), { status: 301, location: '/hi/about' });
});

test('old articles, tags and JSP pages are gone', () => {
  for (const path of [
    '/analysis/oil-prices-surge-us-blocks-iranian-ports',
    '/explained/modi-apologizes-women-quota-bill-shock-defeat',
    '/article/lenskart-apologizes-after-grooming-policy-row-7e1e4402',
    '/topic/game',
    '/topic/world-cup',
    '/news_view.jsp',
    '/careers',
    '/tech',
    '/hi/analysis/anything',
  ]) {
    assert.deepEqual(legacyRoute(path), { status: 410 }, path);
  }
});

test('current pages are never touched', () => {
  for (const path of [
    '/',
    '/hi',
    '/archive',
    '/about',
    '/editorial-standards',
    '/topics',
    '/topics/Courts',
    '/articles/some-story-12',
    '/answers/ews-certificate',
    '/state/bihar',
    '/policies/bihar-65',
    '/hi/answers/ews-certificate',
  ]) {
    assert.equal(legacyRoute(path), null, path);
  }
});
