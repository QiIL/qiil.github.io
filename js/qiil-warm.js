(function(window, document) {
  var root = document.documentElement;
  var accentStorageKey = 'QiIL_Accent_Palette';
  var palettes = {
    ember: { label: 'Ember', color: '#d76f3f', strong: '#8e4225', soft: '#f6d6c2', rgb: '215, 111, 63' },
    sand: { label: 'Sand', color: '#ca8d47', strong: '#7d5628', soft: '#ecd9af', rgb: '202, 141, 71' },
    sage: { label: 'Sage', color: '#5f937d', strong: '#35584a', soft: '#c8ddd4', rgb: '95, 147, 125' },
    dusk: { label: 'Dusk', color: '#7389b7', strong: '#47577a', soft: '#d8e0f2', rgb: '115, 137, 183' }
  };
  var paletteNames = Object.keys(palettes);

  function setLS(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {}
  }

  function getLS(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  function updateThemeMeta() {
    var meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      return;
    }
    var navbarColor = getComputedStyle(root).getPropertyValue('--navbar-bg-color').trim();
    if (navbarColor) {
      meta.setAttribute('content', navbarColor);
    }
  }

  function applyPalette(name) {
    var palette = palettes[name] || palettes.ember;
    root.style.setProperty('--qiil-accent', palette.color);
    root.style.setProperty('--qiil-accent-strong', palette.strong);
    root.style.setProperty('--qiil-accent-soft', palette.soft);
    root.style.setProperty('--qiil-accent-rgb', palette.rgb);
    root.setAttribute('data-qiil-accent', name);
    setLS(accentStorageKey, name);
    document.querySelectorAll('.theme-accent-swatch').forEach(function(button) {
      button.setAttribute('data-active', button.getAttribute('data-accent') === name ? 'true' : 'false');
    });
    updateThemeMeta();
  }

  function nextPaletteName(currentName) {
    var index = paletteNames.indexOf(currentName);
    if (index < 0) {
      return paletteNames[0];
    }
    return paletteNames[(index + 1) % paletteNames.length];
  }

  function mountAccentPanel() {
    if (document.querySelector('.theme-accent-panel')) {
      return;
    }

    var panel = document.createElement('div');
    panel.className = 'theme-accent-panel';

    var trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'theme-accent-trigger';
    trigger.textContent = 'Tone';
    trigger.addEventListener('click', function() {
      applyPalette(nextPaletteName(root.getAttribute('data-qiil-accent') || paletteNames[0]));
    });
    panel.appendChild(trigger);

    var swatches = document.createElement('div');
    swatches.className = 'theme-accent-swatches';
    paletteNames.forEach(function(name) {
      var palette = palettes[name];
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'theme-accent-swatch';
      button.setAttribute('data-accent', name);
      button.setAttribute('aria-label', palette.label);
      button.style.background = 'linear-gradient(135deg, ' + palette.color + ', ' + palette.soft + ')';
      button.addEventListener('click', function() {
        applyPalette(name);
      });
      swatches.appendChild(button);
    });
    panel.appendChild(swatches);
    document.body.appendChild(panel);
  }

  function initCursorGlow() {
    if (!window.matchMedia || !window.matchMedia('(hover: hover)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    if (document.querySelector('.cursor-glow')) {
      return;
    }

    var glow = document.createElement('div');
    glow.className = 'cursor-glow';
    document.body.appendChild(glow);

    var x = window.innerWidth / 2;
    var y = window.innerHeight / 2;
    var targetX = x;
    var targetY = y;
    var pending = false;

    function render() {
      x += (targetX - x) * 0.14;
      y += (targetY - y) * 0.14;
      glow.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0) translate(-50%, -50%)';
      pending = false;
    }

    function requestRender() {
      if (pending) {
        return;
      }
      pending = true;
      window.requestAnimationFrame(render);
    }

    document.addEventListener('pointermove', function(event) {
      targetX = event.clientX;
      targetY = event.clientY;
      glow.classList.add('is-visible');
      requestRender();
    });

    document.addEventListener('pointerleave', function() {
      glow.classList.remove('is-visible');
      document.body.removeAttribute('data-cursor-mode');
    });

    document.querySelectorAll('a, button, input, textarea, .index-card, .post-content img').forEach(function(element) {
      element.addEventListener('pointerenter', function() {
        document.body.setAttribute('data-cursor-mode', 'active');
      });
      element.addEventListener('pointerleave', function() {
        document.body.removeAttribute('data-cursor-mode');
      });
    });
  }

  function initAccentTheme() {
    mountAccentPanel();
    applyPalette(getLS(accentStorageKey) || paletteNames[0]);
    updateThemeMeta();

    var observer = new MutationObserver(updateThemeMeta);
    observer.observe(root, { attributes: true, attributeFilter: ['data-user-color-scheme'] });
  }

  document.addEventListener('DOMContentLoaded', function() {
    initAccentTheme();
    initCursorGlow();
  });
})(window, document);
