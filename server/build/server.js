"use strict";

var _stringify = require("babel-runtime/core-js/json/stringify");

var _stringify2 = _interopRequireDefault(_stringify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var express = require("express");

var app = express();
var port = process.env.PORT || 5000;
var cors = require("cors");
app.use(cors());

//https://github.com/passport/express-4.x-twitter-example/blob/master/server.js
var passport = require("passport");
var Strategy = require("passport-twitter").Strategy;

//MONGO setup
var dbUser = process.env.DBUSER;
var dbPW = process.env.DBPW;
var dburl = "mongodb://" + dbUser + ":" + dbPW + "@ds237967.mlab.com:37967/fccvotingapp";
var mongo = require("mongodb").MongoClient;
var ObjectId = require("mongodb").ObjectId;

// Configure the Twitter strategy for use by Passport.
//
// OAuth 1.0-based strategies require a `verify` function which receives the
// credentials (`token` and `tokenSecret`) for accessing the Twitter API on the
// user's behalf, along with the user's profile.  The function must invoke `cb`
// with a user object, which will be set at `req.user` in route handlers after
// authentication.
passport.use(new Strategy({
  consumerKey: process.env.CONSUMER_KEY,
  consumerSecret: process.env.CONSUMER_SECRET,
  callbackURL: "http://127.0.0.1:3000/api/login/twitter/return"
}, function (token, tokenSecret, profile, cb) {
  // In this example, the user's Twitter profile is supplied as the user
  // record.  In a production-quality application, the Twitter profile should
  // be associated with a user record in the application's database, which
  // allows for account linking and authentication with other identity
  // providers.
  return cb(null, profile);
}));

// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  In a
// production-quality application, this would typically be as simple as
// supplying the user ID when serializing, and querying the user record by ID
// from the database when deserializing.  However, due to the fact that this
// example does not have a database, the complete Twitter profile is serialized
// and deserialized.
passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require("morgan")("combined"));
app.use(require("cookie-parser")());
app.use(require("body-parser").urlencoded({ extended: true }));
app.use(require("express-session")({
  secret: "keyboard cat",
  resave: false,
  proxy: true,
  saveUninitialized: false
}));
app.set("trust proxy", 1);

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

app.get("/api/hello", function (req, res) {
  res.send({ express: "Hello From Express" });
});

app.get("/api/login/twitter", passport.authenticate("twitter"));

app.get("/api/login/twitter/return", passport.authenticate("twitter", { failureRedirect: "/api/login" }), function (req, res) {
  res.redirect("/");
});

//logout
app.get("/logout", function (req, res) {
  req.session.destroy(function () {
    req.logOut();

    res.redirect("/");
  });
});

app.get("/api/profile", function (req, res) {
  res.setHeader("Content-Type", "application/json");
  if (!req.isAuthenticated()) {
    res.send((0, _stringify2.default)({
      success: false,
      message: "You need to be authenticated to access this page!"
    }));
  } else {
    res.send((0, _stringify2.default)({
      success: true,
      user: req.user
    }));
  }
  res.end();
});

app.get("/users/alexwilliams567/listpolls", function (req, res) {
  res.setHeader("Content-Type", "application/json");

  mongo.connect(dburl, function (err, database) {
    var docs = database.db("fccvotingapp").collection("polls");
    var pollNames = [];
    docs.find({ user: "alexwilliams567" }).toArray(function (err, result) {
      if (err) throw err;
      for (var i = 0; i < result.length; i++) {
        pollNames.push({ pollName: result[i].pollName, id: result[i]._id });
      }
      res.send((0, _stringify2.default)({
        polls: pollNames
      }));
      res.end();
    });

    database.close();
  });
});

//query list of polls in db
app.get("/api/listpolls", function (req, res) {
  res.setHeader("Content-Type", "application/json");

  mongo.connect(dburl, function (err, database) {
    var docs = database.db("fccvotingapp").collection("polls");
    var pollNames = [];
    docs.find({}).toArray(function (err, result) {
      if (err) throw err;
      for (var i = 0; i < result.length; i++) {
        pollNames.push({ pollName: result[i].pollName, id: result[i]._id });
      }
      res.send((0, _stringify2.default)({
        polls: pollNames
      }));
      res.end();
    });

    database.close();
  });
});

//return questions and votes by id, unauthenticated
//usage: /api/listquestions?questionid=${id}
app.get("/api/listquestions", function (req, res) {
  res.setHeader("Content-Type", "application/json");

  mongo.connect(dburl, function (err, database) {
    var docs = database.db("fccvotingapp").collection("polls");
    docs.findOne({ _id: new ObjectId(req.query.questionid) }, function (err, doc) {
      if (err) throw err;
      res.send((0, _stringify2.default)({
        pollQuestions: doc.pollQuestions,
        pollVotes: doc.pollVotes
      }));
      res.end();
    });

    database.close();
  });
});

//add poll to db, must be authenticated
//usage: /api/addpoll?pollName=${pollname}
app.post("/api/addpoll", function (req, res) {
  if (!req.isAuthenticated()) {
    res.send((0, _stringify2.default)({
      success: false,
      message: "You need to be authenticated to add a poll!"
    }));
  } else {
    obj = { pollName: req.query.pollName, pollQuestions: [], pollVotes: [] };
    mongo.connect(dburl, function (err, database) {
      var docs = database.db("fccvotingapp").collection("polls");
      docs.insert(obj, function (err, data) {
        if (err) throw err;
      });
      res.send((0, _stringify2.default)({
        success: true,
        docAdded: obj
      }));
      database.close();
    });
  }
});

//add question to poll, doesn't need to be authenticated
//usage: /api/addpoll?pollid=${pollname}&question=${question}
app.post("/api/addquestion", function (req, res) {
  mongo.connect(dburl, function (err, database) {
    var docs = database.db("fccvotingapp").collection("polls");

    docs.findOneAndUpdate({ _id: new ObjectId(req.query.pollid) }, { $push: { pollQuestions: req.query.question, pollVotes: 0 } }, function (err, result) {
      res.send((0, _stringify2.default)({
        success: true
      }));
      database.close();
    });
  });
});

//vote on a question, doesn't need to be authenticated
//usage: /api/addvote?pollid=${pollname}&voteIndex=${vi}
app.post("/api/addvote", function (req, res) {
  mongo.connect(dburl, function (err, database) {
    var docs = database.db("fccvotingapp").collection("polls");

    //use a left side variable in mongodb $inc below
    var variable = "pollVotes." + req.query.voteIndex;
    var action = {};
    action[variable] = 1;

    docs.findOneAndUpdate({ _id: new ObjectId(req.query.pollid) }, { $inc: action }, function (err, result) {
      res.send((0, _stringify2.default)({
        success: true
      }));
      database.close();
    });
  });
});

app.listen(port, function () {
  return console.log("Listening on port " + port);
});