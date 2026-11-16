# Self-hosted fonts

UI / display (production):
- Newsreader (SIL Open Font License 1.1) — headlines
- IBM Plex Sans (SIL Open Font License 1.1) — UI and body

Handwriting specimen fonts (preview and export):

Free
- Caveat (SIL OFL 1.1) — “Oxford Cursive”
- Patrick Hand (SIL OFL 1.1) — “Drafting Script”
- Indie Flower (SIL OFL 1.1) — “Margin Flower”
- Shadows Into Light (SIL OFL 1.1) — “Window Light”
- Architects Daughter (SIL OFL 1.1) — “Sketch Notes”
- Covered By Your Grace (SIL OFL 1.1) — “Grace Ink”
- Kalam (SIL OFL 1.1), including Devanagari — “Kavya Devanagari”
- Dekko (SIL OFL 1.1), including Devanagari — “Patra Devanagari”

Pro
- Dancing Script (SIL OFL 1.1) — “Studio Loop” (Reserved Font Name; do not use “Dancing Script” in the product UI)
- Homemade Apple (Apache License 2.0) — “Orchard Script”
- Amita (SIL OFL 1.1), including Devanagari — “Mela Script”

Licence texts are in `licenses/` and must be kept. The official site may use these files under the licences named above; do not claim that Hindi first-class commercial fonts have been delivered, and do not claim that handwriting cloning is supported.

None of the newly added OFL faces declare a Reserved Font Name in their official copyright headers. Homemade Apple is Apache License 2.0 (not OFL) and has no OFL Reserved Font Name; it is still shown under a product name for consistency.

Sources: Fontsource packages (upstream Google Fonts / IBM Plex), vendored into
this repository so the site does not request Google Fonts or other font CDNs at
runtime.
