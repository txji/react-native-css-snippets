var mongodb=require('./db');

function Post(name,title,artical){
	this.name=name;
	this.title=title;
	this.artical=artical;
}

//保存数据
Post.prototype.save=function(callback){
	var date=new Date(),
		time={
			date:date,
			year:date.getFullYear(),
			month:date.getFullYear() + ' - ' + (date.getMonth()+1),
			day:date.getFullYear() + ' - ' + (date.getMonth()+1) + ' - ' +date.getDate(),
			minute:date.getFullYear() + ' - ' + (date.getMonth()+1) + ' - ' +date.getDate() + ' ' + date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
		},
		//要存入的文章
		thePost={
			name:this.name,
			title:this.title,
			post:this.artical,
			time:time
		};
		//打开数据库
		mongodb.open(function(err,db){
			if(err){
				return callback(err);
			}
			db.collection('post',function(err,collection){
				if(err){
					mongodb.close();
					return callback(err);
				}

				collection.insert(thePost,{safe:true},function(err){
					mongodb.close();
					if(err){
						return callback(err);
					}
					callback(null);
				});
			});
		});
};
//读取数据
Post.get=function(name,callback){
	mongodb.open(function(err,db){
		if(err){
			return callback(err);
		}

		db.collection('post',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}

			var getPost={};

			if(name){
				getPost.name=name;
			}

			collection.find(getPost).sort({time:-1}).toArray(function(err,docs){
				mongodb.close();
				if(err){
					return callback(err);
				}

				callback(null,docs);
			});
		});
	});
};

module.exports=Post;