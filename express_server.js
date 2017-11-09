var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
var cookieParser = require("cookie-parser");

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

function generateRandomString() {
  var link = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 6; i++) {
    link += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return link;
}
app.use((req, res, next) =>{
  res.locals.username = req.cookies.username;
  next();
})
app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello<b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  var display = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  let templateVars = display;
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body["longURL"];
  urlDatabase[shortURL] = longURL;
  console.log(req.body);  // debug statement to see POST parameters
  res.redirect("/urls/"+ shortURL);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/urls/login", (req, res) => {
 res.cookie("username", req.body.username);
 res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/logout", (req,res) => {
 res.clearCookie("username");
 res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

