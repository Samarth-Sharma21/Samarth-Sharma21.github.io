# Portfolio UI and gallery update

Final direction follows Samarth's latest visual feedback. Changes are local only; no new dependencies or remote writes.

## Implemented
- Removed decorative link/button arrows, link hover underlines and hover translation/scaling. Primary labels use even padding and colour feedback.
- Removed the large contact Skyray scene, lens, halftone effect and previous dotted wake. Kept small header/footer identity.
- Project screenshots preload, crossfade with directional movement over 220ms, and retain the current image when loading fails. Rapid requests keep the latest selection.
- Galleries advance after four seconds while at least 35% visible. Hover, keyboard focus, open viewer, explicit pause, hidden document, errors and reduced motion stop automatic cycling. Manual previous/next remain available.
- Fullscreen native image viewer with thumbnail-origin opening/closing, Escape/backdrop dismissal, focus restoration to the actual opener and scroll cleanup. Images stay fully contained.
- Project filters animate their selection and retained-card positions; keyboard and reduced-motion changes are immediate.
- First tool detail entrance uses 150ms feedback; subsequent details stay immediate. Existing tool orbit and pause control remain.
- Existing portfolio wording/data retained. New text is limited to gallery controls and loading-error status.

## Verification
Static checks completed: `npm run lint && npx tsc --noEmit -p tsconfig.app.json && npm run build && git diff --check` exited 0. Build: 1847 modules; JS 318.02 kB (102.53 kB gzip), CSS 36.37 kB (8.18 kB gzip). Original headings/paragraphs and unchanged src/data/projects.ts were compared with checkpoint b46c5de. The final full browser run result is appended below. Browser evidence is saved under tasks/evidence, main results in motion-implementation-report.json and output in tasks/motion-check.log. Useful captures: final-home-desktop.png, final-gallery-mobile.png, final-contact-1440-dark.png and final-contact-390-light.png.

Fresh review: tasks/motion-review.md. The review reproduced and led to fixes for modal close cancellation, a thumbnail TypeScript annotation and a speculative autoplay cursor skipping a screenshot. Root also reproduced stale exiting cards after switching reduced motion and retained layout tracking with zero-duration transitions.

## Limits
Browser checks use headless Chrome on macOS, not physical-device frame-rate measurement or Safari. No claim of universal browser verification or subjective design approval. The old full browser-check.mjs suite has an earlier unresolved smooth-scroll timing failure under headless SwiftShader; this update does not change ScrollToTop. No project verify-* skill exists; Samarth can invoke /create-verification-skill to establish one.

The existing installed Motion package adds runtime code when used. Final production bundle size is recorded with build output; no package install or dependency change occurred. Existing Browserslist age warning remains.

## Reversibility
Checkpoint b46c5de preserves the previous branding/UI. This change set contains the gallery/interaction changes and latest removals. Reverting that final commit restores the checkpoint, including its old decorative wake. No revert has been performed.

Root reran `PORTFOLIO_SCRATCH=<registered task scratch> perl -e 'alarm 45; exec @ARGV' node tasks/evidence/motion-review-autoplay.mjs`: 6/6 assertions passed. Hidden visibility was simulated with document.hidden and visibilitychange, not a claim about actual OS tab scheduling. The diagnostic request list now ends in Rekindle1.JPG after Pause then Next, as required.

Test driver corrections: initial AI-filter expectation used three instead of the data's two projects; the image-count parser was corrected to read the count text directly; filter exit checks await bounded DOM completion instead of a fixed sleep; the pending-autoplay test now selects ReKindle requests, since other visible project galleries also preload. No product test failure is reported as a passing run. Final results below supersede those failed runs.

## Final results
- `PORTFOLIO_SCRATCH=<registered task scratch> perl -e 'alarm 160; exec @ARGV' node scripts/motion-check.mjs`: 102/102 passed, exit 0. Covers all 15 screenshots at 320/768/1440px, image viewer and request races, filters, stationary hover/no underlines, responsive light/dark layouts, actual four-second autoplay, hover/explicit/keyboard/offscreen/reduced-motion pause and resume. No browser console errors or unexpected HTTP failures.
- After updating the removed scroll-link keyboard fallback, `node tasks/evidence/motion-keyboard-final.mjs` under a 35-second limit: 2/2 passed, exit 0. Close from the tool inspector under reduced motion focuses the next section thumbnail. The same case is added to the main script for future runs.
- The 220ms motion observation was changed from sampling only still-running animations to retaining the actual animation returned by the image's native animate() call. This avoids a headless sample arriving after the finite animation finished, without faking or lengthening the effect.
- Lint, app TypeScript, build and diff check exit 0 on final source. Source checks confirm original headings, paragraphs and project data remain. Localhost returned HTTP 200.
- Final captures inspected: desktop home, 320px featured gallery, dark desktop contact, light/dark archive and image viewer. Small gallery controls no longer overlap.
- Fresh reviewer reports no remaining reproduced must-fix findings in the final scoped rechecks. No new packages, remote push or deployment.
