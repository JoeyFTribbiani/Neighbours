var app = require("cloud/app.js");
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

AV.Cloud.define("getPhoneAuthenticationCode",function(req, res) {
    var phone = req.params.phone
    AV.Query.doCloudQuery("select count(*) from PhoneAuthenticationCode where phone=? and createdAt = ?",[phone,new Date().Format('YYYY-MM-dd')],{
        success: function(result){
            if(result.count > 3){
                res.success({
                    'result':result.count
                })
            }else{
                res.success({
                    'result':result.count
                })
//                AV.User.requestMobilePhoneVerify(phone).then(function(){
//                    var phoneAuthenticationCode = new PhoneAuthenticationCode()
//                    phoneAuthenticationCode.save({
//                       "phone": phone
//                    },{
//                        success: function(phoneAuthenticationCode) {
//                            return {
//                                'result':'success'
//                            }
//                        },error: function(phoneAuthenticationCode, error) {
//                            return {
//                                'result':'error',
//                                'msg': error
//                            }
//                        }
//                    })
//                }, function(err){
//                    return{
//                        'result':'error',
//                        'msg': "发送失败"
//                    }
//                });
            }
        },
        error:function(error){
            res.success({
                'result':'error',
                'msg': error
            })
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