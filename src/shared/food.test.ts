import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isValidRating, normalizeName, tierFor } from './food.ts';

test('normalizeName trims, collapses spaces and lowercases', () => {
  assert.equal(normalizeName('  Butter   Chicken '), 'butter chicken');
});

test('tierFor maps averages to tiers', () => {
  assert.equal(tierFor(5), 'S');
  assert.equal(tierFor(4.2), 'A');
  assert.equal(tierFor(3), 'B');
  assert.equal(tierFor(2.5), 'C');
  assert.equal(tierFor(1), 'D');
});

test('isValidRating accepts whole numbers from 1 to 5', () => {
  assert.equal(isValidRating(1), true);
  assert.equal(isValidRating(5), true);
  assert.equal(isValidRating(0), false);
  assert.equal(isValidRating(3.5), false);
});
