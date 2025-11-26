const User = require("../models/user.js");

module.exports.renderSignupForm = (req, res) => {
  res.render("users/signup.ejs");
};

module.exports.userSignup = async (req, res, next) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);

    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Welcome to Wanderlust!");

      // Save session before redirect
      req.session.save((err) => {
        if (err) {
          return next(err);
        }
        res.redirect("/listings");
      });
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};

module.exports.renderLoginForm = (req, res) => {
  res.render("users/login.ejs");
};

module.exports.userLogin = async (req, res) => {
  req.flash("success", "Welcome back to Wanderlust!");

  // Get redirect URL
  let redirectUrl = res.locals.redirectUrl || "/listings";

  // Clean up session
  delete req.session.redirectUrl;

  // Don't redirect to login/signup pages
  if (redirectUrl.includes("/login") || redirectUrl.includes("/signup")) {
    redirectUrl = "/listings";
  }

  console.log("Redirecting to:", redirectUrl);

  // Save session before redirect
  req.session.save((err) => {
    if (err) {
      console.error("Session save error:", err);
    }
    res.redirect(redirectUrl);
  });
};

module.exports.userLogout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You have successfuly logged out!");

    // Save session before redirecting
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return next(err);
      }
      res.redirect("/listings");
    });
  });
};
