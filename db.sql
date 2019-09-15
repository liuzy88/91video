CREATE TABLE `videos` (
  `hash` varchar(64) NOT NULL,
  `name` varchar(128) DEFAULT NULL,
  `mp4` varchar(1024) DEFAULT NULL,
  `img` varchar(1024) DEFAULT NULL,
  `uptime` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `saved` tinyint(4) DEFAULT '0',
  PRIMARY KEY (`hash`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;