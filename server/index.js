const express = require("express");

const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");
app.use(cors());

//https://github.com/passport/express-4.x-twitter-example/blob/master/server.js
const passport = require("passport");
const TwitterStrategy = require("passport-twitter").Strategy;

const path = require("path");

//MONGO setup
const dbUser = process.env.DBUSER;
const dbPW = process.env.DBPW;
const dburl = `mongodb://${dbUser}:${dbPW}@ds237967.mlab.com:37967/fccvotingapp`;
const mongo = require("mongodb").MongoClient;
const mongoose = require("mongoose");

mongoose.connect(
  `mongodb://${dbUser}:${dbPW}@ds237967.mlab.com:37967/fccvotingapp`
);

var User = require("./user");

const ObjectId = require("mongodb").ObjectId;

let db;
mongo.connect(dburl, (err, database) => {
  db = database.db("fccvotingapp");
});

console.log(process.env.CALLBACK);

app.use(
  require("express-session")({
    secret: "keyboard cat",
    resave: false,
    proxy: true,
    saveUninitialized: false,
    unset: "destroy"
  })
);
app.enable("trust proxy");

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());
// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require("morgan")("combined"));
app.use(require("cookie-parser")());
app.use(require("body-parser").urlencoded({ extended: true }));

// Configure the Twitter strategy for use by Passport.
//
// OAuth 1.0-based strategies require a `verify` function which receives the
// credentials (`token` and `tokenSecret`) for accessing the Twitter API on the
// user's behalf, along with the user's profile.  The function must invoke `cb`
// with a user object, which will be set at `req.user` in route handlers after
// authentication.
passport.use(
  new TwitterStrategy(
    {
      consumerKey: process.env.CONSUMER_KEY,
      consumerSecret: process.env.CONSUMER_SECRET,
      callbackURL: process.env.CALLBACK
    },
    function(accessToken, refreshToken, profile, done) {
      var searchQuery = {
        name: profile.displayName
      };

      var updates = {
        name: profile.displayName,
        someID: profile.id,
        wholeprof: profile
      };

      var options = {
        upsert: true
      };

      // update the user if s/he exists or add a new user
      User.findOneAndUpdate(searchQuery, updates, options, function(err, user) {
        if (err) {
          return done(err);
        } else {
          return done(null, user);
        }
      });
    }
  )
);

// Configure Passport authenticated session persistence.
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

// Priority serve any static files.
app.use(express.static(path.resolve(__dirname, "../client/build")));

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

//logout
app.get("/api/logout", function(req, res) {
  req.logout();
  req.session = null;
  res.redirect("/");
});

//simple login confirmation
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

//use authenticated user id to find all docs(polls) that match
app.get("/api/user/listpolls", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  if (!req.isAuthenticated()) {
    res.send(
      JSON.stringify({
        success: false,
        message: "You need to be authenticated to view your polls created"
      })
    );
  } else {
    let userID = req.user.someID;

    mongo.connect(dburl, (err, database) => {
      let docs = database.db("fccvotingapp").collection("polls");
      let pollNames = [];
      docs.find({ userID: userID }).toArray((err, result) => {
        if (err) throw err;
        for (let i = 0; i < result.length; i++) {
          pollNames.push({ pollName: result[i].pollName, id: result[i]._id });
        }
        res.send(
          JSON.stringify({
            success: true,
            polls: pollNames
          })
        );
        res.end();
      });

      database.close();
    });
  }
});

//query list of polls in db
app.get("/api/listpolls", (req, res) => {
  res.setHeader("Content-Type", "application/json");

  mongo.connect(dburl, (err, database) => {
    let docs = database.db("fccvotingapp").collection("polls");
    let pollNames = [];
    docs.find({}).toArray((err, result) => {
      if (err) throw err;
      for (let i = 0; i < result.length; i++) {
        pollNames.push({ pollName: result[i].pollName, id: result[i]._id });
      }
      res.send(
        JSON.stringify({
          success: true,
          polls: pollNames
        })
      );
      res.end();
    });

    database.close();
  });
});

//return questions and votes by id, unauthenticated
//usage: /api/listquestions?questionid=${id}
app.get("/api/listquestions", (req, res) => {
  res.setHeader("Content-Type", "application/json");

  mongo.connect(dburl, (err, database) => {
    let docs = database.db("fccvotingapp").collection("polls");
    docs.findOne({ _id: new ObjectId(req.query.questionid) }, function(
      err,
      doc
    ) {
      if (err) throw err;
      res.send(
        JSON.stringify({
          pollQuestions: doc.pollQuestions,
          pollVotes: doc.pollVotes
        })
      );
      res.end();
    });

    database.close();
  });
});

//add poll to db, must be authenticated
//usage: /api/addpoll?pollName=${pollname}
app.post("/api/addpoll", (req, res) => {
  if (!req.isAuthenticated()) {
    res.send(
      JSON.stringify({
        success: false,
        message: "You need to be authenticated to add a poll!"
      })
    );
  } else {
    docToAdd = {
      pollName: req.query.pollName,
      pollQuestions: [],
      pollVotes: [],
      userID: req.user.someID
    };
    mongo.connect(dburl, (err, database) => {
      let docs = database.db("fccvotingapp").collection("polls");
      docs.insert(docToAdd, (err, data) => {
        if (err) throw err;
      });
      res.send(
        JSON.stringify({
          success: true,
          docAdded: docToAdd
        })
      );
      database.close();
    });
  }
});

//add question to poll, doesn't need to be authenticated
//usage: /api/addpoll?pollid=${pollname}&question=${question}
app.post("/api/addquestion", (req, res) => {
  mongo.connect(dburl, (err, database) => {
    let docs = database.db("fccvotingapp").collection("polls");

    docs.findOneAndUpdate(
      { _id: new ObjectId(req.query.pollid) },
      { $push: { pollQuestions: req.query.question, pollVotes: 0 } },
      (err, result) => {
        res.send(
          JSON.stringify({
            success: true
          })
        );
        database.close();
      }
    );
  });
});

//vote on a question, doesn't need to be authenticated
//usage: /api/addvote?pollid=${pollname}&voteIndex=${vi}
app.post("/api/addvote", (req, res) => {
  mongo.connect(dburl, (err, database) => {
    let docs = database.db("fccvotingapp").collection("polls");

    //use a left side variable in mongodb $inc below
    var variable = `pollVotes.${req.query.voteIndex}`;
    var action = {};
    action[variable] = 1;

    docs.findOneAndUpdate(
      { _id: new ObjectId(req.query.pollid) },
      { $inc: action },
      (err, result) => {
        res.send(
          JSON.stringify({
            success: true
          })
        );
        database.close();
      }
    );
  });
});

// All remaining requests return the React app, so it can handle routing.
app.get("*", function(request, response) {
  response.sendFile(path.resolve(__dirname, "../client/build", "index.html"));
});

app.listen(port, () => console.log(`Listening on port ${port}`));
