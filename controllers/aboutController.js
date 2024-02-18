const User = require('../models/user')
const SITE_TITLE = 'Deceased profiling management system with email notification';

module.exports.index = async (req,res) => {
    const userLogin = await User.findById(req.session.login)
    res.render('about', {
        title: 'About',
        site_title: SITE_TITLE,
        login: req.session.login,
        messages: req.flash(),
        userLogin:userLogin,
    })
}