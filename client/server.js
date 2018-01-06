const express = require("express");

const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");
app.use(cors());

//https://github.com/passport/express-4.x-twitter-example/blob/master/server.js
var passport = require("passport");
var Strategy = require("passport-twitter").Strategy;

const dbUser = process.env.DBUSER;
const dbPW = process.env.DBPW;
const dburl = `mongodb://${dbUser}:${dbPW}@ds237967.mlab.com:37967/fccvotingapp`;
const mongo = require("mongodb").MongoClient;

// Configure the Twitter strategy for use by Passport.
//
// OAuth 1.0-based strategies require a `verify` function which receives the
// credentials (`token` and `tokenSecret`) for accessing the Twitter API on the
// user's behalf, along with the user's profile.  The function must invoke `cb`
// with a user object, which will be set at `req.user` in route handlers after
// authentication.
passport.use(
  new Strategy(
    {
      consumerKey: process.env.CONSUMER_KEY,
      consumerSecret: process.env.CONSUMER_SECRET,
      callbackURL: "http://127.0.0.1:3000/api/login/twitter/return"
    },
    function(token, tokenSecret, profile, cb) {
      // In this example, the user's Twitter profile is supplied as the user
      // record.  In a production-quality application, the Twitter profile should
      // be associated with a user record in the application's database, which
      // allows for account linking and authentication with other identity
      // providers.
      return cb(null, profile);
    }
  )
);

// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  In a
// production-quality application, this would typically be as simple as
// supplying the user ID when serializing, and querying the user record by ID
// from the database when deserializing.  However, due to the fact that this
// example does not have a database, the complete Twitter profile is serialized
// and deserialized.
passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require("morgan")("combined"));
app.use(require("cookie-parser")());
app.use(require("body-parser").urlencoded({ extended: true }));
app.use(
  require("express-session")({
    secret: "keyboard cat",
    resave: false,
    proxy: true,
    saveUninitialized: true
  })
);
app.set("trust proxy", 1);

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

app.get("/api/hello", (req, res) => {
  res.send({ express: "Hello From Express" });
});

app.get("/api/login/twitter", passport.authenticate("twitter"));

app.get(
  "/api/login/twitter/return",
  passport.authenticate("twitter", { failureRedirect: "/api/login" }),
  function(req, res) {
    res.redirect("/");
  }
);

app.get("/api/profile", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  if (!req.isAuthenticated()) {
    res.send(
      JSON.stringify({
        success: false,
        message: "You need to be authenticated to access this page!"
      })
    );
  } else {
    res.send(
      JSON.stringify({
        success: true,
        user: req.user
      })
    );
  }
  res.end();
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    // req.user is available for use here
    return next();
  }

  // denied. redirect to login
  res.redirect("/");
}

//query list of polls in db
app.get("/api/listpolls", (req, res) => {
  mongo.connect(dburl, (err, database) => {
    const myAwesomeDB = database.db("fccvotingapp");
    let docs = myAwesomeDB.collection("polls");
    let obj = { success: true };
    docs.insert(obj, (err, data) => {
      if (err) throw err;
      console.log(JSON.stringify(obj));
    });
    database.close();
  });
  res.setHeader("Content-Type", "application/json");
  res.send(
    JSON.stringify({
      success: true
    })
  );
  res.end();
});

//add poll to db
app.post("/api/addpoll", (req, res) => {
  mongo.connect(dburl, (err, database) => {
    database.close();
  });
});

app.listen(port, () => console.log(`Listening on port ${port}`));
