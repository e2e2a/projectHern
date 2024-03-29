const User = require('../models/user');
const UserEdit = require('../models/userEdit');
const SITE_TITLE = 'Deceased profiling management system with email notification';
var bcrypt = require("bcrypt");
const UserToken = require('../models/userToken');
//token
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { customAlphabet } = require('nanoid');
const sixDigitCode = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);

module.exports.index = async (req, res) => {
    if (req.session.login) {
        const user = await User.findById(req.session.login);
        const userLogin = await User.findById(req.session.login);
        res.render('edit_profile', {
            site_title: SITE_TITLE,
            title: 'Profile',
            messages: req.flash(),
            login: req.session.login,
            user: user,
            userLogin: userLogin,
        })
    } else {
        return res.redirect('/login')
    }

}
module.exports.doEdit = async (req, res) => {
    const userId = req.session.login;
    const user = await User.findById(userId);
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    if (user) {
        if (user.email === req.body.email) {
            console.log(req.body.email)
            // let relativesInputed;
            const capitalizeFirstLetter = (str) => {
                if (str) {
                    return str.replace(/\b\w/g, (char) => char.toUpperCase());
                } else {
                    return '';
                }
            };
            // if (Array.isArray(req.body.relativeName)) {
            //     relativesInputed = req.body.relativeName.map((name, index) => ({
            //         relativeName: capitalizeFirstLetter(name),
            //         relativeEmail: req.body.relativeEmail[index]
            //     }));
            // } else {
            //     const capitalizedRelativeName = capitalizeFirstLetter(req.body.relativeName);
            //     relativesInputed = [{
            //         relativeName: capitalizedRelativeName,
            //         relativeEmail: req.body.relativeEmail
            //     }];
            // }
            const capitalizedFullname = capitalizeFirstLetter(req.body.fullname);
            // const allRelatives = relativesInputed.map(relative => ({
            //     relativeName: relative.relativeName,
            //     relativeEmail: relative.relativeEmail
            // }));
            // console.log('Relatives:', allRelatives);
            // const noRelativesInputed = allRelatives.some(relative => relative.relativeName === undefined || relative.relativeEmail === undefined);
            // if (noRelativesInputed) {
            //     console.log('No Relatives Inputed');
            //     req.flash('message', 'Please Provide Atleast 1 Relative.');
            //     return res.redirect('/edit');
            // }
            if (!password && !confirmPassword) {
                const updateUser = {
                    fullname: capitalizedFullname,
                    email: req.body.email,
                    contact: req.body.contact,
                    address: req.body.address,
                    // relatives: allRelatives,
                    isVerified: true,
                };
                const updatedUser = await User.findByIdAndUpdate(userId, updateUser, {
                    new: true
                });
                if (updatedUser) {
                    console.log('Success');
                    req.flash('message', 'Profile Updated!');
                    return res.redirect('/edit');
                } else {
                    console.log('Update failed');
                    req.flash('message', 'Profile Update Failed!');
                    return res.redirect('/edit');
                }
            } else {
                if (password !== confirmPassword) {
                    req.flash('message', 'Password does not match.');
                    return res.redirect('/edit');
                }

                bcrypt.hash(password, 10, async (error, hash) => {
                    if (error) {
                        console.error("Error hashing password:", error);
                        req.flash('message', 'An error occurred. Please try again.');
                        return res.redirect('/edit');
                    }

                    const updateUser = {
                        fullname: capitalizedFullname,
                        email: req.body.email,
                        contact: req.body.contact,
                        address: req.body.address,
                        // relatives: allRelatives,
                        password: hash, 
                        isVerified: true,
                    };

                    try {
                        const updatedUser = await User.findByIdAndUpdate(userId, updateUser, { new: true });
                        if (updatedUser) {
                            console.log('Success');
                            req.flash('message', 'Profile Updated!');
                            return res.redirect('/edit');
                        } else {
                            console.log('Update failed');
                            req.flash('message', 'Profile Update Failed!');
                            return res.redirect('/edit');
                        }
                    } catch (error) {
                        console.error("Error updating user:", error);
                        req.flash('message', 'An error occurred. Please try again.');
                        return res.status(500).render('500');
                    }
                });

            }
        } else {
            //here
            const password = req.body.password;
            const confirmPassword = req.body.confirmPassword;
            console.log('else', req.body.email)
            const existingUser = await User.findOne({ email: req.body.email });
            if(existingUser){
            if (existingUser.isVerified === true) {
                req.flash('message', 'Email Already Used!');
                return res.redirect('/edit');
            }
            }
            // let relativesInputed;
            const capitalizeFirstLetter = (str) => {
                if (str) {
                    return str.replace(/\b\w/g, (char) => char.toUpperCase());
                } else {
                    return ''; // Return an empty string if str is undefined
                }
            };
            // if (Array.isArray(req.body.relativeName)) {
            //     relativesInputed = req.body.relativeName.map((name, index) => ({
            //         relativeName: capitalizeFirstLetter(name),
            //         relativeEmail: req.body.relativeEmail[index]
            //     }));
            // } else {
            //     const capitalizedRelativeName = capitalizeFirstLetter(req.body.relativeName);
            //     relativesInputed = [{
            //         relativeName: capitalizedRelativeName,
            //         relativeEmail: req.body.relativeEmail
            //     }];
            // }
            const capitalizedFullname = capitalizeFirstLetter(req.body.fullname);
            // const allRelatives = relativesInputed.map(relative => ({
            //     relativeName: relative.relativeName,
            //     relativeEmail: relative.relativeEmail
            // }));
            // // console.log('Relatives:', allRelatives);
            // const noRelativesInputed = allRelatives.some(relative => relative.relativeName === undefined || relative.relativeEmail === undefined);
            // if (noRelativesInputed) {
            //     console.log('No Relatives Inputed');
            //     req.flash('message', 'Please Provide Atleast 1 Relative.')
            //     return res.redirect('/edit');
            // }
            const userEdit = await UserEdit.findOne({ userId: req.session.login })
            if (userEdit) {
                const userId = req.session.login
                if (password !== confirmPassword) {
                    req.flash('message', 'Password does not match.');
                    return res.redirect('/edit');
                }
                // Hash the password
                bcrypt.hash(password, 10, async (error, hash) => {
                    if (error) {
                        console.error("Error hashing password:", error);
                        req.flash('message', 'An error occurred. Please try again.');
                        return res.redirect('/edit');
                    }
                    const updateUser = {
                        userId: req.session.login,
                        fullname: capitalizedFullname,
                        email: req.body.email,
                        contact: req.body.contact,
                        address: req.body.address,
                        // relatives: allRelatives,
                        password: hash,
                        isVerified: true,
                    };
                    const updatedUser = await UserEdit.findOneAndUpdate({ userId: req.session.login }, updateUser, { new: true });
                    const registrationToken = jwt.sign({ userId: updatedUser._id }, 'Reymond_Godoy_Secret7777', { expiresIn: '1d' });
                    const verificationCode = sixDigitCode();
                    const userToken = new UserToken({
                        userId: updatedUser._id,
                        token: registrationToken,
                        verificationCode: verificationCode,
                        expirationDate: new Date(new Date().getTime() + 24 * 5 * 60 * 1000),
                        expirationCodeDate: new Date(new Date().getTime() + 5 * 60 * 1000), // 5 mins expiration
                    });
                    await userToken.save();
                    const transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: 'emonawong22@gmail.com',
                            pass: 'nouv heik zbln qkhf',
                        },
                    });
                    const sendEmail = async (from, to, subject, htmlContent) => {
                        try {
                            const mailOptions = {
                                from,
                                to,
                                subject,
                                html: htmlContent,  // Set the HTML content
                            };
                            const info = await transporter.sendMail(mailOptions);
                            console.log('Email sent:', info.response);
                        } catch (error) {
                            console.error('Error sending email:', error);
                            throw new Error('Failed to send email');
                        }
                    };
                    // link
                    const verificationLink = `http://polanco-registrar.onrender.com/verifyEdit?token=${registrationToken}`;
                    const emailContent = `
                    <div style="font-family: Arial, sans-serif; padding: 10px;">
                    <h2 style="color: #000;">Hello ${user.fullname},</h2>
                    <p style="color: #000;">Were happy you signed up for our website. To start exploring our website, please confirm your email address.</p>
                </div>
                <div style="background-color: #f2f2f2; padding: 10px; width: 60%; text-align: justify;">
                    <h3 style="color: #000;"><a href="http://polanco-registrar.onrender.com">polanco-registrar.onrender.com</a></h3>
                    <p style="color: #000;">Your verification code is: <strong>${verificationCode}</strong></p>
                    <br/>
                    <p style="color: #000;">Requiring users to go through account confirmation helps reduce the number of unverified spam accounts. It also makes it easier for your marketing team to communicate with users or clients.</p>
                    <br/>
                    <p style="color: #000;">Furthermore, verification is helpful for users themselves because it reduces the risk of them creating an account using an incorrect or old email address they no longer have access.</p>
                    <br/>
                    <p style="color: #000;">When it comes to managing a customer portal, you also need to make sure that all accounts used to access it are valid and are owned by your customers or users.</p>
                    <br/>
                </div>
                        `;
                    sendEmail(
                        'polanco-registrar.onrender.com <hernanirefugio@gmail.com>',
                        updatedUser.email,
                        'Verify your new email',
                        emailContent
                    );
                    console.log('Verification email sent. Please verify your email to complete registration.');
                    return res.redirect(`/verifyEdit?token=${registrationToken}&sendcode=true`,);
                });
            } else {
                if (password !== confirmPassword) {
                    req.flash('message', 'Password does not match.');
                    return res.redirect('/edit');
                }
                // Hash the password
                bcrypt.hash(password, 10, async (error, hash) => {
                    if (error) {
                        console.error("Error hashing password:", error);
                        req.flash('message', 'An error occurred. Please try again.');
                        return res.redirect('/edit');
                    }
                    const updateUser = new UserEdit({
                        userId: req.session.login,
                        fullname: capitalizedFullname,
                        email: req.body.email,
                        contact: req.body.contact,
                        address: req.body.address,
                        // relatives: allRelatives,
                        password: hash,
                        isVerified: true,
                    });
                    const updatedUser = await updateUser.save();
                    const registrationToken = jwt.sign({ userId: updatedUser._id }, 'Reymond_Godoy_Secret7777', { expiresIn: '1d' });
                    const verificationCode = sixDigitCode();
                    const userToken = new UserToken({
                        userId: updatedUser._id,
                        token: registrationToken,
                        verificationCode: verificationCode,
                        expirationDate: new Date(new Date().getTime() + 24 * 5 * 60 * 1000),
                        expirationCodeDate: new Date(new Date().getTime() + 5 * 60 * 1000), // 5 mins expiration
                    });
                    await userToken.save();
                    const transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: 'emonawong22@gmail.com',
                            pass: 'nouv heik zbln qkhf',
                        },
                    });
                    const sendEmail = async (from, to, subject, htmlContent) => {
                        try {
                            const mailOptions = {
                                from,
                                to,
                                subject,
                                html: htmlContent,  // Set the HTML content
                            };
                            const info = await transporter.sendMail(mailOptions);
                            console.log('Email sent:', info.response);
                        } catch (error) {
                            console.error('Error sending email:', error);
                            throw new Error('Failed to send email');
                        }
                    };
                    // link
                    const verificationLink = `http://polanco-registrar.onrender.com/verifyEdit?token=${registrationToken}`;
                    const emailContent = `
                    <div style="font-family: Arial, sans-serif; padding: 10px;">
                    <h2 style="color: #000;">Hello ${user.fullname},</h2>
                    <p style="color: #000;">Were happy you signed up for our website. To start exploring our website, please confirm your email address.</p>
                </div>
                <div style="background-color: #f2f2f2; padding: 10px; width: 60%; text-align: justify;">
                    <h3 style="color: #000;"><a href="http://polanco-registrar.onrender.com">polanco-registrar.onrender.com</a></h3>
                    <p style="color: #000;">Your verification code is: <strong>${verificationCode}</strong></p>
                    <br/>
                    <p style="color: #000;">Requiring users to go through account confirmation helps reduce the number of unverified spam accounts. It also makes it easier for your marketing team to communicate with users or clients.</p>
                    <br/>
                    <p style="color: #000;">Furthermore, verification is helpful for users themselves because it reduces the risk of them creating an account using an incorrect or old email address they no longer have access.</p>
                    <br/>
                    <p style="color: #000;">When it comes to managing a customer portal, you also need to make sure that all accounts used to access it are valid and are owned by your customers or users.</p>
                    <br/>
                </div>
                        `;
                    sendEmail(
                        'polanco-registrar.onrender.com <hernanirefugio@gmail.com>',
                        updatedUser.email,
                        'Verify your new email',
                        emailContent
                    );
                    console.log('Verification email sent. Please verify your email to complete registration.');
                    return res.redirect(`/verifyEdit?token=${registrationToken}&sendcode=true`,);
                });
            }
        }
    }
}