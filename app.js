//jshint esversion:6

require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const findOrCreate = require("mongoose-findorcreate");
const request = require("request");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/attendanceDB", {
  useNewUrlParser: true
});
mongoose.set('useCreateIndex', true);

const userSchema = new mongoose.Schema({
  email: String,
  username: String,
  password: String,
  googleId: String,
  facebookId: String,
  firstName: String,
  lastName: String,
  preferredEmail: String,
  cellPhone: String,
  birthDate: String,
  schoolId: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/attendance"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
    User.findOrCreate({ googleId: profile.id }, function(err, user) {
      return cb(err, user);
    });
  }
));

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/attendance"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ facebookId: profile.id }, function(err, user) {
      return cb(err, user);
    });
  }
));

app.get("/", function(req, res) {
  res.render("home");
});

app.get("/auth/google",
  passport.authenticate("google", { scope: ["profile"] }));

app.get("/auth/google/attendance",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect attendance.
    res.redirect("/attendance");
  });

app.get("/auth/facebook",
  passport.authenticate("facebook"));

app.get("/auth/facebook/attendance",
  passport.authenticate("facebook", { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect attendance.
    res.redirect("/attendance");
  });

app.get("/register", function(req, res) {
  res.render("register");
});

app.get("/login", function(req, res) {
  res.render("login");
});

app.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/");
});

app.get("/attendance", function(req, res) {
  if (req.isAuthenticated()) {
    console.log(req.user._id);
    request("http://localhost:3001/users/" + req.user._id + "/meetingsAttended", function (error, response, body) {
      console.log('error: ', error); // Print the error if one occurred
      console.log('statusCode: ', response && response.statusCode); // Print the response status code if a response was received
      console.log('body: ', body); // Print the HTML for the attended meetings response.
      const attendedMeetings = JSON.parse(body);
      request("http://localhost:3001/users/" + req.user._id + "/meetingsHosted", function (error2, response2, body2) {
        console.log('error2: ', error2); // Print the error if one occurred
        console.log('statusCode2: ', response2 && response2.statusCode); // Print the response status code if a response was received
        console.log('body2: ', body2); // Print the HTML for the Google homepage.
        const hostedMeetings = JSON.parse(body2);

        res.render("attendance", {user: req.user, attendedMeetings: attendedMeetings, hostedMeetings: hostedMeetings});
      });
    });
  } else {
    res.redirect("/login");
  }
});

app.get("/meeting", function(req, res) {
  if (req.isAuthenticated()) {
    console.log();
    request("http://localhost:3001/meetings/" + req.query.id, function(error, response, body) {
      console.log('error: ', error); // Print the error if one occurred
      console.log('statusCode: ', response && response.statusCode); // Print the response status code if a response was received
      console.log('body: ', body); // Print the HTML for the attendees response.
      const meetingData = JSON.parse(body);
      // res.send(meetingData);
      res.render("meetingDetails", {meetingData: meetingData});
    });
  } else {
    res.redirect("/login");
  }
});

app.get("/profile", function(req, res) {
  if (req.isAuthenticated()) {
    res.render("profile", {user: req.user});
  } else {
    res.redirect("/login");
  }
});

app.get("/profile-edit", function(req, res) {
  if (req.isAuthenticated()) {
    res.render("profile-edit", {user: req.user});
  } else {
    res.redirect("/login");
  }
});

app.post("/hostMeeting", function(req, res) {
  console.log(req.user);
  const meetingData = {
    title: req.body.meetingDescription,
    host: req.user._id.toString() // this bug took me a long time to figure out!
  };
  console.log("This is my meetingData form I'm sending: " + meetingData);
  console.log(meetingData);
  console.log(mongoose.Types.ObjectId.isValid(meetingData.host));
  request.post(
    {
      url: "http://localhost:3001/meetings",
      form: meetingData
    },
    function (err, httpResponse, body) {
      console.log("Error: " + err);
      console.log();
      if (err) {
        res.json({ success: false, error: err });
      } else {
        res.json({ success: true, code: body });
      }
    }
  );
});

app.post("/attendMeeting", function(req, res) {
  const attendData = {
    code: req.body.meetingCode
  };
  request.post(
    {
      url: "http://localhost:3001/users/" + req.user._id + "/attendEvent",
      form: attendData
    },
    function(err, httpResponse, body) {
      if (err) {
        res.json({ success: false, error: err });
      } else {
        console.log(body);
        res.json(JSON.parse(body));
      }
    }
  );
});

app.post("/deleteAttendedMeeting", function(req, res) {
  console.log(req.body);
  const attendData = {
    meetingCode: req.body.meetingCode
  };
  request.delete(
    {
      url: "http://localhost:3001/users/" + req.user._id + "/attendEvent",
      form: attendData
    },
    function(err, httpResponse, body) {
      if (err) {
        res.json({ success: false, error: err });
      } else {
        console.log(body);
        res.redirect("/attendance");
      }
    }
  );
});

app.post("/deleteHostedMeeting", function(req, res) {
  console.log(req.body);
  request.delete(
    {
      url: "http://localhost:3001/meetings/" + req.body.meetingId,
    },
    function(err, httpResponse, body) {
      if (err) {
        res.json({ success: false, error: err });
      } else {
        console.log(body);
        res.redirect("/attendance");
      }
    }
  );
});

app.post("/saveProfile", function(req, res) {
  const profileData = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    preferredEmail: req.body.preferredEmail,
    cellPhone: req.body.cellPhone,
    birthDate: req.body.birthDate,
    schoolId: req.body.schoolId
  };
  console.log(req.body);
  console.log();
  console.log("Now profile data: ");
  console.log(profileData);
  request.patch(
    {
      url: "http://localhost:3001/users/" + req.user._id,
      form: profileData
    },
    function(err, httpResponse, body) {
      if (err) {
        res.json({ success: false, error: err });
      } else {
        console.log(body);
        res.redirect("/profile");
      }
    }
  );
});

app.post("/register", function(req, res) {
  User.register({username: req.body.username}, req.body.password, function(err, result) {
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function() {
        res.redirect("/attendance");
      });
    }
  });
});

app.post("/login", function(req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });
  console.log(user);
  req.login(user, function(err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function() {
        res.redirect("/attendance");
      });
    }
  });
});

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.post("/attendedMeetings", function(req, res) {

})

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function() {
  console.log("Server started");
});
