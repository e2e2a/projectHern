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
    // const capitalizeFirstLetter = (str) => {
    //     return str.replace(/\b\w/g, (char) => char.toUpperCase());
    // };
    const capitalizeFirstLetter = (str) => {
        // Check if str is defined and not empty
        if (str && typeof str === 'string' && str.trim() !== '') {
            return str.replace(/\b\w/g, (char) => char.toUpperCase());
        } else {
            return ''; // Return an empty string if str is undefined, empty, or not a string
        }
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
        fatherName: req.body.fatherName,
        motherName: req.body.motherName,
        description: req.body.description,
        causeDeath: req.body.causeDeath,
        guardian: req.body.guardian,
        guardianEmail: req.body.guardianEmail,
        informantEmailBrgy: req.body.informantEmailBrgy,
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
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f2f2f2; width: 100%; border-radius: 10px; box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);">
        <p style="color: #333; margin-bottom: 10px;">Hello <strong style="font-weight:bold; font-size: 18px;">${deceased.guardian}</strong>,</p>
        <p style="color: #333; margin-bottom: 20px;">We regret to inform you that your relative <strong>${deceased.fullname}</strong>is now registered in civil registrar in Polanco Zamboang Del Norte and has been buried at <strong>${deceased.nameCemetery}</strong>.</p>
        <p style="color: #333; margin-bottom: 20px;">Please find more information about the deceased below:</p>
        <h3 style="color: #333; margin-bottom: 10px;">Description</h3>
        <p style="color: #333; text-align: justify; margin-bottom: 20px;">${deceased.description}</p>
        <a href="http://polanco-registrar.onrender.com/deceased" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">View More Details</a>
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
    // for (const user of users) {
    //     for (const relative of user.relatives) {
    //         if (relative.relativeName === deceased.fullname) {
    //             console.log(`Relative found for user ${user.fullname}:`, relative);

    //             const emailContent = `
    //                         <div style="font-family: Arial, sans-serif; padding: 20px;">
    //                             <h2 style="color: #000;">Hello ${user.fullname}</h2>
    //                             <p style="color: #000;">Your Relative <strong>${deceased.fullname}</strong> has been buried in the <strong>${deceased.nameCemetery}</strong></p>
    //                             <a href="http://polanco-registrar.onrender.com/deceased">Click here</a>
    //                         </div>
    //                         <div style="background-color: #f2f2f2; padding: 10px; width: 60%; text-align: justify;">
    //                             <h3 style="color: #000;">Description</h3>
    //                             <p style="color: #000;">${deceased.description}</p>
    //                         </div>
    //                         `;
    //             sendEmail(
    //                 'polanco-registrar.onrender.com <hernanirefugio@gmail.com>',
    //                 user.email,
    //                 'Notification',
    //                 emailContent
    //             );
    //             console.log('Email Notification in buried location send to the users with equal name to the deceased person.');
    //         }
    //     }
    // }
    const deceasedUpdated = await Deceased.findByIdAndUpdate(deceasedId, deceased, { new: true });
    if (deceasedUpdated) {
        req.flash('message', 'Updated Successfully!');
        return res.redirect('/admin');
    } else {
        req.flash('message', 'Failed to Update Successfully!');
        return res.redirect('/admin');
    }
}