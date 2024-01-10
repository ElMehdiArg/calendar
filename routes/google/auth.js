const router = require('express-promise-router').default();
const { userInfo } = require('os');
const passport = require('passport');

router.get('/signin',
  passport.authenticate('google', { scope : ['profile', 'email','https://www.googleapis.com/auth/calendar.readonly'] }));


router.get('/callback', 
  passport.authenticate('google', { failureRedirect: '/error' }),
  async function(req, res) {
    // Successful authentication, redirect success.
    try{
      const authenticatedUser = req.user;

      // Save the user's Id in their session
      req.session.userId = authenticatedUser.id;

      // Add the user to user storage
      req.app.locals.users[req.session.userId] = {
         displayName: authenticatedUser.displayName,
         email: authenticatedUser.emails[0].value,
         avatar: authenticatedUser.photos[0].value,
         provider: authenticatedUser.provider
      };


    }catch(error) {
      req.flash('error_msg', {
        message: 'Error completing authentication',
        debug: JSON.stringify(error, Object.getOwnPropertyNames(error))
      });
    }
    res.redirect('/accueil')
  });


  router.get('/signout',
  async function(req, res) {

      req.logout();
      res.redirect('/');
  }
);

module.exports = router;