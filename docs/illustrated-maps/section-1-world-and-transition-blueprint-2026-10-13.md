# Žodis illustrated Journey — Section 1 map blueprint (DRAFT)

Date: 13 October 2026
Status: Art/layout design working specification. Section 1 map concepts and waypoint coordinates are PROPOSALS pending visual acceptance; NOT a release, not an app-integrated artwork pack.

## Immutable product and technical constraints

- Scope: Fox and Wolf only; share the exact same background, world route and interactive stops. Use existing APPROVED eight-direction animation assets. No new companion art.
- The module_1_1 illustrated village, journey route, landmarks and working progression are approved and must remain intact. Its cobbled road is a candidate for a later narrowly scoped readability repaint, not a path rewrite.
- Produce 20 separate teaching-module illustrated backgrounds across five coherent sections: one already exists, 19 remain. No additional full background for a one-point section checkpoint.
- Section checkpoint is a separate, unlocked curriculum event (not conflated with the module checkpoint). Represent it using a particularly large landmark on each section's FOURTH module map.
- Map art must contain ONLY scenery. Do not bake lesson badges, numbers, characters, buttons, text labels, speech bubbles or checkpoints into pixels.
- Keep lesson/score/completion/ID/persistence rules in the existing React/gameStore layer. Preserve scene overlay, developer editors and production gating.
- Author/export a sharp portrait illustrated master, fit to existing 850×1120 virtual scene with its own landmark-specific point coordinates and high-resolution tile exports; preserve the original full-resolution file.
- **No foreground crossings on any NEW map.** Fox/Wolf must remain on unobstructed, fully visible, open paths at every walking frame and lesson stop. Buildings, arches, fences, bridges, canopies, vegetation and props must sit entirely BESIDE or BEHIND the walking corridor, never above it or across it; no new foreground occlusion masks or custom z-order/pillar tricks. Bridge/water landmarks may be visible nearby, but do not route a companion under arches, behind pillars, behind trees or through buildings. The existing approved 1.1 gate mask is a grandfathered exception and remains unchanged.

## Road readability — acceptance criterion

Compared with the first village's busy cobblestones, the main navigable path needs **high silhouette clarity at phone size**:
1. Continuous broad, relatively smooth pale warm-stone path (or packed-earth variation), unmistakable from top to bottom; no fragmented routes, heavy micro-cobbles, dense mosaic, random pebbles or visual "spaghetti".
2. Firm contrasting edges (subtle kerb, clipped grass, edge stones or light earth shoulder). Gentle deliberate curves; route always has space for two quadruped sprite silhouettes.
3. High landmark/environment detail OFF the path; strong focal separation. Keep cross-path decoration minimal, especially around lesson-stop pin positions.
4. Avoid disguising paths under bushes, awnings, props, shadow bands or doorsteps. Mobile visual QA should identify walkable course at a glance with markers temporarily hidden.
5. Ensure world/spawn/ground and stop anchors are designed BEFORE final imagery, not retrofitted into decorative pictures.

## Approved walking-route contract — 13 October 2026

David's additional confirmed acceptance criteria:

1. **Always forwards, in curriculum order.** Layout the landmarks from the ENTRY edge towards the EXIT edge, in order 1 → 2 → ... → module checkpoint, then the separately unlocked SECTION checkpoint on map 1.4. No doubling back to get to a later lesson, no loops, U-turns, crossings or jumping to the far side of the map. Stop marker progression along route distance must be strictly increasing. Any intermediate walking bend should be gentle and should not send the character towards a previously completed landmark. Avoid visual zig-zags even if mathematical progress increases.
2. **Keep the entire quadruped unobstructed.** Before artwork acceptance, imagine a corridor of sufficient width for the whole Fox/Wolf sprite including ears, tails, front/back legs and its ground-contact anchor. Nothing may overlap that corridor at any stop or along any path segment. NO tunnels, arch crossings, walking behind fences, stepping through building fronts or foliage masks. Objects can be detailed right beside the road, never across it.
3. **Stitch adjacent maps into a continuous journey.** Author **exit location + outgoing compass facing** from map N *before* authoring map N+1. Map N+1 must place the **entry at the matching lateral position on the opposite near edge** and preserve the companion's travel heading (allowing a very slight perspective correction). Example: leaving one map via its upper-left path heading up-left should lead into the lower-left near path of the next, still heading up-left — NOT reappear to the right, turn around or start walking towards the previous screen. Both Fox and Wolf use the same seam contracts.
4. **Transition is an overlay, not disappearance.** Keep old scene fully opaque and its existing companion travelling; fade incoming scenery only into view with matching road/ground palette and seam alignment. Switch to new active map and its companion at entry without visible reverse walk, double sprite, screen blank, out-of-order checkpoint, or major apparent size snap.
5. **Design-time acceptance check.** In each draft verify 1) all stop IDs map to strictly increasing distances on one easy-to-follow route; 2) open corridor clearance for BOTH sprites at ALL frames and lesson stops; 3) route is directionally monotonic with no backtrack; 4) the neighboring map seam makes spatial sense; and 5) the road is readable with markers hidden on an Android-width view. Rework composition BEFORE generating final textures or integrating.

### Section 1 directional seams (provisional, must be matched to final accepted imagery)

- **Existing 1.1 village:** approved world route endpoint is `(455,182)` in the 850×1120 scene; last authored segment runs `(487,194) → (455,182)`, heading approximately LEFT/slightly UP. This is a confirmed code constraint, not a request to alter the route. Plan 1.2's entrance and first short walking segment to honour that *actual* terminal facing/position, not the arbitrary infographic concept.
- **1.2 → 1.3 and 1.3 → 1.4:** decide each downstream map's first anchor/entry before illustrating the previous map's last 15% path. Keep the lateral lane, direction, scale progression, material and ground alignment compatible at every seam. Proposed single broad continuous village journey travels generally AWAY (towards the top of portraits) while meandering a little; we avoid prescribed diagonal shifts that would conflict with real route artwork.
- **At Section 1 end:** checkpoint 1.C is the seventh and last landmark on 1.4 and uses a significantly larger community hall; the 1.4 module checkpoint is point six. Both must remain in progression order. The section-to-section handoff can have a new look, but must still preserve outgoing/incoming position and direction.

**Concept-image caveat:** The generated four-panel image was an *art direction illustration*, not a mathematically laid-out playable map. Its illustrated circles/numbers may be wrong or out of route order and its landmark captions may not match the actual curriculum. **Never copy those numbers, pin coordinates, road crossings, or labels into production.** Use the real curriculum IDs/titles below and overlay verified ordered pins in code.

## Section 1 — connected world geography

A single welcoming storybook Lithuanian village:
**1.1 village entrance and civic square → 1.2 residential lane and meeting courtyards → 1.3 central services lane → 1.4 bridge/outskirts, final civic landmark.**
Architecture, roof colour, perspective, daylight and landscaping should match between neighbouring screens. Each map must be a recognisable distinct scene, not a recolour of the same street. The main route generally progresses from the near edge towards the far edge, BUT actual entry/exit lane and compass facing must be matched to neighboring route endpoints. Do not overwrite the approved 1.1 route to force a generic top/bottom formula.

### 1.1 — Greeting and Politeness | 5 points | APPROVED base

Preserve: Village Gate (1.1.1), Village Fountain (1.1.2), Bakery (1.1.3), Lantern Corner (1.1.4), Town Hall (1.1.C). Current interactive route and gate occlusion remain. Later road-only texture reduction may be compared against the same screenshot and must preserve geometry.

### 1.2 — Who I Am | 6 points | FIRST NEW PROTOTYPE

Narrative: leaving the town-hall square, meet village neighbours along a quieter residential street, reaching a warm community courtyard. Path: clearly continuous broad pale paving leading from lower foreground around two gentle bends to the upper centre.

Landmark placement, bottom to top:
1. 1.2.1 "I Am / My Name Is" — flowered front-garden welcome gate / small cottage threshold.
2. 1.2.2 "I'm From…" — village signpost beside a modest travel/map notice board, on the route rather than printed text inside artwork.
3. 1.2.3 "Nice to Meet You" — neighbour-to-neighbour meeting spot, birch-shaded bench and garden gate.
4. 1.2.4 "This Is…" — small family/shared courtyard with two adjacent timber houses.
5. 1.2.5 "People Around You" — open neighbourhood green with several paths/doorways visually framing the main road.
6. 1.2.C module checkpoint — the prominent residential community-house courtyard at the upper end.

Visual balance: gentle pitched roofs, wooden windows, rich plants and flowers, warm Lithuanian vernacular village details. Keep road pale and intentionally QUIET. No figures/animals/fox/wolf. Landmark art is for ambience, NOT an actual printed lesson label. Proposed route overlay: six stop anchors at clear level footing on one continuous road; sprite approaches a stop rather than walking through the building.

### 1.3 — I Don't Understand | 5 points

Narrative: the residential neighbourhood reaches an everyday-services street; asking for help becomes natural.
1. 1.3.1 "I Don't Understand" — guesthouse/reception frontage.
2. 1.3.2 "Please Repeat / More Slowly" — apothecary/pharmacy doorway.
3. 1.3.3 "What Does This Mean?" — cafe's exterior menu display (NO legible words baked into art).
4. 1.3.4 "Do You Speak English?" — village information kiosk / visitor centre.
5. 1.3.C module checkpoint — small meeting pavilion at the services-square exit.

Walkable pale path/sidewalk is broad and uninterrupted. Controlled signage without lettering or lesson UI in image.

### 1.4 — Help and Contact | 7 visual destinations (5 lessons + module checkpoint + separate SECTION checkpoint)

Narrative: main village services route reaches crossroads and a pedestrian bridge, then a destination civic landmark. This scene carries the complete SECTION 1 finish.
1. 1.4.1 "Can You Help Me?" — helpful village information shelter.
2. 1.4.2 "Is It Here? Is It Over There?" — distinctive crossroads with unobstructed wayfinder landmark.
3. 1.4.3 "Where Is…?" — little station/transport direction point.
4. 1.4.4 "Can I…? / Can We…?" — terrace seating near a footbridge.
5. 1.4.5 "Tu and Jūs — A Pattern to Notice" — respectful meeting-place/community garden.
6. 1.4.C MODULE checkpoint — modest roofed forecourt before civic landmark.
7. 1.C SECTION checkpoint, "First Interaction" — **larger, prominent cultural/community hall** at route end, visually distinct from module checkpoint. Separate actual curriculum ID and unlock behaviour.

A seven-stop path needs slightly more generous spatial spacing and less visual clutter. Landmark 7 is obviously larger and significant. The section checkpoint remains its own progression item; it borrows the 1.4 scene rather than spawning a new map.

## Map change animation — approved user intent

The old map stays visually at full opacity while the CURRENT Fox or Wolf finishes walking OFF along the authorised route. The NEXT map is pre-mounted and its **scenery fades IN over** that stable previous scenery; do not separately fade the outgoing card/map to blank, tint/black, or run competing crossfade animations. Never show duplicated companions or lesson markers from a fading preview. Once the new map becomes fully opaque, activate the actual next-map UI and sprite state.

Current DEV code has a 1.1-only outgoing special case. Specifically LearningHome mounts old JourneyMap plus an incoming full JourneyMap overlay whose opacity is tied to departure progress. That preview can visually obscure/fade the outgoing moving character and reveal a generic SVG (because 1.2 has no real art yet); Wolf currently skips exit in LearningHome. This is an implementation caveat, not an assertion that final UX is approved. Fix and physically QA with genuine 1.2 illustrated artwork. Keep the final approved 1.1 route path, its movement, duration and end-of-route navigation intact.

Checks before acceptance: old scenery opacity remains 1; only incoming illustrated scenery animates 0→1; the outgoing walking Fox/Wolf stays visible appropriately until leaving; no double fox/wolf, no double markers; next map is ready before transition; transition respects reduced motion and disabled pointer events; preserves lesson navigation, completed stops and DEV tools; safe when next art fails preload.

## Production order

1. Propose/review the complete 1.2 composition first, with clear route and six recognisable destinations.
2. Approve exact 1.2 art and master file; persist accepted source assets in durable design library/repository.
3. Generate bounded app-quality tiles and author actual landmark/ground/route points for 1.2; integrate on `dev` only.
4. Correct old-map→new-map fade as described, with Fox AND Wolf and no duplicate preview sprites. Add regression coverage, test and Vercel DEV Android review.
5. Apply the proven technique to 1.3 and 1.4, then the other four sections. Do not batch 19 unreviewed assets.
6. Maintain release gate: NO production or external redesign-beta promotion until all illustrated maps/journeys are done and David explicitly signs off.

Source: David's direct decisions (13 October 2026), The Continuity / Žodis live project, verified DEV curriculum titles, the existing JourneyMap.jsx and LearningHome.jsx exit implementation.
