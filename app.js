const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');

const indexRouter = require('./routes/index');
const roomsRouter = require('./routes/room');
const rsvpRouter = require('./routes/rsvp');
const userRouter = require('./routes/user');
const locals = require('./middleware/locals');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(locals);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Passport Config
require('./config/passport')(passport);

// Express session
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.authError = req.flash('error');
  next();
});

// Routes
app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/room', roomsRouter);
app.use('/rsvp', rsvpRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.send(err.message); //this or res.status(err.status || 500).send('error')
});

module.exports = app;
