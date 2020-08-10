
CREATE TABLE `user` (
    `userid` varchar(20) NOT NULL ,
    `password` varchar(20) NOT NULL,
    `email` varchar(30) DEFAULT NULL, 
    `profilepath` varchar(100) NULL,
    `description` varchar(50) NULL,
    PRIMARY KEY (`userid`)
  );

INSERT INTO `user` VALUES ('kimsarang','dlwnsthd','tlagksshl4@gmail.com',"img/sarang.jpg","안녕하세요 배우 김사랑입니다.");

 
CREATE TABLE `thanks` (
  `userid` varchar(20) NOT NULL,
  `description` text NOT NULL,
  `image_path` varchar(100) NULL,
  `created` datetime NOT NULL
);

INSERT INTO `thanks` VALUES ('kimsarang','오늘 촬영은 스태프랑 재미있게 잘했다. 감사감사 ㅎㅎ',"img/1.jpg",NOW());