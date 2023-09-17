// 생활코딩(egoing)님의 node.js + mysql 강의
// 
// 블로그: https://opentutorials.org/module/3560
// 유튜브: https://www.youtube.com/playlist?list=PLuHgQVnccGMAicFFRh8vFFFtLLlNojWUh


const http = require('http');
const url = require('url');

// HTML template 모듈로 분리
const template = require('./lib/template.js');

// topic 모듈로 분리
const topic = require('./lib/topic.js')

// mysql2, connection을 모듈로 분리 + connection 객체만 exports
const db = require('./lib/db.js');
const path = require('path');

// Author 관련 모듈
const author = require('./lib/author.js');




var app = http.createServer(
	function(request,response){
    var _url = request.url;							// _url: '/?id=1'
		var queryData = url.parse(_url, true).query;	// queryData: { id: 1 }, queryData.id: 1
		var pathname = url.parse(_url, true).pathname;

		// 요청path '/'
		if(pathname ==='/') {

			// 홈(WEB)
			if(queryData.id === undefined) {
				topic.home(request, response);
			}

			// 그 외(HTML, CSS ,JavaScript)
			else {
				topic.page(request, response, queryData.id);
			}
		}

		// 글쓰기(create)
		else if(pathname === '/create') {
			topic.create(request, response);
		}

		// 글쓰기 처리(create_process)
		else if(pathname === '/create_process') {
			topic.create_process(request, response);
		}

		// 수정(update)
		else if(pathname === '/update') {
			topic.update(request, response, queryData.id);
		}

		// 수정 처리(update_process)
		else if(pathname === '/update_process') {
			topic.update_process(request, response);
		}

		// 삭제 요청 처리(delete_process)
		else if(pathname === '/delete_process') {
			topic.delete_process(request, response);
		}


		// Author - Home
		else if(pathname === '/author') {
			author.home(request, response);
		}

		// Author - Create 처리(create_process)
		else if(pathname === '/author/create_process') {
			author.create_process(request, response);
		}

		// Author - Update(update)
		else if(pathname === '/author/update') {
			author.update(request, response, queryData.id);
		}

		// Author - Update 처리(update_process)
		else if(pathname === '/author/update_process') {
			author.update_process(request, response);
		}

		// Author - Delete 처리(delete_process)
		else if(pathname === '/author/delete_process') {
			author.delete_process(request, response, queryData.id);
		}


		// 요청path가 잘못된 경우
		else {
			response.writeHead(404);
			response.end("Not Found");
		}
	}
);

app.listen(3000);