// crossover-gate — the witness half of a research dyad. The skeptic's instrument.
//
// A private framework predicts that a specific structural crossover in neural entropy data
// clusters at a specific value (call it the BAND). An engine can measure where the crossover
// falls, on real data, at scale. This kernel is neither the framework nor the engine — it is
// the GATE BETWEEN them: given a measured crossover AND a null distribution from surrogate
// data, does the clustering at the predicted band survive, or would any value fit noise just
// as well? The gate is built to REFUSE the prediction — a "signal" verdict is one the gate
// tried to kill and could not.
//
// This is the estate's role in the dyad (its prediction, its gate); the engine and the raw
// measurement are the partner's sovereign half. The gate adjudicates measurements; it does
// not generate data and it makes no clinical claim — a crossover in clinical EEG would be a
// STRUCTURAL CORRELATE, never a diagnosis, and the hard problem of consciousness is not
// addressed here at all. Pure and total; guards one-per-line.

const isFin = (v) => Number.isFinite(v);

function isObj(v) {
  if (typeof v !== 'object') return false;
  if (v === null) return false;
  if (Array.isArray(v)) return false;
  return true;
}

/**
 * surrogateVerdict({ observed, surrogates, center, tol, alpha }) — the falsification gate.
 *
 *   observed    the crossover value the engine measured on the real data,
 *   surrogates  crossover values measured the same way on SURROGATE datasets (phase-randomised
 *               / IAAFT — same spectrum, structure destroyed): the null distribution,
 *   center      the predicted band centre (the framework's number),
 *   tol         the band half-width,
 *   alpha       the significance level.
 *
 * p = fraction of surrogates that land in the band by chance. The observed value counts as a
 * SIGNAL only if it is IN the band AND surrogates rarely are (p < alpha) — i.e. the clustering
 * is not something noise reproduces. Verdicts:
 *   'signal'                — in band, and the band is not reproduced by the null. Survives.
 *   'null-indistinguishable'— in band, but surrogates land there too: a fit, not a finding.
 *   'off-band'              — the crossover is real-valued but not at the predicted centre:
 *                             the prediction is falsified, honestly.
 */
export function surrogateVerdict(input) {
  if (!isObj(input)) return { ok: false, why: 'surrogateVerdict reads { observed, surrogates, center, tol, alpha }' };
  if (!isFin(input.observed)) return { ok: false, why: 'observed must be a finite number' };
  if (!Array.isArray(input.surrogates)) return { ok: false, why: 'surrogates must be an array' };
  if (input.surrogates.length === 0) return { ok: false, why: 'surrogates must be non-empty — a gate with no null proves nothing' };
  if (!input.surrogates.every(isFin)) return { ok: false, why: 'every surrogate must be a finite number' };
  if (!isFin(input.center)) return { ok: false, why: 'center (the predicted band centre) must be a finite number' };
  if (!isFin(input.tol)) return { ok: false, why: 'tol must be a finite number' };
  if (!(input.tol > 0)) return { ok: false, why: 'tol must be positive' };
  if (!isFin(input.alpha)) return { ok: false, why: 'alpha must be a finite number' };
  if (!(input.alpha > 0)) return { ok: false, why: 'alpha must be positive' };
  if (!(input.alpha < 1)) return { ok: false, why: 'alpha must be below 1' };
  const { observed, surrogates, center, tol, alpha } = input;
  const inBand = Math.abs(observed - center) <= tol;
  let hits = 0;
  surrogates.forEach((s) => { if (Math.abs(s - center) <= tol) hits = hits + 1; });
  const p = hits / surrogates.length;
  let verdict = 'null-indistinguishable';
  if (!inBand) verdict = 'off-band';
  else if (p < alpha) verdict = 'signal';
  const survives = verdict === 'signal';
  return { ok: true, survives, verdict, inBand, p: Math.round(p * 10000) / 10000, hits, n: surrogates.length };
}

/**
 * dmaxDepth(P) — the §T self-reference ceiling, as falsifiable arithmetic.
 * A substrate of P elements can index at most P+1 states in ceil(log2(P+1)) bits, so the
 * deepest self-model it can hold without collapse is floor(P / ceil(log2(P+1))). This is the
 * mechanism side of the prediction: self-reference caps, and the cap is computable — a claim
 * you can check against any P, not a hand-wave. (Structure lifts the cap by buying addressing
 * room; that lift is a separate, later claim, not asserted here.)
 */
export function dmaxDepth(P) {
  if (!Number.isInteger(P)) return { ok: false, why: 'P must be an integer (substrate size)' };
  if (P < 1) return { ok: false, why: 'P must be at least 1' };
  const bits = Math.ceil(Math.log2(P + 1));
  const depth = Math.floor(P / bits);
  return { ok: true, depth, bits };
}

/**
 * clusters(values, center, tol) — a descriptive helper: what fraction of a set of measured
 * crossovers falls in the band, with the mean distance from centre. Descriptive only — it
 * asserts nothing; surrogateVerdict is what decides whether a fraction is meaningful.
 */
export function clusters(values, center, tol) {
  if (!Array.isArray(values)) return { ok: false, why: 'values must be an array' };
  if (values.length === 0) return { ok: false, why: 'values must be non-empty' };
  if (!values.every(isFin)) return { ok: false, why: 'every value must be a finite number' };
  if (!isFin(center)) return { ok: false, why: 'center must be a finite number' };
  if (!isFin(tol)) return { ok: false, why: 'tol must be a finite number' };
  if (!(tol > 0)) return { ok: false, why: 'tol must be positive' };
  let inBand = 0;
  let distSum = 0;
  values.forEach((v) => {
    if (Math.abs(v - center) <= tol) inBand = inBand + 1;
    distSum = distSum + Math.abs(v - center);
  });
  return { ok: true, fraction: Math.round((inBand / values.length) * 10000) / 10000, meanDistance: Math.round((distSum / values.length) * 10000) / 10000, inBand, n: values.length };
}
