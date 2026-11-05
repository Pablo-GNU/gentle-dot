# Spanish account controls

AccountsPanel uses the UI locale for app-authored headings, method choices, search,
status wrappers, action buttons and accessible names. English remains the default.
The account dictionary owns only `account.*` keys in this slice; ModelPicker is
not included. Existing chat and Settings translations remain composed unchanged.

## Shared flow boundary

The exported FlowEvent and FlowPrompt retain their original props and protocols.
ConnectorsPanel also uses them: its shared buttons and fallback instructions now
follow the locale, but its own panel body is outside this change. In Spanish,
connector headings, status text and its own Cancel button therefore remain English.

Provider names, subscription names, IDs, OAuth URLs and challenges, device codes,
backend instructions, info/progress messages, prompt messages, supplied
placeholders, option labels/descriptions/IDs and backend failures are displayed
unchanged. Only an absent manual-code placeholder or absent OAuth instructions
uses a translated fallback; explicitly empty strings remain empty. Input masking,
trimming, optional empty replies, login methods, cancellation and logout payloads
are unchanged.

## Evidence and limits

`i18n-accounts-models.test.tsx` retains all eight historical account/flow cases;
its historical filename does not imply ModelPicker coverage. Synthetic callbacks
pin login/logout/reply fields and URLs alongside unchanged supplied text and codes.
`accounts.test.tsx` adds the original two English controls and preserves provider
alias searches. A real ConnectorsPanel seam in `connectors.test.tsx` runs under a
LocaleProvider in English and Spanish, checking shared display changes, unchanged
connector/native/backend text, URLs, trimmed replies, empty Skip and cancellation.

The focused five-file run passed 57 tests after a compiling RED with 8 expected
translation failures and 49 passes. Scoped Biome passed after one format-only correction.
Parent checks passed all 304 UI tests, full UI/protocol types and production build;
the build retains a warning for a minified chunk above 500 kB.
Fresh Chromium fixtures cover actual AccountsPanel and ConnectorsPanel in both locales,
including alias filtering, raw names/URLs/text and exact login/logout/reply/cancel fields.
State and callbacks are synthetic: no real login, SDK, daemon, hardware or Windows
execution is covered. Full connector-body translation and ModelPicker remain separate.
Independent Risk:item3 verification is a separate gate; renderer/browser fixtures do not
prove a live authentication round trip.
