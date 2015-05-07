// 在 Cloud code 里初始化 Express 框架
var express = require('express');
var app = express();
var crypto = require('crypto');
var md5 = crypto.createHash('md5');
var password = md5.update(‘abcdefg’).digest(‘base64’);

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

app.get('/generateAddressAuthenticationCode', function(req, res) {
	var address = req.address;
	var neighbourhood;
	
	var query = new AV.Query(AddressAuthenticationCode);
	if(req.neighbourhood_id){
    	var neighbourhood_id = req.neighbourhood_id;
    	query.equalTo("neighbourhood_id", neighbourhood_id);
    	query.first({
		  success: function(object) {
			neighbourhood = object
		  },
		  error: function(error) {
			alert("Error: " + error.code + " " + error.message);
		  }
		});
    }else{
    	neighbourhood = null
    }
    
    var codeId;
    AV.Query.doCloudQuery('select max(id) as id from AddressAuthenticationCode', {
	  success: function(result){
		//results 是查询返回的结果，AV.Object 列表
		var results = result.results;
		codeId = results[0].id
		//do something with results...
	  },
	  error: function(error){
		//查询失败，查看 error
		console.dir(error);
	  }
	});
	var addressAuthenticationCode = new AddressAuthenticationCode()
	addressAuthenticationCode.save({
		code:codeId + md5.update(Math.random()).digest('base64'),
        address:address, 
        neighbourhood:neighbourhood,
        authenticatedUser:currentUser,
	}, {
	  success: function(gameScore) {
		// The object was saved successfully.
	  },
	  error: function(gameScore, error) {
		// The save failed.
		// error is a AV.Error with an error code and description.
	  }
	})
	var b = new Buffer(addressAuthenticationCode.code);
	var encode_code = b.toString('base64');
  	res.render('data', { 
  		'result':'success',
        'raw_code': addressAuthenticationCode.code,
        'qr_code':'http://neighbours.avoscloud.com/addressCode/' + encoded_code + '/'
	});
});

// 最后，必须有这行代码来使 express 响应 HTTP 请求
app.listen();