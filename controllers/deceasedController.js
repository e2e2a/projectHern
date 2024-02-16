const User = require('../models/user')
const SITE_TITLE = 'Deceased profiling management system with email notification';

module.exports.index = async (req,res) => {
    res.render('deceased', {
        title: 'Deceased',
        site_title: SITE_TITLE,
        login: req.session.login,
        messages: req.flash(),
    });
}