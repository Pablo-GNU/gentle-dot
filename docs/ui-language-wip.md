# UI language foundation — WIP checkpoint

This is an incomplete Spanish interface, not a completed translation.
Only Settings, Close settings and Interface language have English/Spanish messages.
The foundation adds a locale provider, a Settings selector and local-storage persistence;
it does not change the daemon language or speech-language preference.

Ported from the original locale foundation at `97cc4a3` onto the PR9 base `7be2cef`.
Focused synthetic renderer checks pass: 29 tests across locale and Settings, including
17 existing English controls. They cover persistence, cross-window changes, denied
storage, quota failure and listener cleanup. Scoped locale types and six-file lint pass.
Parent checks also pass: 276 UI tests, full UI/protocol typing and the UI production build.
A fresh Chromium fixture verifies Settings/provider switching, reload persistence and real
cross-tab synchronization without changing speech preference or issuing extra Tauri commands.
The App wrapper is covered by renderer tests; browser proof uses synthetic Tauri and no daemon.
No dependency repair, native Windows build, installed locale or whole-interface acceptance
is implied.

Chat, accounts, models and principal controls, plus remaining panels,
accessibility and documentation, remain pending beyond this foundation.
See `packages/ui/test/i18n.test.tsx` and `packages/ui/test/settings.test.tsx`
for the renderer assertions; these do not prove native or whole-interface behavior.
