var app = require("cloud/app.js");
// Use AV.Cloud.define to define as many cloud functions as you want.
// For example:
AV.Cloud.define("generateAddressAuthenticationCode",function(req, res) {
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
	})
});