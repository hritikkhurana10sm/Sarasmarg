/*
 Email : team.Sarasmarg@gmail.com
 Password : Saras10@marg
*/ 


// http://www.google.com/maps/place/lat,lng
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
const middleware = require('./middleware/index');

// derived filed
const config = require('./config');
const User = require('./models/user');
const issues = require('./models/issue');
const admin = require('./models/admin');


// passport JWT
const jwt = require('jsonwebtoken');
const passportJWT = require('./config/passport-jwt-strategy');
const user = require('./models/user');


// app.use(express.static(path.join(__dirname, '/views/')));
app.use(express.static(path.join(__dirname, '/public')));
// setting up the cookies
app.use(cookieParser("This is my secret!"));

// setting up the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'));
// fetch("https://sarasmarg.herokuapp.com/data").then(req => req.text()).then(console.log)
const cors = require('cors');
app.use(cors({
  origin: '*'
}));

app.use(bodyparser.urlencoded({
  extended: true
}))

app.use(express.json());

//we need express session before we use passport session

app.use(

  session({

    secret: "Hello,This is secret line",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure : false
    }
  }));

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



//-------ADMIN (BAAP)--------- routes and controllers---------------------
app.get('/', function (req, res) {
  res.render("index.ejs");
})

// Authority Pages -------------------------------------
app.get('/AuthoritySideLogin.ejs', function (req, res) {
  res.render('AuthoritySideLogin');
})

app.get('/AuthoritySideSignUp.ejs' , function(req , res){
  res.render('AuthoritySideSignUp');
})

app.get('/AuthoritySideDashboard.ejs' ,async function(req , res){

  const complaints = await issues.find().exec();
  // console.log('complaints : ', complaints);
  res.render('AuthoritySideDashboard' , {
       complaints : complaints
  });
})

app.get('/AuthorityGetStartedAs.ejs' , function(req , res){
  res.render('AuthorityGetStartedAs');
})

app.get('/AuthorityGetStarted.ejs' , function(req ,res){
  res.render('AuthorityGetStarted');
})

app.get('/AuthoritySideComplaintsLar.ejs' , function(req , res){
  res.render('AuthoritySideComplaintsLar');
})

app.get('/getLocation.ejs' ,async function(req , res){
  const complaint = await issues.find().exec();

  const arr = [];
// console.log(complaint)
for(var i = 0 ; i < complaint.length ; i++){
  arr.push(complaint[i].coordinates);
}
// for(var i = 0 ; i < arr.length ; i++){
//   console.log(i , arr[i]);
// }

     res.render('getLocation' , {
      complaint : arr
     })
} )

app.post('/admin/signup' , async function(req ,res){
  
  res.cookie('isLogined', false);
    
  var userBody = req.body;
  console.log("Admin Signup Attemp =>", userBody);

  if (userBody.password) {
      var newUser = new admin(
          { username: userBody.username, email: userBody.email, password: userBody.password}
      );

      await newUser.save()
          .then(newUser => {
              console.log(`${newUser} added`);
          })
          .catch(err => {
              console.log(err);
          });
      res.redirect('/AuthoritySideLogin.ejs');
  }
  else {
      document.alert(`User cannot be created`);
  }
})


app.post('/admin/signin' , async function(req , res){
  var userQuery = req.body;
  console.log(userQuery);

  try {
     
         
          var adm = await admin.findOne({ email: userQuery.email, password: userQuery.password }).exec();
          
          console.log('Admin LoggedIn =>' , adm);
          if (adm) {
              
              res.cookie('isLogined', true);
              // res.cookie('isAdmin', true);
              console.log("--------------- > " , adm._id);
              res.cookie('adminId', adm._id);
              
              console.log("Req.Cookies Admin =>" , req.cookies);

              res.redirect('/AuthoritySideDashboard.ejs');
          }
          else {
              // alert(`incorrect login datails`);
              res.send('login failed');
           
          }

      
     
  }
  catch (error) {
      return console.log('error', error);

  };
  console.log('after');
  
})

app.post('/AuthoritySideComplaintsLar' , async function(req , res){
    
    const id = req.body.issue;
    // console.log("id  = > " , id);
    const complaint = await issues.findById(id).exec();
    // return res.render('../../AuthoritySideComplaintsLar.ejs' , {
    //     complaint : complaint
    // })
    return res.render('AuthoritySideComplaintsLar' , {
      issue : complaint
    });
})

app.post('/AuthoritySideDashboard'  , async function(req , res){
  var qw = req.body.id;
 
  try {
      
      var complaint = await issues.findById(qw).exec();

      complaint.status = req.body.status;
      


      try {
              await complaint.save()
              .then(complaint => {
                  console.log(`${complaint} updated`);

                  return res.redirect('./AuthoritySideDashboard.ejs');
              })
              .catch(err => {
                  console.log(err);
              });;

      }
      catch (error) {
          console.log(error);
      }
  }
  catch (error) { console.log(error); }
})
// --------------------------------------------------------



// WorkerSide ---------------------------------------------
app.get('/WorkerSideLogin.ejs' , function(req ,res){
  res.render('WorkerSideLogin');
})

app.get('/WorkerSideSignUp.ejs' , function(req , res){
  res.render('WorkerSideSignUp');
})

app.get('/WorkerSideDashboard.ejs' , function(req , res){
  res.render('WorkerSideDashboard');
})

app.get('/WorkerSideGetStartedAs.ejs' , function(req , res){
  res.render('WorkerSideGetStartedAs');
})
// ------------------------------------------------------





// DonT ToUcH ThIs PaRt-------------------------------------
app.post('/signin', function (req, res, next) {


  passport.authenticate("local", (err, user, info) => {
    if (err) {
      console.log('problem 1', err)
      console.log('problem -> ', user)

      return res.redirect('/signin');
    }
    if (!user) {
      console.log('problem -> ', user)
      console.log('problem 2')
      return res.redirect('/signin');
    }

    req.login(user, err => {

      if (err) {
        console.log('problem 3')
        return res.redirect('/signin');
      }
      console.log('problem 4')
      return res.render('home');
    });
  })(req, res, next);
});

// get sign up page
app.get('/signup', function (req, res) {
  res.render('signup');
})

// sign up data upload
app.post('/signup', function (req, res) {
  console.log('req data ', req.body);
  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password
  })

  User.register(user, req.body.password, function (err, user) {

    if (err) {
      console.log('Error while creating user', err);
      res.json({
        success: false,
        message: "Your account can not be made"
      });
    } else {

      console.log('Users details are as follows : ', user);
      res.render('signin');
    }
  });
});

// sign out
app.get('/signout', function (req, res) {

  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    // did not work
    res.clearCookie('connect.sid', {
      path: '/'
    });
    res.redirect('/');
  });
})









// -------------Mobile API'S----------------------

app.post('/user/signup', async function (req, res) {

  console.log('API /user/signup ', req.body);
  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password
  })

  User.register(user, req.body.password, function (err, user) {

    if (err) {
      console.log('Error while creating user', err);
     return res.status(404).json({
        success: false,
        message: "Your account can not be made",
        error: err
      });
    } else {

     return res.status(200).json({
        success: true,
        message: "You account is successfully created",
        user: user
      })
    }
  });
})

app.post('/user/signin', async function (req, res, next) {

  passport.authenticate("local", (err, user, info) => {
    if (err) {

      return res.status(404).json({
        success: false,
        message: "Problem in signin",
        error: err
      });
    }
    if (!user) {

      return res.status(404).json({
        success: false,
        message: "Wrong Username/Password!"
      });
    }

    req.login(user, err => {

      if (err) {
        return res.status(404).json({
          success: false,
          message: "Problem in signin-2",
          error: err
        });

      }else{

      return res.status(200).json({

        message: "Sign in successfully",
        // data: {
        //   // encypted
        //   token: jwt.sign(user.toJSON(), 'novel', {
        //     expiresIn: '1h'
        //   })
        // },
        token: jwt.sign(user.toJSON(), 'novel'),
        user: user
      })
    }

    });
  })(req, res, next);

})

app.get('/user/allComplaints/:cid',passport.authenticate('jwt', {
  session: false
}) ,async function (req, res) {
  // middleware.isLoggedIn 



    var qw = req.params;
    var user = await User.findById(qw.cid).exec();
    console.log('user : ', user);
     
    try {
      var issue = await issues.find({
        result: qw.cid
      });
      console.log(":::" , issue);
      res.status(200).json({
        success: true,
        complaints: issue,
        user: user
      });
    } catch (error) {
      res.json({
        success : false,
        error: error
      })
    }
  
    
})
    
app.post('/user/issue/:id',passport.authenticate('jwt', {
  session: false
}) , async function (req, res) {

   
  const qw = req.params;
  const arr = req.body;

  var us = await user.findById(qw.id).exec();
  // console.log('us = > ' , us);

  var date = new Date().toLocaleString('en-us',{day : 'numeric',month : "short", year:'numeric'})
  
//   var st = arr.location;
//  var p = st.substr(15);

//  var i = 0;

//  while(p[i] != ' '){
//     i++;
//  }

//  p = p.substr(0 , i);

  var time = new Date().toLocaleTimeString();
  var issue = new issues({
    location: arr.location,
    files: arr.files,
    description : arr.description,
    result : qw.id,
    naam : us.username,
    email : us.email,
    date : date,
    time : time,
    coordinates : arr.coordinates
  });

 console.log('complaint ' , issue);
  
  issue.save(function(err){

    if(err){
      return res.json({
        success : false,
        error : err
      })
    }
     return res.status(200).json({
      success : true,
      message : "Complaint is successfully Registered",
      issue : issue 
 })

  })
    
    })


// testing for expiry time
app.get('/data'  , async function(req ,res){

  var user = await User.find().exec();
   
   res.json({
    user : user
   })
})


// app is listening Dude
app.listen(port, (err) => {
  console.log(`App is listening on port ${port}`);
})


































































// -------------Checking Part (  Dont Try to touch this part)----------------


// -------------------------------------------------------------------------------
// api's
// app.get('/api/v1', async function (req, res) {

//   const users = await User.find({});

//   res.status(200).json({
//     message: "A list of users",
//     users: users
//   });
// })

// -------------------------------------------------------------------------------
// to create authentication and authorization of api,  we will use passport-jwt 
// we should verify password

// -------------------------------------------------------------------------------
// first created the session , so as to verify the user and providing the token to start request and response cycle
// app.post('/createSession', async function (req, res) {
//   console.log('oooo ', req.body);
//   let user = await User.findOne({
//     username: req.body.username
//   });

//   if (!user || user.password != req.body.password) {
//     res.status(422).json({
//       message: "Password is incorrect"
//     })
//   } else {
//     return res.status(200).json({

//       message: "Sing in successfully",
//       data: {
//         // encypted
//         token: jwt.sign(user.toJSON(), 'novel', {
//           expiresIn: '100000'
//         })
//       },
//       user: user
//     })

//   }
// });

// -------------------------------------------------------------------------------
// delete the user through api
// app.get('/api/v1/:id', passport.authenticate('jwt', {
//   session: false
// }), function (req, res) {

//   let id = req.params.id;
//   const user = User.findByIdAndDelete(id, (err, user) => {

//     if (err) {
//       console.log('Error while deleting the user', err);
//     } else {

//       res.status(200).json({
//         message: `A user is deleted successfully ${user}`
//       })
//     }
//   })
// });






























































// mistakes that was corrected
// app.post('/user/complaint',passport.authenticate('jwt', {
//   session: false
// }) , async function (req, res) {

   
//   // const qw = req.params;
//   const arr = req.body;

//   var complaint = new Complaint({
//     location: arr.location,
//     imageURL: arr.imageURL,
//     details : arr.details
//   });

//  console.log('complaint ' , complaint);
  
//   complaint.save(function(err){

//     if(err){
//       return res.json({
//         success : false,
//         error : err
//       })
//     }
//      return res.status(200).json({
//       success : true,
//       message : "Complaint is successfully Registered",
//       complaint : complaint 
//  })

//   })
    
      
      
//     })
