const User = require('../../models/user')
const Deceased = require('../../models/deceased');
const SITE_TITLE = 'Deceased profiling management system with email notification';

module.exports.index = async (req, res) => {
    try {
        const userLogin = await User.findById(req.session.login);
        if (userLogin) {
            if (userLogin.role === 'admin') {
                const deceaseds = await Deceased.find();
                res.render('admin/index', {
                    site_title: SITE_TITLE,
                    title: 'Dashboard',
                    deceaseds: deceaseds,
                    messages: req.flash(),
                })
            } else {
                return res.redirect('404');
            }
        } else {
            return res.redirect('/login')
        }
    } catch (error) {
        console.log('error:', error)
    }
}