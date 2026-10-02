# Initial Ingest preflight

Read only the authorized repository root, in this order:

1. root `README*`;
2. root `docs/README*` or `docs/index*`;
3. at most three overview/domain/architecture documents linked directly by the
   root README.

Keep the read bounded to five files and 256 KiB total. Do not recursively scan
docs and do not run full discovery only to classify Domain.

Resolve identity first. For an existing canonical Repository, return to the
Add entry's Update handoff without proposing a new home. Ambiguous identity
stops for clarification. Only new repositories need the home plan below.

Present for a new repository:

- the canonical Repository resolution (`existing`, `new` or `ambiguous`);
- proposed exact default Domain identity/title and whether it already exists;
- supporting relative paths and a short excerpt;
- any mismatch between the user's label, repository evidence and Hub Domain;
- one confirmation/correction question.

Do not continue on ambiguous Repository identity or without an explicit
default-home answer. This is the preliminary Repository default; after
Discovery exposes the materialized candidates, the workflow presents one final
grouped home/participation plan. The user's answer is authoritative only after
visible mismatch warnings.
