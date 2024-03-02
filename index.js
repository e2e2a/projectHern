require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoDBSessionStore = require('connect-mongodb-session')(session);
const bodyparser = require('body-parser');
var path = require('path');
const dbConnect = require('./database/dbConnect');
const flash = require('express-flash');
const User = require('./models/user')
// const startServer = require('./database/UserCreated');
const cronStart = require('./controllers/admin/warningController');

const app = express();
const conn = dbConnect();
const store = new MongoDBSessionStore({
    uri: process.env.MONGODB_CONNECT_URI,
    collection: 'sessions'
});
app.use(session({
    secret: 'sessionsecret777', 
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
      },
    resave: false,
    saveUninitialized: true,
    store: store,
}));
app.use(bodyparser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use('/public/admin', express.static(path.join(__dirname, 'public/admin')));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, '/views'));
app.use(flash());
app.use(function (req, res, next) {
    req.db = conn;
    next();
});

require('./routes/web')(app);
app.use((req, res, next) => {
    if (!req.session.login) {
        return res.redirect('/login');
    }
    next();
});

app.use(async (req, res, next) => {
    const userLogin = await User.findById(req.session.login)
                return res.status(404).render('404',{
                    login: req.session.login,
                    userLogin: userLogin,
                });
});

const PORT = process.env.PORT
app.listen(PORT, async () => {
    console.log("Server is running at port", PORT);
    // await startServer(); // Call startServer here
    try {
        await cronStart();
        console.log("Cron job started successfully.");
    } catch (error) {
        console.error("Error starting cron job:", error);
    }
});