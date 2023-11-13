#!/usr/bin/env node

const puppeteer = require('puppeteer');
const mysql = require('mysql2');
const fs = require('fs')
const parser = require('./parser/parser');
const { Console } = require('console');

const output = fs.createWriteStream('./log/message.log');
const errorOutput = fs.createWriteStream('./log/error.log');
// custom simple logger
const logger = new Console(output, errorOutput);

var Config = {}

async function readConfig() {
    const config = JSON.parse(fs.readFileSync('./conf/polspider.conf', 'utf8'))
    return config
}

var FullSQL = "SELECT `pol`.`PartNo` FROM `pricefiles`.`pol`"

var SubstitutionSQL = "SELECT `pol_substitution`.`SubstPartNumber` AS `PartNo`" +
    "FROM `pol_substitution` " +
    "WHERE `pol_substitution`.`SubstPartNumber`!='' AND `pol_substitution`.`SubstPartNumber` NOT IN (SELECT `pol_part`.`PartNumber` from `pol_part`)"

var UpdateSQL = "SELECT `pol`.`PartNo` FROM `pricefiles`.`pol` " +
    "WHERE `pol`.`PartNo` NOT IN (SELECT `PartNumber` from `pol_part`) " +
    "ORDER BY `pol`.`PartNo`"


// param []of parts
async function bulkPageProcess() {
    try {
        let PartSQL = ""
        let parts = []
        switch (Config.ScanType) {
            case "full":
                PartSQL = FullSQL
                break
            case "substitution":
                PartSQL = SubstitutionSQL
                break
            case "update":
                PartSQL = UpdateSQL
                break
            default:
                PartSQL = UpdateSQL
        }
        const pool = mysql.createPool({
            host: Config.host,
            user: Config.user,
            password: Config.password,
            database: Config.database
        });
        // now get a Promise wrapped instance of that pool
        const prmsPool = pool.promise();
        const browser = await puppeteer.launch({
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-gpu'
            ],
            headless: Config.headless
        });
        browser.on('disconnected', () => {
            //console.log('browser disconnected')
            browser.close()
        })
        if (Config.ScanType !== "file") {
            try {
                var [parts, fields] = await prmsPool.query(PartSQL);
            } catch (e) {
                throw e
            }
        } else {
            //scan parts from file
            parts = await readParts(Config.Filepath)
        }
        await pageProcess(browser, prmsPool, parts)
        pool.end()
        await browser.close()
    } catch (e) {
        console.log(e)
        logger.error(e)
        process.exit()
    }
}

const readParts = async (path) => {
    if (fs.existsSync(path)) {
        const skus = fs.readFileSync(path).toString().split("\n");
        let parts = []
        for (let i = 0; i < skus.length; i++) {
            if (skus[i] != "PartNumber" && skus[i].length > 0) {
                console.log(skus[i])
                const part = { "PartNo": skus[i] };
                parts.push(part)
            }
        }
        process.exit(0)
        return parts
    } else {
        throw new Error('file not exists')
    }
}

//process simple array of parts
// params browser(opened) parts []
async function pageProcess(browser, dbpool, parts) {
    try {
        logger.log("parts count: ", parts.length)
        const page = await browser.newPage();
        page.setDefaultNavigationTimeout(180000)
        page.setViewport({
            width: 1440,
            height: 900,
            isLandscape: true
        })
        await page.goto(Config.StartPage);
        checkloginfrom = await page.$('#DealerLogin')
        //new login
        if (checkloginfrom == null) {
            return
        }
        loginform = await page.$('form')
        dealer = await loginform.$('#F_DealerID')
        await dealer.focus()
        await dealer.type(Config.DealerNumber, {
            delay: 50
        })
        useremail = await loginform.$('#F_UserLogin')
        await useremail.focus()
        await useremail.type(Config.Email, {
            delay: 50
        })
        password = await loginform.$('#F_Password')
        await password.focus()
        await password.type(Config.Password, {
            delay: 50
        })
        //submit
        submitbtn = await loginform.$('#F_Submit')
        await submitbtn.focus()
        await submitbtn.click({
            delay: 50
        })
        //await page.waitFor(500)
        await page.waitForNavigation({
            waitUntil: ['load', 'domcontentloaded', 'networkidle2']
        })
        PGlink = await page.$('ul#mainMenu')
        wlinks = await PGlink.$$('a')
        await wlinks[2].focus()
        await wlinks[2].click({
            delay: 50
        })
        WlinkLi = await page.$('#nav_Part_Detail_Search')
        Wlink = await WlinkLi.$('a')
        await Wlink.focus()
        await Wlink.click({
            delay: 50
        })
        //await page.waitFor(1000)
        await page.waitForNavigation({
            waitUntil: ['load', 'domcontentloaded', 'networkidle2']
        })
        //we are on work page
        //main part process
        //await parser.ParsePage(page, dbpool, "2530009")
        //for (let i = 0; i < parts.length; i++) {
        //    const part = parts[i];
        //    await parser.ParsePage(page, dbpool, Config, part.PartNo)
        //}
        while (parts.length > 0) {
            const part = parts.pop()
            logger.log("Parse part %s, \t\tleft %d parts", part.PartNo, parts.length)
            await parser.ParsePage(page, dbpool, Config, part.PartNo)
        }

        //just wait for display result
        //await page.waitFor(5000);
        //console.log("Try close page");

        await page.close()
    } catch (error) {
        console.log(error)
        logger.error(error)
        await page.close()
    }
}

async function ShowHelp() {
    return `--disable-kit              - don't collect kit data
--disable-substitution      - don't collect substitutions data
--disable-fitment           - don't collect fitment

--scan-all              - full scan
--scan-substitutions    - scan substitutions (intersection pol_substitution pol_part)
--scan-update           - scan for update (intersection pol pol_part)
--scan-file=[filepath]  - scan list of parts from file (1 part for row)

Default options :
enabled         all - kit, fitment, substitution
scan mode       --scan-update`
}

(async () => {
    try {
        let DisplayHelp = false
        Config = await readConfig()
        //parse args
        for (let i = 0; i < process.argv.length; i++) {
            const param = process.argv[i];
            switch (param) {
                case "--disable-kit":
                    Config.KitCollect = false
                    break
                case "--disable-substitution":
                    Config.SubstitutionCollect = false
                    break
                case "--disable-fitment":
                    Config.FitmentCollect = false
                    break
                case "--scan-all":
                    Config.ScanType = "full"
                    break
                case "--scan-substitutions":
                    Config.ScanType = "substitution"
                    break
                case "--scan-update":
                    Config.ScanType = "update"
                    break
                case "--help":
                    help = await ShowHelp();
                    console.log(help);
                    await process.exit(0)
                    break
            }
            if (param.substring(0, 11) == "--scan-file") {
                Config.ScanType = "file"
                let fp = param.split("=")
                Config.Filepath = fp.length == 2 ? fp[1] : ""
            }
        }
        await bulkPageProcess()
    } catch (error) {
        console.log(error)
        logger.error(error)
    }
})()