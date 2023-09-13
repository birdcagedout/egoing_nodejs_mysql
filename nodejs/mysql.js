// 공식 홈페이지의 예제
// https://www.npmjs.com/package/mysql2


// get the client
const mysql = require('mysql2');


// create the connection to database
const connection = mysql.createConnection({
  host: '127.0.0.1',				// 만약 연결에 Error: connect ECONNREFUSED ::1:3306 <== 이런 부분이 나타났다면 'localhost'가 '::1'에 바인딩(/private/etc/hosts)되어 나타나는 에러이므로 '127.0.0.1'로 고쳐준다
	// port: 3306,
  user: 'root',
	password: 'mysql1111',
  database: 'opentutorials'
});

// simple query
connection.query(
  'SELECT * FROM topic;',
  function(err, results, fields) {
    console.log(results); 					// results contains rows returned by server
    console.log(fields); 						// fields contains extra meta data about results, if available
  }
);

// with placeholder
// connection.query(
//   'SELECT * FROM `table` WHERE `name` = ? AND `age` > ?',
//   ['Page', 45],
//   function(err, results) {
//     console.log(results);
//   }
// );

connection.end();