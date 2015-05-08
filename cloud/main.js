var app = require("cloud/app.js");
var moment = require('moment');
var crypto = require('crypto');
var md5 = crypto.createHash('md5');

var myLog=require('cloud/mylog.js');
var myUser=require('cloud/myuser.js');
var myUtil=require('cloud/myutil.js');

var AddressAuthenticationCode = AV.Object.extend("AddressAuthenticationCode")
var PhoneAuthenticationCode = AV.Object.extend("PhoneAuthenticationCode")

var currentUser = AV.User.current();
// Use AV.Cloud.define to define as many cloud functions as you want.
// For example:
AV.Cloud.define('hello', function(request, response) {
    response.success('Hello world!');
});

AV.Cloud.define("register",function(req, res) {
    var phone = req.params.phone
    var code = req.params.code
    var gender = req.params.gender
    var birthday = req.params.birthday
    var nickname = req.params.nickname
    var password = req.params.password
    AV.Cloud.verifySmsCode(code,phone).then(function(){
        var user = new AV.User();
        user.set("username", phone);
        user.set("password", password);
        user.set("birthday", birthday);
        user.set("nickname", nickname);
        user.set("gender", gender);
        user.signUp(null, {
            success: function(user) {
                // Hooray! Let them use the app now.
                user.save({
                    "mobilePhoneNumber":phone
                }, {
                    success: function(user) {
                        // The save was successful.
                        user.save({
                            "mobilePhoneVerified":true
                        },{
                            success:function(user){
                                res.success(user)
                            },
                            error:function(){
                                res.error(error)
                            }
                        })
                    },
                    error: function(user, error) {
                        // The save failed.  Error is an instance of AV.Error.
                        res.error(error)
                    }
                })
            },
            error: function(user, error) {
                // Show the error message somewhere and let the user try again.
                res.error(error)
            }
        });
    },function(){
        res.error("验证码错误")
    })
});

AV.Cloud.define("getPhoneAuthenticationCode",function(req, res) {
    var phone = req.params.phone
    var udid = req.params.udid
    AV.Query.doCloudQuery("select count(*) from PhoneAuthenticationCode where phone='"+phone+"' and createdAt <= date('"+moment().endOf('day').format("YYYY-MM-DDTHH:mm:ss.SSS")+"Z"+"') and createdAt >= date('"+moment().startOf('day').format("YYYY-MM-DDTHH:mm:ss.SSS")+"Z"+"')",{
        success: function(result){
            if(result.count > 2){
                res.error("申请次数达到上限")
            }else{
                AV.Query.doCloudQuery("select count(*) from PhoneAuthenticationCode where udid='"+udid+"' and createdAt <= date('"+moment().endOf('day').format("YYYY-MM-DDTHH:mm:ss.SSS")+"Z"+"') and createdAt >= date('"+moment().startOf('day').format("YYYY-MM-DDTHH:mm:ss.SSS")+"Z"+"')",{
                    success: function(result){
                        if(result.count > 2){
                            res.error("当日获取验证码次数达到上限")
                        }else{
                            AV.Cloud.requestSmsCode(phone).then(function(){
                                var phoneAuthenticationCode = new PhoneAuthenticationCode()
                                phoneAuthenticationCode.save({
                                    "phone": phone,
                                    "udid": udid
                                },{
                                    success: function(phoneAuthenticationCode) {
                                        res.success("获取验证码成功")
                                    },error: function(phoneAuthenticationCode, error) {
                                        res.error(error)
                                    }
                                })
                            }, function(err){
                                res.error("发送失败")
                            });
                        }
                    }
                })
            }
        },
        error:function(error){
            res.error(error)
        }
    })
})

AV.Cloud.define("generateAddressAuthenticationCode",function(req, res) {
	var address = req.params.address;
	var neighbourhood;
	
	var query = new AV.Query(AddressAuthenticationCode);
	if(req.neighbourhood_id){
    	var neighbourhood_id = req.params.neighbourhood_id;
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
	})
});