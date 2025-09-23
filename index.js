const express = require('express');
const app = express();
const env = require('dotenv').config();
const session = require('express-session');
const flash = require('connect-flash'); // ✅ add flash
const logger = require('./utils/logger');
const connectDB = require('./config/db');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const userRouter = require('./routes/userRouter');
const adminRouter = require('./routes/adminRouter');
const passport = require('./config/passport');
const middleware = require('./middlewares/middlewares');
const methodOverride = require('method-override');
const Razorpay = require('razorpay');
const {
  validateWebhookSignature,
} = require('razorpay/dist/utils/razorpay-utils');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

//session
app.use(middleware.sessionMiddleware(session));

// ✅ flash middleware
app.use(flash());

// ✅ make flash messages available globally in views
app.use(middleware.flashAndUserMiddleware);

app.use(passport.initialize());
app.use(passport.session());

app.use(middleware.cacheControl);

app.use('/', userRouter);
app.use('/admin', adminRouter);

// error-handling middleware
app.use(middleware.errorHandler);

app.set('view engine', 'ejs');
app.set('views', [
  path.join(__dirname, 'views/user'),
  path.join(__dirname, 'views/admin'),
]);

connectDB();
app.listen(process.env.PORT, () => {
  logger.info('Server listening');
});
