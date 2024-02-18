const User = require('../models/user')
const Deceased = require('../models/deceased')
const SITE_TITLE = 'Deceased profiling management system with email notification';

module.exports.index = async (req,res) => {
    const deceaseds = await Deceased.find();
    res.render('deceased', {
        title: 'Deceased',
        site_title: SITE_TITLE,
        login: req.session.login,
        messages: req.flash(),
        deceaseds: deceaseds,
    });
}