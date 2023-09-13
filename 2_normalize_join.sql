use opentutorials;

-- 예전 topic 테이블 백업해놓고
RENAME TABLE topic TO topic_old;

-- 새로운 topic 테이블 만들기
CREATE TABLE topic(
    id          INT(11)         NOT NULL    AUTO_INCREMENT,
    title       VARCHAR(100)    NOT NULL,
    description TEXT            NULL,
    created     DATETIME        NOT NULL,
    author_id	INT(11)			NULL,
    PRIMARY KEY(id)
);


-- 새로운 author 테이블 만들기
CREATE TABLE author(
	id			INT(11)			NOT NULL	AUTO_INCREMENT,
    name		VARCHAR(20)		NOT NULL,
    profile		VARCHAR(200)	NULL,
    PRIMARY KEY(id)
);



-- author 테이블에 먼저 데이터 넣기(id가 auto_increment인데 id를 모르니까)
INSERT INTO author(
	name,
    profile
) VALUES(
	"egoing",
    "Developer"
);

INSERT INTO author(
	name,
    profile
) VALUES(
	"muzom97",
    "Admin"
);

INSERT INTO author(
	name,
    profile
) VALUES(
	"taeho",
    "Data Scientist, Developer"
);




-- topic 테이블에 데이터 넣기
INSERT INTO topic( 
    title, 
    description, 
    created, 
    author_id
) VALUES(
	"MySQL",
    "MySQL is...",
    "2023-09-10",
    1
);

INSERT INTO topic( 
    title, 
    description, 
    created, 
    author_id
) values(
	"ORACLE",
    "ORACLE is...",
    "2023-09-1",
    1
);

INSERT INTO topic( 
    title, 
    description, 
    created, 
    author_id
) values(
	"SQL Server",
    "SQL Server is...",
    "2023-09-10",
    2
);


INSERT INTO topic( 
    title, 
    description, 
    created, 
    author_id
) values(
	"PostgreSQL",
    "PostgreSQL is...",
    "2023-09-10",
    3
);


INSERT INTO topic( 
    title, 
    description, 
    created, 
    author_id
) values(
	"MongoDB",
    "MongoDB is...",
    "2023-09-11",
    1
);


-- left join
SELECT T.id id, title, description, created, A.name author, A.profile profile 
	FROM topic T 
	LEFT JOIN author A
    ON T.author_id = A.id;

