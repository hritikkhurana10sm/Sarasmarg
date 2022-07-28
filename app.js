const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const path = require('path');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const bodyparser = require('body-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const ejs = require('ejs');
const cookieParser = require('cookie-parser');

// derived filed
const config = require('./config');
const User = require('./models/user');

// passport JWT
const jwt = require('jsonwebtoken');
const passportJWT = require('./config/passport-jwt-strategy');

// setting up the cookies
app.use(cookieParser("This is my secret!"));

// setting up the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'));

app.use(bodyparser.urlencoded({
    extended: true
}))

//we need express session before we use passport session

app.use(

    session({

        secret: "Hello,This is secret line",
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 3600000,
            secure: false,
            httpOnly: true
}}));

//passport setup
app.use(passport.initialize());

// passport will need a session for how much time user needs to be login
// for that we use express session
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// mongodb setup
mongoose.connect(config.dbUrl, {
        useNewUrlParser: true
    })
    .then(() => {
        console.log("DataBase Connected! Enjoy");
}).catch(err => console.log(err));


// routes and controllers
app.get('/' , function(req , res){
res.render("index");
})

//get sign in page
app.get('/signin' , function(req , res){
    res.render('signin');
})

app.post('/signin' , function(req , res , next){
     
      
     passport.authenticate("local" , (err , user , info)=>{
        if(err){
            console.log('problem 1' , err)
            console.log('problem -> ' , user)
            
            return res.redirect('/signin');
        }
        if(!user){
            console.log('problem -> ' , user)
            console.log('problem 2')
            return res.redirect('/signin');
        }

        req.login(user , err=>{
             
             if(err){
                console.log('problem 3')
                return res.redirect('/signin');
             }
             console.log('problem 4')
             return res.render('home');
        });
     })(req , res , next);
});

// get sign up page
app.get('/signup' , function(req , res){
    res.render('signup');
})

// sign up data upload
app.post('/signup' , function(req , res){
   console.log('req data ' , req.body);
    const user = new User({
        username : req.body.username,
        email : req.body.email,
        password : req.body.password
     })

     User.register(user , req.body.password , function(err , user){

           if(err){
             console.log('Error while creating user' , err);
             res.json({
                success : false,
                message : "Your account can not be made"
             });
           }else{
              
              console.log('Users details are as follows : ' , user);
              res.render('signin');
           }
     });
});

// sign out
app.get('/signout' , function(req , res){
    
    req.logout(function(err) {
      if (err) { return next(err); }
      // did not work
      res.clearCookie('connect.sid', { path: '/' });
      res.redirect('/');
    });
  })

  
  // ------------------------------------------------------------

// api's
app.get('/api/v1' , async function(req , res){
   
    const users = await User.find({});
  
    res.status(200).json({
       message : "A list of users",
       users : users 
    });
})

// to create authentication and authorization of api,  we will use passport-jwt 
// we should verify password

// first created the session , so as to verify the user and providing the token to start request and response cycle
app.post('/createSession' , async function(req ,res){
console.log('oooo ' , req.body);
let user = await User.findOne({username : req.body.username});

if(!user || user.password != req.body.password){
    res.status(422).json({
      message : "Password is incorrect"
    })
}else{
  return res.status(200).json({

    message : "Sing in successfully",
    data : {
      // encypted
      token : jwt.sign(user.toJSON() , 'novel' ,{
           expiresIn : '100000'
      } )
    }
  })
      
}
});

// delete the user through api
app.get('/api/v1/:id' ,passport.authenticate('jwt' , {session : false}) , function(req , res){
   
let id = req.params.id;
const user = User.findByIdAndDelete(id , (err , user)=>{

if(err){
  console.log('Error while deleting the user' , err);
}else{
   
     res.status(200).json({
      message : `A user is deleted successfully ${user}`
     })
}
})
});

// app is listening Dude
app.listen(port, (err) => {
    console.log(`App is listening on port ${port}`);
})