# Guarded daemon directory claims

This foundation provides `claimDaemonDirs` for explicit, authorized private
coordination directories. Daemon startup wiring is a separate change. It does
not select, create or harden a user's shared SDK home on the caller's behalf.

## Ownership protocol

- Each directory uses `.gentle-dot-daemon.lock` and the temporary directory
  `.gentle-dot-daemon.lock.guard`.
- Nonrecursive `mkdir` acquires the guard exclusively. All cooperating claim
  creation, stale recovery and release paths use that same guard.
- New records are `gentle-dot-daemon <pid> <32-lowercase-hex-nonce>` plus newline.
  Strict legacy PID-only records are accepted for liveness, not as release capabilities.
- Live owners, uncertain liveness and empty or malformed records are retained.
  Only a well-formed, provably dead owner can be recovered while holding guard.
- Release compares the exact nonce-bound record, not just a possibly reused PID.
  It is idempotent after success. Failed releases retain pending ownership and report errors.
- Directory operations remain within the supplied synchronous `EngineAccess`.
  Skipped/deferred contexts cannot acknowledge acquisition or release. Do not inject asynchronous I/O.

Existing private Windows parents are verified through a fresh missing-file
probe after checking the directory exists; they are not silently hardened.
New authorized directories and acquired guards use existing private-storage
helpers. POSIX checks use the effective user, including inside server-mode
access brackets. Canonical private-directory aliases are deduplicated.

## Recovery and limits

An existing guard is never reclaimed by age, PID or contents. A crash inside the
brief critical section may leave it behind and requires manual intervention.
First stop every relevant daemon and confirm its resources have stopped; inspect
the exact path in the diagnostic. Remove only a verified abandoned, empty guard.
Never recursively delete coordination directories or remove a live claim to force startup.

The caller releases leases only after its owned resources stop. Protection or
cleanup failures can leave diagnostic artifacts; both original and cleanup
errors are preserved rather than claiming a clean release. PID reuse may cause
a conservative refusal. Old clients that ignore guards, or users manually
modifying active claims, are outside the cooperative exclusion guarantee.

Injected contention and synthetic Windows helper-order checks are not evidence
of native Windows ACL/process behavior, installer acceptance or CI approval.
