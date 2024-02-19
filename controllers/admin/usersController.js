
const User = require('../../models/user')
const Deceased = require('../../models/deceased');
const SITE_TITLE = 'Deceased profiling management system with email notification';
const bcrypt = require('bcrypt');

module.exports.index = async (req, res) => {
    try {
        const userLogin = await User.findById(req.session.login);
        const users = await User.find({ role: 'member' });
        if (userLogin) {
            if (userLogin.role === 'admin') {
                res.render('admin/usertable', {
                    site_title: SITE_TITLE,
                    title: 'Users',
                    users: users,
                    userLogin: userLogin,
                });

            } else {
                return res.status(404).render('404', {
                    login: req.session.login,
                    userLogin: userLogin,
                });
            }
        } else {
            return res.redirect('/login')
        }
    } catch (error) {
        console.log('error:', error);
        return res.status(500).render('500');
    }
}

module.exports.Edit = async (req, res) => {
    try {
        const userLogin = await User.findById(req.session.login);
        if (userLogin) {
            if (userLogin.role === 'admin') {
                const userId = req.params.id;
                const user = await User.findById(userId)
                res.render('admin/editUser', {
                    site_title: SITE_TITLE,
                    title: 'Users',
                    user: user,
                    userLogin: userLogin,
                    messages: req.flash(),
                });

            } else {
                return res.status(404).render('404', {
                    login: req.session.login,
                    userLogin: userLogin,
                });
            }
        } else {
            return res.redirect('/login')
        }
    } catch (error) {
        console.log('error:', error);
        return res.status(500).render('500');
    }
}

module.exports.doEdit = async (req, res) => {
    try {
        const userId = req.params.id;
        console.log(userId)
        const password = req.body.password;
        const confirmPassword = req.body.confirmPassword;
        let relativesInputed;
        const capitalizeFirstLetter = (str) => {
            if (str) {
                return str.replace(/\b\w/g, (char) => char.toUpperCase());
            } else {
                return '';
            }
        };
        if (Array.isArray(req.body.relativeName)) {
            relativesInputed = req.body.relativeName.map((name, index) => ({
                relativeName: capitalizeFirstLetter(name),
                relativeEmail: req.body.relativeEmail[index]
            }));
        } else {
            const capitalizedRelativeName = capitalizeFirstLetter(req.body.relativeName);
            relativesInputed = [{
                relativeName: capitalizedRelativeName,
                relativeEmail: req.body.relativeEmail
            }];
        }
        const capitalizedFullname = capitalizeFirstLetter(req.body.fullname);
        const allRelatives = relativesInputed.map(relative => ({
            relativeName: relative.relativeName,
            relativeEmail: relative.relativeEmail
        }));
        // console.log('Relatives:', allRelatives);
        const noRelativesInputed = allRelatives.some(relative => relative.relativeName === undefined || relative.relativeEmail === undefined);
        if (noRelativesInputed) {
            console.log('No Relatives Inputed');
            req.flash('message', 'Please Provide Atleast 1 Relative.')
            return res.redirect('/users');
        }
        if (password !== confirmPassword) {
            req.flash('message', 'Password does not match.');
            return res.redirect('/users');
        }
        bcrypt.hash(password, 10, async (error, hash) => {
            if (error) {
                console.error("Error hashing password:", error);
                req.flash('message', 'An error occurred. Please try again.');
                return res.redirect('/users');
            }

            const updateUser = {
                fullname: capitalizedFullname,
                email: req.body.email,
                contact: req.body.contact,
                address: req.body.address,
                relatives: allRelatives,
                role: req.body.role,
                password: hash,
                isVerified: true,
            };
            try {
                const updatedUser = await User.findByIdAndUpdate(userId, updateUser, { new: true });
                if (updatedUser) {
                    console.log('Success');
                    req.flash('message', 'User Updated!');
                    return res.redirect('/users');
                } else {
                    console.log('Update failed');
                    req.flash('message', 'User Update Failed!');
                    return res.redirect('/users');
                }
            } catch (error) {
                console.error("Error updating user:", error);
                req.flash('message', 'An error occurred. Please try again.');
                return res.status(500).render('500');
            }
        });
    } catch (error) {
        console.log('error:', error)
    }
}

module.exports.create = async (req,res) => {
    try {
        const userLogin = await User.findById(req.session.login);
        if (userLogin) {
            if (userLogin.role === 'admin') {
                res.render('admin/createUser',{
                    site_title: SITE_TITLE,
                    title: 'Create',
                    userLogin: userLogin
                })
            } else {
                return res.status(404).render('404', {
                    login: req.session.login,
                    userLogin: userLogin,
                });
            }
        } else {
            return res.redirect('/login')
        }
    } catch (error) {
        console.log('error:', error);
        return res.status(500).render('500');
    }
}

module.exports.doCreate = async (req,res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const confirmPassword = req.body.confirmPassword;
        // Checking
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            if (existingUser.isVerified) {
                req.flash('message', 'Email Already Used!');
                return res.redirect('/users');
            } else {
                let relativesInputed;
                const capitalizeFirstLetter = (str) => {
                    return str.replace(/\b\w/g, (char) => char.toUpperCase());
                };
                if (Array.isArray(req.body.relativeName)) {
                    relativesInputed = req.body.relativeName.map((name, index) => ({
                        relativeName: capitalizeFirstLetter(name),
                        relativeEmail: req.body.relativeEmail[index]
                    }));
                } else {
                    const capitalizedRelativeName = capitalizeFirstLetter(req.body.relativeName);
                    relativesInputed = [{
                        relativeName: capitalizedRelativeName,
                        relativeEmail: req.body.relativeEmail
                    }];
                }
                const capitalizedFullname = capitalizeFirstLetter(req.body.fullname);
                const allRelatives = relativesInputed.map(relative => ({
                    relativeName: relative.relativeName,
                    relativeEmail: relative.relativeEmail
                }));
                console.log('Relatives:', allRelatives);
                const noRelativesInputed = allRelatives.some(relative => relative.relativeName === undefined || relative.relativeEmail === undefined);
                if (noRelativesInputed) {
                    console.log('No Relatives Inputed');
                    req.flash('message', 'Please Provide Relative.')
                    return res.redirect('/users');
                }
                if (password !== confirmPassword) {
                    req.flash('message', 'Password does not match.');
                    return res.redirect('/users');
                }
                const user = new User({
                    fullname: capitalizedFullname,
                    email: req.body.email,
                    contact: req.body.contact,
                    address: req.body.address,
                    relatives: allRelatives,
                    password: req.body.password,
                    role: req.body.role,
                    isVerified: false,
                });
                await user.save();
                req.flash('message', 'User Created!');
                return res.redirect('/users');
            }
        } else{
            let relativesInputed;
                const capitalizeFirstLetter = (str) => {
                    return str.replace(/\b\w/g, (char) => char.toUpperCase());
                };
                if (Array.isArray(req.body.relativeName)) {
                    relativesInputed = req.body.relativeName.map((name, index) => ({
                        relativeName: capitalizeFirstLetter(name),
                        relativeEmail: req.body.relativeEmail[index]
                    }));
                } else {
                    const capitalizedRelativeName = capitalizeFirstLetter(req.body.relativeName);
                    relativesInputed = [{
                        relativeName: capitalizedRelativeName,
                        relativeEmail: req.body.relativeEmail
                    }];
                }
                const capitalizedFullname = capitalizeFirstLetter(req.body.fullname);
                const allRelatives = relativesInputed.map(relative => ({
                    relativeName: relative.relativeName,
                    relativeEmail: relative.relativeEmail
                }));
                console.log('Relatives:', allRelatives);
                const noRelativesInputed = allRelatives.some(relative => relative.relativeName === undefined || relative.relativeEmail === undefined);
                if (noRelativesInputed) {
                    console.log('No Relatives Inputed');
                    req.flash('message', 'Please Provide Relative.')
                    return res.redirect('/users');
                }
                if (password !== confirmPassword) {
                    req.flash('message', 'Password does not match.');
                    return res.redirect('/users');
                }
                const user = new User({
                    fullname: capitalizedFullname,
                    email: req.body.email,
                    contact: req.body.contact,
                    address: req.body.address,
                    relatives: allRelatives,
                    password: req.body.password,
                    role: req.body.role,
                    isVerified: false,
                });
                await user.save();
                req.flash('message', 'User Created!');
                return res.redirect('/users');
        }
    } catch (error) {
        console.log('error:', error)
        return res.status(500).render('500');
    }
}
module.exports.doDelete = async(req, res) => {
    try {
        const userId = req.body.userId;
        const user = await User.findByIdAndDelete(userId);
        if(user){
            req.flash('message', 'User Deleted!');
            return res.redirect('/users');
        } else{
            req.flash('message', 'User Failed To Deleted!');
            return res.redirect('/users');
        }
    } catch (error) {
        console.log('error:', error)
    }
}