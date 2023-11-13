const model = require('../model/model');

//Substitutions
async function GetSubstitution(page, part) {
    //get #ctl00_cphDealerDefault_ucNavigationControl_mnuPartDetailsNavigation
    let pageMenuBar = await page.$('#ctl00_cphDealerDefault_ucNavigationControl_mnuPartDetailsNavigation')
    navlinks = await pageMenuBar.$$('a')
    await navlinks[5].focus()
    await navlinks[5].click({
        delay: 50
    })
    await page.waitForNavigation({
        waitUntil: ['load', 'domcontentloaded', 'networkidle2']
    }) //we are on substitutions page
    //ctl00_cphDealerDefault_grdSubstitution
    let subtbl = await page.$("#ctl00_cphDealerDefault_grdSubstitution")
    if (subtbl == null) {
        return part
    }//return if no sustitutions
    let rows = await subtbl.$$("tr")
    await rows.shift() //delete titles
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        let columns = await row.$$('td') //get all td
        let subst = {
            Partnum: "",
            AlternatePart: "",
            Type: "",
            Description: "",
            InStock: false,
        }
        const PartNumber = columns[0];
        subst.PartNumber = await page.evaluate(PartNumber => PartNumber.innerText, PartNumber)
        const AlternatePart = columns[1];
        subst.AlternatePart = await page.evaluate(AlternatePart => AlternatePart.innerText, AlternatePart)
        const Type = columns[2];
        subst.Type = await page.evaluate(Type => Type.innerText, Type)
        const Description = columns[3];
        subst.Description = await page.evaluate(Description => Description.innerText, Description)
        //instock in span
        const InStock = columns[4];
        InStockSpan = await page.$("#ctl00_cphDealerDefault_grdSubstitution_ctl02_lblInStock")
        InStockTxt = await page.evaluate(InStockSpan => InStockSpan.innerText, InStockSpan)
        if (InStockTxt.toLowerCase() == "yes") {
            subst.InStock = true
        } else {
            subst.InStock = false
        }
        part.Substitutions.push({
            Partnum: subst.PartNumber,
            AlternatePart: subst.AlternatePart,
            Type: subst.Type,
            Description: subst.Description,
            InStock: subst.InStock,
        })
    }
    return part
}

module.exports = {
    GetSubstitution: GetSubstitution,
}