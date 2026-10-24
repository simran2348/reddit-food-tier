import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidRating,
  normalizeName,
  ratingToStars,
  tierFor,
} from './food.ts';

test('normalizeName trims, collapses spaces and lowercases', () => {
  assert.equal(normalizeName('  Butter   Chicken '), 'butter chicken');
});

test('tierFor maps averages to tiers', () => {
  assert.equal(tierFor(10), 'S');
  assert.equal(tierFor(8.4), 'A');
  assert.equal(tierFor(6), 'B');
  assert.equal(tierFor(5), 'C');
  assert.equal(tierFor(2), 'D');
});

test('isValidRating accepts whole numbers from 1 to 10', () => {
  assert.equal(isValidRating(1), true);
  assert.equal(isValidRating(10), true);
  assert.equal(isValidRating(0), false);
  assert.equal(isValidRating(11), false);
  assert.equal(isValidRating(7.5), false);
});

test('ratingToStars halves a rating out of 10', () => {
  assert.equal(ratingToStars(10), 5);
  assert.equal(ratingToStars(7), 3.5);
  assert.equal(ratingToStars(1), 0.5);
});
