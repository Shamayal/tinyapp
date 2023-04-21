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

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "aJ48lW",
  }
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
  aJ48lW: {
    id: "aJ48lW",
    email: "example@gmail.com",
    password: "hello-world123*",
  }
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

// returns short and long URLs associated with the logged-in user
const urlsForUser = function(id) {
 let userURLs = {};
 for (let tinyLink in urlDatabase) {
  if (urlDatabase[tinyLink].userID === id) {
    userURLs[tinyLink] = urlDatabase[tinyLink].longURL;
  }
 }
 console.log(userURLs);
 return userURLs;
}

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
  const templateVars = { urls: urlsForUser(user), user: users[user] };

  if (user) { // displays links associated with user cookie
    res.render("urls_index", templateVars);
  } else {
    res.status(401).send('Error 401: Please login or register to view URLs.'); // error message to display
  }
});

app.get("/urls/new", (req, res) => {
  const user = req.cookies["user_id"];
  const templateVars = { user: users[user] };

  if (!user) {
    res.redirect(`/login`); // user not logged in, redirect to /login
  } else {
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:id", (req, res) => {
  const user = req.cookies["user_id"];

  //const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user: users[user] };
  const templateVars = { urls: urlsForUser(user), user: users[user], id: req.params.id , longURL: urlsForUser(user)[req.params.id]};

  if (user) {
    if (urlsForUser(user)[req.params.id]) { // displays link
      res.render("urls_show", templateVars);
    } else {
      res.status(401).send('Error 401: You are not authorized to view or edit other users\' URLs.'); // error message to display
    }
  } else {
    res.status(401).send('Error 401: Please login to view or edit URLs'); // error message to display
  }
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id].longURL;

  if (!longURL) {
    res.status(404).send(`Error 404: The URL does not exist in our database.`);
  }
  res.redirect(longURL);
});

// registration page
app.get("/register", (req, res) => {
  const user = req.cookies["user_id"];
  const templateVars = { user: users[user] };

  if (user) {
    res.redirect(`/urls`); // redirect to /urls if user logged in
  } else {
    res.render("urls_register", templateVars);
  }
});

// login page
app.get("/login", (req, res) => {
  const user = req.cookies["user_id"];
  const templateVars = { user: users[user] };
  
  if (user) {
    res.redirect(`/urls`); // redirect to /urls if user logged in
  } else {
    res.render("urls_login", templateVars);
  }
});

// POST

// adds new link to database and generates a random id
app.post("/urls", (req, res) => {
  const user = req.cookies["user_id"];

  if (user) {
    let longURL = req.body.longURL;
    let id = generateRandomString(); // generates short URL id
    urlDatabase[id] = {longURL: longURL}; // saves key-value pair in urlDatabase
    res.redirect(`/urls/${id}`); // redirects to new page with new short url created

    console.log(urlDatabase);
    console.log(req.body); // Log the POST request body to the console
  } else { // if user not logged in, respond with message in command line
    res.status(401).send('Error 401: Unauthorized request. Please login to shorten URLs.');
  }
});

// edit url button
app.post("/urls/:id", (req, res) => {
  const user = req.cookies["user_id"];
  let id = req.params.id;

  if (urlsForUser(user).id) {
    let editURL = req.body.editURL;
    urlDatabase[id] = {longURL: editURL, userID: user};
    res.redirect(`/urls/${id}`); // redirects to urls_show page
    console.log(urlDatabase);
  } else {
    res.status(401).send('Error 401: You are not authorized to edit this URL.'); // error message to display
  }
});

// delete url button
app.post("/urls/:id/delete", (req, res) => {
  const user = req.cookies["user_id"];
  let id = req.params.id;

  if (urlsForUser(user)[id]) {
    delete urlDatabase[id];
    res.redirect('/urls'); // redirects to urls_index page
    console.log(urlDatabase);
  } else {
    res.status(401).send('Error 401: You are not authorized to delete this URL.'); // error message to display
  }
});

// login button
app.post("/login", (req, res) => {
  // check if email is found in database
  if (getUserByEmail(req.body.email, users)) { // true, check if password matches
    let user = getUserByEmail(req.body.email, users);
    if (req.body.password === user.password) { // happy path, password matches
      let userID = getUserByEmail(req.body.email, users).id;
      res.cookie('user_id', userID);
      res.redirect('/urls'); // redirects to urls_index page
    } else { // incorrect password
      res.status(403).send('Error 403: Incorrect password. Please try again.');
    }
  } else { // email can't be found
    res.status(403).send('Error 403: The user does not exist. Please register for a new account.');
  }
});

// logout button
app.post("/logout", (req, res) => {
  res.clearCookie('user_id'); // clears the user_id cookie
  res.redirect('/login'); // redirects to urls_index page
});

// registration form data
app.post("/register", (req, res) => {
 
  // check if email or password are empty strings
  if ((!req.body.email) || (!req.body.password)) {
    res.status(400).send('Error 400: Please enter a valid email or password.');
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