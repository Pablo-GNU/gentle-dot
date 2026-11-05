# Spanish chat navigation and status

Choose Spanish in Settings → Interface language to translate chat navigation,
connection guidance, onboarding, interruption/switch controls, notice dismissal,
and mute/rose/full-screen labels. English retains its original wording.

Conversation titles (including empty titles and `New conversation`), notice bodies,
native error reasons, dates and IDs remain data. Only missing titles use a translated
fallback. Both locales send exactly `Continue where you left off.` with the original
`send` type and generated request ID; locale changes send no backend commands.

Focused jsdom validation passes 46 tests across chat, locale and Settings, including
both continuation locales, raw native reasons, five status states and toggle values.
Fixtures mock native controls/transports; no daemon, login, hardware or private profile.
Composer, message/PIN/model/computer/panel bodies remain outside this slice.
Parent validation also passes all 293 UI tests, UI/protocol typing and the production build.
A fresh Chromium ChatSurface/provider fixture verifies both locales, exact continuation
payloads, raw data, status disabling, cancellation and toggle values with synthetic state,
voice and native controls. The initial fixture-only loading failure is retained separately.
Installed Windows, real native controls and full-interface Spanish remain unclaimed.
