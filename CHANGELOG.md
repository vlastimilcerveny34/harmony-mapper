# Changelog

## v1.5 — 2026-06-21

### Header & lenses UI rework

The whole top bar was reorganized for a cleaner, more discoverable layout:

- **Lenses are now a dropdown** in the header (top right, next to Tonic/Mode)
  instead of chips under the circle. The trigger shows the colored dots of the
  active lenses plus a count; opening it reveals all seven options as a labeled
  list (toggle + name + short description), so it's clear what each one does
  without hovering. It's multi-select — the menu stays open while you pick and
  closes on an outside click (including clicking a chord) or **Esc**. Styling now
  matches the Tonic/Mode selects exactly.
- **Controls regrouped:** the header is a two-column layout — logo + subtitle on
  the left, and on the right the Tonic/Mode/Lenses row with the help, theme, and
  🎸 Guitar buttons on a second row beneath it.
- **Version moved to the footer** (bottom right): *Harmony Mapper v1.5 · beta*
  above the copyright line.
- **All dropdowns unified.** Every dropdown in the app (Tonic, Mode, Lenses,
  Preset Library, and the Bridge inputs) now uses one shared custom component
  with identical styling and keyboard support (↑/↓, Home/End, Enter, Esc,
  type-ahead), instead of a mix of native `<select>`s. This also fixes the
  menus opening **off-screen on mobile** — they now anchor on-screen and fit
  the viewport.

### Security & privacy hardening

- **Self-hosted fonts.** The three web fonts (Crimson Pro, Outfit, JetBrains
  Mono) are now bundled via `@fontsource` instead of loaded from Google Fonts —
  no visitor IP leaks to Google (GDPR), no third-party origin in the runtime
  trust boundary, identical rendering.
- **Content-Security-Policy** added via `kit.csp` (SvelteKit nonces its own
  inline scripts; the app.html theme-init script is allow-listed by hash; Tone.js
  blob: worker and inlined data: fonts are scoped). Plus standard security
  headers via `hooks.server.ts`: `X-Content-Type-Options`, `Referrer-Policy`,
  `X-Frame-Options: DENY`, `Permissions-Policy`. Verified clean (no violations)
  against a production build.

### Guitar diagrams on by default

First-time visitors now see the guitar fretboard diagram straight away — the
**🎸 Guitar** toggle defaults to on (existing visitors keep their saved choice).

---

## v1.4 — 2026-06-19

### Guitar chord diagrams

A new **🎸 Guitar** toggle (top, next to the help and theme buttons) adds a
guitar-fretboard diagram to the chord panel, showing how the focused chord is
played. Shapes come from the open-source [`@tombatossals/chords-db`](https://github.com/tombatossals/chords-db)
database and cover every quality and variation the app produces. Chords with
several voicings can be cycled with the `‹ 1/N ›` arrows. The toggle is remembered
between sessions.

- **Variation-aware:** clicking a variation chip (maj7, sus4, add9…) now also
  redraws the diagram for that exact variation (and highlights the active chip),
  alongside playing the sound.

### Chord panel rework

The chord detail panel is now **always present** instead of appearing and
vanishing on hover:

- **Default state** shows the key's tonic chord (full detail).
- **Hover** a chord for a light preview (name, roman, notes).
- **Click** to pin the full detail (variations, guitar diagram, relationships);
  it stays put while you hover elsewhere. *Clear* returns to the default tonic.
- New two-column layout: guitar diagram on the left, variations on the right,
  outgoing relationships full-width below — saving vertical space.

### Lenses moved to the circle

The lens toggles are now compact colored **chips under the circle** (the thing
they actually control), freeing the sidebar for the chord panel. Long
descriptions moved to tooltips.

---

## v1.3 — 2026-05-06

### Mode-aware functional harmony

The diatonic-motion lens now uses a **per-mode** functional-moves table.
Previously a single Ionian-centric table was applied to all 7 modes, which produced
misleading arrows in modes like Mixolydian (where V is minor, no leading tone, and
the true cadence is ♭VII → I).

Each mode now has its own set of degree-to-degree moves ordered by characteristic
strength:

- **Ionian** — classic functional harmony (V→I, IV→V, ii→V…)
- **Dorian** — IV→i signature, ♭VII→i cadence
- **Phrygian** — ♭II→i Phrygian cadence
- **Lydian** — II is the signature chord, V→I still works
- **Mixolydian** — ♭VII→I and IV→I primary; v→I weakened
- **Aeolian** — ♭VII→i and iv→i carry the cadential weight
- **Locrian** — exploratory moves for an unstable mode

### New lens: Modal cadence

A new toggle highlights the **defining cadence** of the current mode as a
distinct arrow type (saffron color `#c4a04a`). Examples:

- Mixolydian: `♭VII → I`, `IV → I`
- Phrygian: `♭II → i`
- Dorian: `♭VII → i`, `IV → i`
- Aeolian: `♭VII → i`, `iv → i`

Default OFF — toggle in the *Lenses* panel.

### Smaller fixes

- **Diatonic motion** now includes `V → IV` (rock retrograde). Classical theory
  rejects this move; rock and pop use it constantly (Sweet Home Alabama,
  Country Roads, etc.). Added to all modes where it makes sense.
- **Secondary dominants lens**: removed an incorrect skip that suppressed
  arrows like `F → G7` (V7/I) when the *Dominant resolution* lens was also
  active. The two lenses draw different directions and don't duplicate.
- **HelpModal**: corrected the description of the circle of fifths layout
  (rings are minor / major / dom7 from outer to inner — earlier text had
  them reversed). Bridge and Preset Library sections updated to mention
  *direct dominants* and the *modulation* preset category.

---

## v1.2 (and earlier)

Pre-changelog development. See git history once the repo is initialized.
