/* ChordStash — theory.js
 * Pitch, spelling, interval naming and chord qualities.
 * Everything the app displays about a chord is derived here from three facts:
 * the frets, the root, and the quality. Nothing is hardcoded per shape.
 */
(function (CS) {
  'use strict';

  /* ---------------------------------------------------------------- tuning */

  // Standard tuning as MIDI numbers, index 0 = low E.
  var TUNING = [40, 45, 50, 55, 59, 64]; // E2 A2 D3 G3 B3 E4
  var MAX_FRET = 15;

  var LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  var LETTER_PC = [0, 2, 4, 5, 7, 9, 11];
  var FLAT_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
  var SHARP_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  // The roots offered in the picker. Flat-side spellings dominate this
  // repertoire (Ebmaj7, Bbmaj7, Abmaj7, F6/9) but F# beats Gb.
  var ROOTS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

  function mod(n, m) { return ((n % m) + m) % m; }

  function parseNote(name) {
    var li = LETTERS.indexOf(String(name).charAt(0).toUpperCase());
    if (li < 0) li = 0;
    var acc = 0, rest = String(name).slice(1), i;
    for (i = 0; i < rest.length; i++) {
      var ch = rest.charAt(i);
      if (ch === '#' || ch === '♯') acc++;
      else if (ch === 'b' || ch === '♭') acc--;
    }
    return { letter: li, acc: acc, pc: mod(LETTER_PC[li] + acc, 12) };
  }

  function pcOf(name) { return parseNote(name).pc; }

  function accString(acc) {
    if (acc === 0) return '';
    return new Array(Math.abs(acc) + 1).join(acc > 0 ? '#' : 'b');
  }

  function simpleName(pc, preferFlats) {
    return (preferFlats ? FLAT_NAMES : SHARP_NAMES)[mod(pc, 12)];
  }

  /* --------------------------------------------------------------- spelling
   * Spell a note as a given scale degree above a root, so a #9 reads as D#
   * over C rather than Eb. Falls back to a plain enharmonic if the strictly
   * correct answer needs a double accidental.
   */
  function spell(rootName, degree, semitone) {
    var r = parseNote(rootName);
    var li = mod(r.letter + (degree - 1), 7);
    var natural = LETTER_PC[li];
    var actual = mod(r.pc + semitone, 12);
    var acc = mod(actual - natural + 6, 12) - 6;
    // A double accidental is where strict spelling stops helping: the #9 of E
    // is literally F double-sharp, but every player -- and the reference --
    // calls that note G. Single accidentals stay strict, since the interval
    // label sits right next to the name and explains it.
    if (Math.abs(acc) >= 2) return simpleName(actual, r.acc < 0);
    return LETTERS[li] + accString(acc);
  }

  /* Transpose a chord root from one key to another, preserving the interval
   * spelling: bIII of C (Eb) becomes bIII of G (Bb), never A#. */
  function transposeName(name, fromKey, toKey) {
    var n = parseNote(name), f = parseNote(fromKey), t = parseNote(toKey);
    var letterDelta = mod(n.letter - f.letter, 7);
    var pcDelta = mod(n.pc - f.pc, 12);
    var li = mod(t.letter + letterDelta, 7);
    var natural = LETTER_PC[li];
    var actual = mod(t.pc + pcDelta, 12);
    var acc = mod(actual - natural + 6, 12) - 6;
    if (Math.abs(acc) >= 2) return simpleName(actual, t.acc < 0);
    return LETTERS[li] + accString(acc);
  }

  /* Render ASCII accidentals as real musical glyphs for display only. */
  function pretty(s) {
    return String(s).replace(/#/g, '♯').replace(/b(?=\d|$)/g, '♭')
      .replace(/^([A-G])b/, '$1♭');
  }

  /* ------------------------------------------------------- interval naming
   * Quality-aware, as a table rather than inferred: semitone 3 is b3 in a
   * minor chord but #9 in a 7#9, and semitone 9 is 13 in an extended
   * dominant but 6 in a 6/9. Getting this wrong undermines the whole tool.
   */
  var MAJOR = { 0:'R', 1:'b9', 2:'9', 3:'#9', 4:'3', 5:'11', 6:'#11', 7:'5', 8:'b13', 9:'13', 10:'b7', 11:'7' };
  var MINOR = { 0:'R', 1:'b9', 2:'9', 3:'b3', 4:'3', 5:'11', 6:'b5', 7:'5', 8:'b6', 9:'13', 10:'b7', 11:'7' };

  function map(base, over) {
    var out = {}, k;
    for (k in base) if (Object.prototype.hasOwnProperty.call(base, k)) out[k] = base[k];
    for (k in over || {}) if (Object.prototype.hasOwnProperty.call(over, k)) out[k] = over[k];
    return out;
  }

  var SIXTH = { 9: '6' };

  /* --------------------------------------------------------------- qualities
   * formula: semitones that make up the chord, in stacking order.
   * names:   semitone -> interval label for this quality.
   * swaps:   the reference's quality-swap rules, surfaced as one-click moves.
   */
  var QUALITIES = {
    'maj':     { name: 'Major triad',    suffix: '',         family: 'Major',      formula: [0,4,7],
                 names: map(MAJOR, SIXTH),
                 character: 'Plain on its own. In this world it wants a 9th on top.',
                 swaps: [['add9','Whenever a chord feels plain'], ['6/9','Loopable, no leading tone'], ['maj7','Warm and finished']] },
    'maj7':    { name: 'Major 7th',      suffix: 'maj7',     family: 'Major',      formula: [0,4,7,11],
                 names: MAJOR,
                 character: 'Full, warm, the default.',
                 swaps: [['maj9','The indie chord — use this instead'], ['6/9','When the leading tone is too tense to loop'], ['maj7#11','Lydian, dreamier']] },
    'maj9':    { name: 'Major 9th',      suffix: 'maj9',     family: 'Major',      formula: [0,4,7,11,2],
                 names: MAJOR,
                 character: 'The indie chord. Use this instead of maj7.',
                 swaps: [['6/9','Drop the 7th, loop forever'], ['maj7#11','Push it lydian']] },
    'maj7#11': { name: 'Major 7♯11', suffix: 'maj7#11', family: 'Major',      formula: [0,4,7,11,2,6],
                 names: MAJOR,
                 character: 'Lydian. Dreamy, cinematic, slightly unreal.',
                 swaps: [['maj9','Pull it back to earth'], ['6/9','Remove the tension entirely']] },
    '6/9':     { name: 'Six-nine',       suffix: '6/9',      family: 'Major',      formula: [0,4,7,9,2],
                 names: map(MAJOR, SIXTH),
                 character: 'No 7th = no tension. Endlessly loopable.',
                 swaps: [['maj9','Add the leading tone back'], ['add9','Simpler, more open']] },
    '6':       { name: 'Major 6th',      suffix: '6',        family: 'Major',      formula: [0,4,7,9],
                 names: map(MAJOR, SIXTH),
                 character: 'Sweet and vintage. No leading tone, so it sits still.',
                 swaps: [['6/9','Add the 9th'], ['maj7','Add the tension back']] },
    'add9':    { name: 'Add 9',          suffix: 'add9',     family: 'Major',      formula: [0,4,7,2],
                 names: map(MAJOR, SIXTH),
                 character: 'Jangly, open, Alex G territory.',
                 swaps: [['6/9','Richer, still no 7th'], ['sus2','Remove the 3rd entirely']] },
    'sus2':    { name: 'Suspended 2nd',  suffix: 'sus2',     family: 'Suspended',  formula: [0,2,7],
                 names: map(MAJOR, { 2: '2', 5: '4', 9: '6' }),
                 character: 'No 3rd — ambiguous, floats.',
                 swaps: [['add9','Put the 3rd back'], ['m11','Hazier, minor-leaning']] },
    'm':       { name: 'Minor triad',    suffix: 'm',        family: 'Minor',      formula: [0,3,7],
                 names: map(MINOR, SIXTH),
                 character: 'Plain minor. The reference says go to m9.',
                 swaps: [['m9','Always, unless the 9 clashes'], ['madd9','Keep it airy'], ['m6','Brighter, more vintage']] },
    'm7':      { name: 'Minor 7th',      suffix: 'm7',       family: 'Minor',      formula: [0,3,7,10],
                 names: MINOR,
                 character: 'Serviceable — but the rule is m7 → m9, always.',
                 swaps: [['m9','The neo-soul minor'], ['m11','Lush and hazy'], ['m6','Bittersweet, borrowed-iv']] },
    'm9':      { name: 'Minor 9th',      suffix: 'm9',       family: 'Minor',      formula: [0,3,7,10,2],
                 names: MINOR,
                 character: 'The neo-soul minor. Never use plain m7.',
                 swaps: [['m11','Even hazier'], ['m6','Brighter, borrowed-iv']] },
    'm11':     { name: 'Minor 11th',     suffix: 'm11',      family: 'Minor',      formula: [0,3,7,10,2,5],
                 names: MINOR,
                 character: 'Lush, hazy, quartal-ish.',
                 swaps: [['m9','Tighter'], ['quartal','Strip it to stacked 4ths']] },
    'm6':      { name: 'Minor 6th',      suffix: 'm6',       family: 'Minor',      formula: [0,3,7,9],
                 names: map(MINOR, SIXTH),
                 character: 'That bittersweet borrowed-iv sound.',
                 swaps: [['m9','Darker'], ['m','Strip it back']] },
    'madd9':   { name: 'Minor add 9',    suffix: 'm(add9)',  family: 'Minor',      formula: [0,3,7,2],
                 names: map(MINOR, SIXTH),
                 character: 'Minor with air in it. Open-string territory.',
                 swaps: [['m9','Add the ♭7'], ['sus2','Lose the 3rd']] },
    '7':       { name: 'Dominant 7th',   suffix: '7',        family: 'Dominant',   formula: [0,4,7,10],
                 names: MAJOR,
                 character: 'Straight dominant. Bluesy read of a ♭VII.',
                 swaps: [['13','Smooth'], ['7#9','Dirty'], ['9','Funky']] },
    '9':       { name: 'Dominant 9th',   suffix: '9',        family: 'Dominant',   formula: [0,4,7,10,2],
                 names: MAJOR,
                 character: 'Funk dominant. Bluesy but not harsh.',
                 swaps: [['13','Smoother'], ['7#9','Dirtier']] },
    '13':      { name: 'Dominant 13th',  suffix: '13',       family: 'Dominant',   formula: [0,4,7,10,2,9],
                 names: MAJOR,
                 character: 'The smooth dominant. Lacy’s bread and butter.',
                 swaps: [['9','Funkier'], ['7#9','Dirtier']] },
    '7#9':     { name: 'Dominant 7♯9', suffix: '7#9',   family: 'Dominant',   formula: [0,4,7,10,3],
                 names: MAJOR,
                 character: 'The Hendrix chord. Use as a bed, not a stab.',
                 swaps: [['13','Smooth it out'], ['9','Clean it up']] },
    'quartal': { name: 'Stacked 4ths',   suffix: ' quartal', family: 'Other',      formula: [0,5,10], rootless: true,
                 names: MAJOR,
                 character: 'Stacked 4ths — modern, rootless, Weir-ish.',
                 swaps: [['m11','Give it a root'], ['sus2','Keep it ambiguous']] }
  };

  var QUALITY_FAMILIES = ['Major', 'Minor', 'Dominant', 'Suspended', 'Other'];

  /* Explicit display order. Object.keys() hoists integer-like keys, which
   * would float '6', '7', '9' and '13' to the top of their families. */
  var QUALITY_ORDER = [
    'maj', 'maj7', 'maj9', 'maj7#11', '6/9', '6', 'add9',
    'sus2',
    'm', 'm7', 'm9', 'm11', 'm6', 'madd9',
    '7', '9', '13', '7#9',
    'quartal'
  ];

  /* Interval label -> scale degree, for spelling. */
  var DEGREE = {
    'R':1, 'b9':2, '9':2, '#9':2, '2':2, 'b3':3, '3':3,
    '11':4, '#11':4, '4':4, 'b5':5, '5':5, 'b6':6, '6':6, 'b13':6, '13':6, 'b7':7, '7':7
  };

  /* Visual/harmonic role, derived from the label rather than the semitone so
   * that the 3 semitones of a 7#9 read as colour, not as a minor 3rd. */
  function roleOf(label) {
    if (label === 'R') return 'root';
    if (label === '3' || label === 'b3') return 'third';
    if (label === '7' || label === 'b7') return 'seventh';
    if (label === '5') return 'fifth';
    return 'ext';
  }

  function intervalLabel(quality, semitone) {
    var q = QUALITIES[quality] || QUALITIES['maj7'];
    return q.names[mod(semitone, 12)] || MAJOR[mod(semitone, 12)];
  }

  function formulaLabels(quality) {
    var q = QUALITIES[quality];
    if (!q) return [];
    return q.formula.map(function (s) { return intervalLabel(quality, s); });
  }

  /* ---------------------------------------------------------- transposition
   * Shift every fretted note by the interval, then normalise to the lowest
   * playable position. This is what makes the open shapes fall out of the
   * barre shapes for free: the A-form m7 at fret 12 normalises to the open
   * Am7 at fret 0.
   */
  function shift(frets, by) {
    return frets.map(function (f) { return f === null ? null : f + by; });
  }
  function played(frets) {
    return frets.filter(function (f) { return f !== null; });
  }

  function transposeShape(shape, targetPc, octaveOffset) {
    if (!shape.movable) {
      return mod(shape.rootPc, 12) === mod(targetPc, 12) ? shape.frets.slice() : null;
    }
    var delta = mod(targetPc - shape.rootPc, 12);
    var out = shift(shape.frets, delta);
    var guard = 0;
    while (Math.max.apply(null, played(out)) > MAX_FRET && guard++ < 4) out = shift(out, -12);
    guard = 0;
    while (Math.min.apply(null, played(out)) >= 12 && guard++ < 4) out = shift(out, -12);
    if (Math.min.apply(null, played(out)) < 0) out = shift(out, 12);
    if (octaveOffset) out = shift(out, octaveOffset * 12);
    if (Math.min.apply(null, played(out)) < 0) return null;
    if (Math.max.apply(null, played(out)) > MAX_FRET) return null;
    return out;
  }

  /* ------------------------------------------------------------- voicings
   * A voicing carries real pitches, not just frets, so audio and MIDI export
   * can be layered on later without touching this code.
   */
  function buildVoicing(opts) {
    var frets = opts.frets;
    var root = opts.root;
    var quality = opts.quality;
    var q = QUALITIES[quality] || QUALITIES['maj7'];
    var rootPc = pcOf(root);

    var notes = frets.map(function (f, s) {
      if (f === null || f === undefined) {
        return { string: s, fret: null, muted: true };
      }
      var midi = TUNING[s] + f;
      var pc = mod(midi, 12);
      var semi = mod(pc - rootPc, 12);
      var label = intervalLabel(quality, semi);
      return {
        string: s, fret: f, midi: midi, pc: pc, semi: semi,
        label: label, role: roleOf(label),
        name: spell(root, DEGREE[label] || 1, semi),
        open: f === 0, muted: false
      };
    });

    var sounding = notes.filter(function (n) { return !n.muted; })
      .sort(function (a, b) { return a.midi - b.midi; });

    var present = {};
    sounding.forEach(function (n) { present[n.semi] = true; });

    var omitted = q.formula.filter(function (s) { return !present[s]; })
      .map(function (s) {
        return { semi: s, label: intervalLabel(quality, s), name: spell(root, DEGREE[intervalLabel(quality, s)] || 1, s) };
      });

    var inFormula = {};
    q.formula.forEach(function (s) { inFormula[s] = true; });
    var added = [];
    var seenAdd = {};
    sounding.forEach(function (n) {
      if (!inFormula[n.semi] && !seenAdd[n.semi]) {
        seenAdd[n.semi] = true;
        added.push({ semi: n.semi, label: n.label, name: n.name });
      }
    });

    var fs = played(frets);
    var fretted = fs.filter(function (f) { return f > 0; });
    var lowest = fretted.length ? Math.min.apply(null, fretted) : 0;
    var highest = fs.length ? Math.max.apply(null, fs) : 0;

    return {
      frets: frets.slice(),
      root: root, rootPc: rootPc, quality: quality,
      notes: notes,
      sounding: sounding,
      spelling: sounding.map(function (n) { return n.name; }),
      pitches: sounding.map(function (n) { return n.midi; }),
      formula: formulaLabels(quality),
      omitted: omitted,
      added: added,
      hasOpen: fs.indexOf(0) >= 0,
      span: fretted.length ? highest - lowest : 0,
      lowFret: lowest,
      highFret: highest,
      strings: sounding.length
    };
  }

  function symbolFor(root, quality) {
    var q = QUALITIES[quality];
    return root + (q ? q.suffix : '');
  }


  /* ----------------------------------------------------------- voice leading
   * Reference §8: move the fewest notes possible, hold common tones, move
   * everything else by step. Comparing two voicings by pitch class shows which
   * notes are held and which have to move — and how far.
   */
  function signedStep(fromPc, toPc) {
    return mod(toPc - fromPc + 6, 12) - 6; // -6..5, negative = falling
  }

  function pcNotes(voicing) {
    var seen = {}, out = [];
    voicing.sounding.forEach(function (n) {
      if (!seen[n.pc]) { seen[n.pc] = n; out.push(n); }
    });
    return out;
  }

  function voiceLeading(prevVoicing, curVoicing) {
    if (!prevVoicing || !curVoicing) return null;
    var prev = pcNotes(prevVoicing), cur = pcNotes(curVoicing);
    var prevPc = prev.map(function (n) { return n.pc; });
    var curPc = cur.map(function (n) { return n.pc; });

    var held = cur.filter(function (n) { return prevPc.indexOf(n.pc) >= 0; });
    var arrivals = cur.filter(function (n) { return prevPc.indexOf(n.pc) < 0; });
    var departures = prev.filter(function (n) { return curPc.indexOf(n.pc) < 0; });

    /* Pair each arriving note with the departing note nearest to it, closest
     * pair first, so two arrivals never claim the same departure. */
    var pairs = [];
    arrivals.forEach(function (a) {
      departures.forEach(function (d) {
        pairs.push({ to: a, from: d, semitones: signedStep(d.pc, a.pc) });
      });
    });
    pairs.sort(function (x, y) { return Math.abs(x.semitones) - Math.abs(y.semitones); });

    var usedTo = {}, usedFrom = {}, moved = [];
    pairs.forEach(function (pr) {
      if (usedTo[pr.to.pc] || usedFrom[pr.from.pc]) return;
      usedTo[pr.to.pc] = 1; usedFrom[pr.from.pc] = 1;
      moved.push(pr);
    });
    arrivals.forEach(function (a) {
      if (!usedTo[a.pc]) moved.push({ to: a, from: null, semitones: null });
    });
    moved.sort(function (x, y) { return x.to.midi - y.to.midi; });

    var stepwise = moved.filter(function (m) {
      return m.semitones !== null && Math.abs(m.semitones) <= 2;
    }).length;

    return {
      held: held,
      heldPcs: held.map(function (n) { return n.pc; }),
      moved: moved,
      dropped: departures.filter(function (d) { return !usedFrom[d.pc]; }),
      commonTones: held.length,
      stepwise: stepwise,
      /* The reference's first rule, as a number: how much has to move at all. */
      motion: moved.length
    };
  }

  CS.TUNING = TUNING;
  CS.MAX_FRET = MAX_FRET;
  CS.ROOTS = ROOTS;
  CS.QUALITIES = QUALITIES;
  CS.QUALITY_FAMILIES = QUALITY_FAMILIES;
  CS.QUALITY_ORDER = QUALITY_ORDER;
  CS.DEGREE = DEGREE;
  CS.mod = mod;
  CS.parseNote = parseNote;
  CS.pcOf = pcOf;
  CS.spell = spell;
  CS.simpleName = simpleName;
  CS.transposeName = transposeName;
  CS.pretty = pretty;
  CS.roleOf = roleOf;
  CS.intervalLabel = intervalLabel;
  CS.formulaLabels = formulaLabels;
  CS.transposeShape = transposeShape;
  CS.buildVoicing = buildVoicing;
  CS.symbolFor = symbolFor;
  CS.voiceLeading = voiceLeading;
  CS.signedStep = signedStep;
})(window.CS = window.CS || {});
