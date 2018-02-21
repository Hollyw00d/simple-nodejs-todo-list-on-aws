const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongo = require('mongodb');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/loginapp');
let db = mongoose.connection;

let routes = require('./routes/index');
let users = require('./routes/users');

// Init app
let app = express();

// View engine
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout: 'layout'}));
app.set('view engine', 'handlebars');

// bodyParser and cookieParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Expression session
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Express validator
app.use(expressValidator({
    errorFormatter: (param, msg, value) => {
        let namespace = param.split('.');
        let root = namespace.shift();
        let formParam = root;

        while(namespace.length) {
            formParam += `[${namespace.shift()}]`;
        }
        return {
            param: formParam,
            msg,
            value
        }
    }
}));

// Connect flash
app.use(flash());

// Global variables for flash messages
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

app.use('/', routes);
app.use('/users', users);

// Set port
app.set('port', (process.env.PORT || 3000));

app.listen(app.get('port'), () => {
    console.log(`Server started on port ${app.get('port')}`);
});