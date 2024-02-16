const User = require('../models/user')
const SITE_TITLE = 'Deceased profiling management system with email notification';
module.exports.login = (req, res) => {
    res.render('login', {
        site_title: SITE_TITLE,
        title: 'Login',
        session: req.session,
        messages: req.flash(),
        currentUrl: req.originalUrl,
        login: req.session.login,
    });
}
module.exports.doLogin = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
             // 400 Bad Request
            req.flash('error', 'Invalid email.');
            return res.redirect('/login');
        }else {
            if(user.isVerified) {
                user.comparePassword(req.body.password, (error, valid) => {
                    if (error) {
                        return res.status(403).send('Forbidden'); // 403 Forbidden
                    }
                    if (!valid) {
                        // 400 Bad Request
                        req.flash('error', 'Invalid password.');
                        return res.redirect('/login');
                    }
                    req.session.login = user.id;
                    return res.redirect('/');
                });
            }else{
                req.flash('error', 'Users not found.');
                return res.redirect('/login');
            }
        }
    } catch (error) {
        return res.status(500).send(error.message); // 500 Internal Server Error
    }
}

module.exports.logout = (req, res) => {
    const userId = req.session.userId;
    req.session.destroy((err) => {
        if (err) {
            console.error('error destroying session', err);
        } else {
            console.log('user logout', userId)
            return res.redirect('/');
        }
    })
}