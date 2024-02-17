require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bodyparser = require('body-parser');
var path = require('path');
const dbConnect = require('./database/dbConnect');
const flash = require('express-flash');
// const User = require('./models/user')
// const startServer = require('./database/UserCreated');

const app = express();
const conn = dbConnect();

app.use(session({
    secret: 'sessionsecret777', resave: false,
    saveUninitialized: true,
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
// app.use((req, res, next) => {
//     if (!req.session.login) {
//         return res.redirect('/login');
//     }
//     next();
// });

// app.use((req, res, next) => {
//     res.status(404).render('404');
// });
const PORT = process.env.PORT
app.listen(PORT, async () => {
    console.log("Server is running at port", PORT);
    // await startServer(); // Call startServer here
});