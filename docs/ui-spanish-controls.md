# Spanish answer controls

AskCard uses the existing UI locale for authored answer labels, including
Allow/Deny on PIN approvals. English remains the default, with the original
wording and DOM structure.

Question titles, details, options, placeholders and submitted text remain verbatim.
Request IDs, response values and outgoing message shapes are unchanged. First-use
PIN approval still sends `pin_set` before `pin_approve`; denial needs no PIN and
sends `ui_response` with `confirmed: false`.

PIN fields, help, local validation messages and connector confirmations remain
in English in this slice; their localization belongs to the dependent PIN unit.
Password masking, the 6–12-digit rule and mismatch validation are unchanged. The
locked-PIN notice remains informational; the server enforces the lock.

Synthetic renderer coverage checks Spanish answer labels, verbatim question data,
exact callbacks and PIN action labels with unchanged English fields and errors.
Existing English component and PIN tests protect the default behavior. These
checks do not exercise real PIN authentication, SDK calls, native dialogs or
Windows hardware. Parent-owned integration and browser verification are separate.
