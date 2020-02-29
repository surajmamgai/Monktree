const express = require('express');
const app = express();
const User = require('./models/user.model')
const mongoose = require('mongoose');
const PORT = process.env.PORT || 3000;
const userRoutes = require('./routes/user.routes')
const routes = require('./routes/routes')
const cookieParser = require('cookie-parser');
const { URI } = require('./conf/key')
// seting default view engine
app.set('view engine', 'ejs');

// json data middelware
app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use(cookieParser());
// Static files middelware
app.use('/static',express.static(__dirname+'/public'));
// Connecting to database
mongoose.connect(URI, {useNewUrlParser: true,useUnifiedTopology : true},() => {
        console.log(`Connected to MongoDB...`)
});
// Routes
app.use('/api/users',userRoutes);
app.use('/backend',routes);

app.get('/',async (req, res) => {
	if(req.cookies.auth){
		return res.render('dashboard',{user : req.cookies.user})
	}
	return res.render('index');
});

app.get('/signup',(req, res) => {
	if(req.cookies.mobile && req.cookies.verified){
		res.render('signup');
	}else{
		res.redirect('/mobile')
	}
} )
app.get('/signin',(req, res) => {
	res.render('signin');
} )
app.get('/otp',(req, res) => {

	if(req.cookies.otp){
		res.render('otp');
	}else{
		res.redirect('/mobile')
	}
} )
app.get('/personal',(req, res) => {

	if(req.cookies.auth){
		res.render('personal');
	}else{
		res.redirect('/mobile')
	}
} )
app.get('/academic',(req, res) => {
	
	if(req.cookies.auth){
		res.render('academic');
	}else{
		res.redirect('/mobile')
	}
} )
app.get('/mobile',(req, res) => {
	res.render('mobile');
} )
app.get('/dashboard',(req, res) => {
	res.render('dashboard');
} )
app.get('/404',(req, res) => {
	res.render('404');
} )
app.get('/forgot-password',(req, res) => {
	res.render('forgot')
})
app.get('/forgot-password/otp',(req, res) => {

	if(req.cookies.fotp){
		res.render('forgototp');
	}else{
		res.redirect('/forgot-password')
	}
} )
app.get('/forgot-password/set-password',(req, res) => {

	if(req.cookies.fmobile && req.cookies.verified){
		res.render('setpassword');
	}else{
		res.redirect('/forgot-password')
	}
} )

// Server listening to PORT
app.listen(PORT,(err) => {
    if(err){
        console.log(err);
    }
    console.log(`Server has started at port ${PORT}...`);
})
