const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const JWT = require('jsonwebtoken');
const auth = require('../middelware/auth')
// const { jWT_SEC_KEY } = require('../conf/index')
// routes
/*
 * Signup route
 */ 
router.post('/signup',[
    check('mobile',).isMobilePhone().not().isEmpty(),
    check('email').isEmail(),
    check('password').trim().not().isEmpty()
],(req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).json({ errors: errors.array() });
    }
    const mobile = req.body.mobile
    User.findOne({mobile : mobile})
    .then(async (user) => {
        if(user){
           return res.status(400).json({
                msg : "user already exist"
            });
        }else{
            const password = await bcrypt.hash(req.body.password, 10)
            const user = new User({mobile : req.body.mobile, email : req.body.email, password : password});
            user.save()
                .then( async (user) => {
                    const token = await JWT.sign({ mobile : user.mobile},"fswdcooldude");
                    res.status(200).json({msg : "Success",user : user, token : token});
                })
                .catch((error) => {
                    res.status(200).json({msg : "Failed",error : error});
                });
        }
    })
    .catch((err) => {
        return  res.status(400).json({
            msg : "Failed",
            error : err
        });
    })
});

/*
 * academic
 */
router.post('/academic',[
    check('mobile',).isMobilePhone().not().isEmpty(),
    check('college',).trim().not().isEmpty(),
    check('branch').trim().not().isEmpty(),
    check('sem').trim().not().isEmpty(),
    check('shift',).trim().not().isEmpty(),
    check('yoa').trim().not().isEmpty(),
    check('rollno').trim().not().isEmpty()
],auth,(req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).json({ errors: errors.array() });
    }
    const mobile = req.body.mobile
    User.findOne({mobile : mobile})
    .then(async (user) => {
        if(user){
            user.college = req.body.college;
            user.branch = req.body.branch;
            user.sem = req.body.sem;
            user.shift = req.body.shift;
            user.yoa = req.body.yoa;
            user.rollno = req.body.rollno;
            user.save()
            .then( user => {
                res.status(200).json({msg : "Success",user : user});
            })
            .catch((error) => {
                res.status(200).json({msg : "Failed",error : error});
            });
        }else{   
            return res.status(400).json({
                msg : "Wrong mobile no"
            });
        }
    })
    .catch((err) => {
        return  res.status(400).json({
            msg : "Failed",
            error : err
        });
    })
});

/*
 * Personal
 */
router.post('/personal',[
    check('mobile',).isMobilePhone().not().isEmpty(),
    check('name',).trim().not().isEmpty(),
    check('father').trim().not().isEmpty(),
    check('gender').trim().not().isEmpty(),
    check('dob',).trim().not().isEmpty(),
    check('fathermobile').trim().not().isEmpty(),
    check('house_street_area').trim().not().isEmpty(),
    check('landmark').trim().not().isEmpty(),
    check('city').trim().not().isEmpty(),
    check('state').trim().not().isEmpty(),
    check('pin').trim().not().isEmpty()
],auth,(req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).json({ errors: errors.array() });
    }
    const mobile = req.body.mobile
    User.findOne({mobile : mobile})
    .then(async (user) => {
        if(user){
            var date = req.body.dob.split('-');
            var dob = new Date();
            dob.setFullYear(parseInt(date[2])); 
            dob.setMonth(parseInt(date[1])-1); 
            dob.setDate(parseInt(date[0])); 

            user.name = req.body.name;
            user.father = req.body.father;
            user.gender = req.body.gender;
            user.dob = dob;
            user.fathermobile = req.body.fathermobile;
            user.house_street_area = req.body.house_street_area;
            user.landmark = req.body.landmark;
            user.city = req.body.city;
            user.state = req.body.state;
            user.pin = req.body.pin;
            user.save()
            .then( user => {
                res.status(200).json({msg : "Success",user : user});
            })
            .catch((error) => {
                res.status(200).json({msg : "Failed",error : error});
            });
        }else{   
            return res.status(400).json({
                msg : "Wrong mobile no"
            });
        }
    })
    .catch((err) => {
        return  res.status(400).json({
            msg : "Failed",
            error : err
        });
    })
});

/*
 * Signin
 */
// not complete
router.post('/signin', [
    // mobile check
    check('mobile').not().isEmpty().isMobilePhone(),
    // password must be at least 5 chars long
    check('password').not().isEmpty().isLength({ min: 8 })
  ], async (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    User.findOne({mobile : req.body.mobile})
    .then(async (user) => {
        const match = await bcrypt.compare(req.body.password, user.password);
        if(match){
            const token = await JWT.sign({ mobile : user.mobile},"fswdcooldude");
            res.json({msg :"logged in", token : token,user : user.name})
        }else{
            res.json({err : "Invalid credentials"})
        }
    })
    .catch((err) => {
        res.json({
            err : "Invalid credentials"
        })
    })
       
  });

  module.exports = router