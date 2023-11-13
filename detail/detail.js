async function GetDetails(page, part) {
    part.AlternatePart = await getFieldTxt(page, "#ctl00_cphDealerDefault_tdAlternatePart", "string")
    part.Description = await getFieldTxt(page, "#ctl00_cphDealerDefault_lblDescription", "string")
    part.MinimumQty = await getFieldTxt(page, "#ctl00_cphDealerDefault_lblMinimumQty", "number")
    part.MSRP = await getFieldTxt(page, "#ctl00_cphDealerDefault_lblMSRP", "number")
    part.ExMSRP = await getFieldTxt(page, "#ctl00_cphDealerDefault_lblExMSRP", "number")
    part.SubjectToMap = await getFieldTxt(page, "#ctl00_cphDealerDefault_lblSubjectToMap", "bool")
    part.InStock = await getFieldTxt(page, "#ctl00_cphDealerDefault_lblInStock", "bool")
    part.DealerCost = await getFieldTxt(page, "#ctl00_cphDealerDefault_lblDealerCost", "number")
    part.ExtendedCost = await getFieldTxt(page, "#ctl00_cphDealerDefault_lblExtendedCost", "number")
    part.Weight = await getFieldTxt(page, "#ctl00_cphDealerDefault_lblWeight", "number")
    part.Dimension = await getFieldTxt(page, "#ctl00_cphDealerDefault_lblDimension", "string")
    part.Message = await getFieldTxt(page, "#ctl00_cphDealerDefault_lblMessage", "string")
    part.Message = part.Message.replace(/[\n\r]+/g, '')

    pdms = await parseDimension(part.Dimension)
    part.Width = pdms.Width
    part.Height = pdms.Height
    part.Length = pdms.Length
    return part
}

async function getFieldTxt(page, id, type) {
    let outtext = ""
    let out = ""
    El = await page.$(id)
    if (El !== null) {
        outtext = await page.evaluate(El => El.innerText, El)
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

async function parseDimension(d) {
    const ssplitted = d.split(" ")
    let p = {
        Height: 0.00,
        Width: 0.00,
        Length: 0.00,
    }
    for (let i = 0; i < ssplitted.length; i++) {
        switch (ssplitted[i]) {
            case "H=":
                if (ssplitted[i + 1] !== undefined) {
                    p.Height = Number(ssplitted[i + 1].replace(/[^0-9\.]/g, ''))
                    break;
                }
            case "W=":
                if (ssplitted[i + 1] !== undefined) {
                    p.Width = Number(ssplitted[i + 1].replace(/[^0-9\.]/g, ''))
                    break;
                }
            case "L=":
                if (ssplitted[i + 1] !== undefined) {
                    p.Length = Number(ssplitted[i + 1].replace(/[^0-9\.]/g, ''))
                    break;
                }
        }
    }
    return p
}

module.exports = {
    GetDetails: GetDetails,
}