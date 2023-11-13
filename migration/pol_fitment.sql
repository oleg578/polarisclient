/** ID md5 of sum all fields **/
CREATE TABLE `pol_fitment` (
    `ID` char(32) NOT NULL PRIMARY KEY,
    `PartNumber` varchar(50) NOT NULL,
    `ModelNumber` varchar(500) NOT NULL,
    `ModelName` varchar(500) DEFAULT "",
    `ModelYear` varchar(500) DEFAULT "",
    `AssemblyName` varchar(500) DEFAULT ""
) ENGINE=InnoDB DEFAULT CHARSET=utf8