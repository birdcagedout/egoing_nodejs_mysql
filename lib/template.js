// 모듈로 분리


var template = {
	// 전체 html파일의 뼈대
	html: function (title, itemList, body, control) {
		return `
		<!doctype html>
		<html>
		<head>
			<title>WEB - ${title}</title>
			<meta charset="utf-8">
		</head>
		<body>
			<h1><a href="/">WEB</a></h1>
			<a href="/author">Author</a>
			${itemList}
			${control}
			${body}
		</body>
		</html>`;
	},

	// item 리스트
	itemList: function (dbResults) {
		var list = '<ul>';
		var i = 0;
		while(i < dbResults.length) {
			list += `<li><a href="/?id=${dbResults[i].id}">${dbResults[i].title}</a></li>`;
			i++;
		}
		list += '</ul>';
		return list;
	},

	// author list (콤보박스)
	authorList: function(dbResults, selected=-1) {
		var list = '<select name="author">';
		for(let i = 0; i < dbResults.length; i++) {
			if(dbResults[i].id === selected) {
				list += `<option value="${dbResults[i].id}" selected>${dbResults[i].name}</option>`;
			} else {
				list += `<option value="${dbResults[i].id}">${dbResults[i].name}</option>`;
			}
		}
		list += `</select>`;
		return list;
	},

	// Author 테이블
	authorTable: function(dbResults) {
		var authorTable = `
			<style>
				table {
					margin: 15px 0 30px 0;
					width: 500px;
					border: 1px solid black;
					border-collapse: collapse;
				}
				th {
					padding: 5px;
					height: 30px;
					border: 1px solid black;
				}
				td {
					height: 30px;
					padding: 5px;
					border: 1px solid black;
				}
			</style>

			<table>
			<tr>
				<th>Name</th>
				<th>Profile</th>
				<th>Update</th>
				<th>Delete</th>
			</tr>`;

		for(let i=0; i < dbResults.length; i++) {
			authorTable += `
			<tr>
				<td>${dbResults[i].name}</td>
				<td>${dbResults[i].profile}</td>
				<td><a href="/author/update?id=${dbResults[i].id}">Update</a></td>

				<td>
				<form action="/author/delete_process" method="post">
					<input type="hidden" name="id" value=${dbResults[i].id}>
					<input type="submit" value="Delete">
				</form>
				</td>
			</tr>`;
		}
		authorTable += `</table>`;

		return authorTable;
	}
	
};


module.exports = template;		// 외부에서 사용하도록