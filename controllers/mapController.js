const User = require('../models/user')
const SITE_TITLE = 'Deceased profiling management system with email notification';

module.exports.index = async (req, res) => {
    if (req.session.login) {
        const userLogin = await User.findById(req.session.login);
        const map = req.params.map;
        if (!map) {
            req.flash('message', 'Please ensure you clicked the link provided.')
            return res.redirect('/deceased');
        }
        res.render('map', {
            title: 'Map',
            site_title: SITE_TITLE,
            login: req.session.login,
            userLogin: userLogin,
            messages: req.flash(),
            map: map,
        });
    } else {
        return res.redirect('/login');
    }
}