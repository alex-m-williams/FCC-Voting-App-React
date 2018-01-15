const express = require("express");

const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");
app.use(cors());

//https://github.com/passport/express-4.x-twitter-example/blob/master/server.js
var passport = require("passport");
var Strategy = require("passport-twitter").Strategy;

//MONGO setup
const dbUser = process.env.DBUSER;
const dbPW = process.env.DBPW;
const dburl = `mongodb://${dbUser}:${dbPW}@ds237967.mlab.com:37967/fccvotingapp`;
const mongo = require("mongodb").MongoClient;
var ObjectId = require("mongodb").ObjectId;

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
    saveUninitialized: false
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

//logout
app.get("/logout", function(req, res) {
  req.session.destroy(() => {
    req.logOut();

    res.redirect("/");
  });
});

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
    obj = { pollName: req.query.pollName, pollQuestions: [], pollVotes: [] };
    mongo.connect(dburl, (err, database) => {
      let docs = database.db("fccvotingapp").collection("polls");
      docs.insert(obj, (err, data) => {
        if (err) throw err;
      });
      res.send(
        JSON.stringify({
          success: true,
          docAdded: obj
        })
      );
      database.close();
    });
  }
});

//add question to poll, doesn't need to be authenticated
//usage: /api/addpoll?pollid=${pollname}&question=${question}
app.get("/api/addquestion", (req, res) => {
  mongo.connect(dburl, (err, database) => {
    let docs = database.db("fccvotingapp").collection("polls");

    docs.findOneAndUpdate(
      { _id: new ObjectId(req.query.pollid) },
      { $push: { pollQuestions: req.query.question } },
      (err, result) => {
        console.log(result);
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
//usage: /api/addvote?pollName=${pollname}&question=${question}
app.post("/api/addvote", (req, res) => {
  mongo.connect(dburl, (err, database) => {
    let docs = database.db("fccvotingapp").collection("polls");

    database.close();
  });
});

app.listen(port, () => console.log(`Listening on port ${port}`));
