// 생활코딩(egoing)님의 node.js + mysql 강의
// 
// 블로그: https://opentutorials.org/module/3560
// 유튜브: https://www.youtube.com/playlist?list=PLuHgQVnccGMAicFFRh8vFFFtLLlNojWUh


var http = require('http');
var fs = require('fs');
var url = require('url');
const path = require('path');
var qs = require('querystring');

// var template --> ./lib/template 모듈로 분리
var template = require('./lib/template.js');

// 보안(http://localhost:3000/?id=../password.js 처럼 요청이 들어오는 경우 상위 디렉토리에 접근하여 정보를 빼갈 수 있다)
const sanitizeHtml = require('sanitize-html');


// mysql2 
const mysql = require('mysql2');
var conn = mysql.createConnection({
	host: '127.0.0.1',
	user: 'root',
	password: 'mysql1111',
	database: 'opentutorials'
});




var app = http.createServer(
	function(request,response){
    var _url = request.url;
		// console.log(_url);						// /?id=HTML

		var queryData = url.parse(_url, true).query;
		// console.log(queryData);					// [Object: null prototype] { id: 'HTML' }
		// console.log(queryData.id);				// HTML

		var pathname = url.parse(_url, true).pathname;

		// 요청path가 정상인 경우
		if(pathname ==='/') {

			// 홈(WEB)
			if(queryData.id === undefined) {

				conn.query(
					`SELECT * FROM topic;`, 
					(err, results, fields) => {
						// console.log(results);					// [ {id: 1, title: 'MySQL', ...}, {id: 2, title: 'ORACLE', ...}, ... ]

						var title = 'Welcome';
						var description = 'Hello, node.js';

						var itemList = template.itemList(results);
						var html = template.html(title, itemList, `<h2>${title}</h2>${description}`, `<a href="/create">Create</a>`);

						response.writeHead(200);
						response.end(html);
					}
				);
			}

			// 그 외(HTML, CSS ,JavaScript)
			else {

				// DB에서 목록의 title 모두 가져오기
				conn.query(
					`SELECT * FROM topic;`, 
					(err1, results, fields) => {
						if(err1) throw err1;
						var itemList = template.itemList(results);		// 모든 topic 테이블의 title 가져오기

						conn.query(
							`SELECT * FROM topic LEFT JOIN author ON topic.author_id=author.id WHERE topic.id=?`, 
							[queryData.id],										// 첫번째 string의 ?자리에 두번째 배열 요소가 치환됨(DB보안)
							(err2, result, fields) => {				// result: 1개 row만 가져오기 ==> 주의: 1개지만 배열에 담겨서 들어온다
								if(err2) throw err2;

								// 만약 그런 id가 없으면 빈 배열 []이 들어온다
								// console.log(result);						// []
								if(result.length === 0) {
									response.writeHead(400);
									response.end("Bad Request");
								}
								// 정상적인 경우라면
								else {
									var title = result[0].title;
									var description = result[0].description;
									var author = result[0].name;

									var html = template.html(title, itemList, 
										`<h2>${title}</h2>
										${description}<p>
										<h4>by ${author}</h4>`, 
										`<a href="/create">Create</a>
										<a href="/update?id=${queryData.id}">Update</a> 
										<form action="/delete_process" method="post" onsubmit="alert('${title}항목을 삭제하시겠습니까?');">
											<input type="hidden" name="id" value="${queryData.id}">
											<input type="submit" value="delete">
										</form>`
									);

									response.writeHead(200);
									response.end(html);
								}
							}
						);	// 2번째 query
					}
				);	// 1번째 query
			}
		}

		// 글쓰기(create)
		else if(pathname === '/create') {

			// item 목록 가져오기
			conn.query(
				`SELECT * FROM topic;`, 
				(err1, results1, fields1) => {
					if(err1) throw err1;

					// 저자(author) 목록 가져오기
					conn.query(
						`SELECT * FROM author;`,
						(err2, results2, fields2) => {
							// console.log(results2);												// [ { id: 1, name: 'egoing', profile: 'Developer' }, {...}, {...} ]

							var title = "Create"
							var itemList = template.itemList(results1);			// 모든 topic 테이블의 title 가져오기
							var authorList = template.authorList(results2);

							var html = template.html(title, itemList,
								`<form action="/create_process" method="post">
									<p>
										<input type="text" name="title" placeholder="title">
									</p>
									<p>
										<textarea name="description" placeholder="description"></textarea>
									</p>
									<p>
										${authorList}
									</p>
									<p>
										<input type="submit">
									</p>
								</form>`,
								`<h3>Create</h3>`
							);
		
							response.writeHead(200);
							response.end(html);
						}
					);
				}
			);
		}

		// 글쓰기 요청을 처리(create_process)
		else if(pathname === '/create_process') {
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
				var title = params.get('title');
				var description = params.get('description');
				var authorId = params.get('author');

				conn.query(
					`INSERT INTO topic(title, description, created, author_id) VALUES(?, ?, NOW(), ?)`,
					[title, description, authorId],
					(err, results, fields) => {
						if(err) throw err;

						// console.log(results);			// INSERT의 결과는 ResultSetHeader 객체가 들어온다. 이 객체의 indertId는 Insert된 row의 ID를 가지고 있다.
						response.writeHead(302, {Location: `/?id=${results.insertId}`});				// 글쓴 목록이 추가되었음을 보여주는 페이지로 redirection (302=임시이동)
						response.end();
					}
				);
			});
		}


		// 수정(update)하기
		else if(pathname === '/update') {

			// 모든 item의 목록
			conn.query(
				`SELECT * FROM topic`,
				(err1, results1, fields1) => {
					if(err1) throw err1;
					var itemList = template.itemList(results1);

					// 수정을 원하는 특정 item 1개
					conn.query(
						'SELECT * FROM topic WHERE id = ?',
						[queryData.id],
						(err2, result2, fields2) => {
							if(err2) throw err2;

							// 만약 DB에 id가 없는 경우 ==> 원래 있던 item인데 Update를 누르기 전에 DB에서 삭제한 경우
							if(result2.length === 0) {
								response.writeHead(400);
								response.end("Bad Request");
							}
							// DB에 정상적으로 id가 있는 경우
							else {

								// 글쓴이 전체 목록
								conn.query(
									`SELECT * FROM author;`,
									(err3, results3, fields3) => {
										if(err3) throw err3;

										var id = result2[0].id;
										var title = result2[0].title;
										var description = result2[0].description;

										var authorId = result2[0].author_id;													// number 타입 (1부터 시작)
										var authorList = template.authorList(results3, authorId);			// result3는 글쓴이 목록

										var html = template.html(title, itemList,
											`
											<form action="/update_process" method="post">
												<p>
													<input type="hidden" name="id" value=${id}>
													<input type="text" name="title" placeholder="title" value=${title}>				<!-- 수정 후 title = title -->
												</p>
												<p>
													<textarea name="description" placeholder="description">${description}</textarea>
												</p>
												<p>
													${authorList}
												</p>
												<p>
													<input type="submit">
												</p>
											</form>
											`, 
											`<a href="/create">Create</a> <a href="/update?id=${result2[0].id}">Update</a>`);
					
										response.writeHead(200);
										response.end(html);
									}
								);
							}
						}
					);
				}
			);
		}

		// 수정 요청 처리하기(update_process)
		else if(pathname === '/update_process') {
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
				var title = params.get('title');
				var description = params.get('description');
				var authorId = params.get('author');
				// console.log(`${id}, ${title}, ${description}`);

				conn.query(
					`UPDATE topic SET title=?, description=?, author_id=? WHERE id=?;`,
					[title, description, authorId, id],
					(err, result, fields) => {
						// console.log(result);
						// 결과값
						// ResultSetHeader {
						// 	fieldCount: 0,
						// 	affectedRows: 1,
						// 	insertId: 0,
						// 	info: 'Rows matched: 1  Changed: 1  Warnings: 0',
						// 	serverStatus: 2,
						// 	warningStatus: 0,
						// 	changedRows: 1
						// }
						
						response.writeHead(302, {Location: `/?id=${id}`});				// 글쓴 목록이 추가되었음을 보여주는 페이지로 redirection (302=임시이동)
						response.end();
					}
				);
			});
		}


		// 삭제 요청 처리하기(delete_process)
		else if(pathname === '/delete_process') {
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
				// var post = qs.parse(body);
				// console.log(post);					//  [Object: null prototype] { title: 'node.js', description: '노드가 짱짱맨' }

				var params = new URLSearchParams(body);
				var id = params.get('id');

				// var filteredId = path.parse(id).base;
				// fs.unlink(`./data/${filteredId}`, function(err){
				// 	response.writeHead(302, {Location: `/`});
				// 	response.end();
				// });

				conn.query(
					`DELETE FROM topic WHERE id=?`,
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
						response.writeHead(302, {Location: '/'});
						response.end();
					}
				);
			});
		}

		// 요청path가 잘못된 경우
		else {
			response.writeHead(404);
			response.end("Not Found");
		}
	}
);

app.listen(3000);