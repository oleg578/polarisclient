const model = require('../model/model');
const fitment = require('../fitment/fitment');
const detail = require('../detail/detail');
const kit = require('../kit/kit');
const substitution = require('../substitution/substitution');

async function ParsePage(page, dbpool, config, partnum) {
    let pageMenuBar = await page.$(
        '#ctl00_cphDealerDefault_ucNavigationControl_mnuPartDetailsNavigation')
    if (pageMenuBar !== null) {
        navlinks = await pageMenuBar.$$('a')
        await navlinks[0].focus()
        await navlinks[0].click({
            delay: 50
        })
        await page.waitForNavigation({
            waitUntil: ['load', 'domcontentloaded', 'networkidle2']
        })
    }

    const partnuminput = await page.$('#ctl00_cphDealerDefault_ucNavigationControl_txtItemID')
    if (partnuminput == null) {
        throw new Error("Encountered an error on page - form not found")
    }
    await partnuminput.focus()
    const partInputValue = await page.evaluate(partnuminput => partnuminput.value, partnuminput)
    if (partInputValue.length != 0) {
        await page.keyboard.down('Control');
        await page.keyboard.down('A');

        await page.keyboard.up('A');
        await page.keyboard.up('Control');
        await page.keyboard.press('Backspace');
    }
    await partnuminput.type(partnum, {
        delay: 50
    })
    //clear input Description
    //ctl00_cphDealerDefault_ucNavigationControl_txtDescription
    await page.$eval('#ctl00_cphDealerDefault_ucNavigationControl_txtDescription', el => el.value = '');
    partsubmitbtn = await page.$('#ctl00_cphDealerDefault_ucNavigationControl_btnFind')
    await partsubmitbtn.focus()
    await partsubmitbtn.click({
        delay: 50
    })
    await page.waitForNavigation({
        waitUntil: ['load', 'domcontentloaded', 'networkidle2']
    })
    //test multi part result --> click to 1st link if table of choice found
    //id ctl00_cphDealerDefault_grdItemSearch
    const multiresult = await page.$('#ctl00_cphDealerDefault_grdItemSearch')
    if (multiresult !== null) {
        console.log("multiresult is not null")
        links = await multiresult.$$("a")
        let fl = links[0]
        links.forEach(el => {
            if (el.innerText == partnum) {
                fl = el
            }
        });
        const firstHref = await page.evaluate(fl => fl.href, fl)
        console.log(partnum, firstHref)
        if (firstHref == "") {return } //nothing todo
        fl.focus()
        fl.click()
        await page.waitForNavigation({
            timeout: 60000,
        })
    }
    //multiresult handle end
    dealercost = await page.$('#ctl00_cphDealerDefault_rdoYes')
    if (dealercost == null) {
        return
    }
    await dealercost.focus()
    await dealercost.click({
        delay: 50
    })
    await page.waitForNavigation({
        waitUntil: ['load', 'domcontentloaded', 'networkidle2']
    })
    let part = {
        PartNumber: partnum,
        AlternatePart: "",
        Description: "",
        MinimumQty: 0,
        MSRP: 0.00,
        ExMSRP: 0.00,
        SubjectToMap: false,
        Message: "",
        InStock: false,
        Weight: 0.00,
        Height: 0.00,
        Width: 0.00,
        Length: 0.00,
        Dimension: "",
        Children: [],
        Fitments: [],
        Substitutions: [],
    }
    part = await detail.GetDetails(page, part) //parse main info
    console.log("part after main scan: ", part)
    if (config.KitCollect) {
        part = await kit.GetKitContents(page, part) //parse kit children
    }
    if (config.FitmentCollect) {
        part = await fitment.GetFitment(page, part) //parse fitment
    }
    if (config.SubstitutionCollect) {
        part = await substitution.GetSubstitution(page, part) //parse substitution
    }
    try {
        await model.PartStore(dbpool, part)
    } catch (e) {
        console.log(e.sqlMessage)
        process.exit()
    }
    return
}

module.exports = {
    ParsePage: ParsePage,
}