# Message list locale scope

The existing locale provider translates MessageList's authored greeting,
earlier-page control/divider, attachment accessible label, queued labels, and
activity-summary grammar. The dedicated catalog uses only `message*` keys;
Spanish satisfies the English key record without casts. Existing account,
chat, Composer and settings dictionaries retain their values and order.

`summarize(activities, translator?)` remains an exported, hook-free utility with
English as its default. Singular/plural templates cover read, edit, run, search,
memory, delegate and other. Counts include all statuses and retain first-seen
kind order. Running activities still show the first running title verbatim.

Conversation text/Markdown, activity titles, filenames/sizes, backend error and
stopped-note contents, duplicate queue entries, CSS classes and callback wiring
are unchanged. MessageList adds no outgoing protocol calls. The synthetic
show-earlier callback test checks exactly one empty-argument application call;
the existing button still passes its native click event to the supplied handler.

## Focused evidence

- The pre-renderer run observed 11 missing-Spanish-label/summary failures and
  one explicit-translator failure, with 34 passing tests; imports succeeded.
- Focused checks then passed 46 tests across three files: historical component
  controls, the complete Spanish MessageList suite, and locale foundation tests.
- Coverage includes seven singular/plural rules, mixed order and failed-status
  counts, empty/queued-only states, expansion/collapse, unchanged raw data,
  error/stopped notes, streaming caret and callback count/arguments. English
  utility tests include denied storage, explicit translation and empty input.
- Command (run against an owned public-source snapshot):
  `node node_modules/vitest/vitest.mjs run --config vitest.config.ts --project ui packages/ui/test/i18n-message-list.test.tsx packages/ui/test/components.test.tsx packages/ui/test/i18n.test.tsx --maxWorkers=1 --no-cache`

## Integration boundary

These focused runtime checks do not establish full TypeScript, full-UI, build,
browser, native Windows, real SDK, clipboard, network or hardware behavior.
Separate integration evidence belongs alongside each candidate, not in this
component's coverage claim. This display wrapper is not the complete Spanish
catalog. Historical partial environment/cache and browser-verification records
remain partial; current focused evidence does not retroactively validate them.
