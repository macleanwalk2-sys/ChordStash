# ChordStash

A guitar fretboard chord viewer for writing and producing — the shapes under your
hands, and **what each note is doing harmonically**, at a glance.

Built from `docs/HANDOFF.md` and the chord reference in `docs/chord-reference.md`.
Phase 1 scope.

---

**Live:** https://claude.ai/code/artifact/ebe28b4e-bba7-408f-8421-0a5e2a06e226
(private to your account — share it from the page's share menu if you want to)

## Running it

No build step, no dependencies, no tooling.

```
open index.html
```

That's it — it works straight off the filesystem and offline. Scripts are plain
classic `<script>` tags (not ES modules) specifically so `file://` works; the only
network request is Google Fonts, which falls back cleanly when it fails.

To serve it instead: `python3 -m http.server` and open `localhost:8000`.

There is a `manifest.json`, so it installs as a standalone app from a served copy.

---

## What it does

**Fretboard** — frets 0–15, low E at the bottom by default (flippable), real fret
taper, believable relative string gauges, muted strings marked `×` and open strings
drawn as ringed dots that still carry their interval.

**Interval labelling** — every fretted note shows its interval relative to the chord
root, in three modes (interval / note name / both). The labels are **quality-aware**:
semitone 3 is `♭3` in a minor chord but `♯9` in a 7♯9, and semitone 9 is `13` in an
extended dominant but `6` in a 6/9.

Colour encodes function, and the hierarchy *is* the teaching:

| | treatment |
|---|---|
| Root | accent, filled, ringed |
| 3rd / ♭3rd | bone, highest contrast — defines major vs minor |
| 7th / ♭7th | dusty teal |
| Extensions 9 / 11 / 13 | violet |
| 5th | hollow outline, quietest — the first note you drop |

**Chords** — 12 roots × 19 qualities, 44 shapes. Shapes transpose; where a shape can't reach a
root it is greyed out with the reason, and the nearest playable voicing is
substituted with a note saying so. All available voicings show as thumbnails.

**Progressions** — all 20 from the reference, families A–E. Roman numerals, per-chord
bar counts, slash-chord bass notes, click-to-load chips, prev/next plus ← → arrow keys,
and full transposition into any key. The bass lines, piano hints and "why it works"
lines are the reference's own words.

**Voice leading** — stepping a progression shows what the change actually costs:
how many common tones are held, how many of the remaining notes move by step, and
each individual motion with its direction and distance. Held notes are **tied** on
the fretboard so you can see which fingers stay put. Index 0 compares against the
last chord, because these progressions loop.

This is reference §8 made visible. `E7 → Amaj7` shows `D(♭7) → C♯(3)` — the 7th
falling by step to the 3rd, which is rule 5. `Em7 → E♭maj7` in A2 shows E→E♭ and
B→B♭, which is exactly the chromatic slip the progression's own note warns about.

**Ghost tones** — a toggle that shows every other place on the neck the current
chord's tones live, faint and colour-coded by function. Tones come from the
quality's formula rather than the shape, so an omitted 5th still shows up. Useful
for building your own voicing around the one you're holding.

**Info panel** — spelling low→high, formula with omitted degrees struck through,
what the voicing *adds* beyond the chord symbol (the open-string drones pick up
notes the symbol never asked for), a "use it for" line, and one-click quality swaps
from the reference's swap rules.

**Palette tab** — the borrowed-chord table re-spelled into whatever key you pick,
the melody rule, the division-of-labour table and the cheat sheet.

---

## Architecture

The core decision: **nothing is hardcoded per chord.** A shape stores its frets and
which string/fret the root sits on. Everything else — note names, intervals,
spelling, omissions, transposition — is computed.

```
src/theory.js        pitch, spelling, quality tables, transposition, voicing building
src/shapes.js        the shape library + voicing resolution and fallback
src/progressions.js  the 20 progressions + key transposition
src/fretboard.js     SVG rendering (main board + mini chord boxes)
src/reference.js     borrowed-chord palette, division of labour, cheat sheet
src/app.js           state and UI wiring
assets/app.css       tokens and layout
```

This was worth verifying rather than assuming, and it holds: **every single voicing
written in the reference is reproduced exactly** by transposing a canonical shape —
including the open-position ones. The open Am7 `x 0 2 0 1 0` is just the A-form m7
barre normalised down to the lowest playable position; so are open E, open D, open Am
and open Dm. 77 progression chords across all 20 progressions, 0 hand-entered
voicings, 0 mismatches.

### Spelling

Notes are spelled by scale degree, so the ♯9 over C is `D♯`, not `E♭`. The one
exception: when strict spelling would need a **double accidental** it falls back to
the plain enharmonic. The ♯9 of E is literally F𝄪; every player, and the reference,
calls that note G. Single accidentals stay strict — the interval label sits right
next to the name and explains it.

### Transposition

Shift every fretted note by the interval, then normalise to the lowest playable
position. If the result runs past fret 15, drop an octave; if every note sits at
fret 12 or above, drop an octave again. That last rule is what makes the open shapes
fall out of the barre shapes for free.

---

## Known limits

- **`Am9 x 0 5 4 5 x`** (progression B1) has no 3rd in it — the shape is A / G / B / E,
  so it is really a rootless-leaning m9 with the bass supplying the third. It is
  entered as written, per the reference's instruction not to "correct" verified
  shapes, and the info panel reports the omission honestly rather than hiding it.
  Same story with `Emadd9 0 2 4 4 0 0` and `G6 3 x 4 4 0 0`, where the open strings
  add notes the chord symbol doesn't own. That reporting is the feature, not a bug.
- Transposing progression **E3** (and any other open-drone voicing) out of its written
  key substitutes a movable shape, because those voicings *are* their open strings.
  The app says so on screen instead of pretending.
- 7♯9 still ships a single shape; the A-root form is the one that actually sits
  under the hand. Everything else has at least two positions.
- Voice leading is compared by pitch class, not by literal voice. Guitar voicings
  double notes and change string count between chords, so "the alto moved" isn't a
  question this can honestly answer — what it does answer is which tones are shared
  and how far the rest have to travel.

## URL state

The current chord or progression step lives in the location hash, so any view is
bookmarkable and linkable — `#p/a2/C/2` is A2 in C on the third chord, `#c/C/maj9/maj9-a/0`
is a Cmaj9. Quality ids contain `#` and `/`, so each segment is encoded individually.

## Phase 2 — deliberately left room for

The data layer already carries real pitches (`voicing.pitches` is MIDI note numbers,
`voicing.sounding` is the full note objects low→high), so none of this needs a rewrite:

1. **Audio playback** — strum the shape, play the progression in time.
2. **Piano + bass staves** — the upper-structure-triad table is already in `reference.js`.
3. **MIDI export** — separate tracks for guitar / piano / bass, straight into Ableton.
4. **Custom progression builder** — the borrowed-chord palette is already key-aware.
5. **Capo support.**
6. **Voicing/range checker** — the mud rule, flagging 3rds below ~G2.
