CREATE TABLE `pol_part` (
    `PartNumber` varchar(50) NOT NULL PRIMARY KEY,
    `AlternatePart` varchar(50) DEFAULT '',
    `Description` varchar(500) DEFAULT '',
    `MinimumQty` int DEFAULT 0,
    `MSRP` double(11,2) DEFAULT 0.00,
    `ExMSRP` double(11,2) DEFAULT 0.00,
    `SubjectToMap` bool DEFAULT FALSE,
    `Message` varchar(500) DEFAULT '',
    `InStock` bool DEFAULT FALSE,
    `PartWeight` double(11,2) DEFAULT 0.00,
    `PartHeight` double(11,2) DEFAULT 0.00,
    `PartWidth` double(11,2) DEFAULT 0.00,
    `PartLength` double(11,2) DEFAULT 0.00,
    `UpdatedAt` TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8