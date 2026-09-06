# 11.08 — Domain Enrichment publication

> Status: Atomic Enrichment proposals use configured Direct/PR publication.

Enrichment creates one reviewable multi-repository proposal from exact Published
Domain, Repository, candidate and Question inputs. It does not masquerade as
Repository Refresh. Proposal metadata binds mode `enrichment`, Domain,
bounded Repository membership and manifest digest.

Confirmed, rejected and unresolved outcomes remain in one atomic review unit.
Uncertainty stays visible; raw provider output and credentials never enter it.
Scope includes provider/account/region, source revisions and profile versions.

Finalize and Inspect precede an independently confirmed Publish. Direct policy
writes one complete commit; PR policy creates/reuses one exact proposal PR
against the configured target. Neither accepts stacked drafts or silently changes
membership. A changed base stops for renewed preparation and review.

[Prepared publication](12-direct-publication-requirements.md) owns publication
and recovery; [Relations](../06-cross-repository-relations/README.md) owns
provider execution and evidence reconciliation.
