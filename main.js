var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var path = require('path');
var template = require('./lib/template')
var db = require('./lib/db')
var path = require('path');
var formidable = require('formidable')

var app = http.createServer(function (request, response) {
	var _url = request.url;
	var queryData = url.parse(_url, true).query;
	var pathname = url.parse(_url, true).pathname;

	const mimeType = {
		'.ico': 'image/x-icon',
		'.html': 'text/html',
		'.js': 'text/javascript',
		'.css': 'text/css',
		'.svg': 'image/svg+xml',
		'.png': 'image/png',
		'.jpg': 'image/jpeg',
		'.eot': 'application/vnd.ms-fontobject',
		'.ttf': 'application/font-sfnt',
	}
	const ext = path.parse(request.url).ext;
	const publicPath = path.join(__dirname, "/");
	if (Object.keys(mimeType).includes(ext)) {
		fs.readFile(`${publicPath}${request.url}`, (err, data) => {
			if (err) {
				response.statusCode = 404;
				response.end('Not Found');
			}
			else {
				response.statusCode = 200;
				response.setHeader('Content-Type', mimeType[ext]);
				response.end(data);
			}
		})
	}
	else {

		if (pathname === '/') {
			response.writeHead(200);
			response.end(template.index)
		}
		else if (pathname === '/login') {
			response.writeHead(200);
			response.end(template.login)
		}
		else if (pathname === '/login_process'||pathname === '/login_signup_process'||pathname === '/login_findid_process'||pathname === '/login_findpw_process'){
			// 로그인하기 , 회원가입하기, 아이디 찾기, 비밀번호 찾기 

			var body = '';
			request.on('data', function (data) {
				body += data;
			})
			request.on('end', function () {
				var post = qs.parse(body);

				switch(pathname){
					
					case '/login_process':
						// 로그인 
						db.query(`select * from user where (userid=? AND password=?)`, [post.id, post.password], function (err, result) {
							if (err || result.length === 0) {
								response.writeHead(200);
								response.end(template.login + "<script>alert('회원정보가 틀렸거나 없습니다.')</script>");
							}
							else {
								response.writeHead(302,{Location : `/main?realid=${post.id}`});
								response.end();
							}
						})
						break; 

					case '/login_signup_process':
						// 회원가입
						db.query(`select * from user where userid=?`, [post.id], function (err, result) {
							if (err) throw err;
							if (result.length !== 0) {
								response.writeHead(200);
								response.end(template.login + `<script>alert('이미 존재하는 아이디입니다.')</script>`)
							}
							else {
								var description = "당신을 소개해주세요"; 
								var profilepath = "img/default_person.png";
								db.query(`insert into user values ('${post.id}','${post.password}','${post.email}','${profilepath}','${description}')`, function (err2, result) {
									if (err2) throw err2;
									response.writeHead(200);
									response.end(template.login + `<script>alert('회원가입에 성공했습니다.')</script>`)
								})
							}
						})
						break; 

					case '/login_findid_process':
						// 아이디 찾기
						db.query(`select * from user where email=?`, [post.email], function (err, result) {
							if (err) throw err;
							if (result.length === 0) {
								response.writeHead(200);
								response.end(template.login + `<script>alert('아이디가 존재하지 않습니다.')</script>`)
							}
							else {
								response.writeHead(200);
								response.end(template.login + `<script>alert('아이디는 ${result[0].userid} 입니다.')</script>`)
							}
						})
						break; 

					case '/login_findpw_process': 
						// 비밀번호 찾기 
						db.query(`select * from user where (userid=? AND email=?)`, [post.id, post.email], function (err, result) {
							if (err) throw err;
							if (result.length === 0) {
								response.writeHead(200);
								response.end(template.login + `<script>alert('아이디가 없거나, 정보가 틀렸습니다.')</script>`)
							}
							else {
								response.writeHead(200);
								response.end(template.login + `<script>alert('비밀번호는 ${result[0].password} 입니다.')</script>`)
							}
						})
						break;
				}
			})
		}

		else if (pathname === '/main') {
			// 메인페이지 받기 
			template.main(queryData)
			.then((data)=>{
				response.writeHead(200);
				response.end(data);
			})
			.catch((err)=>{
				return response.end('error ㅅㄱ');
			})
		}

		else if (pathname === '/search_process') {
			// 메인페이지에서 검색하기 

			var body =``;
			request.on('data', function (data) {
				body += data;
			});
			request.on('end', function () {
				var post = qs.parse(body);
				template.search_process(queryData,post)
				.then((data)=>{
					response.writeHead(200);
					response.end(data);
				})
				.catch((err)=>{
					template.main(queryData)
					.then((data)=>{
						response.writeHead(200);
						response.end(data+`<script>alert('검색 결과가 없습니다')</script>`);
					})
					.catch((err)=>{
						return response.end('error ㅅㄱ');
					})
				})
			})
		}
		else if (pathname === '/write') {
			// 글쓰기 페이지 받기
			response.statusCode=200;
			response.end(template.write(queryData));
		}
		else if (pathname === '/write_process') {
			// 글쓰기 처리 
			template.write_process(request,queryData)
			.then((data)=>{
				response.writeHead(302,{Location : `/main?realid=${queryData.realid}`});
				response.end();
			})
			.catch((err)=>{
				response.writeHead(404);
				return response.end('글쓰기를 실패하였습니다.');
			})
		}
		
		else if (pathname === '/mypage') {
			// 개인 감사페이지로 이동 
			template.mypage(queryData)
			.then((data)=>{
				response.writeHead(200);
				response.end(data);
			})
			.catch((err)=>{
				response.writeHead(404); 
				return response.end('페이지로 이동할 수 없습니다.');
			})
		}
		else if (pathname === '/mypage_edit') {
			if(queryData.realid!==queryData.reqid){
				response.statusCode=200;
				template.main(queryData).then(res=>{

					response.end(res+"<script>alert('권한이 없습니다')</script>");
				})
			}else{
				response.statusCode=200;
				response.end(template.mypage_edit(queryData));
			}
		}
		else if (pathname === '/mypage_edit_process') {
			template.mypage_edit_process(request,queryData)
			.then((data)=>{
				response.writeHead(302,{Location : `/main?realid=${queryData.realid}`});
				response.end();
			})
			.catch((err)=>{
				return response.end('페이지를 수정할 수 없습니다.');
			})
		}
		else {
			response.writeHead(404);
			response.end("Page Not Found Sorry :( ")
		}
	}

});

app.listen(process.env.PORT||8080);