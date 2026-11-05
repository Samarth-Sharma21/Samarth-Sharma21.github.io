# Skyray loops and project cards

Clicking the orb centre now morphs each technology logo into a Skyray using that logo's sampled colour regions. The 700ms morph happens in place. Each ray then takes a randomly placed, rotated loop with separate entrance and return curves, following its direction of travel. The path includes at least one complete circuit. Flight stays below the header and behind it, with a slight recession in scale/depth. Original logos return to the two shuffled rings.

Each mark has 700ms to morph, 3400ms to travel, and 700ms to restore. Launches are 65ms apart; all 25 finish within 6360ms. Distance-based sampling avoids speed jumps at curve joins. The browser interpolates 721 transform frames. Pause, keyboard/reduced motion, resize, scroll, hidden-tab and route cleanup remain supported.

Project cards now have a unified frame, clearer category/title hierarchy, compact technology tags and a separate gallery control strip. Screenshots remain uncropped. Galleries advance on a 1500ms timer with a 220ms crossfade. Either manual arrow immediately stops autoplay until Play is pressed. Existing hover, keyboard focus, viewer, visibility and reduced-motion guards remain.

## Proven this session

| Command | Output |
| --- | --- |
| `npm run lint && npx tsc -b && npm run build && git diff --check` | Exit 0. 1851 modules transformed; built in 1.37s. JS329.73kB, gzip106.81kB; CSS41.81kB, gzip9.18kB. |
| `node scripts/orb-check.mjs` | `53/53 browser checks passed.` Final source: loop, 700ms stationary morph, distinct textures, new routes, full turn, varied headings, header stacking, interruption/return, both themes, 320/390/768/1440 widths and portrait regression. |
| `node scripts/motion-check.mjs` | `105/105 browser checks passed.` Gallery timing, manual stop/explicit resume, preload races, all screenshots, viewer, filters, reduced motion and static arrows. |
| `node tasks/evidence/ray-review-probe.mjs` | `9/9 browser checks passed.` 101 position samples per ray at four sizes, below-header bounds, exact landing, actual heading versus centre movement sampled at t±5ms, Pause. |
| `node tasks/evidence/flight-cards-independent.mjs` | 23 PASS results, exit0. Six cold flights, held autoplay decode versus Next/Previous, explicit resume, home/archive layout at six widths. Root reran the independent probe. |
| `node tasks/evidence/loop-heading-seeded.mjs` | Eight seed12345 flights passed, plus no runtime errors. Root rerun after denser interpolation. |
| `node tasks/evidence/loop-shape-independent.mjs` | Three PASS results, exit0. All75 sampled trajectories contain an enclosed loop at320/768/1440. Root reran the independent probe. |
| `node tasks/evidence/cards-visual.mjs` | `4/4 browser checks passed.` Light/dark card captures at1440 and phone sizes. |
| `node tasks/evidence/loop-visual.mjs` | `1/1 browser checks passed.` Captured actual movement traces for visual inspection. Traces are test-only, not in the product. |

Browser commands used `PORTFOLIO_SCRATCH` pointing to registered scratch and hard75–170second time limits, with streamed logs in tasks/. No project verify-* skill exists; the user can request `/create-verification-skill`.

## Problems found and addressed

- Cold-flight landing drift: CSS pause was pending when return positions were captured. Pinning paused animation currentTime before measurement fixes the measured drift. Shared ray points are cached and source textures prewarm individually after load. Evidence: tasks/ray-landing-investigation.md.
- A prior random bend could produce a near-cusp and abrupt facing flip. The final complete-loop path uses tangent-matched entrance/exit curves and a continuous ellipse. Final heading checks use rendered movement, not just path metadata.
- The navigation driver tried clicking the footer while its preceding scripted scroll was still running. It now observes the requested scroll position before clicking, retaining the navigation/focus assertions.

Fresh scoped reviews found no outstanding reproduced defects: tasks/flight-cards-review.md and tasks/loop-flight-review.md. Root opened cited source and reran the independent probes. Comments in the diff were checked for process notes.

## Visual evidence and limits

Inspected tasks/evidence/cards-refined-1440-light.png, cards-refined-320-dark.png, orb-flight-desktop.png, orb-morph-intermediate.png, orb-morph-staggered.png, orb-flight-390-dark.png and loop-flight-trace.png. The trace shows enclosed loops with separate stems. An independent card geometry rerun covers the final narrower phone link spacing.

These are headless Chrome checks and frame inspections. Physical-device smoothness and Safari/Firefox execution are not proven. Existing Browserslist age warning remains. No dependencies, remote push or deployment were added.

Scratch cleanup: registration e0512d9da34b4832af31f148c12089f4 returned state finished, exit0. Reviewer registrations also finished.
