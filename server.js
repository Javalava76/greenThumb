const express = require('express');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const expressValidator = require('express-validator');
const Sequelize = require('sequelize');


//Authentication packages
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const MySQLStore = require('express-mysql-session')(session);
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');


// Sets up the Express App
// =============================================================
const app = express();
const PORT = process.env.PORT || 3000;

// Requiring our models for syncing
// =============================================================
const db = require('./models');
const dbSeed = require('./seeds/plant_seeds');

// Sets up the Express app to handle data parsing
// =============================================================
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));

//Authentication setup
// =============================================================
app.use(cookieParser());
app.use(expressValidator());

let options = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'password',
  database: 'greenThumb_db'
};

let sessionStore = new MySQLStore(options);

app.use(session({
  secret: 'sdlfkjdlajsdoijajk',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  // cookie: { secure: true }
}));
app.use(passport.initialize());
app.use(passport.session());

// Set Handlebars as the default templating engine.
// =============================================================
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Static directory
app.use(express.static('public'));

// Routes
// =============================================================
let htmlRoute = require('./routes/html-route.js');
let registrationRoute = require('./routes/registration-route.js');

app.use((req, res, next)=>{
  res.locals.isAuthenticated = req.isAuthenticated();
  next();
})

app.use('/', htmlRoute);
app.use('/', registrationRoute);

passport.use(new LocalStrategy(
  function (username, password, done) {
    console.log(username);
    console.log(password);
    db.users.findOne({
      attributes: ['id','password'],
      where: { username: username }
    }).then((dbResult) => {
      if(dbResult){
        let hash = dbResult.password;
        let userId = dbResult.id;

        bcrypt.compare(password,hash,(err,response)=>{
          console.log(response);
          if (response){
            console.log("password correct");
            return done(null, {userId:userId});
          } else {
            console.log("password incorrect");
            return done(null, false);
          }
        });
      } else {
        return done(null, false);
      }
    }).catch(err => {
      done(err);
    });
  }
));

// Syncing our sequelize models and then starting our Express app
// =============================================================
db.sequelize.sync().then(function () {
  app.listen(PORT, function () {
    console.log("App listening on PORT " + PORT);
  });
  // dbSeed();
});
