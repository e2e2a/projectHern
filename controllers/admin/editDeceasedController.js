const User = require('../../models/user')
const Deceased = require('../../models/deceased');
const SITE_TITLE = 'Deceased profiling management system with email notification';
const nodemailer = require('nodemailer');
const moment = require('moment');
module.exports.index = async (req, res) => {
    try {

        const userLogin = await User.findById(req.session.login)
        if (!userLogin) {
            return res.redirect('/login')
        }
        if (userLogin.role === 'admin') {
            const deceasedId = req.params.id;
            const deceased = await Deceased.findById(deceasedId)
            res.render('admin/editDeceased', {
                site_title: SITE_TITLE,
                title: 'Edit',
                deceased: deceased,
                userLogin: userLogin,
                messages: req.flash(),
            });
        } else {
            return res.status(404).render('404', {
                login: req.session.login,
                userLogin: userLogin,
            });
        }
    } catch (err) {
        console.log('err:', err);
        return res.status(500).render('500');
    }
}

module.exports.doEdit = async (req, res) => {
    const deceasedId = req.params.id;
    const capitalizeFirstLetter = (str) => {
        return str.replace(/\b\w/g, (char) => char.toUpperCase());
    };
    const capitalizedFullname = capitalizeFirstLetter(req.body.fullname);
    function calculateAge(birthDate, deathDate) {
        const birthMoment = moment(birthDate, 'YYYY-MM-DD');
        const deathMoment = moment(deathDate, 'YYYY-MM-DD');
        const age = deathMoment.diff(birthMoment, 'years');
        return age.toString();
    }
    const deceased = {
        fullname: capitalizedFullname,
        deathDate: req.body.deathDate,
        placeDeath: req.body.placeDeath,
        birthDate: req.body.birthDate,
        placeBirth: req.body.placeBirth,
        ageDeath: calculateAge(req.body.birthDate, req.body.deathDate),
        gender: req.body.gender,
        occupation: req.body.occupation,
        civilStatus: req.body.civilStatus,
        religion: req.body.religion,
        citizenship: req.body.citizenship,
        description: req.body.description,
        causeDeath: req.body.causeDeath,
        guardian: req.body.guardian,
        guardianEmail: req.body.guardianEmail,
        nameCemetery: req.body.nameCemetery,
    };
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

    const emailContentToGuardian = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #000;">Hello ${deceased.guardian}</h2>
        <p style="color: #000;">Your Relative <strong>${deceased.fullname}</strong> has been buried in the <strong>${deceased.nameCemetery}</strong></p>
        <a href="http://polanco-registrar.onrender.com/deceased">Click here</a>
    </div>
    <div style="background-color: #f2f2f2; padding: 10px; width: 60%; text-align: justify;">
        <h3 style="color: #000;">Description</h3>
        <p style="color: #000;">${deceased.description}</p>
    </div>
    `;

    // Send email to guardian
    if (deceased.guardianEmail) {
        sendEmail(
            'polanco-registrar.onrender.com <hernanirefugio@gmail.com>',
            deceased.guardianEmail,
            'Notification: Deceased Registration',
            emailContentToGuardian
        );

        console.log('Email sent to guardian.');
    }
    const users = await User.find();
    for (const user of users) {
        for (const relative of user.relatives) {
            if (relative.relativeName === deceased.fullname) {
                console.log(`Relative found for user ${user.fullname}:`, relative);

                // link
                const emailContent = `
                            <div style="font-family: Arial, sans-serif; padding: 20px;">
                                <h2 style="color: #000;">Hello ${user.fullname}</h2>
                                <p style="color: #000;">Your Relative <strong>${deceased.fullname}</strong> has been buried in the <strong>${deceased.nameCemetery}</strong></p>
                                <a href="http://polanco-registrar.onrender.com/deceased">Click here</a>
                            </div>
                            <div style="background-color: #f2f2f2; padding: 10px; width: 60%; text-align: justify;">
                                <h3 style="color: #000;">Description</h3>
                                <p style="color: #000;">${deceased.description}</p>
                            </div>
                            `;
                sendEmail(
                    'polanco-registrar.onrender.com <hernanirefugio@gmail.com>',
                    user.email,
                    'Notification',
                    emailContent
                );
                console.log('Email Notification in buried location send to the users with equal name to the deceased person.');
            }
        }
    }
    const deceasedUpdated = await Deceased.findByIdAndUpdate(deceasedId, deceased, { new: true });
    if (deceasedUpdated) {
        req.flash('message', 'Updated Successfully!');
        return res.redirect('/admin');
    } else {
        req.flash('message', 'Failed to Update Successfully!');
        return res.redirect('/admin');
    }
}