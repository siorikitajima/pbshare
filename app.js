require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser').json({limit: '50mb'});
const { render } = require('ejs');
const mongoose = require('mongoose');
const authController = require('./controllers/authController');
const shareController = require('./controllers/shareController');
const clientController = require('./controllers/clientController');
const passport = require('passport');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const User = require('./models/user');
const Item = require('./models/item');
const flash = require('express-flash');
const methodOverride = require('method-override');
const LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy(User.authenticate()));

const app = express();
const port = process.env.PORT || 3100;

var store = new MongoDBStore({
    uri: process.env.DB_URL,
    collection: 'mySessions'
  });

var sess = {
secret: process.env.SESSION_SECRET,
resave: false,
saveUninitialized: false,
store: store,
cookie:{
    secure: process.env.NODE_ENV == "production" ? true : false ,
    maxAge: 1000 * 60 * 60 * 24 * 7
}
}
app.use(session(sess));

mongoose.connect(process.env.DB_URL)
    .then(() => app.listen(port))
    .catch((err) => console.log(err));

app.set('trust proxy', 1);
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(bodyParser);

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get('/', authController.checkNotAuthenticated, (req, res) => {
  res.render('login', { title: 'Log In', nav: 'login' });
});

app.post('/login', 
passport.authenticate('local', {
  successRedirect: '/home',
  failureRedirect: '/',
  failureFlash: true
}));

app.get('/home', authController.checkAuthenticated, (req, res) => {
  if(req.user.type == 'client') { res.redirect('/downloads'); }
  else { res.redirect('/items') }
})

app.delete('/logout', authController.checkAuthenticated, authController.log_out);

app.get('/upload', authController.checkAuthenticated, shareController.upload_get);
app.post('/upload', authController.checkAuthenticated, shareController.upload_post);

app.get('/items', authController.checkAuthenticated, shareController.items_get);
app.post('/recipient', authController.checkAuthenticated, shareController.change_recipient);
app.get('/recipients', 
authController.checkAuthenticated,
shareController.recipients_get);
app.post('/recipients', 
authController.checkAuthenticated,
shareController.recipients_post);

app.post('/delete', authController.checkAuthenticated, shareController.delete_item);
app.post('/delete-user', authController.checkAuthenticated, shareController.delete_user);

app.get('/downloads', authController.checkAuthenticated, clientController.download_get)

app.use((req, res) => {
  res.status(404).render('404', { title: '404'});
})