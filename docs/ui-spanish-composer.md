# Composer display localization

Composer and its file chips use `useLocale().t` with 24 `composer*` keys in the
composed chat dictionary. English remains the default with the previous labels.
Spanish covers message placeholders, send/refusal text, file wrappers, voice
controls and the shared **Stop** button. The Spanish dictionary retains
`satisfies Record<keyof typeof chatEn, string>`. This is component display
coverage, not a fully translated Spanish application.

## Data boundaries

Only display wrappers change. File names, sizes, progress, upload references,
hook refusal/error text and all voice data remain unchanged. Partial transcripts,
hook notes and unavailable-microphone reasons stay raw; only the app-authored
listening/transcription fallbacks and control labels translate. Submission still
trims text, retains refused drafts/files, reuses uploads on retry, generates
request IDs and sends the same abort payload. The single shared Stop button
still aborts only when busy and calls `stopSpeaking`; playback-only Stop does
not abort. Keyboard, uploader and send-on-stop preference behavior are unchanged.

## Evidence and limits

`i18n-composer.test.tsx` has six cases: text/send, attachments and voice in Spanish
and default English, with reset localStorage and synthetic callbacks/upload
promises. They cover exact payloads, retries, Enter/Shift+Enter/IME, blank input,
upload locks, removal, progress, raw errors, recording controls, both send-on-stop
modes, timer/meter, raw partials/notes/reasons, transcription, disabled controls
and playback-only Stop. Existing component, attachment and voice tests remain
unchanged English regression controls.
New-candidate focused tests observed two expected Spanish voice/Stop-label
failures before the remaining display changes, then 57 passing tests across four
files after the changes.
Focused checks do not establish type, full UI integration, build or browser
coverage; separate integration evidence is recorded alongside the candidate.
No hardware, daemon, network, native review or platform proof is claimed.
