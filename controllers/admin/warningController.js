const cron = require('node-cron');
const moment = require('moment');
const nodemailer = require('nodemailer');
const Deceased = require('../../models/deceased'); // Import your Deceased model

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
        throw new Error('Failed to send email');
    }
};

const cronStart = async () => {
    console.log('Starting cron job...');
    try {
        // cron.schedule('*/20 * * * *', async () => {
        cron.schedule('*/5 * * * *', async () => { // Runs every minute (for testing * * * * *)
            console.log('Cron job execution triggered.');
            try {
                const deceasedList = await Deceased.find();
                if (deceasedList.length > 0) {
                    for (const deceased of deceasedList) {
                        const burialDate = moment(deceased.dateBuried, 'YYYY-MM-DD');
                        const fiveYearsLater = moment(burialDate).add(5, 'years');
                        const currentDate = moment();
                        console.log('burialDate:', burialDate, 'fiveYearsLater:',fiveYearsLater);
                       
                        if (burialDate.isSame(burialDate, 'day')) {
                        // if (currentDate.isSame(fiveYearsLater, 'day')) {
                            if (deceased.guardianEmail && deceased.guardianEmail.trim() !== '') {
                                console.log('Guardian email:', deceased.guardianEmail, 'fiveYearsLater:',fiveYearsLater);
                                const emailContent = `
                                <div style="background-color: #f2f2f2; padding: 20px; border-radius: 10px; box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);">
                                    <h2 style="color: #333;">Subject: Burial Exceed 5 Years (Due Date)</h2>
                                    <h3 style="color: #333; margin-top: 20px;">Dear <span style="font-weight: normal;">${deceased.guardian},</span></h3>
                                    <p style="color: #333; text-align: justify; margin-top: 20px;">We hope this message finds you well. We wanted to remind you that your yearly responsibility is currently overdue. We understand that life can get busy, so we're reaching out to gently encourage you to renew your pass at your earliest convenience.</p>
                                    <p style="color: #333; text-align: justify; margin-top: 20px;">By renewing your pass, you'll continue to have access to our services and be part of our community. If you have any questions or need assistance with the renewal process, please don't hesitate to contact us. We're here to help!</p>
                                    <p style="color: #333; text-align: justify; margin-top: 20px;">Thank you for your attention to this matter, and we appreciate your continued support.</p>
                                    <p style="color: #333; text-align: justify; margin-top: 20px;">Warm regards,<br/><a href="http://polanco-registrar.onrender.com" style="color: #007bff; text-decoration: none;">[POLANCO CIVIL REGISTRAR]</a></p>
                                </div>
                                `;
                                await sendEmail(
                                    'polanco-registrar.onrender.com <hernanirefugio@gmail.com>',
                                    deceased.guardianEmail, 
                                    'Notification: Burial Exceeds 5 Years', 
                                    emailContent
                                    );
                            } else {
                                console.error('Error: Guardian email address is missing or invalid for deceased:', deceased.fullname);
                            }
                        }
                    }
                } else {
                    console.log('No deceased records found.');
                }
            } catch (error) {
                console.error('Error fetching deceased records:', error);
            }
        });
    } catch (error) {
        console.error('Error scheduling cron job:', error);
    }
};

module.exports = cronStart;
