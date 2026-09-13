/* ChordStash — fretboard.js
 * Hand-drawn SVG fretboard. Real fret taper, believable string gauges,
 * interval-coloured note dots. All colour comes from CSS custom properties
 * so the board themes itself.
 */
(function (CS) {
  'use strict';

  var GUTTER = 68;      // room left of the nut for x / o markers
  var BOARD_W = 1000;
  var PAD_R = 18;
  var STRING_GAP = 42;
  var BOARD_PAD_Y = 26; // board edge above the top string / below the bottom
  var TOP = 10;
  var NUM_ROW = 34;

  var BOARD_H = STRING_GAP * 5 + BOARD_PAD_Y * 2;
  var VB_W = GUTTER + BOARD_W + PAD_R;
  var VB_H = TOP + BOARD_H + NUM_ROW;

  // Relative string gauges — low E visibly thicker than high e (a 10-46 set).
  var GAUGE = [4.2, 3.4, 2.7, 1.9, 1.4, 1.0];
  var OPEN_NAMES = ['E', 'A', 'D', 'G', 'B', 'e'];

  var MARKERS = { 3: 1, 5: 1, 7: 1, 9: 1, 12: 2, 15: 1 };

  /* True fret spacing blended slightly towards linear, so the top of the
   * neck stays readable without losing the taper that makes it look real. */
  function fretPos(n, count) {
    var tp = function (k) { return 1 - Math.pow(2, -k / 12); };
    var t = tp(n) / tp(count);
    return BOARD_W * (0.72 * t + 0.28 * (n / count));
  }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function stringY(i, flipped) {
    var slot = flipped ? i : (5 - i); // default: low E at the bottom
    return TOP + BOARD_PAD_Y + slot * STRING_GAP;
  }

  /* --------------------------------------------------------------- defs */
  function defs() {
    return '' +
      '<defs>' +
        '<linearGradient id="cs-wood" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0%" stop-color="var(--fb-wood-a)"/>' +
          '<stop offset="46%" stop-color="var(--fb-wood-b)"/>' +
          '<stop offset="100%" stop-color="var(--fb-wood-c)"/>' +
        '</linearGradient>' +
        '<linearGradient id="cs-fret" x1="0" y1="0" x2="1" y2="0">' +
          '<stop offset="0%" stop-color="var(--fb-fret-lo)"/>' +
          '<stop offset="38%" stop-color="var(--fb-fret-hi)"/>' +
          '<stop offset="100%" stop-color="var(--fb-fret-lo)"/>' +
        '</linearGradient>' +
        '<linearGradient id="cs-nut" x1="0" y1="0" x2="1" y2="0">' +
          '<stop offset="0%" stop-color="var(--fb-nut-lo)"/>' +
          '<stop offset="40%" stop-color="var(--fb-nut-hi)"/>' +
          '<stop offset="100%" stop-color="var(--fb-nut-lo)"/>' +
        '</linearGradient>' +
        '<filter id="cs-grain" x="0" y="0" width="100%" height="100%">' +
          '<feTurbulence type="fractalNoise" baseFrequency="0.006 0.75" numOctaves="3" seed="7"/>' +
          '<feColorMatrix type="saturate" values="0"/>' +
        '</filter>' +
      '</defs>';
  }

  /* -------------------------------------------------------------- board */
  function board(frets) {
    var x = GUTTER, y = TOP, w = BOARD_W, h = BOARD_H, i, out = '';
    out += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h +
           '" rx="3" fill="url(#cs-wood)"/>';
    out += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h +
           '" rx="3" filter="url(#cs-grain)" opacity="0.18" style="mix-blend-mode:overlay"/>';

    // inlays, centred between the middle strings
    var mid = TOP + BOARD_H / 2;
    for (i = 1; i <= frets; i++) {
      if (!MARKERS[i]) continue;
      var cx = x + (fretPos(i - 1, frets) + fretPos(i, frets)) / 2;
      // Kept deliberately recessive: a real inlay is bright, but at this size
      // a bright one reads as a note dot and fights the interval colours.
      if (MARKERS[i] === 2) {
        out += '<circle class="fb-inlay" cx="' + cx.toFixed(1) + '" cy="' + (mid - STRING_GAP * 0.92).toFixed(1) + '" r="8"/>';
        out += '<circle class="fb-inlay" cx="' + cx.toFixed(1) + '" cy="' + (mid + STRING_GAP * 0.92).toFixed(1) + '" r="8"/>';
      } else {
        out += '<circle class="fb-inlay" cx="' + cx.toFixed(1) + '" cy="' + mid.toFixed(1) + '" r="8"/>';
      }
    }

    // fret wire
    for (i = 1; i <= frets; i++) {
      var fx = x + fretPos(i, frets);
      out += '<rect x="' + (fx - 1.6).toFixed(1) + '" y="' + y + '" width="3.2" height="' + h +
             '" fill="url(#cs-fret)"/>';
    }

    // nut, drawn distinctly from the frets
    out += '<rect x="' + (x - 9) + '" y="' + (y - 2) + '" width="10" height="' + (h + 4) +
           '" rx="1.5" fill="url(#cs-nut)"/>';

    out += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h +
           '" rx="3" fill="none" stroke="var(--fb-edge)" stroke-width="1"/>';
    return out;
  }

  function strings(flipped) {
    var out = '', i;
    for (i = 0; i < 6; i++) {
      var y = stringY(i, flipped);
      out += '<line x1="' + (GUTTER - 9) + '" y1="' + y + '" x2="' + (GUTTER + BOARD_W) +
             '" y2="' + y + '" stroke="var(--fb-string)" stroke-width="' + GAUGE[i] + '"/>';
      out += '<line x1="' + (GUTTER - 9) + '" y1="' + (y - GAUGE[i] / 2 + 0.3).toFixed(2) +
             '" x2="' + (GUTTER + BOARD_W) + '" y2="' + (y - GAUGE[i] / 2 + 0.3).toFixed(2) +
             '" stroke="var(--fb-string-hi)" stroke-width="0.7" opacity="0.7"/>';
      out += '<text class="fb-open-name" x="14" y="' + (y + 4.5) + '">' + OPEN_NAMES[i] + '</text>';
    }
    return out;
  }

  function fretNumbers(frets) {
    var out = '', i;
    var y = TOP + BOARD_H + 23;
    for (i = 1; i <= frets; i++) {
      var cx = GUTTER + (fretPos(i - 1, frets) + fretPos(i, frets)) / 2;
      var cls = MARKERS[i] ? 'fb-num fb-num-mark' : 'fb-num';
      out += '<text class="' + cls + '" x="' + cx.toFixed(1) + '" y="' + y + '">' + i + '</text>';
    }
    return out;
  }

  /* --------------------------------------------------------------- dots */
  function dotLabel(note, mode) {
    if (mode === 'note') return '<tspan class="fb-lab-main">' + esc(CS.pretty(note.name)) + '</tspan>';
    if (mode === 'both') {
      return '<tspan class="fb-lab-top" x="0" dy="-3">' + esc(CS.pretty(note.label)) + '</tspan>' +
             '<tspan class="fb-lab-sub" x="0" dy="13">' + esc(CS.pretty(note.name)) + '</tspan>';
    }
    return '<tspan class="fb-lab-main">' + esc(CS.pretty(note.label)) + '</tspan>';
  }

  function noteDot(note, cx, cy, mode, index) {
    var r = mode === 'both' ? 17.5 : 16;
    var cls = 'fb-dot role-' + note.role + (note.open ? ' is-open' : '');
    var out = '<g class="' + cls + '" style="--i:' + index + '" transform="translate(' +
              cx.toFixed(1) + ',' + cy.toFixed(1) + ')">';
    if (note.role === 'root') {
      out += '<circle class="fb-dot-ring" r="' + (r + 4.5) + '"/>';
    }
    out += '<circle class="fb-dot-face" r="' + r + '"/>';
    out += '<text class="fb-dot-label" x="0" y="' + (mode === 'both' ? 0 : 5) + '">' +
           dotLabel(note, mode) + '</text>';
    out += '<title>' + esc(CS.pretty(note.name) + ' — ' + CS.pretty(note.label) +
           (note.open ? ' (open)' : ' (fret ' + note.fret + ')')) + '</title>';
    out += '</g>';
    return out;
  }

  function markers(voicing, flipped, mode, frets) {
    var out = '', i = 0;
    voicing.notes.forEach(function (n) {
      var y = stringY(n.string, flipped);
      if (n.muted) {
        var mx = GUTTER - 34;
        out += '<g class="fb-mute"><line x1="' + (mx - 7) + '" y1="' + (y - 7) + '" x2="' +
               (mx + 7) + '" y2="' + (y + 7) + '"/><line x1="' + (mx + 7) + '" y1="' + (y - 7) +
               '" x2="' + (mx - 7) + '" y2="' + (y + 7) + '"/>' +
               '<title>String ' + OPEN_NAMES[n.string] + ' muted</title></g>';
        return;
      }
      var cx;
      if (n.fret === 0) {
        cx = GUTTER - 34;                       // open note sits in the gutter
      } else {
        cx = GUTTER + (fretPos(n.fret - 1, frets) + fretPos(n.fret, frets)) / 2;
      }
      out += noteDot(n, cx, y, mode, i++);
    });
    return out;
  }

  /* ------------------------------------------------------------- render */
  function render(el, opts) {
    var voicing = opts.voicing;
    var frets = opts.frets || CS.MAX_FRET;
    var mode = opts.labelMode || 'interval';
    var flipped = !!opts.flipped;

    el.setAttribute('viewBox', '0 0 ' + VB_W + ' ' + VB_H);
    el.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    el.setAttribute('role', 'img');
    el.setAttribute('aria-label', opts.ariaLabel || 'Fretboard diagram');

    var svg = defs() + board(frets) + strings(flipped) + fretNumbers(frets);
    if (voicing) svg += markers(voicing, flipped, mode, frets);
    el.innerHTML = svg;
  }

  /* ------------------------------------------------- mini chord boxes */
  var MW = 76, MH = 92, MPAD_T = 16, MPAD_L = 9, MFRETS = 5;

  function mini(voicing) {
    var f = voicing.frets;
    var fretted = f.filter(function (v) { return v !== null && v > 0; });
    var lo = fretted.length ? Math.min.apply(null, fretted) : 1;
    var hi = fretted.length ? Math.max.apply(null, fretted) : 1;
    var start = (hi <= MFRETS) ? 1 : lo;
    var atNut = start === 1;

    var gw = (MW - MPAD_L * 2) / 5;                 // string spacing
    var gh = (MH - MPAD_T - 8) / MFRETS;            // fret spacing
    var out = '<svg class="mini" viewBox="0 0 ' + MW + ' ' + MH + '" aria-hidden="true">';

    // frets
    for (var r = 0; r <= MFRETS; r++) {
      var y = MPAD_T + r * gh;
      var top = (r === 0 && atNut);
      out += '<line class="' + (top ? 'mini-nut' : 'mini-fret') + '" x1="' + MPAD_L + '" y1="' + y +
             '" x2="' + (MW - MPAD_L) + '" y2="' + y + '"/>';
    }
    // strings (low E on the left, matching the tab order)
    for (var s = 0; s < 6; s++) {
      var x = MPAD_L + s * gw;
      out += '<line class="mini-string" x1="' + x + '" y1="' + MPAD_T + '" x2="' + x +
             '" y2="' + (MPAD_T + MFRETS * gh) + '"/>';
    }
    if (!atNut) {
      out += '<text class="mini-pos" x="' + (MW - 2) + '" y="' + (MPAD_T + gh * 0.75) + '">' + start + '</text>';
    }
    // dots
    voicing.notes.forEach(function (n) {
      var x = MPAD_L + n.string * gw;
      if (n.muted) {
        out += '<g class="mini-mute"><line x1="' + (x - 3) + '" y1="' + (MPAD_T - 10) +
               '" x2="' + (x + 3) + '" y2="' + (MPAD_T - 4) + '"/><line x1="' + (x + 3) +
               '" y1="' + (MPAD_T - 10) + '" x2="' + (x - 3) + '" y2="' + (MPAD_T - 4) + '"/></g>';
        return;
      }
      if (n.fret === 0) {
        out += '<circle class="mini-open role-' + n.role + '" cx="' + x + '" cy="' + (MPAD_T - 7) + '" r="3.4"/>';
        return;
      }
      var row = n.fret - start;
      if (row < 0 || row >= MFRETS) return;
      var cy = MPAD_T + row * gh + gh / 2;
      out += '<circle class="mini-dot role-' + n.role + '" cx="' + x + '" cy="' + cy.toFixed(1) + '" r="4.6"/>';
    });
    out += '</svg>';
    return out;
  }

  CS.fretboard = { render: render, mini: mini, fretPos: fretPos };
})(window.CS = window.CS || {});
