if (process.encNODE_ENV !== "production") {
  require("dotenv").config()
}

//all modules
const express = require("express");
const bodyParser = require("body-parser");
const path = require('path');
const app = express();
const mongoose = require("mongoose");
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require("bcrypt");
const passport = require("passport")
const flash = require("express-flash")
const session = require("express-session")
const initializePassport = require("./passport-config")
const methodOverride = require("method-override")
const date = require(__dirname + "/public/javascript/home.js")
const mydb = require(__dirname + "/public/javascript/database.js")
initializePassport(passport,
  email => mydb.users.find(user => user.email === email),
  id => mydb.users.find(user => user.id === id),
)



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

//deletes table data
//mydb.deleteTable()
//mydb.all()
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

  app.post('/logout', function(req, res){
  mydb.eraseArray()
    req.logout();
    res.redirect('/');
  });


//home page
app.get("/", checkAuthenticated, function(req, res) {

  res.render("home", {
    data: mydb.data
  })
});

//page to add new job
app.get("/new", checkAuthenticated, function(req, res) {

  res.render("new")
});


app.get("/archive", checkAuthenticated, function(req, res) {

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
  let day = date.getDate();
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








function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}


app.listen(3000, function() {
  console.log("Server is on port 3K");
});
