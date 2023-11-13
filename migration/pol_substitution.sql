CREATE TABLE `pol_substitution` (
    `ParentPartNumber` varchar(50) NOT NULL,
    `SubstPartNumber` varchar(50) NOT NULL,
    `AlternatePart` varchar(50) DEFAULT "",
    `PartType` varchar(32) DEFAULT "",
    `Description` varchar(500) DEFAULT "",
    `InStock` bool DEFAULT false,
    PRIMARY KEY (`ParentPartNumber`,`SubstPartNumber`),
    KEY `ParentPartNumber` (`ParentPartNumber`),
    KEY `SubstPartNumber` (`SubstPartNumber`),
    KEY `Parent_Subst` (`ParentPartNumber`,`SubstPartNumber`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8