/* bakeOnce(host, key, stamp, build)
   Shared "expensive pre-render, rebuild only when the environment changed" gate.
   host[key] holds the baked artifact (usually an offscreen canvas). It is reused while every field named in
   `stamp` still equals what it was when the bake ran; otherwise build() runs and the stamp fields are updated.
   Stamp fields are ordinary properties on host (e.g. b._shellCacheEnv), so existing readers keep working.
   build() may return the artifact or store it on host[key] itself (the ground-cache painters do the latter).
   If build() throws, nothing is stamped, so the next call retries. Returns host[key]. */
window.bakeOnce = function bakeOnce(host, key, stamp, build){
  var cur = host[key];
  if (cur) {
    var fresh = true;
    for (var f in stamp) { if (host[f] !== stamp[f]) { fresh = false; break; } }
    if (fresh) return cur;
  }
  var out = build();
  if (out) host[key] = out;
  for (var g in stamp) host[g] = stamp[g];
  return host[key];
};