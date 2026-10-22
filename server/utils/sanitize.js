const clean = (o) => {
  if (!o || typeof o !== 'object') return o;
  for (const k of Object.keys(o)) {
    if (k.startsWith('$') || k.includes('.')) delete o[k];
    else clean(o[k]);
  }
  return o;
};
module.exports = (req, _res, next) => { clean(req.body); clean(req.query); clean(req.params); next(); };
