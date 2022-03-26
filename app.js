const express = require("express");
const ejs = require("ejs");
require("dotenv").config();
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true });

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.set("view engine", "ejs");

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function (req, res) {
  res.render("index");
});

app.get("/features", function (req, res) {
  res.render("features");
});

// Login

app.get("/login", function (req, res) {
  res.render("login");
});

app.post("/login", (req, res, next) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });
  passport.authenticate("local", function (err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.render("login");
    }
    req.logIn(user, function (err) {
      if (err) {
        return next(err);
      }
      return res.redirect("/note");
    });
  })(req, res, next);
});

// Signup

app.get("/signup", function (req, res) {
  res.render("signup");
});

app.post("/signup", (req, res) => {
  User.register(
    {
      username: req.body.username,
      email: req.body.email,
    },
    req.body.password,
    (err, user) => {
      if (err) {
        console.log(err);
        res.render("signup");
      } else {
        passport.authenticate("local")(req, res, () => {
          res.redirect("/note");
        });
      }
    }
  );
});

// New note

app.get("/note", (req, res) => {
  // if (req.isAuthenticated()) {
  //   res.render("newnote");
  // } else {
  //   res.render("login");
  // }
  res.render("newnote");
});

// Logout

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
