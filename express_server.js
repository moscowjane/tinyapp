var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
// var cookieParser = require("cookie-parser");
var session = require("session");
var bcrypt = require("bcrypt");
var cookieSession = require("cookie-session");

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
// app.use(cookieParser());
app.use(cookieSession){
  name: "session",
  keys: [],
  maxAge: 24 * 60 * 60 *1000
}

var urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID: "userRandomID"},
  "9sm5xK": {longURL: "http://www.google.com", userID: "user2RandomID"}
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  "user3RandomID": {
    id: "user3RandomID",
    email: "user3@example.com",
    password: "jane"
  }
};

function isEmailTaken(email) {
  for (let userId in users) {
    if(users[userId].email === email) {
      return true;
    }
    return false;
  }
}

function generateRandomID() {
  var user_id = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 6; i++) {
    user_id+= possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return user_id;
}

function generateRandomString() {
  var link = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 6; i++) {
    link += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return link;
}

function findUser(email){
  var user;
  for (let userId in users) {
    if(users[userId].email === email) {
      user = users[userId];
    }
  }
  return user;
}

function getUrlsforUser(user_id){
  var urls = {};
  for (var url in urlDatabase) {
    //if current url belongs to user
    if(urlDatabase[url].userID === user_id) {
    //copy to urls from database
      urls[url] = urlDatabase[url];
    }
  }
  return urls;
}

function hashSync() {}

app.use((req, res, next) =>{
  res.locals.user = users[req.cookies.user_id];
  next();
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello<b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const user_id = req.cookies.user_id;
  let templateVars = { urls: getUrlsforUser(user_id),
    user: users[user_id]};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res ) => {
  //guard statement preventing execution of function if error found
  if (!req.cookies.user_id) {
    //deal with error
    res.redirect("/login");
    return
  }
  //return html with new url format
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
   if (urlDatabase[req.params.id].userID != req.cookies.user_id) {
    //deal with error
    res.send(403);
    return
  }
  var display = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id].longURL
  };
  let templateVars = display;
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
    if (!req.cookies.user_id) {
    //deal with error
    res.redirect("/login");
    return
  }
  let shortURL = generateRandomString();
  let longURL = req.body["longURL"];
  urlDatabase[shortURL] = {longURL: longURL, userID: req.cookies.user_id};
  res.redirect("/urls/"+ shortURL);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

// app.post("/urls/login", (req, res) => {
//  res.cookie("username", req.body.username);
//  res.redirect("/urls");
// });

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {

   bcrypt.compareSync("purple-monkey-dinosaur", hashedPassword); // returns true
   bcrypt.compareSync("pink-donkey-minotaur", hashedPassword); // returns false

  const { email, password } = req.body;
  const user = findUser(email);

  if (user && password === user.password) {
    res.cookie("user_id", user.id)
    res.redirect("/urls");
  } else {
    res.status(403);
    res.render("login");
  }
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req,res) => {

  const bcrypt = require('bcrypt');
  let password = "purple-monkey-dinosaur"; // you will probably this from req.params
  let saltRounds = 10;

  var salt = bcrypt.genSaltSync(saltRounds);

  var hash = bcrypt.hashSync(password, salt);

  console.log(hash);

  // if (bcrypt.compareSync(password, hash) {
  //   console.log("The password is a match!");
  // } else {
  //   console.log("The password is not a match.");
  // }

  const hashedPassword = bcrypt.hashSync(password, 10);
  console.log("hashedPassword")

  //add new user object in users, to keep track of email, password and user ID
  if (req.body.email === "" || req.body.password === "") {
   res.status(400).send("400! Email or password empty");
   return;
  }
  if (isEmailTaken(req.body.email)) {
   res.status(400).send("400!");
   return;
  }
  let user_id = generateRandomID();
  users[user_id] = {
    email: req.body.email,
    password: req.body.password,
    id: user_id
  }
  console.log(users);
  res.cookie("user_id", user_id)
  res.redirect("/urls");
});

app.post("/logout", (req,res) => {
 res.clearCookie("user_id");
 res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

