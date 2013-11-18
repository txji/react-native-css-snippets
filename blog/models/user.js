var mongdb=require('./db');

function User(user){
	this.name=user.name;
	this.password=user.password;
	this.email=user.email;
}

//存储用户信息
User.prototype.save=function(callback){
	var user={
		name:this.name,
		password:this.password,
		email:this.email
	};
	//打开数据库
	mongdb.open(function(err,db){
		if(err){
			return callback(err);//出错，返回错误信息
		}
		//读取collection
		db.collection('users',function(err,collection){
			if(err){
				mongdb.close();//出错关闭数据库
				return callback(err);
			}
			collection.insert(user,{safe:true},function(err,user){
				mongdb.close();
				if(err){
					return callback(err);
				}
				callback(null,user[0]);//成功！err为null，并返回存储后的用户文档
			});
		});
	});
};
//读取用户信息
User.get=function(name,callback){
	mongdb.open(function(err,db){
		if(err){
			return callback(err);//错误，返回错误信息
		}
		db.collection('users',function(err,collection){
			if(err){
				mongdb.close();
				return callback(err);
			}
			collection.findOne({name:name},function(err,user){
				mongdb.close();
				if(err){
					return callback(err);
				}
				callback(null,user);
			});
		});
	});
};

module.exports=User;