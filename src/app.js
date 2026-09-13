/* ChordStash — app.js
 * UI wiring. Holds the selection, asks theory.js/shapes.js what it means,
 * and paints it.
 */
(function (CS) {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var P = CS.pretty;

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  /* ---------------------------------------------------------------- store
   * localStorage is a convenience only: every read is guarded and the app
   * renders correctly when it throws or comes back empty. */
  var store = {
    get: function (k, d) {
      try { var v = localStorage.getItem('chordstash:' + k); return v == null ? d : v; }
      catch (e) { return d; }
    },
    set: function (k, v) {
      try { localStorage.setItem('chordstash:' + k, v); } catch (e) { /* fine */ }
    }
  };

  var state = {
    root: 'C',
    quality: 'maj9',
    shapeId: 'maj9-a',
    octave: 0,
    labelMode: store.get('labelMode', 'interval'),
    flipped: store.get('flipped', '0') === '1',
    theme: store.get('theme', 'auto'),
    tab: 'chords',
    progId: null,
    progKey: null,
    step: -1,
    paletteKey: 'C'
  };

  /* ------------------------------------------------------------ selection */

  function progression() {
    if (!state.progId) return null;
    var p = CS.progressionById(state.progId);
    return p ? CS.progressionInKey(p, state.progKey || p.key) : null;
  }

  function activeChord() {
    var p = progression();
    if (p && state.step >= 0 && p.chords[state.step]) return p.chords[state.step];
    return null;
  }

  /* The voicing currently on the board, plus everything the panels need. */
  function current() {
    var list = CS.voicingsFor(state.root, state.quality);
    var i;
    for (i = 0; i < list.length; i++) {
      if (list[i].shapeId === state.shapeId && list[i].octave === state.octave) {
        return { voicing: list[i], list: list };
      }
    }
    var res = CS.resolveChord(state.root, state.quality, state.shapeId);
    if (!res) return { voicing: null, list: list };
    if (res.qualityChanged) list = CS.voicingsFor(state.root, res.voicing.quality);
    return {
      voicing: res.voicing, list: list,
      substituted: res.substituted, note: res.substitutionNote,
      qualityChanged: res.qualityChanged
    };
  }

  function setChord(root, quality, shapeId, opts) {
    opts = opts || {};
    state.root = root;
    state.quality = quality;
    state.octave = 0;
    var res = CS.resolveChord(root, quality, shapeId);
    state.shapeId = res ? res.voicing.shapeId : shapeId;
    if (res && res.qualityChanged) state.quality = res.voicing.quality;
    if (!opts.keepStep) state.step = -1;
    render();
  }

  function setStep(i) {
    var p = progression();
    if (!p) return;
    var n = p.chords.length;
    state.step = ((i % n) + n) % n;
    var ch = p.chords[state.step];
    state.root = ch.root;
    state.quality = ch.quality;
    state.octave = 0;
    var res = CS.resolveChord(ch.root, ch.quality, ch.shapeId);
    state.shapeId = res ? res.voicing.shapeId : ch.shapeId;
    if (res && res.qualityChanged) state.quality = res.voicing.quality;
    render();
  }

  function loadProgression(id) {
    var p = CS.progressionById(id);
    if (!p) return;
    state.progId = id;
    state.progKey = p.key;
    setStep(0);
  }

  /* ================================================================ rail */

  function renderRoots() {
    var host = $('root-grid');
    host.innerHTML = '';
    CS.ROOTS.forEach(function (r) {
      var on = CS.pcOf(r) === CS.pcOf(state.root);
      var b = el('button', 'root-btn' + (on ? ' is-on' : ''), P(r));
      b.type = 'button';
      b.setAttribute('role', 'radio');
      b.setAttribute('aria-checked', on ? 'true' : 'false');
      b.addEventListener('click', function () { setChord(r, state.quality, state.shapeId); });
      host.appendChild(b);
    });
  }

  function renderQualities() {
    var host = $('quality-list');
    host.innerHTML = '';
    CS.QUALITY_FAMILIES.forEach(function (fam) {
      var ids = CS.QUALITY_ORDER.filter(function (q) {
        return CS.QUALITIES[q] && CS.QUALITIES[q].family === fam;
      });
      if (!ids.length) return;
      host.appendChild(el('h4', 'group-head', esc(fam)));
      var wrap = el('div', 'quality-group');
      ids.forEach(function (q) {
        var meta = CS.QUALITIES[q];
        var on = state.quality === q;
        var playable = CS.voicingsFor(state.root, q).length > 0;
        var b = el('button', 'quality-btn' + (on ? ' is-on' : '') + (playable ? '' : ' is-dim'),
          '<span class="q-sym">' + esc(P(state.root) + P(meta.suffix)) + '</span>' +
          '<span class="q-name">' + esc(meta.name) + '</span>');
        b.type = 'button';
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
        if (!playable) b.title = 'No shape of this quality reaches ' + P(state.root) + ' — the nearest will be substituted';
        b.addEventListener('click', function () { setChord(state.root, q, null); });
        wrap.appendChild(b);
      });
      host.appendChild(wrap);
    });
  }

  function renderProgList() {
    var host = $('prog-list');
    host.innerHTML = '';
    CS.PROG_FAMILIES.forEach(function (fam) {
      host.appendChild(el('h4', 'group-head', esc(fam.name)));
      var wrap = el('div', 'prog-group');
      CS.PROGRESSIONS.filter(function (p) { return p.family === fam.id; }).forEach(function (p) {
        var on = state.progId === p.id;
        var b = el('button', 'prog-btn' + (on ? ' is-on' : ''),
          '<span class="p-code">' + esc(p.code) + '</span>' +
          '<span class="p-name">' + esc(p.name) + '</span>' +
          '<span class="p-key">' + esc(P(p.key) + (p.mode ? ' ' + p.mode : '')) + '</span>');
        b.type = 'button';
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
        b.addEventListener('click', function () { loadProgression(p.id); });
        wrap.appendChild(b);
      });
      host.appendChild(wrap);
    });
  }

  function renderPalette() {
    var host = $('palette-body');
    var ref = CS.reference;
    var key = state.paletteKey;
    var html = '';

    html += '<div class="field palette-key">' +
      '<label class="field-label" for="palette-key-sel">Palette in the key of</label>' +
      '<select id="palette-key-sel">' + CS.ROOTS.map(function (r) {
        return '<option value="' + esc(r) + '"' + (r === key ? ' selected' : '') + '>' + esc(P(r)) + '</option>';
      }).join('') + '</select></div>';

    html += '<h4 class="group-head">Borrowed chords</h4>' +
            '<p class="rail-note">Modal interchange, ranked by how often this style uses it. Tap a chord to load it.</p>';
    html += '<ul class="borrowed">';
    ref.borrowedIn(key).forEach(function (b) {
      html += '<li class="borrowed-row">' +
        '<div class="borrowed-top"><span class="borrowed-roman">' + esc(b.roman) + '</span>' +
        '<span class="borrowed-chords">' + b.qualities.map(function (q) {
          var meta = CS.QUALITIES[q];
          return '<button type="button" class="mini-chord" data-root="' + esc(b.root) +
            '" data-quality="' + esc(q) + '">' + esc(P(b.root) + P(meta.suffix)) + '</button>';
        }).join('') + '</span></div>' +
        '<p class="borrowed-sound">' + esc(b.sound) + '</p>' +
        '<p class="borrowed-meta"><span>' + esc(b.from) + '</span><span>' + esc(b.who) + '</span></p>' +
        '</li>';
    });
    html += '</ul>';

    html += '<div class="rule-card"><span class="eyebrow">The melody rule</span><p>' +
            esc(ref.melodyRule) + '</p></div>';

    html += '<h4 class="group-head">Division of labour</h4>' +
            '<p class="rail-note">Nobody plays the whole chord.</p><table class="division"><thead><tr>' +
            '<th>Part</th><th>Range</th><th>Plays</th><th>Never</th></tr></thead><tbody>';
    ref.division.forEach(function (d) {
      html += '<tr><th scope="row">' + esc(d.part) + '</th><td class="num">' + esc(d.range) +
              '</td><td>' + esc(d.plays) + '</td><td class="never">' + esc(d.never) + '</td></tr>';
    });
    html += '</tbody></table>';
    html += '<div class="rule-card"><span class="eyebrow">The mud rule</span><p>' +
            esc(ref.mudRule) + '</p></div>';

    html += '<h4 class="group-head">Cheat sheet</h4><dl class="cheats">';
    ref.cheats.forEach(function (c) {
      html += '<dt>' + esc(c[0]) + '</dt><dd>' + esc(c[1]) + '</dd>';
    });
    html += '</dl>';

    host.innerHTML = html;

    $('palette-key-sel').addEventListener('change', function (e) {
      state.paletteKey = e.target.value;
      renderPalette();
    });
    Array.prototype.forEach.call(host.querySelectorAll('.mini-chord'), function (b) {
      b.addEventListener('click', function () {
        setChord(b.getAttribute('data-root'), b.getAttribute('data-quality'), null);
        switchTab('chords');
      });
    });
  }

  /* =============================================================== stage */

  function renderHead(cur) {
    var v = cur.voicing;
    var ch = activeChord();
    var meta = CS.QUALITIES[state.quality] || {};
    var symbol = ch ? ch.symbol : P(state.root) + P(meta.suffix || '');

    $('chord-symbol').innerHTML = esc(symbol);
    var name = P(state.root) + ' ' + (meta.name || '').toLowerCase();
    if (ch && CS.pcOf(ch.bass) !== CS.pcOf(ch.root)) {
      name += ' over ' + P(ch.bass) + ' in the bass';
    }
    $('chord-name').textContent = name;

    var badges = [];
    if (ch) badges.push(['roman', ch.roman || 'planed']);
    if (v) {
      badges.push(['pos', v.lowFret === 0 && !v.hasOpen ? 'open position' : 'fret ' +
        (v.lowFret === v.highFret ? v.lowFret : v.lowFret + '–' + v.highFret)]);
      badges.push(['strings', v.strings + ' notes']);
      if (v.hasOpen) badges.push(['open', 'open strings']);
      if (v.span >= 5) badges.push(['warn', 'span ' + v.span + ' frets']);
      if (v.shape && v.shape.rootless) badges.push(['warn', 'rootless']);
      if (!v.shape || !v.shape.movable) badges.push(['warn', 'position-locked']);
    }
    $('chord-badges').innerHTML = badges.map(function (b) {
      return '<span class="badge badge-' + b[0] + '">' + esc(b[1]) + '</span>';
    }).join('');
  }

  var LEGEND = [
    ['root', 'Root', 'the anchor'],
    ['third', '3rd', 'defines major vs minor'],
    ['seventh', '7th', 'defines the colour family'],
    ['ext', '9 11 13', 'the extensions — where the style lives'],
    ['fifth', '5th', 'the first note you drop']
  ];

  function renderLegend() {
    $('legend').innerHTML = LEGEND.map(function (l) {
      return '<li class="legend-item"><span class="swatch role-' + l[0] + '"></span>' +
        '<span class="legend-label">' + esc(l[1]) + '</span>' +
        '<span class="legend-note">' + esc(l[2]) + '</span></li>';
    }).join('');
  }

  function renderBoard(cur) {
    var v = cur.voicing;
    var svg = $('fretboard');
    if (!v) {
      svg.innerHTML = '';
      return;
    }
    var label = v.sounding.map(function (n) {
      return CS.pretty(n.name) + ' ' + CS.pretty(n.label);
    }).join(', ');
    CS.fretboard.render(svg, {
      voicing: v,
      labelMode: state.labelMode,
      flipped: state.flipped,
      ariaLabel: 'Fretboard: ' + $('chord-symbol').textContent + ', low to high ' + label
    });
  }

  function renderVoicings(cur) {
    var host = $('voicing-strip');
    host.innerHTML = '';
    var list = cur.list || [];
    $('voicing-count').textContent = list.length
      ? list.length + (list.length === 1 ? ' shape' : ' shapes')
      : '';

    list.forEach(function (v) {
      var on = v.shapeId === (cur.voicing && cur.voicing.shapeId) && v.octave === (cur.voicing && cur.voicing.octave);
      var b = el('button', 'voicing' + (on ? ' is-on' : ''),
        CS.fretboard.mini(v) +
        '<span class="voicing-name">' + esc(v.title) + '</span>' +
        '<span class="voicing-frets">' + esc(v.frets.map(function (f) {
          return f === null ? '×' : f;
        }).join(' ')) + '</span>');
      b.type = 'button';
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.addEventListener('click', function () {
        state.shapeId = v.shapeId;
        state.octave = v.octave;
        render();
      });
      host.appendChild(b);
    });

    var un = CS.unavailableFor(state.root, cur.voicing ? cur.voicing.quality : state.quality);
    var note = $('voicing-unavailable');
    if (un.length) {
      note.hidden = false;
      note.innerHTML = un.map(function (u) {
        return '<span class="unavail-item"><strong>' + esc(u.shape.label) + '</strong> — ' + esc(u.reason) + '</span>';
      }).join('');
    } else {
      note.hidden = true;
      note.innerHTML = '';
    }
  }

  /* ------------------------------------------------------ progression bar */

  function renderProgBar() {
    var bar = $('prog-bar');
    var p = progression();
    if (!p) { bar.hidden = true; return; }
    bar.hidden = false;

    $('prog-code').textContent = p.code;
    $('prog-name').textContent = p.name;
    $('prog-mode').textContent = p.mode || '';

    var sel = $('prog-key');
    if (sel.getAttribute('data-built') !== '1') {
      sel.innerHTML = CS.ROOTS.map(function (r) {
        return '<option value="' + esc(r) + '">' + esc(P(r)) + '</option>';
      }).join('');
      sel.setAttribute('data-built', '1');
    }
    sel.value = CS.ROOTS.filter(function (r) { return CS.pcOf(r) === CS.pcOf(p.key); })[0] || p.key;

    var chips = $('prog-chips');
    chips.innerHTML = '';
    var idx = 0;
    p.sections.forEach(function (sec, si) {
      if (p.sections.length > 1 || sec.label) {
        chips.appendChild(el('span', 'chip-section', esc(sec.label || 'Section ' + (si + 1))));
      }
      sec.chords.forEach(function (ch) {
        var myIndex = idx++;
        var on = myIndex === state.step;
        var slash = CS.pcOf(ch.bass) !== CS.pcOf(ch.root);
        var b = el('button', 'chip' + (on ? ' is-on' : ''),
          '<span class="chip-roman">' + esc(ch.roman || '—') + '</span>' +
          '<span class="chip-symbol">' + esc(ch.symbol) + '</span>' +
          '<span class="chip-bars">' + ch.bars + (ch.bars === 1 ? ' bar' : ' bars') +
          (slash ? ' · bass ' + esc(P(ch.bass)) : '') + '</span>');
        b.type = 'button';
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
        b.addEventListener('click', function () { setStep(myIndex); });
        chips.appendChild(b);
      });
    });
    if (p.resolvesTo) {
      var rIndex = idx;
      var rOn = rIndex === state.step;
      chips.appendChild(el('span', 'chip-arrow', '→'));
      var rb = el('button', 'chip chip-resolve' + (rOn ? ' is-on' : ''),
        '<span class="chip-roman">' + esc(p.resolvesTo.roman) + '</span>' +
        '<span class="chip-symbol">' + esc(p.resolvesTo.symbol) + '</span>' +
        '<span class="chip-bars">resolves</span>');
      rb.type = 'button';
      rb.setAttribute('aria-pressed', rOn ? 'true' : 'false');
      rb.addEventListener('click', function () { setStep(rIndex); });
      chips.appendChild(rb);
    }

    $('step-count').textContent = (state.step >= 0 ? state.step + 1 : '–') + ' / ' + p.chords.length;
  }

  /* ------------------------------------------------------------- panels */

  function infoRow(label, body, cls) {
    return '<div class="info-row ' + (cls || '') + '"><span class="eyebrow">' + esc(label) +
      '</span><p>' + body + '</p></div>';
  }

  function renderChordInfo(cur) {
    var host = $('chord-info');
    var v = cur.voicing;
    if (!v) {
      host.innerHTML = '<p class="empty">No shape of this quality can be played at ' +
        esc(P(state.root)) + ' within 15 frets.</p>';
      return;
    }
    var meta = CS.QUALITIES[v.quality] || {};
    var html = '';

    if (cur.substituted && cur.note) {
      html += '<p class="substituted">' + esc(cur.note) + '</p>';
    }

    html += infoRow('Spelled low → high',
      v.sounding.map(function (n) {
        return '<span class="sp role-' + n.role + '"><b>' + esc(P(n.name)) +
          '</b><i>' + esc(P(n.label)) + '</i></span>';
      }).join(''), 'spelling');

    var present = {};
    v.sounding.forEach(function (n) { present[n.semi] = true; });
    html += infoRow('Formula',
      (meta.formula || []).map(function (s) {
        var lab = CS.intervalLabel(v.quality, s);
        return '<span class="deg role-' + CS.roleOf(lab) + (present[s] ? '' : ' is-omitted') + '">' +
          esc(P(lab)) + '</span>';
      }).join(''), 'formula');

    if (v.omitted.length) {
      html += infoRow('Omitted', v.omitted.map(function (o) {
        return '<span class="omit">' + esc(P(o.label)) + ' <i>(' + esc(P(o.name)) + ')</i></span>';
      }).join(''), 'omitted');
    } else {
      html += infoRow('Omitted', '<span class="complete">Nothing — the full chord is under your fingers.</span>', 'omitted');
    }

    if (v.added.length) {
      html += infoRow('Adds', v.added.map(function (a) {
        return '<span class="omit is-add">' + esc(P(a.label)) + ' <i>(' + esc(P(a.name)) + ')</i></span>';
      }).join('') + '<span class="added-why"> — notes the shape picks up beyond the chord symbol.</span>', 'added');
    }

    var character = (v.shape && v.shape.character) || meta.character;
    if (character) html += infoRow('Use it for', esc(character), 'character');

    if (meta.swaps && meta.swaps.length) {
      html += '<div class="info-row swaps"><span class="eyebrow">Swap it for</span><div class="swap-list">' +
        meta.swaps.map(function (s) {
          var m = CS.QUALITIES[s[0]];
          if (!m) return '';
          return '<button type="button" class="swap" data-quality="' + esc(s[0]) + '">' +
            '<span class="swap-sym">' + esc(P(state.root) + P(m.suffix)) + '</span>' +
            '<span class="swap-why">' + esc(s[1]) + '</span></button>';
        }).join('') + '</div></div>';
    }

    host.innerHTML = html;
    Array.prototype.forEach.call(host.querySelectorAll('.swap'), function (b) {
      b.addEventListener('click', function () {
        setChord(state.root, b.getAttribute('data-quality'), null);
      });
    });
  }

  function renderProgInfo() {
    var host = $('prog-info');
    var p = progression();
    if (!p) { host.innerHTML = ''; return; }
    var fam = CS.PROG_FAMILIES.filter(function (f) { return f.id === p.family; })[0];
    var html = '<div class="prog-info-card"><span class="eyebrow">' + esc(fam ? fam.name : '') +
      '</span><h3>' + esc(p.code + ' — ' + p.name) + '</h3>';

    if (p.key !== p.originalKey) {
      html += '<p class="transposed">Transposed from ' + esc(P(p.originalKey)) + '.</p>';
    }
    if (p.bassLine) html += infoRow('Bass', esc(p.bassLine));
    if (p.pianoHint) html += infoRow('Piano / Rhodes', esc(p.pianoHint));
    if (p.scale) html += infoRow('Solo over', esc(p.scale));
    if (p.note) html += infoRow('Note', esc(p.note));
    if (p.why) html += '<blockquote class="why">' + esc(p.why) + '</blockquote>';
    html += '</div>';
    host.innerHTML = html;
  }

  /* =============================================================== chrome */

  function switchTab(tab) {
    state.tab = tab;
    ['chords', 'progs', 'palette'].forEach(function (name) {
      var on = name === tab;
      $('tab-' + name).hidden = !on;
      var btn = document.querySelector('[data-tab="' + name + '"]');
      if (btn) btn.setAttribute('aria-selected', on ? 'true' : 'false');
    });
  }

  function applyTheme() {
    var r = document.documentElement;
    if (state.theme === 'auto') r.removeAttribute('data-theme');
    else r.setAttribute('data-theme', state.theme);
    $('theme-label').textContent =
      state.theme === 'auto' ? 'Auto' : state.theme === 'light' ? 'Light' : 'Dark';
    $('theme-btn').setAttribute('aria-label', 'Theme: ' + $('theme-label').textContent + '. Click to change.');
  }

  function render() {
    var cur = current();
    renderRoots();
    renderQualities();
    renderProgList();
    renderHead(cur);
    renderBoard(cur);
    renderVoicings(cur);
    renderProgBar();
    renderChordInfo(cur);
    renderProgInfo();
    $('flip-btn').setAttribute('aria-pressed', state.flipped ? 'true' : 'false');
    Array.prototype.forEach.call($('label-mode').querySelectorAll('button'), function (b) {
      var on = b.getAttribute('data-mode') === state.labelMode;
      b.setAttribute('aria-checked', on ? 'true' : 'false');
      b.classList.toggle('is-on', on);
    });
  }

  /* ------------------------------------------------------------- events */

  function wire() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-tab]'), function (b) {
      b.addEventListener('click', function () { switchTab(b.getAttribute('data-tab')); });
    });

    Array.prototype.forEach.call($('label-mode').querySelectorAll('button'), function (b) {
      b.addEventListener('click', function () {
        state.labelMode = b.getAttribute('data-mode');
        store.set('labelMode', state.labelMode);
        render();
      });
    });

    $('flip-btn').addEventListener('click', function () {
      state.flipped = !state.flipped;
      store.set('flipped', state.flipped ? '1' : '0');
      render();
    });

    $('theme-btn').addEventListener('click', function () {
      state.theme = state.theme === 'auto' ? 'light' : state.theme === 'light' ? 'dark' : 'auto';
      store.set('theme', state.theme);
      applyTheme();
    });

    $('prog-key').addEventListener('change', function (e) {
      state.progKey = e.target.value;
      setStep(state.step < 0 ? 0 : state.step);
    });

    $('step-prev').addEventListener('click', function () { setStep(state.step - 1); });
    $('step-next').addEventListener('click', function () { setStep(state.step + 1); });

    document.addEventListener('keydown', function (e) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      var t = e.target;
      if (t && (/^(INPUT|SELECT|TEXTAREA)$/.test(t.tagName) || t.isContentEditable)) return;
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      var dir = e.key === 'ArrowRight' ? 1 : -1;

      if (progression()) {
        e.preventDefault();
        setStep(state.step < 0 ? (dir > 0 ? 0 : -1) : state.step + dir);
        return;
      }
      // No progression loaded — walk the voicings of the current chord instead.
      var cur = current();
      if (!cur.list.length) return;
      e.preventDefault();
      var at = 0, i;
      for (i = 0; i < cur.list.length; i++) {
        if (cur.list[i].shapeId === state.shapeId && cur.list[i].octave === state.octave) { at = i; break; }
      }
      var next = cur.list[(at + dir + cur.list.length) % cur.list.length];
      state.shapeId = next.shapeId;
      state.octave = next.octave;
      render();
    });
  }

  function init() {
    applyTheme();
    renderLegend();
    renderPalette();
    switchTab('chords');
    wire();
    setChord('C', 'maj9', 'maj9-a');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window.CS = window.CS || {});
