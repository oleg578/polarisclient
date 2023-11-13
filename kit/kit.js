const model = require('../model/model');
//KitContents
async function GetKitContents(page, part) {
    //get #ctl00_cphDealerDefault_ucNavigationControl_mnuPartDetailsNavigation
    let pageMenuBar = await page.$(
        '#ctl00_cphDealerDefault_ucNavigationControl_mnuPartDetailsNavigation')
    navlinks = await pageMenuBar.$$('a')
    await navlinks[2].focus()
    await navlinks[2].click({
        delay: 50
    })
    await page.waitForNavigation({
        waitUntil: ['load', 'domcontentloaded', 'networkidle2']
    })

    const rows = await page.$$('#ctl00_cphDealerDefault_grdKitBOM tr')
    if (rows === null) {
        return part
    }
    part.Children = await rowsScan(page, rows)
    return part
}

async function rowsScan(page, rows) {
    await rows.shift() //skip first row with titles
    const items = []
    for (let i = 0; i < rows.length; i++) {
        let item = await parseChild(page, rows[i])
        //console.log(item);
        await items.push({
            Partnum: item.Partnum,
            Qty: item.Qty,
            UM: item.UM,
            Description: item.Description,
        })
    }
    return items
}

async function parseChild(page, row) {
    let child = {
        Partnum: "",
        Qty: 0,
        UM: "",
        Description: "",
    }
    const props = await row.$$('td') //get all td
    for (let k = 0; k < props.length; k++) {
        switch (k) {
            case 0:
                child.Partnum = await getTextFromEl(page, props[k], "string")
            case 1:
                child.Qty = await getTextFromEl(page, props[k], "number")
            case 2:
                child.UM = await getTextFromEl(page, props[k], "string")
            case 3:
                child.Description = await getTextFromEl(page, props[k], "string")
        }
    }

    return child
}

async function getTextFromEl(page, el, type) {
    let outtext = ""
    let out = ""
    if (el !== null) {
        outtext = await page.evaluate(el => el.innerText, el)
    }
    switch (type) {
        case "string":
            out = outtext.trim();
            break;
        case "number":
            out = Number(outtext.replace(/[^0-9\.]/g, ''));
            break;
        case "bool":
            if (outtext.toLowerCase() == "yes") {
                out = true
            } else {
                out = false
            }
            break;
        default:
            out = outtext.trim();
            break;
    }
    return out
}

module.exports = {
    GetKitContents: GetKitContents,
}