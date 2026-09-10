# Crossover Gate — the skeptic's instrument

**Live: https://sjgant80-hub.github.io/crossover-gate/**

A private framework predicts that a structural crossover in neural entropy data clusters at a
specific value. This repo is neither the framework nor the measuring engine — it is the
**gate between them**: given a measured crossover and a null distribution from surrogate data,
does the clustering at the predicted band survive, or would any value fit noise just as well?
The gate is built to **refuse** the prediction. A "signal" verdict is one it tried to kill and could not.

This is the estate's half of a research dyad (its prediction, its gate). The measuring engine
and the raw data are the partner's sovereign half; the two cross-verify at the seam, neither
merged, neither adjudicating the other.

## What it decides

`surrogateVerdict({ observed, surrogates, center, tol, alpha })`:
- **signal** — observed is in the band AND the surrogate null rarely reaches it (p < alpha). Survives.
- **null-indistinguishable** — in band, but surrogates land there too: a fit, not a finding.
- **off-band** — the crossover is real-valued but not at the predicted centre: falsified, honestly.

`dmaxDepth(P) = ⌊P / ⌈log₂(P+1)⌉⌋` — the mechanism side: self-reference caps at a depth the
substrate can address. Falsifiable arithmetic, checkable at any P.

## The walls

A structural **correlate** claim at most — never a proof of consciousness (the hard problem is
the compass, untouched), and never a diagnosis. If the engine runs on clinical EEG, a crossover
is a structural feature of the data, never a statement about a person or condition.

## Proof

`kernel.mjs` — pure, total. Mutation gate **CLEAN: 21/21 killed, zero survivors, zero
exemptions** (12 tests; the three verdicts, the inclusive band edge, the p<alpha boundary, and
the seed's Dmax numbers all pinned). CI re-runs the vendored gate on every push; the page
carries the kernel verbatim and is diffed. Pure client-side.

MIT.
