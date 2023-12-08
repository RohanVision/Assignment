const userModel = require("../models/user.model");
const bcrypt = require('bcrypt');

module.exports = {
  signup: (req, res) => {
    const payload = req.body;

    const user = new userModel({
      username: payload.username,
      password: payload.password,
      user_type: payload.user_type,
    });

    user.save()
      .then(() => {
        return res.redirect('/Login')
      })
      .catch((err) => {
        console.log(err);
        return res.render('login', { error: 'Username already taken, please choose different username.' });
      });
  },
  login: (req, res) => {
    const payload = req.body;

    userModel.findOne({ username: payload.username })
      .then((user) => {
        if (!user) {
          return res.redirect('/Login')
        }

        // compare bycrypt password
        const hasSamePassword = bcrypt.compareSync(payload.password, user.password);

        if (!hasSamePassword) {
          return res.redirect('/Login')
        }

        req.session.userId = user._id.toString();
        req.session.user = user;
        return res.redirect('/Dashboard')
      })
      .catch((err) => {
        console.log(err);
      });
  },

  logout: (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.log(err);
      }

      return res.redirect('/Login');
    });
  },
};