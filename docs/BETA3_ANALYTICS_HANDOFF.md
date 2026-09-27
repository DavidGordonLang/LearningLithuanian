# Beta 3 learner telemetry — bounded handoff

## Starting state and scope

Started from remote `dev` `3a13238059c47a68c7f94337600c5cbe2c5f82e4` (`3.0.0-beta`). The existing `app_events` (`event_props` JSONB), `app_errors` and `user_game` tables were inspected read-only. No schema/data migration, production signup alteration, third-party analytics tool or curriculum change was made.

Before this work, active `trackEvent()` sites emitted `tts_preload`, `tts_play`, `tts_stop`; `admin_analytics_view_loaded`; settings export/import, starter install, diagnostics toggle, Library clear, and sync upload/download/merge/conflict start/complete events. `AnalyticsView` expected `session_start`, `view_home/library/settings/analytics/dupes`, and `phrase_add/edit/delete`, which current Beta 3 code did not emit. The old dashboard looked only at today's events and would be dominated by technical audio. The live audit measured 13,855 Beta 3 events from two users, including 10,846 preloads and 2,929 plays.

## Final event taxonomy

| Journey | Events and bounded properties |
|---|---|
| Entry | `session_start` once per authenticated account and 30-minute activity session; entry surface `pwa` or `browser`. Account switches create distinct sessions. |
| Onboarding | `onboarding_started`, `onboarding_completed` after successful profile save, `quickstart_opened`, `quickstart_completed` only on final step (Skip does not count). No profile values or DOB. |
| Learning | `training_viewed`, `lesson_started`, `lesson_resumed`, `lesson_exited`, `lesson_completed`. IDs, review/restart, stable block/index, completed-block percentage, measured duration, existing score/XP fields. Deliberate incomplete Back/Browse/tab change records an exit once; completion does not. A close/crash is not mislabelled as a deliberate exit. |
| Authored conversation | `scenario_started`, `scenario_help_used`, `scenario_completed`. Completion summarises best/acceptable/awkward/repair/wrong selections, help count and decisions; no per-turn clickstream or dialogue content. |
| Speaking | `pronunciation_attempt` on recognized pass/fail or no speech, with lesson/block IDs, attempt number and Speechmatics route. No transcript or audio. Manual “Mark as spoken” is not a microphone attempt. |
| Library and personal Scenarios | `phrase_saved` with `source` (`lesson`, `translation`, `manual`, `scenario`), `phrase_edited`, `phrase_deleted`, `personal_scenario_created/deleted/opened`, `phrase_added_to_personal_scenario`. A checkpoint's bulk save is one event with count. IDs/counts only; no titles or phrase text. |
| Technical events | TTS preload/play/stop work is unchanged, but per-call events have been retired. Historical technical rows remain in the database and are excluded from the cohort dashboard. The pre-existing settings/sync operational events remain available in `app_events` outside headline learner counts. |

`src/lib/productTelemetry.js` allowlists identifiers, numeric counts, boolean outcomes and enumerated sources before product events reach JSONB. `user_game` is still the authoritative persisted completion/XP/accuracy state. Analytics event counts describe observed journeys, not a replacement for durable progress.

## Admin cohort view and limitations

`AnalyticsView` pages through Beta-version events from 27 September 2026 onward, excluding technical TTS rows. Its funnel reports first recorded app session, onboarding completion, Lesson 1 started/completed, authored Scenario completion and any later session. Per-user details show first/last seen, distinct sessions, observed lesson IDs, last deliberately exited incomplete lesson/block, Scenario use, pronunciation attempts/pass percentage, saves, personal Scenario creation and errors. Empty and incomplete funnels render safely. Existing admin-only navigation/RLS is preserved.

Retention definition: `returned` = a second distinct `session_start` at any time; D1/D3/D7 = a distinct session on exactly the first/third/seventh UTC calendar day after the first recorded session. These are counts. A tester whose first recorded session predates the telemetry rollout is not a fully measurable acquisition funnel, so recruitment analysis should focus on new testers after rollout.

**Security boundary:** `user_game` is own-user RLS, and `beta_requests` is not readable by the admin browser client. The view therefore labels admitted count unavailable (`—`) and lesson completion as observed events; it does not claim the persisted current course totals of other users. A future exact admin-state view requires a narrowly authorized server-side aggregate/RPC, not a broadened `user_game` SELECT policy. The existing `app_events`/`app_errors` admin SELECT policy allows David's account; it was not changed.

## Acquisition attribution: separate bounded follow-up

Read-only inspection of `DavidGordonLang/zodis-landing` found the live `index.html` form sends `email`, `note`, honeypot and Turnstile token to the production `beta-signup` Edge Function. The function calls `beta_submit_request` with `p_source: 'zodis.app'`. Current `beta_requests` has `source` but no UTM/referrer fields; the RPC also constrains source to `zodis.app`. No robust UTM path currently survives signup/admission.

The follow-up should be separately reviewed in that repository and Supabase: (1) capture bounded `utm_source`, `utm_medium`, `utm_campaign` and a sanitized HTTP referrer in the form; (2) validate/forward them in `beta-signup`; (3) add nullable attribution columns and extend `beta_submit_request` without changing cap, idempotency, admission, email or Discord semantics; (4) expose a strictly admin-only aggregate linking request/admission to app user/session/course outcomes by normalized email or a safer explicit identity key. Do not put public signup data in learner-accessible event props. This task did not deploy or mutate that production flow.

## Verification and manual sample

Focused `tests/analyticsJourney.test.mjs` covers session deduplication/new session/account switch; lesson start/exit/resume/completion and non-abandonment; Scenario result summary; pronunciation pass/fail without transcript; product-prop allowlist; retention and empty funnels; actual lesson preload invocation with no per-preload event. The existing component harness gained inert analytics doubles so C1–C9 regression mechanics remain isolated from network writes. Full test and build results plus application SHA are provided at handoff.

One dev preview sample for David after deployment: sign in as an admitted test account, finish profile and Quick Start (or intentionally Skip to distinguish it), enter Training, start and Back out of an incomplete lesson, resume and complete it, finish one Scenario V2, try one failed then successful speaking attempt, save a phrase and create a personal Scenario. In Admin Analytics, refresh and check the ordered funnel and per-user counts; ensure no phrase text or transcript is present. Check an app reload within 30 minutes does not create a second session; after 30 minutes of inactivity a new action should. No production promotion is part of this handoff.
