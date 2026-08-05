# Baseline freeze, 5 August 2026

Captured immediately before the catalogue expansion begins, so that anything
that moves afterwards can be proved rather than argued about.

Everything here was fetched from production, logged out, with a cache busting
query string on every request.

## Contents

    pages/home.html       the homepage, including the computed entry counts
    pages/giants.html     the full catalogue listing
    pages/motifs.html     the motif index
    pages/evidence.html   the evidence page, including Corrections
    pages/findings.html   Bones and Shadows
    sitemap.xml           every indexable URL at freeze time
    slugs.txt             all 58 entry slugs, sorted
    entries.tsv           per entry: slug, free or gated, served HTML byte length

## What this is not

Evidence, not a test. Nothing here is wired into CI and nothing asserts
against it.

Byte lengths will drift on their own for reasons that have nothing to do with
the import: a Next.js build id changes, a chunk hash changes, a dependency
bumps. Treat a changed length as a prompt to look, never as a failure.

The useful comparisons after the import are the ones that should not move on
their own: which slugs exist, which are free against gated, and whether any
entry that nobody meant to touch changed at all.
