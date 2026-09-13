/* ChordStash — reference.js
 * Reference content from the chord reference, §3, §6 and §10. Quoted, not
 * paraphrased. The borrowed-chord palette is key-aware: the roots are stored
 * as scale degrees so the table re-spells itself for whatever key you are in.
 */
(function (CS) {
  'use strict';

  /* §3 — the borrowed-chord palette (modal interchange), ranked roughly by
   * how often this style uses them. Shown in the current key. */
  var BORROWED = [
    { roman: '♭VII', degree: 7, semitone: 10, qualities: ['maj', 'maj7', '9'],
      from: 'mixolydian, minor',
      sound: 'The workhorse. Darker but not sad. Resolves down to I.',
      who: 'Everyone. The Dead’s whole vocabulary.' },
    { roman: 'iv', degree: 4, semitone: 5, qualities: ['m', 'm7', 'm6'],
      from: 'minor',
      sound: 'The saddest single move in pop. Follow IV with iv.',
      who: 'Frank Ocean, Beatles lineage.' },
    { roman: '♭VI', degree: 6, semitone: 8, qualities: ['maj', 'maj7'],
      from: 'minor',
      sound: 'Big, cinematic lift. Heavier than ♭VII.',
      who: 'Choruses, bridges.' },
    { roman: '♭III', degree: 3, semitone: 3, qualities: ['maj', 'maj7'],
      from: 'minor',
      sound: 'Chromatic mediant. Disorienting in a pleasant way.',
      who: 'Mac DeMarco’s signature.' },
    { roman: 'IV7 / IVmaj7♯11', degree: 4, semitone: 5, qualities: ['7', 'maj7#11'],
      from: 'dorian / lydian',
      sound: 'Brightens the subdominant. Backdoor setup.',
      who: 'Jam bands, gospel.' },
    { roman: 'II (major)', degree: 2, semitone: 2, qualities: ['maj', '7'],
      from: 'lydian / V-of-V',
      sound: 'Lifts, then usually falls to V.',
      who: 'Jazz-leaning writing.' },
    { roman: '♭II', degree: 2, semitone: 1, qualities: ['maj', 'maj7'],
      from: 'phrygian / tritone sub',
      sound: 'Exotic, heavy. Use sparingly.',
      who: 'Bridges, one-off surprises.' },
    { roman: 'v (minor)', degree: 5, semitone: 7, qualities: ['m7'],
      from: 'mixolydian',
      sound: 'Removes the leading tone. Kills the cadence on purpose.',
      who: 'Modal writing.' }
  ];

  var MELODY_RULE = 'When you borrow a chord, the melody has to dodge the note you altered. ' +
    'If you play an E♭maj7 in C, the melody must move E → E♭ during that bar or it will ' +
    'sound like a mistake. That is the difference between “exotic” and “wrong”.';

  /* §6 — the division of labour. Nobody plays the whole chord. */
  var DIVISION = [
    { part: 'Bass', range: 'E1 – G2',
      plays: 'Root (or the specified inversion), one note at a time',
      never: 'Chords. Anything above G2 unless it’s a fill' },
    { part: 'Piano / Rhodes', range: 'C3 – C5',
      plays: 'Guide tones (3rd + 7th) low, upper-structure triad high',
      never: 'The root — the bass has it' },
    { part: 'Guitar', range: 'G3 – E5',
      plays: 'Colour tones: 9, 11, 13, partial triads',
      never: 'The root, usually the 5th' }
  ];

  var MUD_RULE = 'Never put an interval of a 3rd below roughly G2. Down there only octaves and ' +
    '5ths stay clear. This is why a piano left hand playing root-position triads in the bass ' +
    'register ruins a mix — and why guide-tone shells work.';

  /* §10 — the cheat sheet. */
  var CHEATS = [
    ['When it sounds too plain', 'add the 9th. Turn triads into add9, m7s into m9.'],
    ['When it sounds too sweet', 'borrow the iv, or flip a maj7 to a dom7.'],
    ['When it won’t loop', 'remove the V. Replace with ♭VII or IV.'],
    ['When it feels static', 'move the bass, not the chords. Use inversions and pedal tones.'],
    ['When it sounds like a jazz exercise', 'slow the harmonic rhythm and delete a chord.'],
    ['When it sounds muddy', 'something is playing a 3rd below G2. Usually the piano’s left hand.'],
    ['When it sounds sterile', 'the guitar isn’t detuning against itself. Add chorus/vibrato.'],
    ['When you’re stuck', 'take one shape and plane it chromatically. Decide what it means later.']
  ];

  /* Re-spell the palette for a given tonic. */
  function borrowedIn(key) {
    return BORROWED.map(function (b) {
      return {
        roman: b.roman,
        root: CS.spell(key, b.degree, b.semitone),
        qualities: b.qualities,
        from: b.from, sound: b.sound, who: b.who
      };
    });
  }

  CS.reference = {
    borrowed: BORROWED,
    borrowedIn: borrowedIn,
    melodyRule: MELODY_RULE,
    division: DIVISION,
    mudRule: MUD_RULE,
    cheats: CHEATS
  };
})(window.CS = window.CS || {});
