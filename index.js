const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const userController = require("./controller/user.controller");
const authController = require('./controller/auth.controller');
const appointmentController = require('./controller/appointment.controller');

const app = express();

const PORT = 5001;

app.use(express.static('public'));
// Set the default templating engine to ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }));

// connect to db
mongoose.connect('mongodb+srv://kaushal:atkVjy8egIxrRmc9@cluster0.dfvtatp.mongodb.net/Car_Insurance', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  keepAlive: true,
  keepAliveInitialDelay: 300000,
})
  .then(() => {
    console.log('Connected to database');
  })
  .catch((err) => {
    console.log(err);
  });

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
})

// configure express-session
const session = require('express-session');
const authMiddleware = require('./middleware/auth.middleware');
const adminMiddleware = require('./middleware/admin.middleware');

app.use(session({
  secret: 'this is a secret!',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },
}));

app.use(function (req, res, next) {
  res.locals.isLoggedIn = req.session.userId || false;
  res.locals.user = req.session.user;
  next();
});

// routes
app.get('/', (req, res) => res.render('dashboard'));
app.get('/Dashboard', (req, res) => res.render('dashboard'));
app.get('/Login', (req, res) => res.render('login'));
app.get('/G_page', authMiddleware, userController.renderGPage);
app.get('/G2_page', authMiddleware, userController.renderG2Page);

app.post('/G_page', authMiddleware, userController.get);
app.post('/G2_page', authMiddleware, userController.store);
app.post('/update-g2_page', authMiddleware, userController.update);

app.post('/signup', authController.signup);
app.post('/login', authController.login);
app.get('/logout', authController.logout);

app.get('/appointment', authMiddleware, adminMiddleware, appointmentController.renderAppointments);
app.post('/appointment', authMiddleware, adminMiddleware, appointmentController.store);
app.get('/appointment/slots', appointmentController.getSlots);