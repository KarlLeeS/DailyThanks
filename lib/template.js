var db = require('./db');
var formidable = require('formidable');
var path = require('path')
var fs =require('fs')


module.exports ={
	search_process : function(querydata,post){
		return new Promise((resolve,reject)=>{
			var q = `select * from thanks where description like "%${post.description}%" ORDER BY created DESC`
			db.query(q,function(err,result){
				console.log(result);
				if(err){
					console.log(`qeurying failed `)
					reject(err); 
				}
				else{
					console.log(`qeurying success `)
					var str = ``; 
					var res =``; 
					for(let i = 0 ; i<result.length ;i++){
						str += `<a href="/mypage?realid=${querydata.realid}&reqid=${result[i].userid}"><p><img src="${result[i].image_path}" alt=""><div class="desc"><div class="thank">${result[i].description}</div></div></p></a>`
					}
					var res = `
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta http-equiv="x-ua-compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width,initial-scale=1.0">
	<title>main page</title>
	<meta name="description" href="display all ot the contents that contain user thanks list">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<link rel="icon" href="./favicon.ico" type="image/x-icon">
	<title>Document</title>
	<link rel="stylesheet" type="text/css" href="/css/main.css">
</head>
<body>
	<div id="wrap" class="active">
		<header id="header">
			<h1 class="title">하루감사</h1>
			<span onclick="showSearch()"><span class="search"></span></span>
			<div id="search_input" class="blind">
				<form action="/search_process?realid=${querydata.realid}" method="POST">
						<input id="search_input_text" name="description" type="text" 
						placeholder="Search">
						<label id="search_submit" for="search_input_submit"></label> 
						<input  class="blind" type="submit" id="search_input_submit" value="검색!">
				</form>
			</div>
			
		</header>
		<div id="container">
			<section id="banner">
				<img src="img/baanner.png" alt="">
			</section>
			<section id="content">
				${str}
			</section>

		</div>
		<div id="menu">
			<a href="/main?realid=${querydata.realid}">
					<span class="icon icon-library"></span>
				</a>
			<a href="/write?realid=${querydata.realid}"><span class="icon icon-write"></span></a>
			<a href="/mypage?realid=${querydata.realid}&reqid=${querydata.realid}"><span class="icon icon-mypage"></span></a>
		</div>
	</div>
	<script>
		function showSearch(){
			document.getElementById('search_input').className = 'active'
		}
	</script>
</body>
</html>
					`
					resolve(res);
				}
			})
		})
	}
	,mypage_edit_process : function(req,querydata){
		return new Promise((resolve,reject)=>{
			const form = new formidable.IncomingForm(); 
			form.parse(req,(err,fields,files)=>{
				if(err){
					console.log(err);
				}
				var oldPath = files.multipleFiles.path;
				console.log(files.multipleFiles);
				var newPath = path.join(__dirname,"../img")+"/"+Date.now()+files.multipleFiles.name; 
				var rawData = fs.readFileSync(oldPath); 
				fs.writeFile(newPath,rawData,function(err){
					if(err) throw err; 
					else{
						console.log(11);
						console.log(querydata.reqid);
						var str = "img" + newPath.split('img')[1]; 
						var q = `UPDATE user SET description='${fields.title}', profilepath='${str}' WHERE userid='${querydata.reqid}'`; 
						db.query(q,function(err2,res){
							
							if(err2) return reject(err); 
							return resolve(res); 
						})
					}
				})
			})
		})
	}
	,write_process:function(req,querydata){
		return new Promise((resolve,reject)=>{
			const form = new formidable.IncomingForm(); 
			form.parse(req,(err,fields,files)=>{
				if(err) {
					console.log(err);
				}
				var oldPath = files.multipleFiles.path;
				var newPath = path.join(__dirname,'../img')+"/"+files.multipleFiles.name; 
				var rawData = fs.readFileSync(oldPath); 
				fs.writeFile(newPath,rawData,function(err){
					if(err){
						throw err;
					}
					else{
						var str = "img"+newPath.split('img')[1]; 
						console.log(str);
						var q = `INSERT INTO thanks VALUES ('${querydata.realid}','${fields.title}','${str}',NOW())`;
						console.log({q});
						db.query(q,function(err2,result){
							if(err2) return reject(err);  
							return resolve(result);
						})
					}
					
				})
			})
		})
	}
	,write: function(querydata){
		var id = querydata.realid;
		return `
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta http-equiv="x-ua-compatible" content="IE=edge">
				<meta name="viewport" content="width=device-width,initial-scale=1.0">
				<title>main page</title>
				<meta name="description" href="display all ot the contents that contain user thanks list">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link rel="icon" href="favicon.ico" type="image/x-icon">
				<title>Document</title>
				<link rel="stylesheet" type="text/css" href="css/page_edit.css">
			</head>
			<body>
				<div id="write" class="active">
					<header id="write_header">
						<a href="/main?realid=${id}" class="write_cancle">
							<span class="cancle"></span>
						</a>
					</header>
					<div id="container">
						<form action="/write_process?realid=${id}" method="POST" enctype="multipart/form-data">
							<input type="text" name="realid" id="realid" value="${id}" style="display:none">
							<p id="textarea">
								<textarea name="title"  cols="10" rows="3" wrap="hard" maxlength="40" autofocus="autofocus" 
								placeholder="감사로 하루를&#10;표현해주세요.&#10;하루감사 : - )"></textarea>
							</p>
							<div class="filebox">
								<label for="multipleFiles">
									<div class="file_inner">
										<div class="onemore">
											<img src="img/photo.png" alt="">
											<p>감사책 표지 이미지를 넣어주세요.</p>
										</div>
									</div>
								</label>
								<input type="file" id="multipleFiles" name="multipleFiles" multiple="multiple">
							</div>
							<label for="submit"><span class="submit"></span></label>
							<input type="submit" id="submit" value="Upload">
						</form>
					</div>
				</div>
			</body>
			</html>
		`
	}
	,mypage : function(querydata){
		
		return new Promise((resolve,reject)=>{ 
			var id =querydata.realid; 
			var reqid = querydata.reqid===undefined ? undefined : querydata.reqid;
			let str = ``;
			var q =   `select * from thanks WHERE userid='${reqid}' ORDER BY created DESC`
			
			console.log(id, q);
			db.query('select * from user where userid=?',[reqid],function(err1,user){
				if(err1) throw err1 ; 
				var requser = user ;
				db.query(q,function(err,result){
					if(err){
						reject(err);
					} 
					else{
						for(let i = 0 ; i <result.length; i++){
							imagepath = result[i].image_path; 
							// console.log({imagepath}); 
				
							
							str +=
							`<a href="/mypage?realid=${id}&reqid=${result[i].userid}"><p><img src="${imagepath}" alt=""><div class="desc"><div class="thank">${result[i].description}</div></div></p></a>`
						}
						var res = `
						<!DOCTYPE html>
						<html lang="en">

						<head>
							<meta charset="UTF-8">
							<meta name="viewport" content="width=device-width, initial-scale=1.0">
							<title>Document</title>
						</head>
						<link rel="stylesheet" type="text/css" href="css/mypage.css">

						<body>
							<div id="wrap">
								<header id="header">
									<div class="header_cancel"><a href="/main?realid=${id}"><span class="cancle"></span></a></div>
									<div class="header_title">
										<h1 class="author_name">글쓴이의 하루감사</h1>
									</div>
								</header>
								<div id="container">
									<div id="profile">
										<div class="profile_pic">
											<a href="/mypage_edit?realid=${id}&reqid=${reqid}"><img src="${requser[0].profilepath}" alt=""></a>

										</div>
										<div class="profile_desc">
											<h2 class="author_name">${requser[0].userid}</h2>
											<p class="author_content">${requser[0].description}</p>
										</div>
									</div>
									<div id="content">
										${str}
									</div>
								</div>
								<div id="menu">
									<a href="/main?realid=${id}">
										<div>
											<span class="icon icon-library"></span>
										</div>
									</a>
									<a href="/write?realid=${id}"><span class="icon icon-write"></span></a>
									<a href="/mypage?realid=${id}&reqid=${id}"><span class="icon icon-mypage"></span></a>
								</div>
							</div>
						</body>
						</html>
						`
						resolve(res);
					} 
					// str = `<a href="#"><p><img src="img/gifts.jpg" alt=""><div class="desc"><div class="thank">힘들다고 생각할 수 있지만 오히려 성장한 하루. 하루하루 발전하고 개선할 수 있음에 감사하다. </div></div></p></a>` 		
				});	 
			})
		});	 
	}
	,mypage_edit: function(querydata){
		var id = querydata.realid;
		var reqid= querydata.reqid;
		
		return `
		<!DOCTYPE html>
		<html lang="en">
		<head>
		<meta charset="UTF-8">
		<meta http-equiv="x-ua-compatible" content="IE=edge">
		<meta name="viewport" content="width=device-width,initial-scale=1.0">
		<title>main page</title>
		<meta name="description" href="display all ot the contents that contain user thanks list">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<link rel="icon" href="favicon.ico" type="image/x-icon">
		<title>Document</title>
		<link rel="stylesheet" text="text/css" href="css/page_edit.css">
		</head>
			<body>

				<div id="write" class="active">
					
					<header id="write_header">
						
						<a href="/main?realid=${id}" class="write_cancle">
							<span class="cancle"></span>
						</a>
					</header>


					<div id="container">
						<form action="/mypage_edit_process?realid=${id}&reqid=${reqid}" method="POST" enctype="multipart/form-data">
							<input type="text" name="realid" id="realid" value="${id}" style="display:none">
							<p id="textarea">
								<textarea name="title"  cols="10" rows="3" wrap="hard" maxlength="48" autofocus="autofocus" 
								placeholder="당신을&#10;소개해&#10;주세요 :)"></textarea>
							</p>
							<div class="filebox">
								<label for="multipleFiles">
									<div class="file_inner">
										<div class="onemore">
											<img src="img/photo.png" alt="">
											<p>프로필 사진을 넣어주세요.</p>
										</div>
									</div>
								</label>
								<input type="file" id="multipleFiles" name="multipleFiles" multiple="multiple">
							</div>
							<label for="submit"><span class="submit"></span></label>
							<input type="submit" id="submit" value="Upload">
						</form>

					</div>

				</div>

			</body>	
		</html>
		`
	}
	,main : function(querydata){
		return new Promise((resolve,reject)=>{ 
		var id =querydata.realid; 
		let str = ``;
		var q = ``;
		q= `select * from thanks ORDER BY created DESC`; 
		console.log(id, q);
		db.query(q,function(err,result){
			if(err){
				reject(err);
			} 
			else{
				for(let i = 0 ; i <result.length; i++){
					imagepath = result[i].image_path; 
					str +=
					`<a href="/mypage?realid=${id}&reqid=${result[i].userid}"><p><img src="${imagepath}" alt=""><div class="desc"><div class="thank">${result[i].description}</div></div></p></a>`
				}
				var res = `
				
				<!DOCTYPE html>
				<html lang="en">
				<head>
					<meta charset="UTF-8">
					<meta http-equiv="x-ua-compatible" content="IE=edge">
					<meta name="viewport" content="width=device-width,initial-scale=1.0">
					<title>main page</title>
					<meta name="description" href="display all ot the contents that contain user thanks list">
					<meta name="viewport" content="width=device-width, initial-scale=1.0">
					<link rel="icon" href="./favicon.ico" type="image/x-icon">
					<title>Document</title>
					<link rel="stylesheet" type="text/css" href="/css/main.css">
				</head>
				<body>
					<div id="wrap" class="active">
						<header id="header">
							<h1 class="title">하루감사</h1>
							<span onclick="showSearch()"><span class="search"></span></span>
							<div id="search_input" class="blind">
								<form action="/search_process?realid=${querydata.realid}" method="POST">
										<input id="search_input_text" name="description" type="text" 
										placeholder="Search">
										<label id="search_submit" for="search_input_submit"></label> 
										<input  class="blind" type="submit" id="search_input_submit" value="검색!">
								</form>
							</div>
							
						</header>
						<div id="container">
							<section id="banner">
								<img src="img/baanner.png" alt="">
							</section>
							<section id="content">
								${str}
							</section>

						</div>
						<div id="menu">
							<a href="/main?realid=${querydata.realid}">
									<span class="icon icon-library"></span>
								</a>
							<a href="/write?realid=${querydata.realid}"><span class="icon icon-write"></span></a>
							<a href="/mypage?realid=${querydata.realid}&reqid=${querydata.realid}"><span class="icon icon-mypage"></span></a>
						</div>
					</div>
					<script>
						function showSearch(){
							document.getElementById('search_input').className = 'active'
						}
					</script>
				</body>
				</html>
					
				`
				resolve(res);
			} 
		});	 
	});	 
	}, 
	login:`
	<!DOCTYPE html>
	<html lang="en">
	<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Document</title>
	<link rel="stylesheet" type="text/css" href="css/login.css">
	</head>
	<body>
	<div id="wrap">
		<div id="header">
			<h1>하루감사</h1>
		</div>
		<div id="login" class="active" >
			<form action="/login_process" method="POST">
				<p>
					<input class="form" type="text" name="id" placeholder="ID">
				</p>
				<p>
					<input class="form" type="password" name="password" placeholder="Password">
				</p>
				<p>
					<input  class="submit" type="submit" value="Login">
				</p>
				 
			</form>
			<p id="func_list" >
				<a class="func" href="#" onclick="signup()">Sign up</a>
				<a class="func" href="#" onclick="findid()">Find ID</a>
				<a class="func" href="#" onclick="findpw()">Find PW</a>
			</p>
		</div>
	
		<div id="signup" class="blind">
			<form action="/login_signup_process" method="POST">
				<p>
					<input class="form"  type="text" name="id" placeholder="ID">
				</p>
				<p>
					<input class="form"  type="email" name="email" placeholder="Email">
				</p>
				<p>
					<input class="form"  type="password" name="password" placeholder="Password">
				</p>
				<p>
					<input class="submit"  type="submit" value="회원가입 하기" onclick=""
					>
				</p>
				<p>
					<input class="submit"  type="button" value="뒤로가기" onclick="backToMain()">
				</p>
			</form>
		</div>
	
		<div id="findid" class="blind">
			<form action="/login_findid_process" method="POST">
				<p>
					<input class="form"  type="email" name="email" placeholder="Email">
				</p>
				<p>
					<input  class="submit" type="submit" value="아이디 찾기" onclick="">
				</p>
				<p>
					<input class="submit"  type="button" value="뒤로가기" onclick="backToMain()">
				</p>
			</form>
		</div>
	
		<div id="findpw" class="blind">
			<form action="/login_findpw_process" method="POST">
				<p>
					<input class="form" class="formval" type="text" name="id" placeholder="ID">
				</p>
				<p>
					<input class="form" class="formval" type="email" name="email" placeholder="Email">
				</p>
				<p>
					<input class="submit" type="submit" value="비밀번호 찾기" onclick="">
				</p>
				<p>
					<input class="submit"  type="button" value="뒤로가기" onclick="backToMain()">
				</p>
			</form>
		</div>
	
	</div>
	
	<script>
	
		function backToMain(){
			document.getElementById("signup").className='blind';
			document.getElementById("findpw").className='blind';
			document.getElementById("findid").className='blind';
			document.getElementById("login").className='active';
		}
		function signup() {
			document.getElementById("findid").className='blind';
			document.getElementById("findpw").className='blind';
			document.getElementById("login").className='blind';
			var element = document.getElementById("signup"); 
			console.log(element.className)
			if(element.className ==='blind'){
				element.className = "active";
			}else{
				element.className = "blind";
			}
			return true;
		}
	
		function findid() {
			document.getElementById("signup").className='blind';
			document.getElementById("findpw").className='blind';
			document.getElementById("login").className='blind';
			var element = document.getElementById("findid");
			if(element.className ==='blind'){
				element.className = "active";
			}else{
				element.className = "blind";
			}
			return true; 
		}
	
		function findpw() {
			document.getElementById("signup").className='blind';
			document.getElementById("findid").className='blind';
			document.getElementById("login").className='blind';
			var element = document.getElementById("findpw");
			if(element.className ==='blind'){
				element.className = "active";
			}else{
				element.className = "blind";
			}
			return true;
		}
	
	</script>
	</body>
	</html>
	`,
	index : `
	<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta http-equiv="refresh" content="1.5; url=/login">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Document</title>
	<style>
		@import url('https://fonts.googleapis.com/css2?family=Nanum+Brush+Script&display=swap');
		@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@100&display=swap');

		h1{
			position: relative;
			width: 30%;
			margin: 0 auto;
			margin-top:50%;
			border: 10px solid #72afc1;
			font-weight: normal;
			text-align: center;
			border-radius: 4px;
			padding : 6px 0;
		font-family: 'Noto Sans KR', sans-serif;
			line-height: normal;
			font-size: 1.7em;
		}
		p{
			text-align: center;
			font-family: "Helvetica Neue", Helvetica, sans-serif;
			letter-spacing: 4px;
		}

	</style>
</head>
<body>
	<h1>하루<br>감사</h1>
	<p>DAILYTHANKS</p>
</body>
</html>
	`
};