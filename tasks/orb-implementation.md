# Static arrows, orb flight and portrait notes

## Result
- Restored external-link arrows, Back to top, scroll down, archive back, and primary navigation arrows. Arrow transforms stay none on hover; no link underlines restored.
- The centre of the technology orb is now a button. Pointer/touch activation sends the 25 existing logos on varied curved paths with small banks/flutters, then returns them to shuffled, evenly spaced slots in their original two rings. Paths run 2200ms with up to 168ms stagger. Rings freeze during flight, then preserve the previous Pause setting.
- Repeated clicks cannot stack flights. Real scroll/resize, hidden-document state, reduced-motion changes and route unmount clear the overlay. Queued geometry events with unchanged coordinates do not cancel a newly started flight. The overlay cannot intercept links or clicks.
- Short-screen orbs are sized to fit. If needed, the scene is brought into view before measuring the flight. Extremely short viewports that cannot fit it rearrange instantly. Keyboard/reduced-motion activation also rearranges instantly, with focus retained.
- Added a stationary-photo note interaction. Hover or focus reveals a short note, another encounter advances to the next, touch taps toggle it, and Escape dismisses even when the photo is not focused. Notes use existing About themes; original portfolio headings, paragraphs and project data remain unchanged.

## Reference
Inspected https://yatisharmaportfolio.netlify.app/#home using public HTTP/source and a real command-driven Chrome hover. Web reader failed, but HTTP and Chrome access succeeded without a challenge. Its portrait chooses a random short comment on mouseenter; observed opacity 0 -> 1 -> 0. Adapted the interaction to this portfolio's existing photo, colours and type, with focus/touch/Escape support. No theme, illustration or personal catchphrases copied. Source/evidence: tasks/reference-portrait-report.md and tasks/reference-root-check.log.

## Checks
- `npm run lint && npx tsc --noEmit -p tsconfig.app.json && npm run build && git diff --check`: exit 0. Final build: 1849 modules; JS 324.93 kB, gzip 104.73 kB; CSS 38.63 kB, gzip 8.57 kB. Existing Browserslist age warning remains.
- `PORTFOLIO_SCRATCH=<registered task scratch> perl -e 'alarm 100; exec @ARGV' node scripts/orb-check.mjs`: 44/44 passed, exit 0. Evidence tasks/evidence/orb-implementation-report.json and tasks/orb-check.log. Tested 320/390/768/1440 widths and a 1440x500 viewport, light/dark rendering, actual midpoint displacement of all 25 logos, finite completion, shuffled rings, repeat clicks, pause preservation, scroll/resize/hidden/reduced/unmount cleanup, static arrow navigation, and portrait hover/focus/touch/Escape.
- Root independently reran `node tasks/evidence/orb-review-round2.mjs` under a 45-second limit: 8/8 passed. Captured transformed logo bounds at eight points on a native 1440x500 flight; tested unfocused Escape and actual scroll cancellation. See tasks/orb-review-root.log. The final geometry-event guard is additionally covered by the 44-check run.
- Headings/paragraphs compared with HEAD and src/data/projects.ts unchanged. Localhost returned HTTP 200.
- Fresh review resolved the two reproduced findings (unfocused Escape, clipped short-screen flights); final scoped source review found no new must-fix. See tasks/orb-review.md.

Initial runs exposed early click rejection from stale visibility state, queued geometry events cancelling flight, and slightly clipped 320px touch targets. These were corrected and the complete new-interaction suite reran. Its midpoint visual check seeks the actual animation to a consistent time instead of assuming a wall-clock sample is at that phase. Failed runs were not treated as passes.

## Evidence and limits
Screenshots inspected: tasks/evidence/orb-flight-desktop.png, orb-flight-390-dark.png, portrait-note-desktop.png and portrait-note-mobile.png. No physical-device frame-rate benchmark or Safari verification. Hidden-document behavior was simulated through the visibility handler. Random-path samples are not a proof over every possible random path. No project verify-* skill exists; Samarth can invoke /create-verification-skill to establish one.

No new dependency, push or deployment. The previous local commit remains 780bc75 for comparison/reversion. Scratch cleanup and final regression result are appended after completion.

Final regression: `PORTFOLIO_SCRATCH=<registered task scratch> perl -e 'alarm 160; exec @ARGV' node scripts/motion-check.mjs`: 103/103 passed, exit 0. Existing galleries, image viewer, filters, focus, autopause and reduced-motion behavior remain checked. Output tasks/orb-regression.log; results tasks/evidence/motion-implementation-report.json.

Cleanup: registered root and reviewer scratch directories finished after saving evidence.
