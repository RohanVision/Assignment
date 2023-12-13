const userModel = require("../models/user.model");

module.exports = async (req, res, next) => {
  if (req.session.userId) {
    return next();
  }

  const user = await userModel.findById(req.session.userId);

  if (user && user.user_type === 'Examiner') {
    return next();
  }

  return res.redirect('/Login');
};
