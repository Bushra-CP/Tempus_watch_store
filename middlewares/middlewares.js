// Session middleware
function sessionMiddleware(session) {
  return session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  });
}

// Flash messages
function flashAndUserMiddleware(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.user = req.session.user || null;
  next();
}

// Cache control middleware
function cacheControl(req, res, next) {
  res.set('cache-control', 'no-store');
  next();
}

//error handling middleware
function errorHandler(err, req, res, next) {
  console.error(err.stack); // log the error
  res.status(err.status || 500).send({
    success: false,
    message: err.message || 'Internal Server Error',
  });
}

module.exports = {
  sessionMiddleware,
  flashAndUserMiddleware,
  cacheControl,
  errorHandler,
};
