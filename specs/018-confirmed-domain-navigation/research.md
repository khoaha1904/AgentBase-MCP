# Research: Confirmed Domain Navigation

## Decision: Carry exact identity and title

The maintainer supplies both `domains/<slug>` and a display title. AgentBase
validates rather than guesses or slugifies business terminology.

**Rationale**: Automatic slugging cannot resolve aliases, collisions or the
organization's canonical vocabulary.

**Alternatives considered**: Deriving Domain from repository name was rejected
as unsupported inference; accepting title alone was rejected because it hides a
canonical identity decision.

## Decision: Separate owner guidance from repository evidence

Prepare derives `agentbase://owner-guidance/<domain-identity>` and returns it to
the author. Domain membership relationships cite this source ID, while source
code claims continue citing normalized repository resources.

**Rationale**: A README that never names Commerce must not be presented as the
reason the System belongs to Commerce.

**Alternatives considered**: A question concept is deferred; hidden session-only
evidence would not survive accepted Markdown; a fabricated repository citation
would violate evidence policy.

## Decision: Preserve accepted index lines

New proposals apply the existing refresh definition of additive indexes: every
accepted nonblank line appears byte-for-byte in the same order.

**Rationale**: This allows bounded navigation growth while preventing a repo
from renaming the Hub or restyling prior team navigation.

**Alternatives considered**: Protecting root bytes completely would block new
Domain/System entrypoints; parsing and regenerating all indexes would rewrite
human or foreign formatting.
