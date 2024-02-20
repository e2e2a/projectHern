const User = require('../models/user')
const SITE_TITLE = 'Deceased profiling management system with email notification';
module.exports.login =async (req, res) => {
    const userLogin = await User.findById(req.session.login);
    res.render('login', {
        site_title: SITE_TITLE,
        title: 'Login',
        session: req.session,
        messages: req.flash(),
        currentUrl: req.originalUrl,
        login: req.session.login,
        userLogin:userLogin,
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
            if(user.role === 'member'){
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
                        return res.redirect('/deceased');
                    });
                }else{
                    req.flash('error', 'Users not found.');
                    return res.redirect('/login');
                }
            } else{
                if(req.body.password === user.password){
                    req.session.login = user.id;
                    return res.redirect('/admin');
                }else {
                    req.flash('message', 'WARNING DETECTED!');
                    return res.redirect('/login')
                }
            }
            
        }
    } catch (error) {
        console.log('error:', error)
        return res.status(500).render('500');
    }
}

module.exports.logout = (req, res) => {
    const login = req.session.login;
    req.session.destroy((err) => {
        if (err) {
            console.error('error destroying session', err);
        } else {
            console.log('user logout', login)
            return res.redirect('/');
        }
    })
}