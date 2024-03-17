const User = require('../../models/user')
const SITE_TITLE = 'Deceased profiling management system with email notification';
const bcrypt = require('bcrypt');
module.exports.index = async(req,res) => {
    try {
        const userLogin = await User.findById(req.session.login);
        if(userLogin){
            if(userLogin.role === 'admin'){
                res.render('admin/myprofile', {
                    site_title: SITE_TITLE,
                    title: 'Profile',
                    userLogin: userLogin,
                    messages: req.flash(),
                })
            }else{
                return res.status(400).render('404')
            }
        }else{
            return res.redirect('/login')
        }
    } catch (error) {
        
    }
}
module.exports.doUpdate = async (req,res) => {
    try {
        const password = req.body.password;
        const confirmPassword = req.body.confirmPassword;
        const existingUser = await User.findOne({ email: req.body.email, isVerified: true });
        if (existingUser) {
            req.flash('message', 'Email is already used.')
            return res.redirect('/myprofile')
        }
        if(password !== confirmPassword){
            req.flash('message', 'password does not match.')
            return res.redirect('/myprofile')
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const data = {
            fullname: req.body.fullname,
            email: req.body.email,
            password: hashedPassword,
        }
        const user = await User.findByIdAndUpdate(req.session.login ,data, {new:true});
        req.flash('message', 'Profile Updated.')
        return res.redirect('/myprofile');
    } catch (error) {
        console.log('error:', error)
        return res.status(500).render('500')
    }
    
}