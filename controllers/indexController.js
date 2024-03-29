const User = require('../models/user')
const SITE_TITLE = 'Deceased profiling management system with email notification';

module.exports.index = async (req,res) => {
    if(req.session.login){
        const userLogin = await User.findById(req.session.login);
        res.render('index', {
            title: 'Home',
            site_title: SITE_TITLE,
            login:req.session.login,
            userLogin: userLogin,
            messages: req.flash(),
        });
    } else{
        res.render('index', {
            title: 'Home',
            site_title: SITE_TITLE,
            login:req.session.login,
            messages: req.flash(),
        });
    }
}