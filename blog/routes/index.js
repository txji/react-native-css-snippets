
/*
 * GET home page.
 */
var crypto=require('crypto'),
	User=require('../models/user.js'),
	Post=require('../models/post.js');
console.log(typeof User.get);
module.exports = function(app) {
	//首页
	app.get('/', function (req, res) {
		Post.get(null, function (err, posts) {
			if (err) {
				posts = [];
			} 
			res.render('index', {
				title: '主页',
				user: req.session.user,
				posts: posts,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});
	});
	//注册页访问
	app.get('/reg', checkNotLogin);
	app.get('/reg', function (req, res) {
		res.render('reg', {
			title: '注册',
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
	//注册功能
	app.post('/reg', checkNotLogin);
	app.post('/reg', function (req, res) {
		var name=req.body.name,
			password=req.body.password,
			password_re=req.body['password-repeat'],
			email=req.body.email;
		//检验用户两次输入的密码是否一到
		if(password !== password_re){
			req.flash('error','两次输入的密码不一致');
			return res.redirect('/reg');
		}
		if(password.replace(/^\s+|\s+$/g,'').length<6){
			req.flash('error','密码长度小于6');
			return res.redirect('/reg');
		}
		var md5=crypto.createHash('md5'),
			password=md5.update(password).digest('hex');
		var newUser=new User({
			name:name,
			password:password,
			email:email
		});
		User.get(newUser.name,function(err,user){
			if(user){
				req.flash('error','用户已经存在!');
				return res.redirect('/reg');
			}
			newUser.save(function(err,user){
				if(err){
					req.flash('error',err);
					return res.redirect('/reg');
				}
				req.session.user=user;
				req.flash('success','注册成功！');
				res.redirect('/');
			});
		});
	});

	//登录页访问
	app.get('/login', checkNotLogin);
	app.get('/login', function (req, res) {
		res.render('login', { 
			title: '主页',
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
	//登录功能
	app.post('/login', checkNotLogin);
	app.post('/login', function (req, res) {
		var user={
			name:req.body.name,
			password:req.body.password
		};
		var md5=crypto.createHash('md5');
		user.password=md5.update(user.password).digest('hex');
		User.get(user.name,function(err,u){
			if(err){
				req.flash('err',err);
			}
			if(u && u.name===user.name && u.password === user.password){
				req.session.user=user;
				req.flash('success','登录成功！');
				res.redirect('/');
			}else{
				req.session.user=null;
				req.flash('error','用户名或密码错误！');
				res.redirect('/login');
			}
		});
	});

	//访问发布
	app.get('/post', checkLogin);
	app.get('/post', function (req, res) {
		res.render('post', { title: '发表' ,user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()});
	});
	//发布功能
	app.post('/post', checkLogin);
	app.post('/post', function (req, res) {
		var currentUser=req.session.user,
			post=new Post(currentUser.name,req.body.title,req.body.post);

		post.save(function(err){
			if(err){
				req.flash('error',err);
				return res.redirect('/');
			}
			req.flash('success','发布成功！');
			res.redirect('/');
		});
	});
	//退出登录
	app.get('/logout', checkLogin);
	app.get('/logout', function (req, res) {
		req.session.user=null;
		req.flash('success','登录');
		res.redirect('/');
	});

	//login?
	function checkLogin(req, res, next) {
		if (!req.session.user) {
			req.flash('error', '未登录!'); 
			res.redirect('/login');
		}
		next();
	}

	function checkNotLogin(req, res, next) {
		if (req.session.user) {
			req.flash('error', '已登录!'); 
			res.redirect('back');
		}
		next();
	}
};