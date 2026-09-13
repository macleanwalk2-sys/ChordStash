/* ChordStash — shapes.js
 * The chord shape library. Frets and a root only; note names, intervals and
 * transposition are all computed in theory.js. One source of truth.
 *
 * frets: low E -> high e. null = muted, 0 = open.
 * movable: false only where the voicing's identity IS the open strings.
 */
(function (CS) {
  'use strict';

  function f(str) {
    return str.trim().split(/\s+/).map(function (t) {
      return (t === 'x' || t === 'X') ? null : parseInt(t, 10);
    });
  }

  var SHAPES = [
    /* ------------------------------------------------------------- major */
    { id: 'maj7-a', quality: 'maj7', label: 'A-root', frets: f('x 3 5 4 5 3'),
      rootString: 1, rootFret: 3, movable: true,
      character: 'Full, warm, the default.' },

    { id: 'maj7-e', quality: 'maj7', label: 'E-root', frets: f('8 x 9 9 8 x'),
      rootString: 0, rootFret: 8, movable: true,
      character: 'Tighter, sits higher. Leaves room under it for the bass.' },

    { id: 'maj7-drone', quality: 'maj7', label: 'Open drone', frets: f('x 3 5 4 0 0'),
      rootString: 1, rootFret: 3, movable: false,
      character: 'B and e strings left ringing. Alex G open-string harmony.' },

    { id: 'maj7-d', quality: 'maj7', label: 'D-root', frets: f('x x 10 9 8 7'),
      rootString: 2, rootFret: 10, movable: true,
      character: 'Root position on the top four strings. Sits well above the bass.' },

    { id: 'maj9-a', quality: 'maj9', label: 'A-root', frets: f('x 3 2 4 3 x'),
      rootString: 1, rootFret: 3, movable: true,
      character: 'The indie chord. Use this instead of maj7.' },

    { id: 'maj9-e', quality: 'maj9', label: 'E-form', frets: f('8 10 9 9 8 10'),
      rootString: 0, rootFret: 8, movable: true,
      character: 'Six strings of it. Big and strummable where the A-root shape is a stab.' },

    { id: 'maj7s11-a', quality: 'maj7#11', label: 'A-root', frets: f('x 3 4 4 3 x'),
      rootString: 1, rootFret: 3, movable: true,
      character: 'Lydian. Dreamy, cinematic, slightly unreal.' },

    { id: 'maj7s11-e', quality: 'maj7#11', label: 'E-root', frets: f('8 x 9 9 7 x'),
      rootString: 0, rootFret: 8, movable: true,
      character: 'Root, 7, 3 and the ♯11 — no 5th getting in the way of the colour.' },

    { id: '69-a', quality: '6/9', label: 'A-root', frets: f('x 3 2 2 3 3'),
      rootString: 1, rootFret: 3, movable: true,
      character: 'No 7th = no tension. Endlessly loopable.' },

    { id: '69-e', quality: '6/9', label: 'E-form', frets: f('8 10 10 9 10 10'),
      rootString: 0, rootFret: 8, movable: true,
      character: 'The full six-string 6/9. Ring it out and leave it there.' },

    { id: '6-drone', quality: '6', label: 'Open drone', frets: f('3 x 4 4 0 0'),
      rootString: 0, rootFret: 3, movable: false,
      character: 'The open B and e hand you a major 7th the shape never asked for.' },

    { id: 'add9-a', quality: 'add9', label: 'A-root', frets: f('x 3 2 0 3 0'),
      rootString: 1, rootFret: 3, movable: true,
      character: 'Jangly, open, Alex G territory.' },

    { id: 'add9-e', quality: 'add9', label: 'E-form', frets: f('8 10 10 9 8 10'),
      rootString: 0, rootFret: 8, movable: true,
      character: 'A barre chord with the 9th swapped in on top. Works at any root.' },

    { id: 'sus2-a', quality: 'sus2', label: 'A-root', frets: f('x 3 0 0 3 3'),
      rootString: 1, rootFret: 3, movable: true,
      character: 'No 3rd — ambiguous, floats.' },

    { id: 'maj-a', quality: 'maj', label: 'A-form', frets: f('x 3 5 5 5 3'),
      rootString: 1, rootFret: 3, movable: true },
    { id: 'maj-e', quality: 'maj', label: 'E-form', frets: f('8 10 10 9 8 8'),
      rootString: 0, rootFret: 8, movable: true },
    { id: 'maj-c', quality: 'maj', label: 'C-form', frets: f('x 3 2 0 1 0'),
      rootString: 1, rootFret: 3, movable: true,
      character: 'Open at C. Moved up the neck it becomes the jangly inversion Weir uses.' },
    { id: 'maj-d', quality: 'maj', label: 'D-form', frets: f('x x 10 12 13 12'),
      rootString: 2, rootFret: 10, movable: true },
    { id: 'maj-g-open', quality: 'maj', label: 'Open G', frets: f('3 2 0 0 0 3'),
      rootString: 0, rootFret: 3, movable: false,
      character: 'The full open G. Position-locked.' },
    { id: 'maj-g-drone', quality: 'maj', label: 'G drone', frets: f('3 x 0 0 0 3'),
      rootString: 0, rootFret: 3, movable: false,
      character: 'Guitar 2 voicing — open middle strings, different register.' },
    { id: 'maj-drone-d', quality: 'maj', label: 'Open drone', frets: f('x 5 4 2 0 0'),
      rootString: 1, rootFret: 5, movable: false,
      character: 'Open B and e turn a plain D into a 6/9 by accident.' },

    /* ------------------------------------------------------------- minor */
    { id: 'm9-a', quality: 'm9', label: 'A-root', frets: f('x 3 1 3 3 x'),
      rootString: 1, rootFret: 3, movable: true,
      character: 'The neo-soul minor. Never use plain m7.' },

    { id: 'm9-open-a', quality: 'm9', label: 'Open A', frets: f('x 0 5 4 5 x'),
      rootString: 1, rootFret: 0, movable: false,
      character: 'No 3rd in the shape — open and airy, the bass fills it in.' },

    { id: 'm9-e', quality: 'm9', label: 'E-form', frets: f('8 10 8 8 8 10'),
      rootString: 0, rootFret: 8, movable: true,
      character: 'The whole neo-soul minor across six strings. Barre it and let it sit.' },

    { id: 'm11-a', quality: 'm11', label: 'A-root', frets: f('x 3 3 3 4 3'),
      rootString: 1, rootFret: 3, movable: true,
      character: 'Lush, hazy, quartal-ish.' },

    { id: 'm11-e', quality: 'm11', label: 'E-form', frets: f('8 8 8 8 x x'),
      rootString: 0, rootFret: 8, movable: true,
      character: 'One finger, four strings, stacked 4ths. The quartal sound with a root under it.' },

    { id: 'm6-e', quality: 'm6', label: 'E-root', frets: f('8 x 7 8 8 x'),
      rootString: 0, rootFret: 8, movable: true,
      character: 'That bittersweet borrowed-iv sound.' },

    { id: 'm6-a', quality: 'm6', label: 'A-form', frets: f('x 3 5 5 4 5'),
      rootString: 1, rootFret: 3, movable: true,
      character: 'The 6th up on top where you can hear it. Brighter read of the borrowed iv.' },

    { id: 'm7-a', quality: 'm7', label: 'A-root', frets: f('x 3 5 3 4 3'),
      rootString: 1, rootFret: 3, movable: true },
    { id: 'm7-e', quality: 'm7', label: 'E-root', frets: f('8 x 8 8 8 x'),
      rootString: 0, rootFret: 8, movable: true,
      character: 'Four notes, no doubling. Sits out of the bass’s way.' },
    { id: 'm7-open-e', quality: 'm7', label: 'E-form (full)', frets: f('0 2 0 0 0 0'),
      rootString: 0, rootFret: 0, movable: true,
      character: 'All six strings. Open at E, a barre anywhere else.' },

    { id: 'min-a', quality: 'm', label: 'A-form', frets: f('x 3 5 5 4 3'),
      rootString: 1, rootFret: 3, movable: true },
    { id: 'min-e', quality: 'm', label: 'E-form', frets: f('8 10 10 8 8 8'),
      rootString: 0, rootFret: 8, movable: true },
    { id: 'min-d', quality: 'm', label: 'D-form', frets: f('x x 10 12 13 11'),
      rootString: 2, rootFret: 10, movable: true },

    { id: 'madd9-drone', quality: 'madd9', label: 'Open drone', frets: f('0 2 4 4 0 0'),
      rootString: 0, rootFret: 0, movable: false,
      character: 'No 3rd at all — the open strings are doing the writing.' },

    /* ---------------------------------------------------------- dominant */
    { id: '9-a', quality: '9', label: 'A-root', frets: f('x 3 2 3 3 x'),
      rootString: 1, rootFret: 3, movable: true,
      character: 'Funk dominant. Bluesy but not harsh.' },
    { id: '9-e', quality: '9', label: 'E-root', frets: f('8 x 8 9 8 10'),
      rootString: 0, rootFret: 8, movable: true,
      character: 'Five notes with the 9th on top. Spreads wide.' },

    { id: '13-a', quality: '13', label: 'A-root', frets: f('x 3 x 3 5 5'),
      rootString: 1, rootFret: 3, movable: true,
      character: 'The smooth dominant. Lacy’s bread and butter.' },

    { id: '13-e', quality: '13', label: 'E-root', frets: f('8 x 8 9 10 x'),
      rootString: 0, rootFret: 8, movable: true,
      character: 'Root, ♭7, 3, 13 — the four notes that matter and nothing else.' },

    { id: '7s9-a', quality: '7#9', label: 'A-root', frets: f('x 3 2 3 4 x'),
      rootString: 1, rootFret: 3, movable: true,
      character: 'The Hendrix chord. Use as a bed, not a stab.' },

    { id: '7-a', quality: '7', label: 'A-form', frets: f('x 3 5 3 5 3'),
      rootString: 1, rootFret: 3, movable: true },
    { id: '7-e', quality: '7', label: 'E-root', frets: f('8 x 8 9 8 x'),
      rootString: 0, rootFret: 8, movable: true },

    /* ------------------------------------------------------------- other */
    { id: 'quartal-3', quality: 'quartal', label: '3-note', frets: f('x x 5 5 6 x'),
      rootString: 3, rootFret: 5, movable: true, rootless: true,
      character: 'Stacked 4ths — modern, rootless, Weir-ish. Pick the root yourself; the bass decides.' },

    { id: 'quartal-4', quality: 'quartal', label: '4-note', frets: f('x x 5 5 6 6'),
      rootString: 3, rootFret: 5, movable: true, rootless: true,
      character: 'Four stacked 4ths. Even less committed to a key than the three-note shape.' }
  ];

  var BY_ID = {};
  SHAPES.forEach(function (s) {
    s.rootPc = CS.mod(CS.TUNING[s.rootString] + s.rootFret, 12);
    s.rootName = CS.simpleName(s.rootPc, true);
    BY_ID[s.id] = s;
  });

  function shapesFor(quality) {
    return SHAPES.filter(function (s) { return s.quality === quality; });
  }

  /* All renderable voicings of a chord: every shape of that quality at this
   * root, plus the octave-up position where it still fits on the neck. */
  function voicingsFor(root, quality) {
    var pc = CS.pcOf(root);
    var out = [];
    shapesFor(quality).forEach(function (shape) {
      [0, 1].forEach(function (oct) {
        var frets = CS.transposeShape(shape, pc, oct);
        if (!frets) return;
        if (oct > 0) {
          // Only offer an octave alternate that is genuinely a new position.
          var base = CS.transposeShape(shape, pc, 0);
          if (base && base.join() === frets.join()) return;
        }
        var v = CS.buildVoicing({ frets: frets, root: root, quality: quality });
        v.shape = shape;
        v.shapeId = shape.id;
        v.octave = oct;
        v.title = shape.label + (oct ? ' • 8va' : '');
        out.push(v);
      });
    });
    return out;
  }

  /* Shapes of this quality that exist but cannot be played at this root,
   * so the UI can grey them out honestly instead of pretending. */
  function unavailableFor(root, quality) {
    var pc = CS.pcOf(root);
    return shapesFor(quality).filter(function (shape) {
      return !CS.transposeShape(shape, pc, 0);
    }).map(function (shape) {
      return {
        shape: shape,
        reason: shape.movable
          ? 'Runs off the end of the neck at this root'
          : 'Open-position only — lives at ' + CS.pretty(shape.rootName) + ' and nowhere else'
      };
    });
  }

  /* Best available voicing for a root+quality, preferring a named shape. */
  function resolve(root, quality, preferredShapeId) {
    var list = voicingsFor(root, quality);
    if (!list.length) return null;
    if (preferredShapeId) {
      for (var i = 0; i < list.length; i++) {
        if (list[i].shapeId === preferredShapeId && !list[i].octave) return list[i];
      }
    }
    return list[0];
  }


  /* When a chord's quality has no playable shape at a given root — the
   * open-drone voicings are position-locked — fall back to the nearest
   * quality that keeps the chord's character, and say so. */
  var FALLBACK = {
    'madd9':   ['m9', 'm11', 'm7', 'm'],
    'm':       ['m7', 'm9'],
    'm6':      ['m9', 'm7', 'm'],
    'm11':     ['m9', 'm7'],
    'm9':      ['m11', 'm7'],
    'm7':      ['m9', 'm'],
    '6':       ['6/9', 'maj7', 'maj'],
    '6/9':     ['maj9', 'maj7', 'maj'],
    'add9':    ['6/9', 'maj', 'maj7'],
    'sus2':    ['add9', 'maj'],
    'maj':     ['maj7', '6/9', 'add9'],
    'maj7':    ['maj9', '6/9', 'maj'],
    'maj9':    ['maj7', '6/9'],
    'maj7#11': ['maj9', 'maj7'],
    '7':       ['9', '13', '7#9'],
    '9':       ['13', '7', '7#9'],
    '13':      ['9', '7'],
    '7#9':     ['9', '13', '7'],
    'quartal': ['m11', 'sus2']
  };

  /* The one call the UI makes for a chord. Always returns something playable
   * or nothing at all — never a silently wrong voicing. */
  function resolveChord(root, quality, preferredShapeId) {
    var v = resolve(root, quality, preferredShapeId);
    if (v) {
      return {
        voicing: v,
        substituted: !!(preferredShapeId && v.shapeId !== preferredShapeId),
        substitutionNote: (preferredShapeId && v.shapeId !== preferredShapeId)
          ? shapeNote(preferredShapeId, root)
          : null
      };
    }
    var chain = FALLBACK[quality] || [];
    for (var i = 0; i < chain.length; i++) {
      var alt = resolve(root, chain[i]);
      if (alt) {
        var q = CS.QUALITIES[quality], aq = CS.QUALITIES[chain[i]];
        return {
          voicing: alt,
          substituted: true,
          qualityChanged: true,
          substitutionNote: 'No ' + (q ? q.name.toLowerCase() : quality) +
            ' shape reaches ' + CS.pretty(root) + ' — showing ' +
            (aq ? aq.name.toLowerCase() : chain[i]) + ' instead.'
        };
      }
    }
    return null;
  }

  function shapeNote(shapeId, root) {
    var s = BY_ID[shapeId];
    if (!s) return null;
    if (!s.movable) {
      return 'The written shape (' + s.label.toLowerCase() + ') is open-position only at ' +
        CS.pretty(s.rootName) + ' — showing the nearest movable voicing.';
    }
    return 'The written shape runs off the neck at ' + CS.pretty(root) +
      ' — showing the nearest alternative.';
  }

  CS.SHAPES = SHAPES;
  CS.shapeById = function (id) { return BY_ID[id]; };
  CS.shapesFor = shapesFor;
  CS.voicingsFor = voicingsFor;
  CS.unavailableFor = unavailableFor;
  CS.resolveVoicing = resolve;
  CS.resolveChord = resolveChord;
  CS.QUALITY_FALLBACK = FALLBACK;
})(window.CS = window.CS || {});
