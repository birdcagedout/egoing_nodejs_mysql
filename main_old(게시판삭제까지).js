// 생활코딩(egoing)님의 nodejs 강의: node.js 기초
// 
// 블로그: https://opentutorials.org/module/3549/21032
// 유튜브: https://www.youtube.com/playlist?list=PLuHgQVnccGMA9QQX5wqj6ThK7t2tsGxjm
//
// pm2 사용법: https://www.youtube.com/watch?v=KzjTCREOIkk&list=PLuHgQVnccGMA9QQX5wqj6ThK7t2tsGxjm&index=39
// 설치: npm install pm2 -g
// 실행: pm2 start main.js --watch
// 정지: pm2 stop main(id)
// 목록: pm2 list
// 모니터링: pm2 monit (나갈 때는 q)
// 내부관찰: pm2 log (나갈 때는 Ctrl + C)


var http = require('http');
var fs = require('fs');
var url = require('url');
const path = require('path');
var qs = require('querystring');


var template = {
	html: function (title, list, body, control) {
		return `
		<!doctype html>
		<html>
		<head>
			<title>WEB - ${title}</title>
			<meta charset="utf-8">
		</head>
		<body>
			<h1><a href="/">WEB</a></h1>
			${list}
			${control}
			${body}
		</body>
		</html>`;
	},

	list: function (fileList) {
		var list = '<ul>';
		var i = 0;
		while(i < fileList.length) {
			list += `<li><a href="/?id=${fileList[i]}">${fileList[i]}</a></li>`;
			i++;
		}
		list += '</ul>';
		return list;
	}
};




var app = http.createServer(
	function(request,response){
    var _url = request.url;
		// console.log(_url);						// /?id=HTML

		var queryData = url.parse(_url, true).query;
		// console.log(queryData);					// [Object: null prototype] { id: 'HTML' }
		// console.log(queryData.id);				// HTML

		// console.log(url.parse(_url, true));
		// 만약 http://localhost:3000 라고 입력했다면 (맨 뒤에 /는 자동으로 붙어서)
		// Url {
		// 	protocol: null,
		// 	slashes: null,
		// 	auth: null,
		// 	host: null,
		// 	port: null,
		// 	hostname: null,
		// 	hash: null,
		// 	search: null,
		// 	query: [Object: null prototype] {},					// 이 경우 queryData.id === undefined
		// 	pathname: '/',
		// 	path: '/',
		// 	href: '/'
		// }

		// 만약 http://localhost:3000/?id=HTML 라고 입력했다면
		// Url {
		// 	...
		// 	search: '?id=HTML',
		// 	query: [Object: null prototype] { id: 'HTML' },
		// 	pathname: '/',
		// 	path: '/?id=HTML',
		// 	href: '/?id=HTML'
		// }

		// 만약 http://localhost:3000/api/user?id=HTML 라고 입력했다면
		// Url {
		// 	...
		// 	search: '?id=HTML',
		// 	query: [Object: null prototype] { id: 'HTML' },
		// 	pathname: '/api/user',
		// 	path: '/api/user?id=HTML',
		// 	href: '/api/user?id=HTML'
		// }

		var pathname = url.parse(_url, true).pathname;

		// 요청path가 정상인 경우
		if(pathname ==='/') {

			// 홈(WEB)
			if(queryData.id === undefined) {
				fs.readdir('data', function(err, fileList) {
					// console.log(fileList);					// [ 'CSS', 'HTML', 'JavaScript' ]
					var title = 'Welcome';
					var description = 'Hello, node.js';
	
					var list = template.list(fileList);
					var html = template.html(title, list, `<h2>${title}</h2>${description}`, `<a href="/create">create</a>`);
		
					response.writeHead(200);
					response.end(html);
				});
			}

			// 그 외(HTML, CSS ,JavaScript)
			else {
				fs.readdir('data', function(err, fileList) {
					// console.log(fileList);					// [ 'CSS', 'HTML', 'JavaScript' ]

					fs.readFile(`./data/${queryData.id}`, 'utf-8', function(err, description) {
						var title = queryData.id;
						
						var list = template.list(fileList);
						var html = template.html(title, list, 
							`<h2>${title}</h2>${description}`, 
							`<a href="/create">CREATE</a> 
							<a href="/update?id=${title}">UPDATE</a> 
							<form action="/delete_process" method="post" onsubmit="alert('${title}항목을 삭제하시겠습니까?');">
								<input type="hidden" name="id" value="${title}">
								<input type="submit" value="delete">
							</form`);															// delete를 GET방식으로 링크를 드러내서는 안 되므로 POST방식으로 하기 위해 form 사용

						response.writeHead(200);
						response.end(html);
					});
				});
			}
		}

		// 글쓰기(create)
		else if(pathname === '/create') {
			fs.readdir('data', function(err, fileList) {
				// console.log(fileList);					// [ 'CSS', 'HTML', 'JavaScript' ]
				var title = 'WEB - create';

				var list = template.list(fileList);
				var html = template.html(title, list, `
					<form action="/create_process" method="post">
						<p>
							<input type="text" name="title" placeholder="title">
						</p>
						<p>
							<textarea name="description" placeholder="description"></textarea>
						</p>
						<p>
							<input type="submit">
						</p>
					</form>
				`, '');
	
				response.writeHead(200);
				response.end(html);
			});
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
				var post = qs.parse(body);
				// console.log(post);					//  [Object: null prototype] { title: 'node.js', description: '노드가 짱짱맨' }

				var title = post.title;
				var description = post.description;
				fs.writeFile(`./data/${title}`, description, 'utf-8', function(err) {
					if(err) throw err;

					response.writeHead(302, {Location: `/?id=${title}`});				// 글쓴 목록이 추가되었음을 보여주는 페이지로 redirection (301=영구이동, 302=임시이동)
					response.end();																							// title이 한글일 때는 Location: `/?id=${encodeURI(title)}
				});

			});
		}

		// 수정(update)하기
		else if(pathname === '/update') {
			fs.readdir('data', function(err, fileList) {
				// console.log(fileList);					// [ 'CSS', 'HTML', 'JavaScript' ]

				fs.readFile(`./data/${queryData.id}`, 'utf-8', function(err, description) {
					var title = queryData.id;
					
					var list = template.list(fileList);
					var html = template.html(title, list,
						`
						<form action="/update_process" method="post">
						<p>
							<input type="hidden" name="id" value=${title}>															<!-- 수정 전 원래 title = id -->
							<input type="text" name="title" placeholder="title" value=${title}>					<!-- 수정 후 title = title -->
						</p>
						<p>
							<textarea name="description" placeholder="description">${description}</textarea>
						</p>
						<p>
							<input type="submit">
						</p>
					</form>
						`, 
						`<a href="/create">create</a> <a href="/update?id=${title}">update</a>`);

					response.writeHead(200);
					response.end(html);
				});
			});
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
				var post = qs.parse(body);
				// console.log(post);					//  [Object: null prototype] { title: 'node.js', description: '노드가 짱짱맨' }

				var id = post.id;
				var title = post.title;
				var description = post.description;
				// console.log(post);

				/*
				// 일단 파일을 쓰고
				fs.writeFile(`./data/${title}`, description, 'utf-8', function(err) {
					if(err) throw err;

					response.writeHead(302, {Location: `/?id=${title}`});
					response.end();
				});

				// id와 title이 다르다면 id(예전 title)로 된 파일을 지워준다
				if(id !== title) {
					fs.rm(`./data/${id}`, function(err) {
						if(err) throw err;
					});						
				}
				*/

				fs.rename(`data/${id}`, `data/${title}`, function(error){
					if(error) throw error;
					fs.writeFile(`data/${title}`, description, 'utf8', function(err){
						if(err) throw err;
						response.writeHead(302, {Location: `/?id=${title}`});
						response.end();
					})
				});
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
				var post = qs.parse(body);
				// console.log(post);					//  [Object: null prototype] { title: 'node.js', description: '노드가 짱짱맨' }

				var id = post.id;
				fs.unlink(`./data/${id}`, function(err){
					response.writeHead(302, {Location: `/`});
					response.end();
				});
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