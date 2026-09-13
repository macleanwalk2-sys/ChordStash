# HANDOFF — Fretboard Chord Explorer

**For:** Claude Code
**From:** prior research session (chord theory research for indie / jam / neo-soul production)
**Owner:** Mac — plays acoustic + electric guitar, produces original music in Ableton

---

## 0. Read this first

You are building a **guitar fretboard chord viewer** — a tool Mac uses while writing and
producing music in Ableton. He picks a chord (or a whole progression) from a list and the
fretboard shows him where to put his fingers and, critically, **what each note is doing
harmonically** (root, 3rd, b7, 9th…).

This is a writing tool, not a lesson site. He already knows the theory well enough; he needs
the shapes under his hands fast, and he needs to see the intervals so he can make voicing
decisions (drop the root, keep the 9th, etc.).

**Appendix A of this file is the complete chord theory reference** that drives the content.
Read it fully before you write code. The chord shapes, the progressions, the arrangement
rules and the "division of labor" section are all real data the app surfaces — they are not
background reading, they are the spec's content layer. The same file ships alongside this one
as `chord-reference.md`.

Take your time. Make it look clean. Ship something he wants to leave open on a second monitor.

---

## 1. What to build — Phase 1 scope

A single-page web app. **One self-contained HTML file** unless you have a strong reason to
split; if you do split, keep it to a plain static site with no build step so he can open it
locally or publish it as an artifact without tooling.

### Core features

**1. Fretboard display**
- Standard 6-string guitar, frets 0–15 (make the visible window configurable later; 0–15 is fine for now).
- Horizontal orientation, low E string at the **bottom** (the way a right-handed player looking down at their own guitar sees it). Make this flippable in settings — some people read it the other way.
- Fret markers at 3, 5, 7, 9, 12 (double dot at 12), 15.
- Nut drawn distinctly from frets.
- Muted strings marked with an `×` above the nut; open strings with an `○`.

**2. Chord selection**
- A browsable list of chords, grouped by family (see §3 data).
- Root selector — the shapes are movable, so picking a different root should **transpose the shape** up or down the neck, not require a separate entry. Shapes with open strings can't transpose; mark those and either grey them out or offer the nearest closed-voicing alternative.
- Quality selector (maj7, maj9, 6/9, m9, m11, 13, 7#9, sus2, add9, maj7#11, quartal…).
- Show **all available voicings** for the selected chord as small selectable thumbnails; clicking one loads it onto the big fretboard.

**3. Interval labelling — this is the important one**
Every fretted note on the board shows its **interval relative to the chord root**, not just
the note name. Give the user a toggle between three label modes:
- `Interval` — R, b3, 3, 5, b7, 7, 9, 11, 13 (default)
- `Note name` — C, Eb, G, Bb, D
- `Both` — stacked, small

Color-code by interval function. Suggested mapping (tune it to your palette, keep it consistent):
- **Root** — the accent color, filled, highest contrast
- **3rd / b3rd** — second-strongest treatment (this is the note that defines major vs minor)
- **7th / b7th** — third treatment
- **Extensions (9, 11, 13)** — a distinct, lighter treatment
- **5th** — deliberately the quietest dot, since it's the first note you drop

That hierarchy *is* the teaching. It should be obvious at a glance which notes are
structural and which are color.

**4. Chord progressions**
- A library of progressions grouped by family (Jangle / Neo-soul / Frank Ocean / Jam / Alex G — see Appendix A §7).
- Selecting a progression shows the chord sequence as a row of chips: Roman numeral on top, chord name below.
- Clicking a chip loads that chord onto the fretboard.
- A **"step through"** control — prev/next, plus keyboard left/right arrows — so he can walk the changes.
- Show the progression's **key**, and transpose the whole progression when he changes key.
- Display the per-progression notes from the reference: the bass line, the piano/upper-structure hint, and the one-line "why it works" note. These are already written in Appendix A §7 — use that copy verbatim, it's part of the product.

**5. Info panel**
For the selected chord, show:
- Chord symbol and full name
- Spelled notes in order, low to high
- Formula (e.g. `1 3 5 7 9`)
- Which notes are **omitted** from this voicing (very common — most of these shapes drop the 5th or the root)
- A short "use it for" line pulled from the reference's character column

---

## 2. Design direction

Read Appendix A §1 and §5 for the world this lives in. The aesthetic reference points are
Mac DeMarco, Steve Lacy, Frank Ocean, Alex G and the Grateful Dead — warm, analog, slightly
faded, not clinical. **Do not** make this look like a generic guitar-tab website, and do not
make it look like a default AI-generated dark dashboard.

Some direction, but use your judgment:
- Think studio hardware and old tape machines rather than SaaS. Warm neutrals, a restrained
  palette, one confident accent. Screen-printed panel labels, not glossy gradients.
- The fretboard itself is the hero. Give it real presence — the wood/fingerboard field, the
  strings with believable relative gauges (low E visibly thicker than high e), the frets as
  actual metal lines. It should look like a nice instrument, not a table with dots in it.
- Typography: pair a characterful display face with a clean body face, plus something with
  good tabular figures for the fret numbers and note labels. Avoid Inter and Space Grotesk.
- Both light and dark themes, done properly with CSS custom properties on `:root`, a
  `prefers-color-scheme` block guarded as `:root:not([data-theme="light"])`, and a
  `:root[data-theme="dark"]` block so an explicit toggle wins. Never define a color only
  inside a media query.
- Responsive down to ~400px. The fretboard gets its own `overflow-x: auto` container at
  narrow widths rather than squashing; everything else stacks.
- Motion: restrained. A note dot settling into place when the chord changes is enough.
  Respect `prefers-reduced-motion`.

Semantic clarity beats decoration everywhere. If a visual flourish makes the intervals
harder to read at a glance, cut it.

---

## 3. Data model

### Tuning
Standard tuning, as MIDI note numbers for the open strings, index 0 = low E:

```js
const TUNING = [40, 45, 50, 55, 59, 64]; // E2 A2 D3 G3 B3 E4
```

Note at a given string/fret = `TUNING[string] + fret`.

### Shapes
Do **not** hardcode note names or interval labels per shape. Store the frets, store the root,
and compute everything else. That way transposition is free and there's one source of truth.

```js
{
  id: "maj9-a-root",
  quality: "maj9",
  label: "maj9",
  // low E → high e. null = muted, 0 = open
  frets: [null, 3, 2, 4, 3, null],
  // fret number that the shape's root sits on, and which string it's on
  rootString: 1,   // index into TUNING (1 = A string)
  rootFret: 3,
  movable: true,   // false if the shape uses open strings
  character: "The indie chord. Use this instead of maj7"
}
```

Derive:
- `pitchClass(string, fret) = (TUNING[string] + fret) % 12`
- `rootPc = pitchClass(rootString, rootFret)`
- `interval = (pc - rootPc + 12) % 12`
- map `interval` → label, **quality-aware**: semitone 3 is `b3` in a minor chord but `#9` in a
  7#9 chord; semitone 10 is `b7`; semitone 2 is `9`; semitone 5 is `11`; semitone 9 is `13`
  in a dominant/extended chord but `6` in a 6/9. Store an `intervalNames` map per quality
  rather than trying to infer it — it's a small table and getting it wrong undermines the
  whole point of the tool.

Transposition: to move a movable shape to a new root, shift every non-null fret by
`(newRootPc - rootPc + 12) % 12`, then if the highest resulting fret exceeds ~15, shift the
whole shape down 12.

### Starter chord set

Ship these. They're all verified and all from the reference (Appendix A §2). Shown rooted on
C where practical; `x` = muted.

| Quality | Frets (E→e) | Root string/fret | Movable |
|---|---|---|---|
| maj7 | `x 3 5 4 5 3` | A / 3 | yes |
| maj7 (E-root) | `8 x 9 9 8 x` | E / 8 | yes |
| maj9 | `x 3 2 4 3 x` | A / 3 | yes |
| 6/9 | `x 3 2 2 3 3` | A / 3 | yes |
| add9 | `x 3 2 0 3 0` | A / 3 | no |
| sus2 | `x 3 0 0 3 3` | A / 3 | no |
| m9 | `x 3 1 3 3 x` | A / 3 | yes |
| m11 | `x 3 3 3 4 3` | A / 3 | yes |
| m6 | `8 x 7 8 8 x` | E / 8 | yes |
| 9 | `x 3 2 3 3 x` | A / 3 | yes |
| 13 | `x 3 x 3 5 5` | A / 3 | yes |
| 7#9 | `x 3 2 3 4 x` | A / 3 | yes |
| maj7#11 | `x 3 4 4 3 x` | A / 3 | yes |
| quartal (3-note) | `x x 5 5 6 x` | — rootless, see note | yes |

Note on the quartal shape: it has no root. Treat rootless voicings as a special case — the
user picks the intended root separately and the app labels the intervals against it. This
matters because rootless voicings are central to the style (see Appendix A §6).

Also include the additional named shapes used by the progressions in Appendix A §7
(`Gmaj7 3 x 4 4 3 x`, `Bm7 x 2 4 2 3 2`, `Am7 x 0 2 0 1 0`, `F6/9 x 8 7 7 8 8`,
`Fmaj7 x 8 10 9 10 8`, `Em7 0 2 0 0 0 0`, `Ebmaj7 x 6 8 7 8 6`, `Dm7 x 5 7 5 6 5`,
`Dmaj7 x 5 7 6 7 5`, `Gm6 3 x 2 3 3 x`, `Am9 x 0 5 4 5 x`, `D13 x 5 x 5 7 7`,
`E7#9 x 7 6 7 8 x`, `A9 5 x 5 6 5 7`, `Cm9 x 3 1 3 3 x`, `Ebmaj9 x 6 5 7 6 x`,
`Abmaj7 4 x 5 5 4 x`, `Bb13 x 1 x 1 3 3`, `Dm9 x 5 3 5 5 x`, `Ebm9 x 6 4 6 6 x`,
`Emaj7 0 x 1 1 0 x`, `F#m7 2 x 2 2 2 x`, `C#m7 x 4 6 4 5 4`, `Amaj7 x 0 2 1 2 0`,
`Bbmaj7 x 1 3 2 3 1`).

Every one of these has been verified note-by-note. Don't "correct" them against another
source without checking the actual pitches first.

### Progressions

```js
{
  id: "a2-chromatic-descent",
  family: "Jangle / Mac DeMarco",
  name: "Chromatic bass descent",
  key: "C",
  note: "Melody must move E → Eb over the Ebmaj7 bar.",
  chords: [
    { roman: "IV",   symbol: "Fmaj7",  shapeId: "maj7-a-root", root: "F",  bars: 1, bass: "F"  },
    { roman: "iii",  symbol: "Em7",    shapeId: "m7-open-e",   root: "E",  bars: 1, bass: "E"  },
    { roman: "bIII", symbol: "Ebmaj7", shapeId: "maj7-a-root", root: "Eb", bars: 1, bass: "Eb" },
    { roman: "ii",   symbol: "Dm7",    shapeId: "m7-a-root",   root: "D",  bars: 1, bass: "D"  },
    { roman: "I",    symbol: "Cmaj7",  shapeId: "maj7-a-root", root: "C",  bars: 1, bass: "C"  }
  ],
  bassLine: "F – E – Eb – D – C, straight chromatic",
  pianoHint: "Shell voicings; keep the guide tones moving by step"
}
```

Enter **all 20 progressions** from Appendix A §7 (families A–E). Keep the Roman numerals, the
bass line notes, the piano hints and the italic "why it works" lines — they're the value.

---

## 4. Phase 2 — do not build yet, but don't architect yourself out of it

Leave room for these. Mac will ask for them.

1. **Audio playback** — strum the shape, play the progression in time. Web Audio, a simple
   plucked-string synth or sampled guitar. Tempo control.
2. **Piano + bass staves** — render the piano voicing and bass note alongside the fretboard,
   using the upper-structure-triad table in Appendix A §6. This is explicitly what he asked
   for originally: guitar chords *plus* piano and bass parts.
3. **MIDI export** — export the progression as a `.mid` file he can drag straight into
   Ableton. Separate tracks for guitar voicing, piano, bass. This is the highest-value
   Phase 2 item by a distance.
4. **Custom progression builder** — let him assemble and save his own progressions, with a
   borrowed-chord palette (Appendix A §3) offering suggestions in the current key.
5. **Capo support** — Mac DeMarco's whole approach depends on it (Appendix A §5).
6. **Voicing/range checker** — flag when a voicing violates the "mud rule" (no 3rds below
   ~G2) or when guitar and piano are colliding in the same register. See Appendix A §6.

Design the data layer so chords carry enough information (actual pitches, not just frets) to
feed audio and MIDI later without a rewrite.

---

## 5. Build constraints

- No build step. Plain HTML/CSS/JS, or a single file.
- If you need a library, load a pinned UMD build from `cdnjs.cloudflare.com` only. Most of
  this needs no library at all — the fretboard is better hand-drawn in SVG or Canvas than
  pulled from a package.
- Fonts from Google Fonts via `<link>`, with real fallback stacks.
- Keyboard accessible: arrow keys step the progression, tab reaches every control, focus is
  visible.
- No `localStorage` for anything that matters; if you use it for a remembered setting, wrap
  it in try/catch and render correctly without it.
- Works offline once loaded.

---

## 6. Definition of done for Phase 1

- [ ] Fretboard renders cleanly, looks like an instrument, readable in both themes
- [ ] All starter shapes selectable and correct
- [ ] Root transposition works, open-string shapes handled honestly
- [ ] Interval labels correct and quality-aware, with the three label modes
- [ ] Interval color hierarchy makes root/3rd/7th/extensions readable at a glance
- [ ] All 20 progressions entered, steppable, transposable, with their notes displayed
- [ ] Info panel shows spelling, formula, and omitted notes
- [ ] Responsive to 400px, no horizontal body scroll
- [ ] Keyboard navigable

---

---

# Appendix A — Chord Reference

> Complete theory reference from the research session. This is the content layer of the app.
> Also shipped as `chord-reference.md`.

---

## 1. The shared DNA

These five artists — Mac DeMarco, Steve Lacy, Frank Ocean, Alex G, Grateful Dead — sound
wildly different on the surface but run on the same six mechanisms.

**1. Bright chord qualities on non-diatonic roots.** The defining trick. Take a root that
doesn't belong to the key (bIII, bVII, bVI) and voice it as a *major 7* rather than a plain
triad. The root says "outside," the quality says "warm." That contradiction is the sound.
Frank Ocean does it constantly; Mac DeMarco built a career on it.

**2. Extensions replace the triad, not decorate it.** Nobody in this world plays a full
barre chord. They play 3–4 notes, usually root-3-7-9 or 3-7-9-13, and let the bass supply
the root. A plain major triad sounds naive here; a maj9 sounds finished.

**3. Slow harmonic rhythm.** One chord per 1–2 bars, looping forever. This is what makes
something feel like a *groove* rather than a *song*. It's the single biggest lever between
"indie rock" and "Steve Lacy."

**4. Modal ambiguity instead of cadence.** Avoid V–I. Use bVII–I, IV–I, or just don't
resolve at all. The Dead sit on one chord for eight minutes; Frank Ocean writes loops that
never touch the tonic. Same idea at different tempos.

**5. The bass is a separate composer.** Inversions, pedal tones and chromatic approach
notes mean the bass line has its own melodic logic. Half the emotional content of these
progressions lives in the bass, not the chords.

**6. Detune and modulation as harmony.** Chorus, tape wow and slightly-flat tuning make a
maj7 *beat* against itself. A Cmaj7 through a deep chorus isn't a cleaner Cmaj7, it's a
different chord. This is why the same voicings sound sterile when you program them dry.

---

## 2. Core chord vocabulary

Guitar shapes written low-to-high: `E A D G B e`. `x` = don't play.

| Chord | Shape | Notes | Character |
|---|---|---|---|
| Cmaj7 | `x 3 5 4 5 3` | C G B E G | full, warm, the default |
| Cmaj7 (E-root) | `8 x 9 9 8 x` | C B E G | tighter, sits higher |
| Cmaj9 | `x 3 2 4 3 x` | C E B D | the indie chord. Use this instead of maj7 |
| C6/9 | `x 3 2 2 3 3` | C E A D G | no 7th = no tension. Endlessly loopable |
| Cadd9 | `x 3 2 0 3 0` | C E G D E | jangly, open, Alex G territory |
| Csus2 | `x 3 0 0 3 3` | C D G D G | no 3rd — ambiguous, floats |
| Cm9 | `x 3 1 3 3 x` | C Eb Bb D | the neo-soul minor. Never use plain m7 |
| Cm11 | `x 3 3 3 4 3` | C F Bb Eb G | lush, hazy, quartal-ish |
| Cm6 | `8 x 7 8 8 x` | C A Eb G | that bittersweet borrowed-iv sound |
| C9 | `x 3 2 3 3 x` | C E Bb D | funk dominant. Bluesy but not harsh |
| C13 | `x 3 x 3 5 5` | C Bb E A | the smooth dominant. Lacy's bread and butter |
| C7#9 | `x 3 2 3 4 x` | C E Bb Eb | the Hendrix chord. Use as a *bed*, not a stab |
| Cmaj7#11 | `x 3 4 4 3 x` | C F# B D | lydian. Dreamy, cinematic, slightly unreal |
| Quartal (3 notes) | `x x 5 5 6 x` | G C F | stacked 4ths — modern, rootless, Weir-ish |

### Quality-swap rules of thumb

- **Triad → add9** whenever a chord feels plain.
- **m7 → m9** always, unless the 9 clashes with the melody.
- **maj7 → 6/9** when the maj7's leading tone feels too tense to loop.
- **7 → 13** for smooth, **7 → 7#9** for dirty, **7 → 9** for funky.
- **Any chord → sus2/sus4** to remove the 3rd and make the harmony ambiguous.

---

## 3. The borrowed-chord palette (modal interchange)

Shown in **C major**. Ranked roughly by how often this style uses them.

| Chord | From | Sound | Who |
|---|---|---|---|
| **bVII** — Bb / Bbmaj7 / Bb9 | mixolydian, minor | The workhorse. Darker but not sad. Resolves down to I | Everyone. The Dead's whole vocabulary |
| **iv** — Fm / Fm7 / Fm6 | minor | The saddest single move in pop. Follow IV with iv | Frank Ocean, Beatles lineage |
| **bVI** — Ab / Abmaj7 | minor | Big, cinematic lift. Heavier than bVII | Choruses, bridges |
| **bIII** — Eb / Ebmaj7 | minor | Chromatic mediant. Disorienting in a pleasant way | Mac DeMarco's signature |
| **IV7 / IVmaj7#11** — F7 / Fmaj7#11 | dorian / lydian | Brightens the subdominant. Backdoor setup | Jam bands, gospel |
| **II (major)** — D / D7 | lydian / V-of-V | Lifts, then usually falls to G | Jazz-leaning writing |
| **bII** — Db / Dbmaj7 | phrygian / tritone sub | Exotic, heavy. Use sparingly | Bridges, one-off surprises |
| **v (minor)** — Gm7 | mixolydian | Removes the leading tone. Kills the cadence on purpose | Modal writing |

**The melody rule:** when you borrow a chord, the melody has to dodge the note you altered.
If you play an Ebmaj7 in C, the melody must move E → Eb during that bar or it will sound
like a mistake. Mac DeMarco does this explicitly and it's the difference between "exotic"
and "wrong."

---

## 4. Device catalog

Reusable moves, not specific progressions.

### bVII drop
`I → bVII`. Borrowed from mixolydian. The most-used non-diatonic move in rock because the
bVII sits a whole step below the tonic and slides back down into it without needing a leading
tone. Voice the bVII as **maj7 for dreamy, dom7 for bluesy** — same root, completely
different emotional read. That choice is one of the biggest levers available.

### Chromatic bass descent
Build a progression where the bass falls by half steps: `F – E – Eb – D – C`. The chords on
top can be ordinary (IV – iii – bIII – ii – I); the chromaticism in the bass is what sells it.
The bIII here is a passing chord, not a key change.

### Chromatic mediant
Two major (or two minor) chords whose roots are a 3rd apart but which share only one note —
C to Eb, C to Ab, C to E. No functional relationship, which is exactly why it sounds
cinematic and unmoored. Starting a section on bIII instead of I disorients the ear until the
progression finally lands home.

### Planing (parallel harmony)
Take one voicing shape and slide it chromatically — `Dm9 → Ebm9 → Dm9 → Cm9`. No functional
harmony at all. It works because the shape is internally consonant and the motion is smooth.
Steve Lacy and The Internet lean on this hard; it's also how you write a part when you don't
want it to imply a key.

### Borrowed iv
`IV → iv → I`. Play the major IV, then immediately the minor version of the same chord. The
b6 scale degree appearing out of nowhere is the most reliable emotional gut-punch in popular
harmony. Voice the iv as **m6** rather than m7 for a brighter, more vintage version.

### Backdoor ii-V
`iv7 → bVII7 → I` (in C: `Fm7 → Bb7 → Cmaj7`). An alternative to the standard ii–V that
approaches the tonic from a whole step *below* instead of a fifth above. Works because Bb7
and G7 share the same underlying diminished structure. Keep the dominant **bright** here —
natural 9, #11, natural 13 — not altered. Sounds like gospel and soul rather than bebop.

### Pedal point
Hold one bass note and move chords above it. `A | G/A | D/A | F/A` keeps the low A constant
while the harmony shifts around it. The core jam-band device for sustaining energy across a
long section without changing key, and how you make a static loop feel like it's developing.

### Modal mixture in a vamp
Alternate between two parallel modes over the same tonal center. The Dead's signature is
D mixolydian (F#) flipping to D dorian (F natural) — one note changes and the whole vamp
goes from bright country to bluesy minor. Can be done in the melody alone while chords stay put.

### Slash chords and inversions
Writing `C/G` instead of `C` changes what the bass plays without changing the chord. Alex G
builds entire progressions from inversions — the roots never appear in the bass, so the
harmony feels unmoored and the bass line becomes a countermelody. Also the easiest way to
make a 3-chord loop sound like 6 chords.

### Quality flip
Same root, opposite quality: `C → Cm`, or a major-key song that lands on the parallel minor
tonic. Cheap, instant, effective in small doses.

### Open-string drone
Keep the top two strings (B and e) ringing while moving shapes underneath on the lower
strings. You get accidental 9ths, 11ths and sus intervals for free, and the constant pitch
acts as a pedal. This is why a lot of indie guitar harmony is *technically* very complex —
it wasn't planned, it's the open strings.

---

## 5. Artist profiles

### Mac DeMarco
Diatonic pop harmony with jazz garnish. Heavy use of **bVII** and **bIII**, frequent
**ii–V** pairs lifted straight out of jazz (sometimes chained: `Dm7 G13 | Gm7 C9 | Fm7 Bb9`),
chromatic bass descents, and **maj7 / 6/9 / 9** voicings almost everywhere. Capos to move
songs into comfortable vocal keys while keeping open E-major-shaped voicings under his
fingers. Harmonic rhythm relatively fast — often a chord per bar.

*Tone matters harmonically:* neck pickup, tone rolled back, clean warm amp (drive 2–3, bass 6,
mid 5, treble 4, presence low), short spring reverb ~20%, and a **deep chorus — rate ~2.5 Hz,
depth ~2/3, mix ~50%** — plus tuning a few cents flat. That combination makes the maj7
interval wobble and detune against itself. Programmed dry, the same chords sound flat.

### Steve Lacy
Minimalism and groove over harmonic complexity. Often only two or three chords, voiced as
**m9, 13, maj7 and 7#9**, plus a lot of **partial chords and double-stops** rather than full
voicings. Syncopated funk-derived rhythm with **ghost notes** (muted strums) carrying as much
information as the pitched ones. The space between chords is the composition. Strat into a
clean bright amp, minimal pedals, fuzz when needed.

### Frank Ocean
The most harmonically adventurous of the group. Non-diatonic **maj7 chords planed against a
modal center** so the key is deliberately unclear — a progression can simultaneously imply
A minor, A dorian, A major and A mixolydian depending on which chord you're hearing from.
Very slow harmonic rhythm, **unresolved loops that avoid the tonic**, gospel-derived iv and
bVI moves, and bass notes chosen for line rather than function. Voicings are often sparse
Rhodes or guitar triads high up with the bass carrying the root a long way below.

### Alex G
Uses **inversions as the primary device** — verses built on `IV⁶₄ – vi⁶₅ – V⁶`-type shapes
where the bass line drives everything and chords never sit in root position. Adds 7ths to
otherwise simple triads. Frequent **quality flips** (major to parallel minor) and progressions
that measurably deviate from standard pop patterns. Often records slightly detuned or tuned
down, with open strings ringing through changes they don't belong to.

### Grateful Dead / jam band
**Modal, not functional.** D mixolydian and D dorian are home territory: `D – C – G – F`
reads as `I – bVII – IV – bIII` with the bVII and bIII borrowed. Two-chord vamps sustained
indefinitely, pedal tones, and **modal mixture** (flipping F#/F natural) as the main source
of variety.

The jazzier side runs on **maj7 drones**: sitting on Emaj7 / E6 / E6/9 creates a "stable yet
unstable" sound — the major 7th wants to resolve up to the tonic and never does. The
improvising scale there is E major pentatonic *plus* the D# (E F# G# B C# D#), two whole-step
groups a fifth apart. Garcia would also drop a straight `ii–V–I` into the middle of a modal
jam to briefly imply a new key, then abandon it.

**Bob Weir's rhythm approach** is the model for a second guitar part: melodic accompaniment
rather than strumming. Broken triads, first-inversion and root-position shapes alternating,
**3rd-less voicings**, sus4s resolving into the next chord, open strings doubling 5ths, and
slash chords (`A/E`, `D/F#`) placed to disrupt a predictable two-beat feel. He deliberately
avoids the register and the notes the lead player is using.

---

## 6. Voicing by instrument

### The division of labor

The most important section. Nobody plays the whole chord.

| Instrument | Range | Plays | Never plays |
|---|---|---|---|
| **Bass** | E1 – G2 | Root (or the specified inversion), one note at a time | Chords. Anything above G2 unless it's a fill |
| **Piano / Rhodes** | C3 – C5 | Guide tones (3rd + 7th) low, upper-structure triad high | The root — the bass has it |
| **Guitar** | G3 – E5 | Color tones: 9, 11, 13, partial triads | The root, usually the 5th |

**The mud rule:** never put an interval of a 3rd below roughly G2. Down there, only octaves
and 5ths stay clear. This is why a piano left hand playing root-position triads in the bass
register ruins a mix — and why guide-tone shells work.

### Piano / Rhodes

**Shell voicings** — left hand plays only root + 3rd + 7th (or just 3rd + 7th if the bass has
the root). Three notes, total clarity, leaves room for everything else.

**Upper-structure triads** — right hand plays a simple major or minor triad a long way from
the root, and the bass defines what the chord actually is. This is the Rhodes sound in
neo-soul and Frank Ocean records, and the fastest way to write a good piano part.

| Bass / chord | Play this triad in the right hand | You get |
|---|---|---|
| Cmaj7 | Em | 3–5–7 |
| Cmaj7 | G | 5–7–9 |
| Cm7 | Eb | b3–5–b7 |
| Cm7 | Bb | b7–9–11 |
| Cm7 | Gm | 5–b7–9 |
| C7 | Bb | b7–9–11 |
| C7 | D | 9–#11–13 |
| C7 | Eb | #9–5–b7 (the Hendrix color) |
| C7 | Db | b9–3–b13 (dark, altered) |
| Cmaj7#11 | D | 9–#11–13 |
| Csus / C11 | Bb | b7–9–11 |

**Rootless voicings** (Bill Evans style) for a more overtly jazzy read:
- **Type A** = 3–5–7–9 (3rd on the bottom)
- **Type B** = 7–9–3–5 (7th on the bottom) — take Type A's bottom two notes and move them to the top
- For dominants, substitute the 13th for the 5th
- Play them centered around middle C. Lower gets muddy, higher gets thin
- Alternate A and B between chords to stay in that register and minimise hand movement

### Bass

1. **Lock to the kick first.** Groove before notes.
2. **Root on the downbeat** of each chord, as the default.
3. **Approach notes into the next root** — chromatic or diatonic, from above or below, placed
   on the "and of 4" or the last eighth of the bar. `G → F# → E` beats `G → E`.
4. **Ghost / dead notes** — muted attacks that add rhythm without pitch. Place one right
   before beat 4 to push into the next bar. Half of what makes a bass line feel alive.
5. **Outline the triad** when you have two bars on one chord: root – b3 – 5, and pick the note
   that approaches the next chord by a half step.
6. **Under static vamps**, use root – 5 – b7 – octave rather than repeating the root.
7. **Inversions are a compositional choice.** Writing `Cmaj7/E` is a decision about the bass
   melody, and it's how you make a 4-chord loop feel like it's going somewhere.

### Guitar — acoustic vs electric

**Acoustic** works best on open-position shapes with ringing strings (add9, sus2, 6/9) and
partial chords played up the neck with open high strings droning underneath. Avoid dense
extension voicings low on the neck — acoustics get muddy fast. Capo to keep open shapes
available in awkward keys.

**Electric** is where the extension voicings live. Neck pickup, tone rolled back, clean, and
3–4 note voicings in the G3–E5 range. Chorus or vibrato is doing real harmonic work — it
detunes the chord against itself. For a second part, use Weir's approach: broken triads,
different inversion, different register from part one.

---

## 7. Progression banks

All original. Roman numerals given so you can transpose. Chord-per-bar unless noted.

### A. Jangle / Mac DeMarco family

**A1 — bVII drop** (G major)
```
| Gmaj7 | Bm7 | Am7 | F6/9 |
    I      iii    ii    bVII
```
Guitar: `3 x 4 4 3 x` / `x 2 4 2 3 2` / `x 0 2 0 1 0` / `x 8 7 7 8 8`
Bass: G – B – A – F. Piano: shells; over F6/9 play an Am triad.
*The F is borrowed. Voiced as 6/9 it reads as hazy rather than as a rock bVII.*

**A2 — chromatic bass descent** (C major)
```
| Fmaj7 | Em7 | Ebmaj7 | Dm7 | Cmaj7 |
   IV      iii    bIII     ii     I
```
Guitar: `x 8 10 9 10 8` / `0 2 0 0 0 0` / `x 6 8 7 8 6` / `x 5 7 5 6 5` / `x 3 5 4 5 3`
Bass: F – E – Eb – D – C, straight chromatic.
*Melody must move E → Eb over the Ebmaj7 bar.*

**A3 — starting on bIII** (G major)
```
| Bbmaj7 | Em7 | Am7 | D7 |  → resolve to Gmaj7
   bIII     vi    ii    V
```
*The ear doesn't find home until bar 5. Good for a verse that keeps you off balance.*

**A4 — the two-flavor bVII** (E major)
```
Verse:  | Emaj7 | Dmaj7 |        I   – bVIImaj7   (dreamy)
Chorus: | E     | D7    | A | B7 |  I – bVII7 – IV – V  (bluesy)
```
*Same root, two qualities, two completely different sections.*

### B. Neo-soul / Steve Lacy family

**B1 — dorian two-chord vamp** (A dorian) — 2 bars each
```
| Am9 | Am9 | D13 | D13 |
   i9           IV13
```
Guitar: `x 0 5 4 5 x` / `x 5 x 5 7 7`
Piano: over Am9 play a C or Em triad; over D13 play an Am triad.
Bass: A with ghost notes and octaves, then D. Heavily syncopated.
*The F# in D13 is what makes this dorian rather than minor. That one note is the mood.*

**B2 — 7#9 bed** (E)
```
| E7#9 | E7#9 | A9 | A9 |     (or hold E7#9 for 8 bars)
```
Guitar: `x 7 6 7 8 x` / `5 x 5 6 5 7`
*Use the 7#9 as a sustained bed, not a stab. The rub between the G (#9) and G# (3rd) is the
entire point. Solo with E minor pentatonic over it.*

**B3 — full aeolian loop** (C minor)
```
| Cm9 | Ebmaj9 | Abmaj7 | Bb13 |
   i      bIII     bVI     bVII
```
Guitar: `x 3 1 3 3 x` / `x 6 5 7 6 x` / `4 x 5 5 4 x` / `x 1 x 1 3 3`
Bass: C – Eb – Ab – Bb, with a B natural or D as a chromatic approach back to C.

**B4 — chromatic planing** (no key)
```
| Dm9 | Ebm9 | Dm9 | Cm9 |
```
Guitar: `x 5 3 5 5 x` / `x 6 4 6 6 x` / `x 5 3 5 5 x` / `x 3 1 3 3 x`
Bass doubles the roots exactly.
*No functional harmony. Works purely because the shape is consonant and moves by step.*

### C. Frank Ocean family

**C1 — the floating maj7 plane** (D center) — 2 bars each
```
| Fmaj7 | Em7 | Dmaj7 | Dmaj7 |
  bIIImaj7  ii    Imaj7
```
Guitar: `x 8 10 9 10 8` / `0 2 0 0 0 0` / `x 5 7 6 7 5`
*The Fmaj7 is borrowed — an F natural over a D center is the minor 3rd — but voicing it as
maj7 stops it reading as sad. Bright quality on a dark root. This is the core Frank Ocean
device, and the loop implies D minor, D dorian and D major at the same time.*

**C2 — pedal point** (F major) — 2 bars each
```
| Fmaj7 | Gm7/F | Bbmaj7/F | Am7/F |
```
Bass holds a low F for all 8 bars. Piano plays the upper triads.
*Static bass, moving harmony. Feels like it's developing without going anywhere.*

**C3 — borrowed iv** (D major)
```
| Dmaj7 | Gmaj7 | Gm6 | Dmaj7 |
    I       IV      iv     I
```
Guitar: `x 5 7 6 7 5` / `3 x 4 4 3 x` / `3 x 2 3 3 x` / `x 5 7 6 7 5`
*Gm6 = G Bb D E. The Bb is the borrowed b6. Nothing else in pop harmony does this.*

**C4 — the loop that never lands** (A major implied, tonic avoided)
```
| Bm7 | Emaj7 | F#m7 | Emaj7 |
   ii    Vmaj7    vi     Vmaj7
```
Guitar: `x 2 4 2 3 2` / `0 x 1 1 0 x` / `2 x 2 2 2 x` / `0 x 1 1 0 x`
*Emaj7 instead of E7 removes the dominant's pull. The loop can run forever without ever
implying resolution. Never play the A.*

### D. Jam / Grateful Dead family

**D1 — mixolydian vamp** (D mixolydian) — 2 or 4 bars each
```
| D | C | D | C |
  I  bVII
```
Solo scale: D mixolydian (D E F# G A B C). Flip the F# to F natural for D dorian mid-jam —
that one-note change is the whole trick.
Bass: D pedal with octaves, or D – C walking.

**D2 — rotating bright vamp** (A major / mixolydian)
```
| A | D | G | D |
  I  IV bVII IV
```
*Never cadences, so it loops indefinitely. Guitar 2 should play different inversions in a
different register: `x 0 2 2 2 0` / `x 5 4 2 3 2` / `3 x 0 0 0 3`.*

**D3 — maj7 drone** (E major) — 4 bars each
```
| Emaj7 | Emaj7 | E6/9 | Emaj7 |
```
Guitar: `0 x 1 1 0 x` / `x 7 6 6 7 7`
Solo scale: E F# G# B C# D# (E major pentatonic + the major 7th).
*The D# wants to resolve to E and never does. Stable and unstable at once — that tension is
what sustains a long, static section.*

**D4 — pedal-point build** (A)
```
| A | G/A | D/A | F/A |
```
Bass holds low A throughout. Guitar moves triads above it.
*A mixolydian for the first three chords, then the F adds a bVI color. Ideal for building a
long crescendo without changing key.*

**D5 — the ii-V drop-in**
Sit on a modal vamp, then insert `| Bm7 | E7 | Amaj7 |` to briefly imply a new key, then
abandon it and return to the vamp. Garcia's move for injecting harmonic motion into a static jam.

### E. Alex G family

**E1 — inversions as the point** (G major)
```
| C/G | Em7/D | D/F# | G |
  IV⁶₄  vi⁶₅    V⁶     I
```
*The bass line (G – D – F# – G) is the actual composition. Root position appears once.*

**E2 — quality flip** (C major)
```
| C | Cm | G | G |
  I    i   V
```
*Sweet then immediately sour. Small doses.*

**E3 — open-string drone** (E minor-ish)
```
| Emadd9 | Cmaj7 | G6 | D |
```
Play all of these keeping the B and e strings open:
`0 2 4 4 0 0` / `x 3 5 4 0 0` / `3 x 4 4 0 0` / `x 5 4 2 0 0`
*The open strings create 9ths and 6ths that don't belong to the shapes. That accidental
complexity is the sound.*

---

## 8. Writing rules

**Voice leading**
1. Move the fewest notes possible between chords.
2. Hold common tones in the same voice.
3. Move everything else by step — half or whole.
4. When you have to jump, jump in the bass. Never in an inner voice.
5. When roots move by a 4th, the 7th of the first chord falls by step to the 3rd of the next.
   This is the mechanism behind every ii–V that has ever sounded good.

**Harmonic rhythm by style**

| Style | Chords per bar | Tempo | Feel |
|---|---|---|---|
| Mac DeMarco / Alex G | 1–2 | 90–120 | straight or slightly loose |
| Steve Lacy | 1 per 1–2 bars | 80–105 | swung, often half-time |
| Frank Ocean | 1 per 2 bars | 70–95 | ambiguous, sometimes free |
| Jam / Dead | 1 per 2–4 bars | 100–135 | shuffle or straight-8 |

**Building a section**
- Verse: fewest chords, slowest harmonic rhythm, most space.
- Chorus/lift: introduce one borrowed chord (bVI or iv does the most work).
- Bridge: chromatic mediant, or shift the tonal center without formally modulating.
- Never resolve when you can loop.

---

## 9. Ableton notes

- **Record guitar DI and a parallel amp-sim/mic path.** The DI allows re-amping after the
  arrangement is decided.
- **Write piano and bass as MIDI** so voicings stay editable. Hand-voice them — the Chord
  device is fine for sketching but it stacks intervals mechanically and ignores the
  division-of-labor rules in §6.
- **Scale device** to constrain a part to a mode while writing. Turn it off before finalising —
  the borrowed chords are the whole point and Scale will flatten them out.
- **Groove Pool** for swing on the MIDI parts; match it to the guitar's natural feel rather
  than quantising the guitar to the grid.
- **The DeMarco wobble:** Chorus-Ensemble, rate ~2.5 Hz, depth ~2/3, ~50% wet, plus tuning the
  guitar a few cents flat. Add light saturation/tape to roll off the highs.
- **Keep the low end mono** below ~120 Hz. One bass note at a time.
- **High-pass the guitar and Rhodes** around 100–150 Hz so the bass owns the bottom.

---

## 10. Cheat sheet

**When it sounds too plain** → add the 9th. Turn triads into add9, m7s into m9.
**When it sounds too sweet** → borrow the iv, or flip a maj7 to a dom7.
**When it won't loop** → remove the V. Replace with bVII or IV.
**When it feels static** → move the bass, not the chords. Use inversions and pedal tones.
**When it sounds like a jazz exercise** → slow the harmonic rhythm and delete a chord.
**When it sounds muddy** → something is playing a 3rd below G2. Usually the piano's left hand.
**When it sounds sterile** → the guitar isn't detuning against itself. Add chorus/vibrato.
**When you're stuck** → take one shape and plane it chromatically. Decide what it means later.

---

## Sources

Research behind Appendix A:

- [Mac DeMarco Chord Theory — Reverb Machine](https://reverbmachine.com/blog/mac-demarco-chord-theory/)
- [Frank Ocean – Pink and White — Ethan Hein](https://www.ethanhein.com/wp/2017/frank-ocean-pink-and-white/)
- [What does Jerry Garcia play on "Eyes of the World" — Ethan Hein](https://www.ethanhein.com/wp/2024/what-does-jerry-garcia-play-on-eyes-of-the-world-and-why-does-it-sound-so-cool/)
- [I Know You Rider — Guitar Music Theory (Desi Serna)](https://www.guitarmusictheory.com/i-know-you-rider-grateful-dead-guitar-chords-and-scales/)
- [Bob Weir's Rhythm Guitar Trip — Premier Guitar](https://www.premierguitar.com/bob-weirs-rhythm-guitar-trip)
- [How to Get Steve Lacy's Guitar Sound — Riffhard](https://www.riffhard.com/how-to-get-steve-lacys-guitar-sound/)
- [Runner by Alex G — Hooktheory](https://www.hooktheory.com/theorytab/view/alex-g/runner)
- [The Backdoor ii-V Progression — Anton Schwartz](https://antonjazz.com/2012/01/backdoor-ii-v-progression/)
- [Rootless Chord Voicings for Jazz Piano — PianoGroove](https://www.pianogroove.com/jazz-piano-lessons/rootless-chord-voicings/)
- [Neo Soul Guitar Lesson — Fundamental Changes](https://www.fundamental-changes.com/neo-soul-chords/)
- [Build Better Bass Lines with Dead Notes and Approach Notes — No Treble](https://www.notreble.com/buzz/2026/04/22/build-better-bass-lines-with-dead-notes-and-approach-notes/)
- [Mac DeMarco Guitar Tone and Amp Settings — Northern Valley Audio](https://www.northernvalleyaudio.com/blog/mac-demarco-guitar-tone-settings)
