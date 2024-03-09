const User = require('../models/user');
const SITE_TITLE = 'Deceased profiling management system with email notification';
const UserToken = require('../models/userToken');
//token
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { customAlphabet } = require('nanoid');
const sixDigitCode = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);
module.exports.index = async (req, res) => {
    const userLogin = await User.findById(req.session.login);
    res.render('register', {
        site_title: SITE_TITLE,
        title: 'Register',
        messages: req.flash(),
        login: req.session.login,
        userLogin: userLogin,
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
                    role: 'member',
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
                        return res.status(500).render('500');
                    }
                };
                // link
                const verificationLink = `http://polanco-registrar.onrender.com/verify?token=${registrationToken}`;
                const emailContent = `
                    <div style="font-family: Arial, sans-serif; padding: 10px;">
                    <h2 style="color: #000;">Hello ${user.fullname},</h2>
                    <p style="color: #000;">Were happy you signed up for our website. To start exploring our website, please confirm your email address.</p>
                    </div>
                    <div style="background-color: #f2f2f2; padding: 10px; width: 60%; text-align: justify;">
                    <h3 style="color: #000;"><a href="http://polanco-registrar.onrender.com">polanco-registrar.onrender.com</a></h3>
                    <p style="color: #000;">Your verification code is: <strong style="text-align:center;">${verificationCode}</strong></p>
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
                role: 'member',
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
                        html: htmlContent, 
                    };
                    const info = await transporter.sendMail(mailOptions);
                    console.log('Email sent:', info.response);
                } catch (error) {
                    console.error('Error sending email:', error);
                    return res.status(500).render('500');
                }
            };
            // link
            const verificationLink = `http://polanco-registrar.onrender.com/verify?token=${registrationToken}`;
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
                user.email,
                'Verify your email',
                emailContent
            );
            console.log('Verification email sent. Please verify your email to complete registration.');
            return res.redirect(`/verify?token=${registrationToken}&sendcode=true`,);
        }
    } catch (error) {
        console.error('Registration failed:', error);
        return res.status(500).render('500');
    }
}