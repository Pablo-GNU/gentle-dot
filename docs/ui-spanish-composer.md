# Composer text, send and attachment localization

Composer and its file chips use `useLocale().t` with ten `composer*` keys in the
composed chat dictionary. English remains the default with the previous labels.
Spanish covers message placeholders, send/refusal text and file wrappers.
Voice controls and the shared **Stop** button remain English in both locales;
the next slice translates them. This is not complete Spanish Composer coverage.
The Spanish dictionary retains `satisfies Record<keyof typeof chatEn, string>`.

## Data boundaries

Only display wrappers change. File names, sizes, progress, upload references,
hook refusal/error text and all voice data remain unchanged. Submission still
trims text, retains refused drafts/files, reuses uploads on retry, generates
request IDs and sends the same abort payload. Stop still aborts when busy and
calls `stopSpeaking`; keyboard and uploader behavior are unchanged.

## Evidence and limits

`i18n-composer.test.tsx` has four cases: text/send and attachments in Spanish and
default English, with reset localStorage and synthetic callbacks/upload promises.
They cover exact payloads, retries, Enter/Shift+Enter/IME, blank input,
upload locks, removal, progress and raw errors. Existing component, attachment
and voice tests remain unchanged English regression controls.
New-candidate focused tests observed two expected Spanish-label failures before
the display changes, then 55 passing tests across four files after the changes.
Focused checks do not establish type, full UI integration, build or browser
coverage; separate integration evidence is recorded alongside the candidate.
No hardware, daemon, network, native review or platform proof is claimed.
