import express from 'express';
const app = express();
import dotenv from 'dotenv';
dotenv.config();
import session from 'express-session';
import flash from 'connect-flash'; // ✅ add flash
import logger from './utils/logger.js';
import connectDB from './config/db.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import multer from 'multer';
import userRouter from './routes/userRouter.js';
import adminRouter from './routes/adminRouter.js';
import passport from './config/passport.js';
import middleware from './middlewares/middlewares.js';
import methodOverride from 'method-override';
import Razorpay from 'razorpay';
import { validateWebhookSignature } from 'razorpay/dist/utils/razorpay-utils.js';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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

app.use('/admin', adminRouter);
app.use('/', userRouter);


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
