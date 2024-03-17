const fs = require('fs').promises;
const path = require('path');
const puppeteer = require('puppeteer');
const puppeteerConfig = require('../../puppeteer.config.cjs');
const ejs = require('ejs');
const User = require('../../models/user');
const Deceased = require('../../models/deceased');

module.exports.print = async (req, res) => {
    const month = parseInt(req.body.month);
    const year = parseInt(req.body.year);
    const causeDeath = req.body.causeDeath;
    const gender = req.body.gender;

    if (isNaN(year) && isNaN(month)) {
        // If both year and month are NaN, retrieve all data from Deceased collection
        try {
            let deceaseds = await Deceased.find();
            // Apply additional filters for gender and cause of death
            if (causeDeath && causeDeath !== 'All') {
                deceaseds = deceaseds.filter(deceased => deceased.causeDeath === causeDeath);
            }
            if (gender && gender !== 'All') {
                deceaseds = deceaseds.filter(deceased => deceased.gender === gender);
            }

            const templatePath = path.join(__dirname, '../../views/admin/partials/pdf/month-pdf.ejs');
            const templateContent = await fs.readFile(templatePath, 'utf-8');
            const html = ejs.render(templateContent, { filteredDeceaseds: deceaseds, month: month, year: year });

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
            req.flash('message', 'Internal error occurred.');
            return res.status(500).render('500');
        }
    } else if (isNaN(year)) {
        // If the year is NaN, search only by month
        const deceaseds = await Deceased.find();
        let filteredDeceaseds = deceaseds.filter(deceased => {
            const deathMonth = new Date(deceased.deathDate).getMonth() + 1; // Months are zero-based in JavaScript Date objects
            return deathMonth === month;
        });

        // Apply additional filters for gender and cause of death
        if (causeDeath && causeDeath !== 'All') {
            filteredDeceaseds = filteredDeceaseds.filter(deceased => deceased.causeDeath === causeDeath);
        }
        if (gender && gender !== 'All') {
            filteredDeceaseds = filteredDeceaseds.filter(deceased => deceased.gender === gender);
        }

        const templatePath = path.join(__dirname, '../../views/admin/partials/pdf/month-pdf.ejs');
        const templateContent = await fs.readFile(templatePath, 'utf-8');
        const html = ejs.render(templateContent, { filteredDeceaseds: filteredDeceaseds, month: month, year: year });
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
            req.flash('message', 'Internal error occurred.');
            return res.status(500).render('500');
        }
    } else if (isNaN(month)) {
        // If the month is NaN, search only by year
        const deceaseds = await Deceased.find();
        let filteredDeceaseds = deceaseds.filter(deceased => {
            const deathYear = new Date(deceased.deathDate).getFullYear();
            return deathYear === year;
        });

        // Apply additional filters for gender and cause of death
        if (causeDeath && causeDeath !== 'All') {
            filteredDeceaseds = filteredDeceaseds.filter(deceased => deceased.causeDeath === causeDeath);
        }
        if (gender && gender !== 'All') {
            filteredDeceaseds = filteredDeceaseds.filter(deceased => deceased.gender === gender);
        }

        const templatePath = path.join(__dirname, '../../views/admin/partials/pdf/month-pdf.ejs');
        const templateContent = await fs.readFile(templatePath, 'utf-8');
        const html = ejs.render(templateContent, { filteredDeceaseds: filteredDeceaseds, month: month, year: year });
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
            req.flash('message', 'Internal error occurred.');
            return res.status(500).render('500');
        }
    } else {
        // If year is provided, search by both year and month
        const deceaseds = await Deceased.find();
        let filteredDeceaseds = deceaseds.filter(deceased => {
            const deathYear = new Date(deceased.deathDate).getFullYear();
            const deathMonth = new Date(deceased.deathDate).getMonth() + 1; // Months are zero-based in JavaScript Date objects
            return deathYear === year && deathMonth === month;
        });

        // Apply additional filters for gender and cause of death
        if (causeDeath && causeDeath !== 'All') {
            filteredDeceaseds = filteredDeceaseds.filter(deceased => deceased.causeDeath === causeDeath);
        }
        if (gender && gender !== 'All') {
            filteredDeceaseds = filteredDeceaseds.filter(deceased => deceased.gender === gender);
        }

        const templatePath = path.join(__dirname, '../../views/admin/partials/pdf/month-pdf.ejs');
        const templateContent = await fs.readFile(templatePath, 'utf-8');
        const html = ejs.render(templateContent, { filteredDeceaseds: filteredDeceaseds, month: month, year: year });
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
            req.flash('message', 'Internal error occurred.');
            return res.status(500).render('500');
        }
    }
};
