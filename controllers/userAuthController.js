const User = require('../models/user')

module.exports.renderRegisterForm =(req, res) => {
    res.render('userAuth/register')
}

module.exports.registereUser = async (req, res, next) => {
    try{
     const {email,username,password} = req.body
     const user = new User({username,email})
     const registeredUser = await User.register(user, password)
     req.login(registeredUser, err => {
         if(err) return next(err);
     req.flash('success', 'Welcome to Yelp Camp')
     res.redirect('/campground')
     })
 
    } catch (e) {
     req.flash('error', e.message)
     res.redirect('register')
    }
 }

module.exports.renderLoginForm = (req, res) => {
    res.render('userAuth/login')
}

module.exports.loggedInUser =   (req, res) => {
    req.flash('success', 'welcome back!');
    const redirectUrl = req.session.returnTo || '/campground';  // redirect user back to where they were
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.logoutUser = (req, res, next) => {
    req.logout(function(err) {
      if (err) { return next(err); }
      req.flash('success', "Goodbye!");
      res.redirect('/campground');
    });
  }