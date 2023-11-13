const model = require('../model/model');
//fitment
async function GetFitment(page, part) {
    //get #ctl00_cphDealerDefault_ucNavigationControl_mnuPartDetailsNavigation
    let pageMenuBar = await page.$(
        '#ctl00_cphDealerDefault_ucNavigationControl_mnuPartDetailsNavigation')
    navlinks = await pageMenuBar.$$('a')
    await navlinks[4].focus()
    await navlinks[4].click({
        delay: 50
    })
    await page.waitForNavigation({
        waitUntil: ['load', 'domcontentloaded', 'networkidle2']
    }) //we are on fitment page
    //start scan
    let IsFull = false
    let pagenum = 1 //page counter
    while (!IsFull) {
        fitments = await getFitmentTbl(page, pagenum)
        for (let i = 0; i < fitments.length; i++) {
            const ftmt = fitments[i]
            part.Fitments.push({
                ModelNumber: ftmt.ModelNumber,
                ModelName: ftmt.ModelName,
                ModelYear: ftmt.ModelYear,
                AssemblyName: ftmt.AssemblyName
            })
        }
        //goto next page
        pagenum++;
        let nextlink = await PaginatorHndl(page, pagenum)
        if (nextlink !== null) {
            await nextlink.focus()
            await nextlink.click({
                delay: 50
            })
            await page.waitForNavigation({
                waitUntil: ['load', 'domcontentloaded', 'networkidle2']
            }) //we are on fitment page
        } else {
            IsFull = true
        }
    }
    return part
}

async function PaginatorHndl(page) {
    let NextpageclickEl = null
    const paginator = await page.$("table#ctl00_cphDealerDefault_grdKitWhereUsed table tr")
    if (paginator == null) {
        return NextpageclickEl
    }
    let links = await paginator.$$("td")
    for (let i = 0; i < links.length; i++) {
        const link = links[i];
        let curlink = await link.$("span")
        if (curlink !== null && i < (links.length - 1)) {
            let nextlink = links[i + 1]
            let NextpageclickEl = await nextlink.$("a")
            return NextpageclickEl
        }
    }
    return NextpageclickEl
}

async function getFitmentTbl(page, pagenum) {
    //ctl00_cphDealerDefault_grdKitWhereUsed
    let fitments = []
    let rows = await page.$$("[class$='RowStyle']")
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        let columns = await row.$$('td') //get all td
        let fitment = {
            ModelNumber: "",
            ModelName: "",
            ModelYear: "",
            AssemblyName: "",
        }
        const ModelNumber = columns[0];
        fitment.ModelNumber = await page.evaluate(ModelNumber => ModelNumber.innerText, ModelNumber)
        const ModelName = columns[1];
        fitment.ModelName = await page.evaluate(ModelName => ModelName.innerText, ModelName)
        const ModelYear = columns[2];
        fitment.ModelYear = await page.evaluate(ModelYear => ModelYear.innerText, ModelYear)
        const AssemblyName = columns[3];
        fitment.AssemblyName = await page.evaluate(AssemblyName => AssemblyName.innerText, AssemblyName)
        fitments.push({
            ModelNumber: fitment.ModelNumber,
            ModelName: fitment.ModelName,
            ModelYear: fitment.ModelYear,
            AssemblyName: fitment.AssemblyName,
        })
    }
    return fitments
}

module.exports = {
    GetFitment: GetFitment,
}