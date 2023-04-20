const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs"); // tells the Express app to use EJS as its templating engine

// middleware which will make data from body of POST request readable
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// function to generate a random short URL ID
const generateRandomString = () => {
  const alphanumericCharacters = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUyVvWwXxYyZz0123456789';
  let result = '';
  for (let i = 1; i <= 6; i++) {
    result += alphanumericCharacters.charAt(Math.floor(Math.random() * alphanumericCharacters.length));
  }
  return result;
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

// look up user by email address
const getUserByEmail = function(email, users) {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return false;
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const user = req.cookies["user_id"];
  const templateVars = { urls: urlDatabase, user: users[user] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user = req.cookies["user_id"];
  const templateVars = { user: users[user] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const user = req.cookies["user_id"];
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user: users[user] };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];

  if (!longURL) {
    res.status(404).send(`Error 404: The URL does not exist.`);
  }
  res.redirect(longURL);
});

// registration page
app.get("/register", (req, res) => {
  const user = req.cookies["user_id"];
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user: users[user] };
  res.render("urls_register", templateVars);
});

// login page
app.get("/login", (req, res) => {
  const user = req.cookies["user_id"];
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user: users[user] };
  res.render("urls_login", templateVars);
});

// POST

// adds new link to database and generates a random id
app.post("/urls", (req, res) => {
  let longURL = req.body.longURL;
  let id = generateRandomString(); // generates short URL id
  urlDatabase[id] = longURL; // saves key-value pair in urlDatabase
  
  console.log(urlDatabase);
  console.log(req.body); // Log the POST request body to the console
  
  res.redirect(`/urls/${id}`); // redirects to new page with new short url created
});

// edit url button
app.post("/urls/:id", (req, res) => {
  let id = req.params.id;
  let editURL = req.body.editURL;
  urlDatabase[id] = editURL;
  res.redirect(`/urls/${id}`); // redirects to urls_show page
  console.log(urlDatabase);
});

// delete url button
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls'); // redirects to urls_index page
  
  console.log(urlDatabase);
});

// login button
app.post("/login", (req, res) => {
  res.cookie('user_id', req.body.id);
  res.redirect('/urls'); // redirects to urls_index page
});

// logout button
app.post("/logout", (req, res) => {
  res.clearCookie('user_id'); // clears the username cookie
  res.redirect('/urls'); // redirects to urls_index page
});

// registration form data
app.post("/register", (req, res) => {
 
  // check if email or password are empty strings
  if ((!req.body.email) || (!req.body.password)) {
    res.status(400).send('Error 400: Please enter a valid username or password.');
  }

  // check if the user exists
  if (getUserByEmail(req.body.email, users)) { // user exists, send error
    res.status(400).send('Error 400: An account with the email already exists. Please enter a new email.');
  } else { // user does not exist, create a new user
    let userID = generateRandomString(); // creates new user ID
    users[userID] = {
      id: userID,
      email: req.body.email,
      password: req.body.password
    };
    res.cookie('user_id', userID);
    console.log(users);
    res.redirect('/urls'); // redirects to urls_index page
  }
  console.log(users);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});