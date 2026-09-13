/* ChordStash — progressions.js
 * The twenty progressions from the reference, families A-E.
 * Chords store a root + quality + preferred shape; symbols, voicings and
 * transposition are all derived, so changing key rewrites everything.
 *
 * bassLine / pianoHint / scale / why are the reference's own words. They are
 * the value of this bank, so they are quoted, not paraphrased.
 */
(function (CS) {
  'use strict';

  var FAMILIES = [
    { id: 'jangle',  name: 'Jangle / Mac DeMarco' },
    { id: 'neosoul', name: 'Neo-soul / Steve Lacy' },
    { id: 'frank',   name: 'Frank Ocean' },
    { id: 'jam',     name: 'Jam / Grateful Dead' },
    { id: 'alexg',   name: 'Alex G' }
  ];

  function c(roman, root, quality, shapeId, bars, bass) {
    return { roman: roman, root: root, quality: quality, shapeId: shapeId,
             bars: bars || 1, bass: bass || root };
  }

  var PROGRESSIONS = [
    /* ================================================= A. Jangle / DeMarco */
    {
      id: 'a1', family: 'jangle', code: 'A1', name: '♭VII drop',
      key: 'G', mode: 'major',
      sections: [{ chords: [
        c('I',      'G',  'maj7', 'maj7-e', 1),
        c('iii',    'B',  'm7',   'm7-a',   1),
        c('ii',     'A',  'm7',   'm7-a',   1),
        c('♭VII', 'F', '6/9', '69-a',  1)
      ]}],
      bassLine: 'G – B – A – F.',
      pianoHint: 'Shells; over F6/9 play an Am triad.',
      why: 'The F is borrowed. Voiced as 6/9 it reads as hazy rather than as a rock ♭VII.'
    },
    {
      id: 'a2', family: 'jangle', code: 'A2', name: 'Chromatic bass descent',
      key: 'C', mode: 'major',
      sections: [{ chords: [
        c('IV',        'F',  'maj7', 'maj7-a',    1),
        c('iii',       'E',  'm7',   'm7-open-e', 1),
        c('♭III', 'Eb', 'maj7', 'maj7-a',    1),
        c('ii',        'D',  'm7',   'm7-a',      1),
        c('I',         'C',  'maj7', 'maj7-a',    1)
      ]}],
      bassLine: 'F – E – E♭ – D – C, straight chromatic.',
      pianoHint: 'Shell voicings; keep the guide tones moving by step.',
      why: 'Melody must move E → E♭ over the E♭maj7 bar.'
    },
    {
      id: 'a3', family: 'jangle', code: 'A3', name: 'Starting on ♭III',
      key: 'G', mode: 'major',
      sections: [{ chords: [
        c('♭III', 'Bb', 'maj7', 'maj7-a',    1),
        c('vi',        'E',  'm7',   'm7-open-e', 1),
        c('ii',        'A',  'm7',   'm7-a',      1),
        c('V',         'D',  '7',    '7-a',       1)
      ]}],
      resolvesTo: { roman: 'I', root: 'G', quality: 'maj7', shapeId: 'maj7-e' },
      why: 'The ear doesn’t find home until bar 5. Good for a verse that keeps you off balance.'
    },
    {
      id: 'a4', family: 'jangle', code: 'A4', name: 'The two-flavour ♭VII',
      key: 'E', mode: 'major',
      sections: [
        { label: 'Verse — dreamy', chords: [
          c('I',              'E', 'maj7', 'maj7-e', 1),
          c('♭VIImaj7',  'D', 'maj7', 'maj7-a', 1)
        ]},
        { label: 'Chorus — bluesy', chords: [
          c('I',            'E', 'maj', 'maj-e', 1),
          c('♭VII7',   'D', '7',   '7-a',   1),
          c('IV',           'A', 'maj', 'maj-a', 1),
          c('V',            'B', '7',   '7-a',   1)
        ]}
      ],
      why: 'Same root, two qualities, two completely different sections.'
    },

    /* ================================================ B. Neo-soul / Lacy */
    {
      id: 'b1', family: 'neosoul', code: 'B1', name: 'Dorian two-chord vamp',
      key: 'A', mode: 'dorian',
      sections: [{ chords: [
        c('i9',   'A', 'm9', 'm9-open-a', 2),
        c('IV13', 'D', '13', '13-a',      2)
      ]}],
      bassLine: 'A with ghost notes and octaves, then D. Heavily syncopated.',
      pianoHint: 'Over Am9 play a C or Em triad; over D13 play an Am triad.',
      why: 'The F♯ in D13 is what makes this dorian rather than minor. That one note is the mood.'
    },
    {
      id: 'b2', family: 'neosoul', code: 'B2', name: '7♯9 bed',
      key: 'E', mode: '',
      sections: [{ chords: [
        c('I7♯9', 'E', '7#9', '7s9-a', 2),
        c('IV9',       'A', '9',   '9-e',   2)
      ]}],
      note: 'Or hold the E7♯9 for eight bars and never move.',
      why: 'Use the 7♯9 as a sustained bed, not a stab. The rub between the G (♯9) and G♯ (3rd) is the entire point. Solo with E minor pentatonic over it.'
    },
    {
      id: 'b3', family: 'neosoul', code: 'B3', name: 'Full aeolian loop',
      key: 'C', mode: 'minor',
      sections: [{ chords: [
        c('i',         'C',  'm9',   'm9-a',   1),
        c('♭III', 'Eb', 'maj9', 'maj9-a', 1),
        c('♭VI',  'Ab', 'maj7', 'maj7-e', 1),
        c('♭VII', 'Bb', '13',   '13-a',   1)
      ]}],
      bassLine: 'C – E♭ – A♭ – B♭, with a B natural or D as a chromatic approach back to C.'
    },
    {
      id: 'b4', family: 'neosoul', code: 'B4', name: 'Chromatic planing',
      key: 'D', mode: 'no key — planing', keyless: true,
      sections: [{ chords: [
        c('', 'D',  'm9', 'm9-a', 1),
        c('', 'Eb', 'm9', 'm9-a', 1),
        c('', 'D',  'm9', 'm9-a', 1),
        c('', 'C',  'm9', 'm9-a', 1)
      ]}],
      bassLine: 'Bass doubles the roots exactly.',
      why: 'No functional harmony. Works purely because the shape is consonant and moves by step.'
    },

    /* ==================================================== C. Frank Ocean */
    {
      id: 'c1', family: 'frank', code: 'C1', name: 'The floating maj7 plane',
      key: 'D', mode: 'modal centre',
      sections: [{ chords: [
        c('♭IIImaj7', 'F', 'maj7', 'maj7-a',    2),
        c('ii',            'E', 'm7',   'm7-open-e', 2),
        c('Imaj7',         'D', 'maj7', 'maj7-a',    4)
      ]}],
      why: 'The Fmaj7 is borrowed — an F natural over a D centre is the minor 3rd — but voicing it as maj7 stops it reading as sad. Bright quality on a dark root. This is the core Frank Ocean device, and the loop implies D minor, D dorian and D major at the same time.'
    },
    {
      id: 'c2', family: 'frank', code: 'C2', name: 'Pedal point',
      key: 'F', mode: 'major',
      sections: [{ chords: [
        c('Imaj7',  'F',  'maj7', 'maj7-a', 2, 'F'),
        c('ii7/I',  'G',  'm7',   'm7-a',   2, 'F'),
        c('IVmaj7/I','Bb', 'maj7', 'maj7-a', 2, 'F'),
        c('iii7/I', 'A',  'm7',   'm7-a',   2, 'F')
      ]}],
      bassLine: 'Bass holds a low F for all eight bars.',
      pianoHint: 'Piano plays the upper triads.',
      why: 'Static bass, moving harmony. Feels like it’s developing without going anywhere.'
    },
    {
      id: 'c3', family: 'frank', code: 'C3', name: 'Borrowed iv',
      key: 'D', mode: 'major',
      sections: [{ chords: [
        c('I',  'D', 'maj7', 'maj7-a', 1),
        c('IV', 'G', 'maj7', 'maj7-e', 1),
        c('iv', 'G', 'm6',   'm6-e',   1),
        c('I',  'D', 'maj7', 'maj7-a', 1)
      ]}],
      why: 'Gm6 = G B♭ D E. The B♭ is the borrowed ♭6. Nothing else in pop harmony does this.'
    },
    {
      id: 'c4', family: 'frank', code: 'C4', name: 'The loop that never lands',
      key: 'A', mode: 'major implied, tonic avoided',
      sections: [{ chords: [
        c('ii',     'B',  'm7',   'm7-a',   1),
        c('Vmaj7',  'E',  'maj7', 'maj7-e', 1),
        c('vi',     'F#', 'm7',   'm7-e',   1),
        c('Vmaj7',  'E',  'maj7', 'maj7-e', 1)
      ]}],
      why: 'Emaj7 instead of E7 removes the dominant’s pull. The loop can run forever without ever implying resolution. Never play the A.'
    },

    /* ================================================ D. Jam / Grateful Dead */
    {
      id: 'd1', family: 'jam', code: 'D1', name: 'Mixolydian vamp',
      key: 'D', mode: 'mixolydian',
      sections: [{ chords: [
        c('I',         'D', 'maj', 'maj-d', 2),
        c('♭VII', 'C', 'maj', 'maj-c', 2),
        c('I',         'D', 'maj', 'maj-d', 2),
        c('♭VII', 'C', 'maj', 'maj-c', 2)
      ]}],
      bassLine: 'D pedal with octaves, or D – C walking.',
      scale: 'D mixolydian (D E F♯ G A B C). Flip the F♯ to F natural for D dorian mid-jam — that one-note change is the whole trick.'
    },
    {
      id: 'd2', family: 'jam', code: 'D2', name: 'Rotating bright vamp',
      key: 'A', mode: 'major / mixolydian',
      sections: [{ chords: [
        c('I',         'A', 'maj', 'maj-a', 1),
        c('IV',        'D', 'maj', 'maj-d', 1),
        c('♭VII', 'G', 'maj', 'maj-e', 1),
        c('IV',        'D', 'maj', 'maj-d', 1)
      ]}],
      note: 'Guitar 2 should play different inversions in a different register: x 0 2 2 2 0 / x 5 4 2 3 2 / 3 x 0 0 0 3.',
      why: 'Never cadences, so it loops indefinitely.'
    },
    {
      id: 'd3', family: 'jam', code: 'D3', name: 'maj7 drone',
      key: 'E', mode: 'major',
      sections: [{ chords: [
        c('Imaj7', 'E', 'maj7', 'maj7-e', 4),
        c('Imaj7', 'E', 'maj7', 'maj7-e', 4),
        c('I6/9',  'E', '6/9',  '69-a',   4),
        c('Imaj7', 'E', 'maj7', 'maj7-e', 4)
      ]}],
      scale: 'E F♯ G♯ B C♯ D♯ (E major pentatonic + the major 7th).',
      why: 'The D♯ wants to resolve to E and never does. Stable and unstable at once — that tension is what sustains a long, static section.'
    },
    {
      id: 'd4', family: 'jam', code: 'D4', name: 'Pedal-point build',
      key: 'A', mode: '',
      sections: [{ chords: [
        c('I',            'A', 'maj', 'maj-a', 1, 'A'),
        c('♭VII/I',  'G', 'maj', 'maj-e', 1, 'A'),
        c('IV/I',         'D', 'maj', 'maj-d', 1, 'A'),
        c('♭VI/I',   'F', 'maj', 'maj-e', 1, 'A')
      ]}],
      bassLine: 'Bass holds low A throughout.',
      note: 'Guitar moves triads above it.',
      why: 'A mixolydian for the first three chords, then the F adds a ♭VI colour. Ideal for building a long crescendo without changing key.'
    },
    {
      id: 'd5', family: 'jam', code: 'D5', name: 'The ii–V drop-in',
      key: 'A', mode: '',
      sections: [{ chords: [
        c('ii',    'B', 'm7',   'm7-a',   1),
        c('V',     'E', '7',    '7-a',    1),
        c('Imaj7', 'A', 'maj7', 'maj7-a', 1)
      ]}],
      why: 'Sit on a modal vamp, then insert this to briefly imply a new key, then abandon it and return to the vamp. Garcia’s move for injecting harmonic motion into a static jam.'
    },

    /* ========================================================= E. Alex G */
    {
      id: 'e1', family: 'alexg', code: 'E1', name: 'Inversions as the point',
      key: 'G', mode: 'major',
      sections: [{ chords: [
        c('IV⁶₄', 'C', 'maj', 'maj-c',      1, 'G'),
        c('vi⁶₅', 'E', 'm7',  'm7-open-e',  1, 'D'),
        c('V⁶',        'D', 'maj', 'maj-d',      1, 'F#'),
        c('I',              'G', 'maj', 'maj-g-open', 1, 'G')
      ]}],
      bassLine: 'G – D – F♯ – G.',
      why: 'The bass line (G – D – F♯ – G) is the actual composition. Root position appears once.'
    },
    {
      id: 'e2', family: 'alexg', code: 'E2', name: 'Quality flip',
      key: 'C', mode: 'major',
      sections: [{ chords: [
        c('I', 'C', 'maj', 'maj-c',      1),
        c('i', 'C', 'm',   'min-a',      1),
        c('V', 'G', 'maj', 'maj-g-open', 2)
      ]}],
      why: 'Sweet then immediately sour. Small doses.'
    },
    {
      id: 'e3', family: 'alexg', code: 'E3', name: 'Open-string drone',
      key: 'E', mode: 'minor-ish',
      sections: [{ chords: [
        c('i',         'E', 'madd9', 'madd9-drone',  1),
        c('♭VI',  'C', 'maj7',  'maj7-drone',   1),
        c('♭III', 'G', '6',     '6-drone',      1),
        c('♭VII', 'D', 'maj',   'maj-drone-d',  1)
      ]}],
      note: 'Play all of these keeping the B and e strings open.',
      why: 'The open strings create 9ths and 6ths that don’t belong to the shapes. That accidental complexity is the sound.'
    }
  ];

  /* ------------------------------------------------------- transposition */

  function symbolOf(chord) {
    var q = CS.QUALITIES[chord.quality];
    var sym = CS.pretty(chord.root) + (q ? CS.pretty(q.suffix) : '');
    if (chord.bass && CS.pcOf(chord.bass) !== CS.pcOf(chord.root)) {
      sym += '/' + CS.pretty(chord.bass);
    }
    return sym;
  }

  /* Return a copy of the progression rewritten into a new key. Roman
   * numerals are invariant; roots and bass notes move by interval so the
   * spelling stays correct (bIII of C is Eb, of G is Bb, never A#). */
  function inKey(prog, newKey) {
    var from = prog.key;
    var to = newKey || prog.key;
    function moveChord(ch) {
      var out = {
        roman: ch.roman,
        root: CS.transposeName(ch.root, from, to),
        bass: CS.transposeName(ch.bass || ch.root, from, to),
        quality: ch.quality,
        shapeId: ch.shapeId,
        bars: ch.bars
      };
      out.symbol = symbolOf(out);
      return out;
    }
    var out = {
      id: prog.id, family: prog.family, code: prog.code, name: prog.name,
      key: to, mode: prog.mode, keyless: prog.keyless,
      originalKey: from,
      sections: prog.sections.map(function (sec) {
        return { label: sec.label, chords: sec.chords.map(moveChord) };
      }),
      bassLine: prog.bassLine, pianoHint: prog.pianoHint,
      scale: prog.scale, note: prog.note, why: prog.why
    };
    if (prog.resolvesTo) out.resolvesTo = moveChord(prog.resolvesTo);
    out.chords = out.sections.reduce(function (acc, s) { return acc.concat(s.chords); }, []);
    if (out.resolvesTo) out.chords.push(out.resolvesTo);
    return out;
  }

  function byId(id) {
    for (var i = 0; i < PROGRESSIONS.length; i++) {
      if (PROGRESSIONS[i].id === id) return PROGRESSIONS[i];
    }
    return null;
  }

  CS.PROG_FAMILIES = FAMILIES;
  CS.PROGRESSIONS = PROGRESSIONS;
  CS.progressionById = byId;
  CS.progressionInKey = inKey;
  CS.chordSymbol = symbolOf;
})(window.CS = window.CS || {});
