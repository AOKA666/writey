# Self-hosted fonts

UI / display (production):
- Newsreader (SIL Open Font License 1.1) — headlines
- IBM Plex Sans (SIL Open Font License 1.1) — UI and body

Handwriting specimen fonts (preview and export):
- Caveat (SIL OFL 1.1) — “Oxford Cursive”
- Patrick Hand (SIL OFL 1.1) — “Drafting Script”
- Kalam (SIL OFL 1.1), including Devanagari — “Kavya Devanagari”
- Dancing Script (SIL OFL 1.1) — product display name “Studio Loop” (Pro specimen; Reserved Font Name)

These faces are labeled **SIL OFL 1.1** in the product UI. Licence texts are in `licenses/` and must be kept. The official site may use these files under OFL 1.1; do not claim that Hindi first-class commercial fonts have been delivered, and do not claim that handwriting cloning is supported. Dancing Script must not be relabeled “Dancing Script” in the product UI because of its Reserved Font Name.

Sources: Fontsource packages (upstream Google Fonts / IBM Plex), vendored into
this repository so the site does not request Google Fonts or other font CDNs at
runtime.
