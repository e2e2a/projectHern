const User = require('../models/user');
const SITE_TITLE = 'Deceased profiling management system with email notification';
const UserToken = require('../models/userToken');
//token
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { customAlphabet } = require('nanoid');
const sixDigitCode = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);
module.exports.index = async (req, res) => {
    res.render('register', {
        site_title: SITE_TITLE,
        title: 'Register',
        messages: req.flash(),
        login: req.session.login,
    });
}

module.exports.doRegister = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const confirmPassword = req.body.confirmPassword;
        // Checking
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            if (existingUser.isVerified) {
                req.flash('message', 'Email Already Used!');
                return res.redirect('/register');
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
                    return res.redirect('/register');
                }
                if (password !== confirmPassword) {
                    req.flash('message', 'Password does not match.');
                    return res.redirect('/register');
                }
                const user = new User({
                    fullname: capitalizedFullname,
                    email: req.body.email,
                    contact: req.body.contact,
                    address: req.body.address,
                    relatives: allRelatives,
                    password: req.body.password,
                    isVerified: false,
                });
                await user.save();
                const registrationToken = jwt.sign({ userId: user._id }, 'Reymond_Godoy_Secret7777', { expiresIn: '1d' });
                const verificationCode = sixDigitCode();
                const userToken = new UserToken({
                    userId: user._id,
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
                const verificationLink = `http://localhost:8080/verify?token=${registrationToken}`;
                const emailContent = `
                        <div style="font-family: Arial, sans-serif; padding: 20px;">
                            <h1 style="color: #000;">Hello ${user.fullname}</h1>
                            <p style="color: #000;">From: <strong>Reymond R. Godoy</strong></p>
                            <p style="color: #000;">Your verification code is: <strong>${verificationCode}</strong></p>
                            <p style="color: #000;">Click the link below to verify your email:</p>
                            <a href="${verificationLink}" style="text-decoration: none; display: inline-block; padding: 10px; background-color: #4CAF50; color: #fff; border-radius: 5px;">Verify Email</a>
                        </div>
                        `;
                sendEmail(
                    'domain.com <emonawong22@gmail.com>',
                    user.email,
                    'Verify your email',
                    emailContent
                );
                console.log('Verification email sent. Please verify your email to complete registration.');
                return res.redirect(`/verify?token=${registrationToken}&sendcode=true`,);


            }
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
                    return res.redirect('/register');
                }
                if (password !== confirmPassword) {
                    req.flash('message', 'Password does not match.');
                    return res.redirect('/register');
                }
                const user = new User({
                    fullname: capitalizedFullname,
                    email: req.body.email,
                    contact: req.body.contact,
                    address: req.body.address,
                    relatives: allRelatives,
                    password: req.body.password,
                    isVerified: false,
                });
                await user.save();
                const registrationToken = jwt.sign({ userId: user._id }, 'Reymond_Godoy_Secret7777', { expiresIn: '1d' });
                const verificationCode = sixDigitCode();
                const userToken = new UserToken({
                    userId: user._id,
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
                const verificationLink = `http://localhost:8080/verify?token=${registrationToken}`;
                const emailContent = `
                        <div style="font-family: Arial, sans-serif; padding: 20px;">
                            <h1 style="color: #000;">Hello ${user.fullname}</h1>
                            <p style="color: #000;">From: <strong>Reymond R. Godoy</strong></p>
                            <p style="color: #000;">Your verification code is: <strong>${verificationCode}</strong></p>
                            <p style="color: #000;">Click the link below to verify your email:</p>
                            <a href="${verificationLink}" style="text-decoration: none; display: inline-block; padding: 10px; background-color: #4CAF50; color: #fff; border-radius: 5px;">Verify Email</a>
                        </div>
                        `;
                sendEmail(
                    'domain.com <emonawong22@gmail.com>',
                    user.email,
                    'Verify your email',
                    emailContent
                );
                console.log('Verification email sent. Please verify your email to complete registration.');
                return res.redirect(`/verify?token=${registrationToken}&sendcode=true`,);
        }
    } catch (error) {
        console.error('Registration failed:', error);
    }
}