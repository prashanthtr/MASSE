
const express = require('express')
var app = express();
var http = require('http').Server(app);

var kport = process.argv[2] || 3002;

var m_useRoot="/www";
app.use(express.static(__dirname + m_useRoot));

// app.get('/', function(req, res){
//     res.sendFile(__dirname + '/www/index.html');
// });

http.listen(kport, function(){
    console.log('listening on *:' + kport);
});
