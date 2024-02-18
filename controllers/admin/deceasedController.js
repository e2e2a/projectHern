const fs = require('fs').promises;
const path = require('path');
const puppeteer = require('puppeteer');
const puppeteerConfig = require('../../puppeteer.config.cjs');
const ejs = require('ejs');
const User = require('../../models/user')
const Deceased = require('../../models/deceased');
const SITE_TITLE = 'Deceased profiling management system with email notification';
const nodemailer = require('nodemailer');

module.exports.create = async (req, res) => {
    try {
        const capitalizeFirstLetter = (str) => {
            return str.replace(/\b\w/g, (char) => char.toUpperCase());
        };
        const capitalizedFullname = capitalizeFirstLetter(req.body.fullname);
        console.log(capitalizedFullname)
        const deceased = new Deceased({
            fullname: capitalizedFullname,
            deathDate: req.body.deathDate,
            placeDeath: req.body.placeDeath,
            birthDate: req.body.birthDate,
            placeBirth: req.body.placeBirth,
            ageDeath: req.body.ageDeath,
            gender: req.body.gender,
            occupation: req.body.occupation,
            civilStatus: req.body.civilStatus,
            religion: req.body.religion,
            citizenship: req.body.citizenship,
            description: req.body.description,
            causeDeath: req.body.causeDeath,
            nameCemetery: req.body.nameCemetery,
        });

        const users = await User.find();
        for (const user of users) {
            for (const relative of user.relatives) {
                if (relative.relativeName === deceased.fullname) {
                    console.log(`Relative found for user ${user.fullname}:`, relative);
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
                    const emailContent = `
                            <div style="font-family: Arial, sans-serif; padding: 20px;">
                                <h1 style="color: #000;">Hello ${user.fullname}</h1>
                                <p style="color: #000;">From: <strong>Reymond R. Godoy</strong></p>
                                <p style="color: #000;">Your Relative <strong>${deceased.fullname}</strong> has been buried in the <strong>${deceased.nameCemetery}</strong></p>
                                <a href="/deceased" >Click here</a>
                            </div>
                            `;
                    sendEmail(
                        'domain.com <emonawong22@gmail.com>',
                        user.email,
                        'Verify your email',
                        emailContent
                    );
                    console.log('Email Notification in buried location send to the users with equal name to the deceased person.');
                }
            }
        }

        // console.log('Deceased created:', deceased);
        await deceased.save();
        req.flash('message', 'Registered Deceased Person Successful!')
        return res.redirect('/register-deceased');
    } catch (error) {
        console.error('Error creating deceased:', error);
        // Handle error appropriately
        res.status(500).send('An error occurred while creating deceased');
    }
};

module.exports.actions = async (req, res) => {
    const actions = req.body.actions;
    const deceased = await Deceased.findById(req.body.deceasedId);
    if (actions === 'delete') {
        const deleteDeceased = await Deceased.findByIdAndDelete(req.body.deceasedId);
        if(deleteDeceased){
            req.flash('message', 'Data has been deleted successfully!');
            return res.redirect('/admin');
        } else{
            req.flash('message', 'Data has been failed to delete !');
            return res.redirect('/admin');
        }
    } else if (actions === 'print') {
        const templatePath = path.join(__dirname, '../../views/admin/partials/pdf/single-pdf.ejs');
        const templateContent = await fs.readFile(templatePath, 'utf-8');
        const html = ejs.render(templateContent, { deceased: deceased });
        try {
            const browser = await puppeteer.launch({
                ...puppeteerConfig,
                args: [
                    "--disable-setuid-sandbox",
                    "--no-sandbox",
                    "--single-process",
                    "--no-zygote",
                ],
                headless: true
            });

            const page = await browser.newPage();
            await page.setContent(html);
            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
            });

            // Set response headers to indicate PDF content
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader(`Content-Disposition', 'inline; filename="${deceased._id}"`);

            // Send the PDF content as the response
            res.send(pdfBuffer);
        } catch (err) {
            console.log('err:', err);
            req.flash('message', 'Internal error occured.');
            return res.status(500).render('500');
        }
    }
}