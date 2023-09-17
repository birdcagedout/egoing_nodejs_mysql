const db = require('./db');
const template = require('./template');

exports.home = function(request, response) {

	db.query(
		`SELECT * FROM topic;`,
		(err1, results1, fields1) => {
			var itemList = template.itemList(results1);

			db.query(
				`SELECT * FROM author;`,
				(err2, results2, fields2) => {
					var title = 'Author';
					var authorTable = template.authorTable(results2);
					var html = template.html(title, itemList, 
						`
						${authorTable}
						* Author 추가하기 *
						<form action="/author/create_process" method="post">
							<p>
								<input type="text" name="name" placeholder="name">
							</p>
							<p>
								<textarea name = "profile"></textarea>
							</p>
							<p>
								<input type="submit" value="추가">
							</p>
						</form>
						`,
						``
					);
			
					response.writeHead(200);
					response.end(html);
				}
			);	// 쿼리2
		}
	);	// 쿼리1
}


exports.create_process = function(request, response) {
	// POST로 전송된 data 처리
	var body = '';

	// 서버가 POST data를 (조각조각 순차적으로) 수신할 때마다 호출되는 event listener
	request.on('data', function(data) {
		body += data;

		// 너무 큰(대략 1MB) 데이터가 들어왔을 때 접속을 끊어버리는 예방장치
		if(data.length > 1e6) request.socket.destroy();
	});

	// 서버에 더이상 들어오는 data가 없으면 정보수신이 끝났으므로 이때 호출되는 event listener
	request.on('end', function(data) {

		const params = new URLSearchParams(body);
		var name = params.get('name');
		var profile = params.get('profile');

		db.query(
			`INSERT INTO author(name, profile) VALUES(?, ?);`,
			[name, profile],
			(err, results, fields) => {
				if(err) throw err;

				// console.log(results);			// INSERT의 결과는 ResultSetHeader 객체가 들어온다. 이 객체의 indertId는 Insert된 row의 ID를 가지고 있다.
				response.writeHead(302, {Location: `/author`});
				response.end();
			}
		);
	});
}


exports.update = function(request, response, queryId) {
	db.query(
		`SELECT * FROM topic;`,
		(err1, results1, fields1) => {
			var itemList = template.itemList(results1);

			db.query(
				`SELECT * FROM author;`,
				(err2, results2, fields2) => {
					var authorTable = template.authorTable(results2);

					db.query(
						`SELECT * FROM author WHERE id=?`,
						[queryId],
						(err3, result3, fields3) => {
							var title = 'Author';
							var html = template.html(title, itemList,
								`
								${authorTable}
								* Author 변경하기 *
								<form action="/author/update_process" method="post">
									<p>
										<input type="hidden" name="id" value=${queryId}>
										<input type="text" name="name" value=${result3[0].name}>
									</p>
									<p>
										<textarea name = "profile">${result3[0].profile}</textarea>
									</p>
									<p>
										<input type="submit" value="변경">
									</p>
								</form>
								`,
								``
							);
					
							response.writeHead(200);
							response.end(html);
						}
					);
					
				}
			);	// 쿼리2
		}
	);	// 쿼리1
}


exports.update_process = function(request, response) {
	// POST로 전송된 data 처리
	var body = '';

	// 서버가 POST data를 (조각조각 순차적으로) 수신할 때마다 호출되는 event listener
	request.on('data', function(data) {
		body += data;

		// 너무 큰(대략 1MB) 데이터가 들어왔을 때 접속을 끊어버리는 예방장치
		if(data.length > 1e6) request.socket.destroy();
	});

	// 서버에 더이상 들어오는 data가 없으면 정보수신이 끝났으므로 이때 호출되는 event listener
	request.on('end', function(data) {
		var params = new URLSearchParams(body);

		var authorId = params.get('id');
		var name = params.get('name');
		var profile = params.get('profile');

		db.query(
			`UPDATE author SET name=?, profile=? WHERE id=?;`,
			[name, profile, authorId],
			(err, result, fields) => {
				console.log(result);
				// ResultSetHeader {
				// 	0|main   |   fieldCount: 0,
				// 	0|main   |   affectedRows: 1,
				// 	0|main   |   insertId: 0,
				// 	0|main   |   info: 'Rows matched: 1  Changed: 1  Warnings: 0',
				// 	0|main   |   serverStatus: 2,
				// 	0|main   |   warningStatus: 0,
				// 	0|main   |   changedRows: 1
				// 	0|main   | }

				response.writeHead(302, {Location: `/author`});				// author로 redirection
				response.end();
			}
		);
	});
}

exports.delete_process = function(request, response) {
	// POST로 전송된 data 처리
	var body = '';

	// 서버가 POST data를 (조각조각 순차적으로) 수신할 때마다 호출되는 event listener
	request.on('data', function(data) {
		body += data;

		// 너무 큰(대략 1MB) 데이터가 들어왔을 때 접속을 끊어버리는 예방장치
		if(data.length > 1e6) request.socket.destroy();
	});

	// 서버에 더이상 들어오는 data가 없으면 정보수신이 끝났으므로 이때 호출되는 event listener
	request.on('end', function(data) {
		var params = new URLSearchParams(body);
		var id = params.get('id');


		db.query(
			`DELETE FROM author WHERE id=?`,
			[id],
			(err, results, fields) => {
				if(err) throw err;
				// console.log(results);
				// ResultSetHeader {
					// fieldCount: 0,
					// affectedRows: 1,
					// insertId: 0,
					// info: '',
					// serverStatus: 2,
					// warningStatus: 0,
					// changedRows: 0
				// }						
				response.writeHead(302, {Location: '/author'});
				response.end();
			}
		);
	});
}