module.exports = function (options) {
  return function (req, res, next) {
      if (typeof options === 'object' && typeof options.cache === 'object') {
          options.cache.forEach(function (route) {

              if (req.path.match(new RegExp(route.path, 'g'))) {
                  res.set('Cache-Control', 'max-age=' + route.ttl);
              }
          });
      }

      next();
  };
};