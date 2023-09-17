const mysql = require('mysql2');

var conn = mysql.createConnection({
	host: '127.0.0.1',
	user: 'root',
	password: 'mysql1111',
	database: 'opentutorials'
});

module.exports = conn;