// 在 Cloud code 里初始化 Express 框架
var express = require('express');
var app = express();
var crypto = require('crypto');
var md5 = crypto.createHash('md5');

var myLog=require('cloud/mylog.js');
var myUser=require('cloud/myuser.js');
var myUtil=require('cloud/myutil.js');

var currentUser = AV.User.current();

// App 全局配置
app.set('views','cloud/views');   // 设置模板目录
app.set('view engine', 'ejs');    // 设置 template 引擎
app.use(express.bodyParser());    // 读取请求 body 的中间件

var AddressAuthenticationCode = AV.Object.extend("AddressAuthenticationCode")


// 使用 Express 路由 API 服务 /hello 的 HTTP GET 请求
app.get('/hello', function(req, res) {
  res.render('hello', { message: 'Congrats, you just set up your app!' });
});

// 最后，必须有这行代码来使 express 响应 HTTP 请求
app.listen();