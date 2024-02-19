const SITE_TITLE = 'CAR';
const User = require('../models/user');
const UserToken = require('../models/userToken');
//token
const jwt = require('jsonwebtoken');
//sender mailer
const nodemailer = require('nodemailer');
const { customAlphabet } = require('nanoid');
const sixDigitCode = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);

module.exports.verify = async (req, res) => {
    try {
        const verificationToken = req.query.token;
        const sendcode = req.query.sendcode === 'true';
        if (!verificationToken) {
            const userLogin = await User.findById(req.session.login)
            return res.status(404).render('404', {
                login: req.session.login,
                userLogin: userLogin,
            });
        }
        // Checking
        const userToken = await UserToken.findOne({ token: verificationToken });
        // Checking 
        if (!userToken) {
            const userLogin = await User.findById(req.session.login)
            return res.status(404).render('404', {
                login: req.session.login,
                userLogin: userLogin,
            });
        }
        const expirationCodeDate = userToken.expirationCodeDate;
        const remainingTimeInSeconds = Math.floor((expirationCodeDate - new Date().getTime()) / 1000);
        if (!userToken || userToken.expirationDate < new Date()) {
            const userLogin = await User.findById(req.session.login)
            return res.status(404).render('404', {
                login: req.session.login,
                userLogin: userLogin,
            });
        }
        const user = await User.findById({ _id: userToken.userId });
        res.render('verify', {
            site_title: SITE_TITLE,
            title: 'Verify',
            session: req.session,
            currentUrl: req.originalUrl,
            adjustedExpirationTimestamp: remainingTimeInSeconds,
            userToken: userToken,
            sendcode: sendcode,
            user: user,
            messages: req.flash(),
        });
    } catch (error) {
        console.error('Error rendering verification input form:', error);
        return res.status(500).render('500');
    }
};

module.exports.doVerify = async (req, res) => {
    var action = req.body.action;
    const verificationToken = req.body.token;
    if (action === 'submit') {
        try {
            const verificationCode = req.body.verificationCode;
            const decodedToken = jwt.verify(verificationToken, 'Reymond_Godoy_Secret7777');
            // Checking
            const userToken = await UserToken.findOne({ userId: decodedToken.userId, token: verificationToken });
            if (userToken && userToken.expirationDate > new Date()) {
                if (verificationCode === userToken.verificationCode) {
                    if (userToken.expirationCodeDate > new Date()) {
                        const user = await User.findByIdAndUpdate(decodedToken.userId, { isVerified: true });
                        req.session.login = user._id;
                        await UserToken.findByIdAndDelete(userToken._id);
                        console.log('Email verification successful. Registration completed.');
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
                        const emailContent = `
                        <div style="font-family: Arial, sans-serif; padding: 10px;">
                            <h2 style="color: #000;">Hello ${user.fullname},</h2>
                            <p style="color: #000;">Were happy you signed up for our website. To start exploring our website, please confirm your email address.</p>
                        </div>
                        <div style="background-color: #f2f2f2; padding: 10px; width: 60%; text-align: justify;">
                            <h3 style="color: #000;"><a href="http://polonco-registrar.onrender.com">polonco-registrar.onrender.com</a></h3>
                            <p style="color: #000;">Your verification code is: <strong>${verificationCode}</strong></p>
                            <br/>
                            <p style="color: #000;">Requiring users to go through account confirmation helps reduce the number of unverified spam accounts. It also makes it easier for your marketing team to communicate with users or clients.</p>
                            <br/>
                            <p style="color: #000;">Furthermore, verification is helpful for users themselves because it reduces the risk of them creating an account using an incorrect or old email address they no longer have access.</p>
                            <br/>
                            <p style="color: #000;">When it comes to managing a customer portal, you also need to make sure that all accounts used to access it are valid and are owned by your customers or users.</p>
                            <br/>
                        </div>`;
                        sendEmail(
                            'polanco-registrar.onrender.com <hernanirefugio@gmail.com>',
                            user.email,
                            'Verify your email',
                            emailContent
                        );
                        res.redirect(`/`);
                    } else {
                        console.log('Code expired', userToken.expirationCodeDate)
                        req.flash('error', 'Code has been expired.');
                        res.redirect(`/verify?token=${verificationToken}`);
                    }
                } else {
                    console.log('Verification code does not match');
                    req.flash('error', 'The code does not match.');
                    res.redirect(`/verify?token=${verificationToken}`);
                }
            } else {
                console.log('Invalid or expired verification code.');
                const userLogin = await User.findById(req.session.login)
                return res.status(404).render('404', {
                    login: req.session.login,
                    userLogin: userLogin,
                });
            }
        } catch (error) {
            console.error('Verification failed:', error);
            return res.status(500).render('500');
        }
    } else if (action === 'resend') {
        try {
            const decodedToken = jwt.verify(verificationToken, 'Reymond_Godoy_Secret7777');
            const userToken = await UserToken.findOne({ userId: decodedToken.userId, token: verificationToken });
            const user = await User.findById({ _id: userToken.userId });
            if (userToken) {
                console.log(user._id);
                const verificationCode = sixDigitCode();
                if (verificationToken === userToken.token) {
                    const updateCode = {
                        verificationCode: verificationCode,
                        expirationCodeDate: new Date(new Date().getTime() + 5 * 60 * 1000),
                    };
                    const transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: 'emonawong22@gmail.com',
                            pass: 'nouv heik zbln qkhf',
                        },
                    });
                    // Function to send an email
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
                    const verificationLink = `http://polanco-registrar.onrender.com/verify?token=${verificationToken}`;
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
                    console.log('Code Resend Successfully!');
                    const updatedCode = await UserToken.findByIdAndUpdate(userToken._id, updateCode, {
                        new: true
                    });
                    if (updatedCode) {
                        console.log('code has been updated', updatedCode);
                        console.log(user);
                        res.redirect(`/verify?token=${verificationToken}&sendcode=true`);
                    } else {
                        console.log('Error updating code: Code not found or update unsuccessful');
                    }
                } else {
                    // Codes in req.body do not match
                    console.log('Verification codes do not match.');
                    const userLogin = await User.findById(req.session.login)
                    return res.status(404).render('404', {
                        login: req.session.login,
                        userLogin: userLogin,
                    });
                }
            }
        } catch (err) {
            console.log('no token', err);
        }
    } else if (action === 'cancel') {
        const decodedToken = jwt.verify(verificationToken, 'Reymond_Godoy_Secret7777');
        const userToken = await UserToken.findOne({ userId: decodedToken.userId, token: verificationToken });
        try {
            await User.findByIdAndDelete(decodedToken.userId);
            await UserToken.findByIdAndDelete(userToken._id);
            res.redirect('/register')
        } catch (error) {
            console.error('Deletion error:', error.message);
            return res.status(500).render('500');
        }
    } else {
        //this must be status 400 invalid action
        return res.status(500).render('500');
    }
};