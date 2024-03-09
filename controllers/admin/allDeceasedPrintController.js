const fs = require('fs').promises;
const path = require('path');
const puppeteer = require('puppeteer');
const puppeteerConfig = require('../../puppeteer.config.cjs');
const ejs = require('ejs');
const User = require('../../models/user');
const Deceased = require('../../models/deceased')

module.exports.print = async (req, res) => {

const month = parseInt(req.body.month);
const year = parseInt(req.body.year);
console.log(year,month)
if (isNaN(month)) {
    const deceaseds = await Deceased.find();
    const filteredDeceaseds = deceaseds.filter(deceased => {
        const deathYear = new Date(deceased.deathDate).getFullYear();
        return deathYear === year;
    });
    const templatePath = path.join(__dirname, '../../views/admin/partials/pdf/all-pdf.ejs');
    const templateContent = await fs.readFile(templatePath, 'utf-8');
    const html = ejs.render(templateContent, { filteredDeceaseds: filteredDeceaseds, year:year, });
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
            landscape: true
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="All-deceased.pdf"');
        res.send(pdfBuffer);
    } catch (err) {
        console.log('err:', err);
        req.flash('message', 'Internal error occured.');
        return res.status(500).render('500');
    }
} else {
    const deceaseds = await Deceased.find();
    
    const filteredDeceaseds = deceaseds.filter(deceased => {
        const deathYear = new Date(deceased.deathDate).getFullYear();
        const deathMonth = new Date(deceased.deathDate).getMonth() + 1; // Months are zero-based in JavaScript Date objects

        return deathYear === year && deathMonth === month;
    });
        
        const templatePath = path.join(__dirname, '../../views/admin/partials/pdf/month-pdf.ejs');
        const templateContent = await fs.readFile(templatePath, 'utf-8');
        const html = ejs.render(templateContent, { filteredDeceaseds: filteredDeceaseds, month:month, year:year, });
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
                landscape: true
            });

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'inline; filename="pdf-print.pdf"');
            res.send(pdfBuffer);
        } catch (err) {
            console.log('err:', err);
            req.flash('message', 'Internal error occured.');
            return res.status(500).render('500');
        }
}
}