// authMiddleware.js

///checks whether any user is logged in or not
const authMiddleware = (req, res, next) => {
    if (!req.session.userType) {
      return res.redirect('/'); 
    }
    next();
  };
  
  module.exports = authMiddleware;
  