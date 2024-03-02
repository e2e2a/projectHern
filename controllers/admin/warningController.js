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
            html: htmlContent,  // Set the HTML content
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
        cron.schedule('* * * * *', async () => { // Runs every minute (for testing)
            console.log('Cron job execution triggered.');
            try {
                const deceasedList = await Deceased.find(); // Fetch all deceased records from the database
                if (deceasedList.length > 0) {
                    for (const deceased of deceasedList) {
                        const burialDate = moment(deceased.dateBuried, 'YYYY-MM-DD');
                        const fiveYearsLater = moment(burialDate).add(5, 'years');
                        const currentDate = moment();
                        console.log('burialDate:', burialDate, 'dateBuried:', 'fiveYearsLater:',fiveYearsLater);
                        // Check if current date is 5 years after the burial date
                        if (currentDate.isSameOrAfter(fiveYearsLater, 'day')) {
                            if (deceased.guardianEmail && deceased.guardianEmail.trim() !== '') {
                                console.log('Guardian email:', deceased.guardianEmail, 'fiveYearsLater:',fiveYearsLater);
                                const emailContent = `
                                    <p>Your loved one, ${deceased.fullname}, has been buried for more than 5 years.</p>
                                    <p>Please contact us for further information.</p>
                                `;
                                await sendEmail(deceased.guardianEmail, 'Notification: Burial Exceeds 5 Years', emailContent);
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
