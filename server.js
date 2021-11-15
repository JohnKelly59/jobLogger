if (process.encNODE_ENV !== "production") {
  require("dotenv").config()
}

//all modules
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
let mysql = require('mysql2');
const bcrypt = require("bcryptjs");
const passport = require("passport")
const flash = require("express-flash")
const session = require("express-session")
const initializePassport = require("./passport-config")
const methodOverride = require("method-override")
//database.js functions
const mydb = require(__dirname + "/connect.js")
initializePassport(passport,
  email => mydb.users.find(user => user.email === email),
  id => mydb.users.find(user => user.id === id),
)
var path = require("path");


var _ = require('lodash');

//initiates ejs
app.set('view engine', 'ejs');
// adds public folder
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride("_method"))

//creates active table
mydb.tableCreation()
//resets id to 1
mydb.resetSQE()
//Adds to userslist
mydb.addToUserList()

// adds public folder
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({
  extended: true
}));



//User Authentication
//login page
app.get("/login", checkNotAuthenticated, function(req, res) {
console.log(mydb.data)
console.log(mydb.users)
  res.render("login")
});

//register page
app.get("/register", checkNotAuthenticated, function(req, res) {

  res.render("register")
});

//registers new users
app.post("/register", checkNotAuthenticated, async function(req, res) {
  const name = req.body.name
  const email = req.body.email
  exports.email = email
  exports.name = name
  try {
    const hashPassword = await bcrypt.hash(req.body.password, 10)
    exports.hashPassword = hashPassword

    mydb.newUser()
      mydb.addToUserList()
      console.log("didit")

    res.redirect("/login");
  } catch {
    res.redirect("/register");
  }
});


//authenticates password
app.post('/login', passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true
  }),
  function(req, res) {
    const user = req.user.id
    exports.userB = user;
    mydb.addToData()
    mydb.addToArchive()
    res.redirect('/');

  });
//Logs user out
  app.post('/logout', function(req, res){
  mydb.eraseArray()
    req.logout();
    res.redirect('/');
  });


//home page
app.get("/", checkAuthenticated, function(req, res) {
  console.log()
  
  
  res.render("home", {
    data: mydb.data,
    userB: user
  })
});

//page to add new job
app.get("/new", checkAuthenticated, function(req, res) {

  res.render("new")
});

//Archive page
app.get("/archive", checkAuthenticated, function(req, res) {
  const user = req.user.id
  exports.userB = user;
  res.render("archive", {
    archives: mydb.archives
  })
});



//gets data from new page and adds data to joblogDB
app.post("/new", checkAuthenticated, function(req, res) {
  //puts info from new page into variables

  const company = req.body.company;
  const jtitle = req.body.title;
  const interest = req.body.interest;
  const salary = req.body.salary;
  const comments = req.body.comments;
  let day = mydb.getDate();
  const user = req.user.id
  exports.company = company
  exports.title = jtitle
  exports.interest = interest
  exports.salary = salary
  exports.comments = comments
  exports.day = day
  exports.userB = user;
  mydb.newLog();


  res.redirect("/new");
});


//Archive button functionality
app.post("/", checkAuthenticated, function(req, res) {
  const user = req.user.id
  const archivebutton = req.body.abutton;
  exports.archiveB = archivebutton;
  exports.userB = user;

  mydb.pressedArchive();
  var gotit = mydb.data.findIndex(x => x.id == archivebutton);
  mydb.data.splice(gotit, 1)
  //console.log(archivebutton)


  res.redirect("/")
});



//Delete button functionality
app.post("/archive", function(req, res) {

  const deleteButton = req.body.deleteBTN;
  const user = req.user.id
  console.log(deleteButton)
  exports.delete = deleteButton
  exports.userB = user;
  mydb.deleteFromActive()
  var go = mydb.archives.findIndex(x => x.id == deleteButton);
  mydb.archives.splice(go, 1)

  res.redirect("/archive")
})

//restore users from archive page
app.post("/back", function(req, res) {

  const restoreButton = req.body.restore;
  const user = req.user.id
  exports.restore = restoreButton
  exports.userB = user;
  mydb.restoreFromArchive()
  var go = mydb.archives.findIndex(x => x.id ==restoreButton);
  mydb.archives.splice(go, 1)

  res.redirect("/archive")
})

//creates comments page
app.get("/comment/:commentName", function(req, res){
  const requestedTitle = _.lowerCase(req.params.commentName);
  let guesses = mydb.data

console.log(guesses)
  guesses.forEach(function(guess){
    const storedTitle = _.lowerCase(guess.company);
console.log(storedTitle);
    if (storedTitle === requestedTitle) {
      res.render("comment", {
        company: guess.company,
        title: guess.title,
        comments: guess.comments
      });
    }
  });

});





//checks if user is aunthenticated before loading page
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect('/login')
}
//checks is user is not authenticated before loading page
function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}


const port = process.env.PORT || 8081;
      app.listen(port, () => {
        console.log("Server is listening on: ", port);
      });
