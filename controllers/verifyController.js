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
            res.status(404).render('404', {
                site_title: SITE_TITLE,
                title: '404',
                session: req.session,
                currentUrl: req.originalUrl,
                err: 'We’re sorry, the page you have looked for does not exist in our website! Maybe go to our home page or check the link on the browser and try again.',
            });
            return;
        }
        // Checking
        const userToken = await UserToken.findOne({ token: verificationToken });
        // Checking 
        if (!userToken) {
            res.status(404).render('404', {
                site_title: SITE_TITLE,
                title: '404',
                session: req.session,
                currentUrl: req.originalUrl,
                err: 'We’re sorry, the page you have looked for does not exist in our website! Maybe go to our home page or check the link on the browser and try again.',
            });
            return;
        }
        const expirationCodeDate = userToken.expirationCodeDate;
        const remainingTimeInSeconds = Math.floor((expirationCodeDate - new Date().getTime()) / 1000);
        if (!userToken || userToken.expirationDate < new Date()) {
            res.status(404).render('404', {
                site_title: SITE_TITLE,
                title: '404',
                session: req.session,
                currentUrl: req.originalUrl,
                err: 'We’re sorry, the page you have looked for does not exist in our website! Maybe go to our home page or check the link on the browser and try again.',
            });
            return;
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
        res.status(500).render('500', {
            site_title: SITE_TITLE,
            title: 'Internal Server Error',
            session: req.session,
            currentUrl: req.originalUrl
        });
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
                        <div style="font-family: Arial, sans-serif; padding: 20px;">
                            <h1 style="color: #000;">Registration Success! </h1>
                            <p style="color: #000;">Enjoy to our newest website <strong>${user.fullname}</strong></p>
                        </div>`;
                        sendEmail(
                            'Swiftfixhub.com <emonawong22@gmail.com>',
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
                res.status(404).redirect('404', {
                    site_title: SITE_TITLE,
                    title: '404',
                    session: req.session,
                    currentUrl: req.originalUrl,
                    err: 'We’re sorry, the page you have looked for does not exist in our website! Maybe go to our home page or check the link on the browser and try again.',
                });
            }
        } catch (error) {
            console.error('Verification failed:', error);
            res.status(500).render('500', {
                site_title: SITE_TITLE,
                title: 'Internal Server Error',
                session: req.session,
                currentUrl: req.originalUrl
            });
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
                            res.status(500).render('500', {
                                site_title: SITE_TITLE,
                                title: 'Internal Server Error',
                                session: req.session,
                                currentUrl: req.originalUrl
                            });
                        }
                    };
                    // link
                    const verificationLink = `http://localhost:8080/verify?token=${verificationToken}`;
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
                        'Swiftfixhub.com <emonawong22@gmail.com>',
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
                    res.status(404).redirect('404', {
                        site_title: SITE_TITLE,
                        title: '404',
                        session: req.session,
                        currentUrl: req.originalUrl,
                        err: 'We’re sorry, the page you have looked for does not exist in our website! Maybe go to our home page or check the link on the browser and try again.',
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
            res.status(500).render('500', {
                site_title: SITE_TITLE,
                title: 'Internal Server Error',
                session: req.session,
                currentUrl: req.originalUrl
            });
        }
    } else {
        //this must be status 400 invalid action
        res.status(500).render('500', {
            site_title: SITE_TITLE,
            title: 'Internal Server Error',
            session: req.session,
            currentUrl: req.originalUrl
        });
    }
};