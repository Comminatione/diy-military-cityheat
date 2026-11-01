(() => {
  const files = window.__engine.files;
  const errors = window.__engineErrors = [];
  const gens = files.map(f => f());
  const failed = new Set();
  const name = i => files[i].name || ('module#' + i);
  [1, 2].forEach(phase => {
    gens.forEach((g, i) => {
      if (failed.has(i)) return;
      try { g.next(); }
      catch (err) {
        failed.add(i);
        errors.push({ module: name(i), phase, error: err });
        console.error('[engine] module "' + name(i) + '" failed in phase ' + phase + ':', err);
      }
    });
  });
  if (errors.length) console.error('[engine] ' + errors.length + ' module(s) failed to load: ' + errors.map(e => e.module).join(', '));
})();