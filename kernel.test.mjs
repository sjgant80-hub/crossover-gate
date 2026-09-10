import { test } from 'node:test';
import assert from 'node:assert/strict';
import { surrogateVerdict, dmaxDepth, clusters } from './kernel.mjs';

// a null spread across [0,1] with NOTHING inside [0.598, 0.638] (the 0.618 ± 0.02 band)
const SPREAD = [0.05, 0.14, 0.22, 0.31, 0.40, 0.49, 0.52, 0.71, 0.80, 0.88, 0.95, 0.10, 0.35, 0.75, 0.90, 0.25, 0.45, 0.85, 0.03, 0.98];
// a null that itself clusters near 0.618 (noise reproduces the band)
const CLUMPED = [0.60, 0.61, 0.62, 0.63, 0.615, 0.625, 0.605, 0.635, 0.618, 0.61, 0.62, 0.60, 0.63, 0.615, 0.622, 0.608, 0.617, 0.629, 0.611, 0.624];

test('surrogateVerdict: SIGNAL — in band, and the null rarely reaches the band', () => {
  const r = surrogateVerdict({ observed: 0.618, surrogates: SPREAD, center: 0.618, tol: 0.02, alpha: 0.05 });
  assert.equal(r.ok, true);
  assert.equal(r.inBand, true);
  assert.equal(r.hits, 0);          // no SPREAD value within 0.02 of 0.618
  assert.equal(r.p, 0);
  assert.equal(r.verdict, 'signal');
  assert.equal(r.survives, true);
});

test('surrogateVerdict: NULL-INDISTINGUISHABLE — in band, but the null clusters there too', () => {
  const r = surrogateVerdict({ observed: 0.618, surrogates: CLUMPED, center: 0.618, tol: 0.02, alpha: 0.05 });
  assert.equal(r.inBand, true);
  assert.ok(r.p >= 0.05, 'the null reaches the band often: p=' + r.p);
  assert.equal(r.verdict, 'null-indistinguishable');
  assert.equal(r.survives, false);
});

test('surrogateVerdict: OFF-BAND — the crossover is not at the predicted centre (prediction falsified)', () => {
  const r = surrogateVerdict({ observed: 0.90, surrogates: SPREAD, center: 0.618, tol: 0.02, alpha: 0.05 });
  assert.equal(r.inBand, false);
  assert.equal(r.verdict, 'off-band');
  assert.equal(r.survives, false);
});

test('surrogateVerdict: the band edge is inclusive (kills <= → <)', () => {
  // integer domain so |observed - center| == tol EXACTLY (no float error at the edge)
  const nullInts = [1, 2, 3, 20, 21, 22, 30, 31, 40, 41, 50, 51, 60, 61, 70, 71, 80, 81, 90, 91];
  const r = surrogateVerdict({ observed: 7, surrogates: nullInts, center: 5, tol: 2, alpha: 0.05 });
  assert.equal(r.inBand, true);           // |7-5| == 2 == tol → in band
  const out = surrogateVerdict({ observed: 8, surrogates: nullInts, center: 5, tol: 2, alpha: 0.05 });
  assert.equal(out.inBand, false);        // |8-5| == 3 > 2 → out
});

test('surrogateVerdict: p exactly at alpha is NOT a signal (kills p < alpha → p <= alpha)', () => {
  // 1 of 20 surrogates in band → p = 0.05, alpha = 0.05 → not < alpha → not signal
  const one = [0.618, 0.05, 0.14, 0.22, 0.31, 0.40, 0.49, 0.71, 0.80, 0.88, 0.95, 0.10, 0.35, 0.75, 0.90, 0.25, 0.45, 0.85, 0.02, 0.98];
  const r = surrogateVerdict({ observed: 0.618, surrogates: one, center: 0.618, tol: 0.02, alpha: 0.05 });
  assert.equal(r.p, 0.05);
  assert.equal(r.verdict, 'null-indistinguishable');
  // a hair more surrogates out of band → p < alpha → signal
  const fewer = [0.05, 0.14, 0.22, 0.31, 0.40, 0.49, 0.71, 0.80, 0.88, 0.95, 0.10, 0.35, 0.75, 0.90, 0.25, 0.45, 0.85, 0.02, 0.98, 0.03];
  assert.equal(surrogateVerdict({ observed: 0.618, surrogates: fewer, center: 0.618, tol: 0.02, alpha: 0.05 }).verdict, 'signal');
});

test('surrogateVerdict: total on garbage, each guard alone', () => {
  const ok = { observed: 0.6, surrogates: SPREAD, center: 0.618, tol: 0.02, alpha: 0.05 };
  assert.equal(surrogateVerdict(null).ok, false);
  assert.equal(surrogateVerdict([]).ok, false);
  assert.equal(surrogateVerdict({ ...ok, observed: Infinity }).ok, false);
  assert.equal(surrogateVerdict({ ...ok, surrogates: 'x' }).ok, false);
  assert.equal(surrogateVerdict({ ...ok, surrogates: [] }).ok, false);
  assert.equal(surrogateVerdict({ ...ok, surrogates: [0.1, 'y'] }).ok, false);
  assert.equal(surrogateVerdict({ ...ok, center: NaN }).ok, false);
  assert.equal(surrogateVerdict({ ...ok, tol: 0 }).ok, false);
  assert.equal(surrogateVerdict({ ...ok, tol: -0.1 }).ok, false);
  assert.equal(surrogateVerdict({ ...ok, alpha: 0 }).ok, false);
  assert.equal(surrogateVerdict({ ...ok, alpha: 1 }).ok, false);
  assert.equal(surrogateVerdict({ ...ok, alpha: 1.5 }).ok, false);
});

test('dmaxDepth: the seed numbers, pinned', () => {
  assert.deepEqual(dmaxDepth(8), { ok: true, depth: 2, bits: 4 });      // log2(9)=3.17→4; 8/4=2
  assert.deepEqual(dmaxDepth(127), { ok: true, depth: 18, bits: 7 });   // log2(128)=7; 127/7=18.1→18
  assert.deepEqual(dmaxDepth(709), { ok: true, depth: 70, bits: 10 });  // log2(710)=9.47→10; 709/10=70.9→70
  assert.equal(dmaxDepth(1).depth, 1);                                  // log2(2)=1; 1/1=1
});

test('dmaxDepth: monotone-ish and total', () => {
  assert.ok(dmaxDepth(1000).depth > dmaxDepth(100).depth);
  assert.equal(dmaxDepth(0).ok, false);       // P >= 1
  assert.equal(dmaxDepth(1).ok, true);        // exactly 1 valid (kills < 1 → <= 1)
  assert.equal(dmaxDepth(2.5).ok, false);
  assert.equal(dmaxDepth('x').ok, false);
});

test('clusters: descriptive fraction and mean distance', () => {
  const r = clusters([0.618, 0.62, 0.30, 0.90], 0.618, 0.02);
  assert.equal(r.inBand, 2);          // 0.618 and 0.62 within 0.02
  assert.equal(r.fraction, 0.5);
  assert.equal(r.n, 4);
  assert.ok(r.meanDistance > 0);
  // band edge inclusive, integer domain so the edge is exact
  assert.equal(clusters([7], 5, 2).inBand, 1);      // |7-5| == 2 == tol
  assert.equal(clusters([8], 5, 2).inBand, 0);      // |8-5| == 3 > tol
});

test('clusters: total on garbage', () => {
  assert.equal(clusters('x', 0.6, 0.02).ok, false);
  assert.equal(clusters([], 0.6, 0.02).ok, false);
  assert.equal(clusters([0.1, Infinity], 0.6, 0.02).ok, false);
  assert.equal(clusters([0.1], NaN, 0.02).ok, false);
  assert.equal(clusters([0.1], 0.6, 0).ok, false);
});

test('surrogateVerdict: a surrogate exactly at the band edge COUNTS as a hit (kills <= → <)', () => {
  // integer domain. observed in band; ONE surrogate exactly tol from centre, 19 well outside.
  // counting the edge → hits 1 → p 0.05 → not < alpha → null-indistinguishable.
  // NOT counting it (mutant) → hits 0 → p 0 → signal. So the verdict pins the inclusive edge.
  const surr = [7, 20, 21, 22, 30, 31, 40, 41, 50, 51, 60, 61, 70, 71, 80, 81, 90, 91, 12, 15];
  const r = surrogateVerdict({ observed: 5, surrogates: surr, center: 5, tol: 2, alpha: 0.05 });
  assert.equal(r.hits, 1);
  assert.equal(r.p, 0.05);
  assert.equal(r.verdict, 'null-indistinguishable');
});

test('surrogateVerdict: a primitive and an array are refused at the SHAPE guard (kills isObj branches)', () => {
  // the shape-guard why must be the one returned — not a downstream field why
  assert.match(surrogateVerdict('x').why, /reads \{ observed/);
  assert.match(surrogateVerdict(42).why, /reads \{ observed/);
  assert.match(surrogateVerdict([1, 2, 3]).why, /reads \{ observed/);
});
