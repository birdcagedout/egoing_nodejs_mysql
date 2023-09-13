DROP DATABASE if exists opentutorials;
CREATE DATABASE opentutorials;

SHOW DATABASES;
USE opentutorials;

SHOW TABLES;

CREATE TABLE topic(
    id          INT(11)         NOT NULL    AUTO_INCREMENT,
    title       VARCHAR(100)    NOT NULL,
    description TEXT            NULL,
    created     DATETIME        NOT NULL,
    author      VARCHAR(15)     NULL,
    profile     VARCHAR(200)    NULL,
    PRIMARY KEY(id)
);

INSERT INTO topic( 
    title, 
    description, 
    created, 
    author, 
    profile
) values(
	"MySQL",
    "MySQL is...",
    "2023-09-10",
    "egoing",
    "Developer"
);

INSERT INTO topic( 
    title, 
    description, 
    created, 
    author, 
    profile
) values(
	"ORACLE",
    "ORACLE is...",
    "2023-09-1",
    "egoing",
    "Developer"
);

INSERT INTO topic( 
    title, 
    description, 
    created, 
    author, 
    profile
) values(
	"SQL Server",
    "SQL Server is...",
    "2023-09-10",
    "muzom97",
    "Admin"
);


INSERT INTO topic( 
    title, 
    description, 
    created, 
    author, 
    profile
) values(
	"PostgreSQL",
    "PostgreSQL is...",
    "2023-09-10",
    "taeho",
    "Data Scientist, Developer"
);


INSERT INTO topic( 
    title, 
    description, 
    created, 
    author, 
    profile
) values(
	"MongoDB",
    "MongoDB is...",
    "2023-09-11",
    "egoing",
    "Developer"
);


select * from topic;


UPDATE topic SET created="2023-09-12" 
WHERE id=4;

DELETE FROM topic
WHERE title='MongoDB';





