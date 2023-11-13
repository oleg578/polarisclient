CREATE TABLE `pol_kit` (
    `ParentPartNumber` varchar(50) NOT NULL,
    `PartNumber` varchar(50) NOT NULL,
    `Quantity` int DEFAULT 0,
    `UM` varchar(255) DEFAULT '',
    `Description` varchar(500) DEFAULT '',
    PRIMARY KEY (`ParentPartNumber`,`PartNumber`),
    KEY `ParentPartNumber` (`ParentPartNumber`),
    KEY `PartNumber` (`PartNumber`),
    KEY `Parent_Child` (`ParentPartNumber`,`PartNumber`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8