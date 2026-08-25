# Data model: Readable 2D Domain site

No canonical data model changes.

The browser derives ephemeral `MapNode` and `MapEdge` elements from the existing
Published visualization projection. Visibility, selection, filters and the Flow
toggle are view state only and never enter OKF, projection JSON or the build
receipt.
