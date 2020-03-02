const express = require('express');
const router = express.Router();
const { URL } = require('../conf')
const request = require('request')
const mobileAuth = require('../middelware/mobile')
const { check, validationResult } = require('express-validator');
const auth = require('../middelware/auth')
const User = require('../models/user.model')
const bcrypt = require('bcryptjs');

router.post('/mobile',[
    check('mobile').isMobilePhone()
],
(req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.redirect('/mobile')
    }    
    
    User.findOne({"mobile" : req.body.mobile }).then( user => {
        if(user){
            return res.redirect('/mobile')
        }
        else{
            var otp = "";
    for(var i = 1; i < 7; i++){
        otp += Math.floor(Math.random() * (9 - 0) + 0)
    }
    
    // var options = { method: 'POST',
    // url: 'https://api.msg91.com/api/v2/sendsms',
    // headers: 
    // { 
    //     authkey: '313754AzZb7sMGt25l5e4cb523P1',
    //     'content-type': 'application/json' },
    // body: 
    // { sender: 'MKTREE',
    //     route: '4',
    //     country: '91',
    //     sms: [ { message: `${otp} is your one time password(OTP) for phone verification`, to: [ req.body.mobile ] } ] },
    // json: true };

    // request(options, function (error, response, body) {
    //     if (error) res.redirect('/mobile');

    //     res.cookie('mobile',req.body.mobile);
    //     res.cookie('otp',otp);
    //     res.redirect('/otp');
    // });
    var request = require("request");

    var options = { method: 'POST',
    url: 'https://www.fast2sms.com/dev/bulk',
    headers: 
    { 
        'content-type': 'application/json',
        authorization: 'v5fXkCRsw7QjZJlVdI1WxtAran3g48EDPHmTqcy6uFUezLKopM7f9Uh2e38WBjbIlayFZgiCck0pPz4N' },
    body: 
    { sender_id:"FSTSMS",
        message: `${otp} is your one time password(OTP) for phone verification`,
        language: 'english',
        route: 'p',
        numbers: req.body.mobile },
    json: true };

    request(options, function (error, response, body) {
       if (error) res.redirect('/mobile');

        res.cookie('mobile',req.body.mobile);
        res.cookie('otp',otp);
        res.redirect('/otp');
            });

        }
    }).catch(err => {
        return res.redirect('/mobile')
    })
    
})
router.post('/otp',(req, res) => {
    if(req.cookies.otp){
        if(req.body.otp){
            if(req.body.otp == req.cookies.otp){
                res.clearCookie('otp')
                res.cookie('verified',true)
                res.redirect('/signup')
            }
            else{
                res.redirect('/otp')
            }
        }else{
            res.redirect('/otp')
        }
    }else{
        res.redirect('/mobile')
    }
})
router.post('/signup',async (req,res) => {
    if(req.cookies.mobile){
        if(req.body.password === req.body.rpassword){
            const user = req.body;
            var options = {
            method: 'POST',
            url: URL+"/api/users/signup",
            headers: 
            { 
              'cache-control': 'no-cache',
              'content-type': 'application/json' },
            body: 
            { mobile: req.cookies.mobile,
              email: user.email,
              password: user.password},
            json: true };
        
             request(options, async function (error, response, body) {
            if (error) {
                return res.json({error})
            } 
                const result = await body;
                if(result.msg === "Success"){
                    res.clearCookie('mobile');
                    res.clearCookie('verified');
                    res.cookie("auth", result.token) 
                    return res.redirect('/academic');
                }
                else{
                    
                    return res.redirect('/signup')
                }
            });
        
         }else{
             res.redirect('/signup')
         }   
    }else{
        res.redirect('mobile')
    }
})

router.post('/academic', mobileAuth,async (req,res) => {
    if(req.cookies.auth){
        const user = req.body;
        var options = {
        method: 'POST',
        url: URL+"/api/users/academic",
        headers: 
        { 
          'cache-control': 'no-cache',
          auth: req.token,
          'content-type': 'application/json' },
       body: 
        { mobile: req.mobile,
          college: user.college,
          rollno: user.rollno,
          branch: user.branch,
          sem: user.sem,
          yoa: user.yoa,
          shift: user.shift },
       json: true };
    
         request(options, async function (error, response, body) {
        if (error) {
            return res.json({error})
        } 
            const result = await body;
            if(result.msg === "Success"){
                return res.redirect('/personal');
            }
            else{
                
                return res.redirect('/academic')
            }
        });
    
    }else{
        res.redirect('/mobile')
    }
})


router.post('/personal', mobileAuth,async (req,res) => {
    if(req.cookies.auth){
        const user = req.body;
    var options = {
    method: 'POST',
    url: URL+"/api/users/personal",
    headers: 
    { 
      'cache-control': 'no-cache',
      auth: req.token,
      'content-type': 'application/json' },
   body: 
    { mobile: req.mobile,
        name: user.name,
        father: user.father,
        gender: user.gender,
        dob: user.dob,
        fathermobile: user.fathermobile,
        house_street_area: user.house_street_area,
        landmark: user.landmark,
        city: user.city,
        state: user.state,
        pin: user.pin},
     json: true };
   
     request(options, async function (error, response, body) {
    if (error) {
        return res.json({error})
    } 
        const result = await body;
        if(result.msg === "Success"){
            res.clearCookie('auth');
            return res.redirect('/signin');
        }
        else{
            return res.redirect('/personal')
        }
    });
    }else{
        res.redirect('/mobile')
    }
})

router.post('/signin',async (req,res) => {
    const user = req.body;
    var options = {
    method: 'POST',
    url: URL+"/api/users/signin",
    headers: 
    { 
      'cache-control': 'no-cache',
      'content-type': 'application/json' },
   body: 
    { 
        mobile: user.mobile,
        password : user.password
    },
     json: true };
   
     request(options, async function (error, response, body) {
    if (error) {
        return res.json({error})
    } 
        const result = await body;
        if(result.msg === "logged in"){
            res.cookie("auth" ,result.token);
            res.cookie("user" ,result.user);
            return res.redirect('/');
        }
        else{
            return res.redirect('/signin')
        }
    });

})

// forgot password
router.post('/forgot',[
    check('mobile').isMobilePhone()
],
(req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.redirect('/forgot-password')
    }
    User.findOne({"mobile" : req.body.mobile}).then(user => {
        if(user){
            var otp = "";
            for(var i = 1; i < 7; i++){
                otp += Math.floor(Math.random() * (9 - 0) + 0)
            }
            
            // var options = { method: 'POST',
            // url: 'https://api.msg91.com/api/v2/sendsms',
            // headers: 
            // { 
            //     authkey: '313754AzZb7sMGt25l5e4cb523P1',
            //     'content-type': 'application/json' },
            // body: 
            // { sender: 'MKTREE',
            //     route: '4',
            //     country: '91',
            //     sms: [ { message: `${otp} is your one time password(OTP) to reset your Monktree.in account password`, to: [ req.body.mobile ] } ] },
            // json: true };
        
            // request(options, function (error, response, body) {
            //     if (error) res.redirect('/forgot-password');
        
            //     res.cookie('fmobile',req.body.mobile);
            //     res.cookie('fotp',otp);
            //     res.redirect('/forgot-password/otp');
            // });
            var request = require("request");

            var options = { method: 'POST',
            url: 'https://www.fast2sms.com/dev/bulk',
            headers: 
            { 'postman-token': 'b1fc959d-a9e9-3793-e274-fc30a119ab87',
                'cache-control': 'no-cache',
                'content-type': 'application/json',
                authorization: 'v5fXkCRsw7QjZJlVdI1WxtAran3g48EDPHmTqcy6uFUezLKopM7f9Uh2e38WBjbIlayFZgiCck0pPz4N' },
            body: 
            { sender_id: "FSTSMS",
                message: `${otp} is your one time password(OTP) to reset your Monktree.in account password`,
                language: 'english',
                route: 'p',
                numbers: req.body.mobile },
            json: true };

            request(options, function (error, response, body) {
              if (error) res.redirect('/forgot-password');
        
                res.cookie('fmobile',req.body.mobile);
                res.cookie('fotp',otp);
                res.redirect('/forgot-password/otp');
            });

        }else{
            res.redirect('/forgot-password')
        }
    }).catch( err => {
        res.redirect('/frogot-password');
    })
})

router.post('/forgototp',(req, res) => {
    if(req.cookies.fotp){
        if(req.body.otp){
            if(req.body.otp == req.cookies.fotp){
                res.clearCookie('fotp')
                res.cookie('verified',true)
                res.redirect('/forgot-password/set-password')
            }
            else{
                res.redirect('/forgot-password/otp')
            }
        }else{
            res.redirect('/forgot-password/otp')
        }
    }else{
        res.redirect('/mobile')
    }
})
router.post('/setpassword',(req,res) => {
    if(req.body.password === req.body.rpassword){
        if(req.cookies.verified){
            User.findOne({mobile : req.cookies.fmobile}).then(async user => {
                const password = await bcrypt.hash(req.body.password, 10)
                user.password = password;
                user.save().then( user => {
                    console.log(user)
                    console.log(req.cookies.fmobile)
                    console.log(req.cookies.verified)
                    if(user){ 
                        res.clearCookie('verified')
                        res.clearCookie('fmobile')
                        return res.redirect('/signin')
                    }
                }).catch(err =>{ return res.redirect('/forgot-password/set-password')})
            })
        }
        else{
            res.redirect('/forgot-password/otp');
        }
    }else{
        res.redirect('/forgot-password/set-password');
    }
})
router.get('/logout',(req,res) => {
    res.clearCookie('auth');
    res.redirect('/')
})
module.exports = router