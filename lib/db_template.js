var mysql = require('mysql')
var db = mysql.createConnection({
	host:'xxxxxx', 
	user:'xxxxxx',
	password:'xxxxxx',
	database:'xxxxxx'
})

module.exports =db; 