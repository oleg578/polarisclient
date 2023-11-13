const md5 = require('md5');

let Part = {
    PartNumber: "",
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

let Child = {
    Partnum: "",
    Qty: 0,
    UM: "",
    Description: "",
}

let Fitment = {
    ModelNumber: "",
    ModelName: "",
    ModelYear: "",
    AssemblyName: "",
}

let Substitution = {
    Partnum: "",
    AlternatePart: "",
    Type: "",
    Description: "",
    InStock: false,
}

async function PartStore(dbpool, part) {
    //store main data
    await storeGeneral(dbpool, part)
    //Children
    await storeChildren(dbpool, part)
    //Substitutions
    await storeSubstitutions(dbpool, part)
    //Fitments
    await storeFitment(dbpool, part)
    //await storeFitmentS(dbpool, part)
}

async function storeGeneral(pool, part) {
    const SQLQuery = 'INSERT INTO `pol_part` ' +
        '(`PartNumber`,`AlternatePart`,`Description`,' +
        '`MinimumQty`,`MSRP`,`ExMSRP`,`SubjectToMap`,' +
        '`Message`,`InStock`,`PartWeight`,`PartHeight`,' +
        '`PartWidth`,`PartLength`) ' +
        'VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?) ' +
        'ON DUPLICATE KEY UPDATE ' +
        '`AlternatePart`=?,' +
        '`Description`=?,' +
        '`MinimumQty`=?,' +
        '`MSRP`=?,' +
        '`ExMSRP`=?,' +
        '`SubjectToMap`=?,' +
        '`Message`=?,' +
        '`InStock`=?,' +
        '`PartWeight`=?,' +
        '`PartHeight`=?,' +
        '`PartWidth`=?,' +
        '`PartLength`=?'
    await pool.query(SQLQuery,
        [part.PartNumber,
        part.AlternatePart,
        part.Description,
        part.MinimumQty,
        part.MSRP,
        part.ExMSRP,
        part.SubjectToMap,
        part.Message,
        part.InStock,
        part.Weight,
        part.Height,
        part.Width,
        part.Length,
        part.AlternatePart,
        part.Description,
        part.MinimumQty,
        part.MSRP,
        part.ExMSRP,
        part.SubjectToMap,
        part.Message,
        part.InStock,
        part.Weight,
        part.Height,
        part.Width,
        part.Length],
        (err) => {
            console.log(err.sqlMessage)
            return err
        });
}

async function storeChildren(pool, part) {
    const SQLQuery = 'INSERT INTO `pol_kit` ' +
        '(`ParentPartNumber`,`PartNumber`,`Quantity`,' +
        '`UM`,`Description`) ' +
        'VALUES(?,?,?,?,?) ' +
        'ON DUPLICATE KEY UPDATE ' +
        '`PartNumber`=?,' +
        '`Quantity`=?,' +
        '`UM`=?,' +
        '`Description`=?'
    part.Children.forEach(async (item) => {
        await pool.query(SQLQuery,
            [part.PartNumber, item.Partnum, item.Qty, item.UM, item.Description,
            item.Partnum, item.Qty, item.UM, item.Description],
            (error) => {
                if (error) {throw error;}
            })
    });
}

async function storeSubstitutions(pool, part) {
    const SQLQuery = 'INSERT INTO `pol_substitution` ' +
        '(`ParentPartNumber`,`SubstPartNumber`,`AlternatePart`,' +
        '`PartType`,`Description`,`InStock`) ' +
        'VALUES(?,?,?,?,?,?) ' +
        'ON DUPLICATE KEY UPDATE ' +
        '`AlternatePart`=?,' +
        '`PartType`=?,' +
        '`Description`=?,' +
        '`InStock`=?'
    part.Substitutions.forEach(async (item) => {
        await pool.query(SQLQuery,
            [part.PartNumber, item.Partnum, item.AlternatePart, item.Type, item.Description, item.InStock,
            item.AlternatePart, item.Type, item.Description, item.InStock],
            (error) => {
                if (error) {throw error;}
            })
    });
}

async function storeFitment(pool, part) {
    const SQLQuery = 'INSERT INTO `pol_fitment` ' +
        '(`ID`,`PartNumber`,`ModelNumber`,`ModelName`,`ModelYear`,`AssemblyName`) ' +
        'VALUES(?,?,?,?,?,?) ' +
        'ON DUPLICATE KEY UPDATE ' +
        '`AssemblyName`=?'
    part.Fitments.forEach(async (item) => {
        let id = await md5(part.PartNumber + item.ModelNumber +
            item.ModelName + item.ModelYear + item.AssemblyName)
        //console.log(id, " : ", item)
        await pool.query(SQLQuery,
            [id,
                part.PartNumber, item.ModelNumber,
                item.ModelName, item.ModelYear, item.AssemblyName,
                item.AssemblyName],
            (error) => {
                if (error) {throw error;}
            })
    });
}

async function storeFitmentS(pool, part) {
    const SQLQuery = 'INSERT INTO `pol_fitment_s` ' +
        '(`PartNumber`,`ModelNumber`,`ModelName`,`ModelYear`,`AssemblyName`) ' +
        'VALUES(?,?,?,?,?)'
    part.Fitments.forEach(async (item) => {
        await pool.query(SQLQuery,
            [part.PartNumber, item.ModelNumber,
            item.ModelName, item.ModelYear, item.AssemblyName,
            item.AssemblyName],
            (error) => {
                if (error) {throw error;}
            })
    });
}

module.exports = {
    Part: Part,
    Child: Child,
    Fitment: Fitment,
    Substitution: Substitution,
    PartStore: PartStore,
}