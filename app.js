const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
require('dotenv').config();



const session = require('express-session');
const flash = require('connect-flash');
const msal = require('@azure/msal-node');

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;


const indexRouter = require('./routes/microsoft/index');
const authRouter = require('./routes/microsoft/auth');
const calendarRouter = require('./routes/microsoft/calendar');

const gauthRouter = require('./routes/google/auth')
const gcalendarRouter = require('./routes/google/calendar')

const useraurhRouter = require('./routes/userdb/auth')
const usercalendarRouter = require('./routes/userdb/calendar')

const csvRouter = require('./routes/csv/csv')

var app = express();
// <MsalInitSnippet>
// In-memory storage of logged-in users
// For demo purposes only, production apps should store
// this in a reliable storage
app.locals.users = {};

// MSAL config
const msalConfig = {
  auth: {
    clientId: process.env.OAUTH_CLIENT_ID || '',
    authority: process.env.OAUTH_AUTHORITY,
    clientSecret: process.env.OAUTH_CLIENT_SECRET
  },
  // system: {
  //   loggerOptions: {
  //     loggerCallback(loglevel, message, containsPii) {
  //       if (!containsPii) console.log(message);
  //     },
  //     piiLoggingEnabled: false,
  //     logLevel: msal.LogLevel.Verbose,
  //   }
  // }
};

// Create msal application object
app.locals.msalClient = new msal.ConfidentialClientApplication(msalConfig);
// </MsalInitSnippet>
// <SessionSnippet>
// Session middleware
// NOTE: Uses default in-memory session store, which is not
// suitable for production
app.use(session({
  secret: 'secret_value',
  resave: false,
  saveUninitialized: false,
  unset: 'destroy'
}));

// Initialize Passport
app.use(passport.initialize());
// Set up Passport to use sessions
app.use(passport.session());



// Flash middleware
app.use(flash());

// Set up local vars for template layout
app.use(function(req, res, next) {
  // Read any flashed errors and save
  // in the response locals
  res.locals.error = req.flash('error_msg');

  // Check for simple error string and
  // convert to layout's expected format
  var errs = req.flash('error');
  for (var i in errs){
    res.locals.error.push({message: 'An error occurred', debug: errs[i]});
  }

  // Check for an authenticated user and load
  // into response locals
  if (req.session.userId) {
    res.locals.user = app.locals.users[req.session.userId];
  }

  next();
});
// </SessionSnippet>



// Serialize User: Defines how user objects are stored in the session.
passport.serializeUser(function(user, cb) {
  cb(null, user);
});


// Serialize User: Defines how user objects are stored in the session.
passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});


// Configure Google Strategy for OAuth 2.0 authentication
passport.use(new GoogleStrategy({
  clientID: process.env.GOAUTH_CLIENT_ID,
  clientSecret: process.env.GOAUTH_CLIENT_SECRET,
  callbackURL: process.env.GOAUTH_REDIRECT_URI
},
function(accessToken, refreshToken, profile, done) {
    profile.accessToken = accessToken
    return done(null, profile);
}
));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// <FormatDateSnippet>
var hbs = require('hbs');
var dateFns = require('date-fns');
// Helper to format date/time sent 
hbs.registerHelper('eventDateTime', function(dateTime) {
  const date = dateFns.parseISO(dateTime);
  return dateFns.format(date, 'dd/MM/yyyy h:mm a');
});
// </FormatDateSnippet>



app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



app.use('/', indexRouter);
//Microsoft Router
app.use('/auth', authRouter);
app.use('/calendar/Microsoft', calendarRouter);

//google Router
app.use('/auth/google',gauthRouter); 
app.use('/calendar/google',gcalendarRouter); 

//user router
app.use('/user',useraurhRouter)
app.use('/calendar/user',usercalendarRouter)

//csv router
app.use('/calendar/csv',csvRouter)



app.get('/error', (req, res) => res.send('Error logging in'));  
 



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



module.exports = app;
