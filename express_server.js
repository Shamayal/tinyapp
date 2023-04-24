const express = require("express");
const cookieSession = require('cookie-session');
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require("bcryptjs");
const { generateRandomString, getUserByEmail, urlsForUser } = require('./helpers');

// Express app will use EJS as its templating engine
app.set("view engine", "ejs");

// middleware which will make data from body of POST request readable
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ["userID"]
}));

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "WhnG77",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "ydNGzw",
  },
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "ydNGzw",
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
  'WhnG77': {
    id: "WhnG77",
    email: "testing@outlook.com",
    password: "$2a$10$J1A/brB65/ysOhMixT5dtegyxLbJ40QZRKLNUkyYr5mWQzi8pi6vO", //asdf99%
  },
  'ydNGzw': {
    id: "ydNGzw",
    email: "example@gmail.com",
    password: "$2a$10$WVkb40fs3OL3NTrNHFxWK.8DahSqK4FBRbqC51sQ7B46OXxOZz0Ei", //hello-world123*
  },
  'YQCLev': {
    id: "ydNGzw",
    email: "project@gmail.com",
    password: "$2a$10$Z/yJcbNZyn1u77d0oeNU3ebOq/2UzYe3tMf.HqId40ZFN88vgY4vG", //1
  }
};

// GET Requests

// checks if user is logged in based on cookies to redirect to the right page
app.get("/", (req, res) => {
  const user = req.session["user_id"];

  if (user) {
    res.redirect(`/urls`);
  } else {
    res.redirect(`/login`);
  }
});

// homepage that displays the shortened URLs saved by the user
app.get("/urls", (req, res) => {
  const user = req.session["user_id"];
  const templateVars = { urls: urlsForUser(user, urlDatabase), user: users[user] };

  // checks if user is logged in based on cookies to show urls or error page
  if (user) {
    res.render("urls_index", templateVars);
  } else {
    res.status(401).send('Error 401: Please login or register to view URLs.');
  }
});

// create new TinyURL page 
app.get("/urls/new", (req, res) => {
  const user = req.session["user_id"];
  const templateVars = { user: users[user] };

  // checks if user is logged in based on cookies to show create page or login page
  if (!user) {
    res.redirect(`/login`);
  } else {
    res.render("urls_new", templateVars);
  }
});

// displays the short url id navigation link and edit option to change the long url
app.get("/urls/:id", (req, res) => {
  const user = req.session["user_id"];
  const userURLs = urlsForUser(user, urlDatabase);
  const templateVars = { urls: userURLs, user: users[user], id: req.params.id , longURL: userURLs[req.params.id]};

  // checks if user is logged in and is the short url id was created by that user
  if (user) {
    if (userURLs[req.params.id]) {
      res.render("urls_show", templateVars);
    } else {
      res.status(401).send('Error 401: You are not authorized to view or edit other users\' URLs.');
    }
  } else {
    res.status(401).send('Error 401: Please login to view or edit URLs');
  }
});

// navigates to the link associated with the short url id
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const shortURL = urlDatabase[id];

  if (shortURL === undefined) {
    res.status(404).send(`Error 404: The URL does not exist in our database.`);
  }
  res.redirect(shortURL.longURL);
});

// registration page
app.get("/register", (req, res) => {
  const user = req.session["user_id"];
  const templateVars = { user: users[user] };
    
  // checks if user is logged in based on cookies to show homepage or registration page
  if (user) {
    res.redirect(`/urls`);
  } else {
    res.render("urls_register", templateVars);
  }
});

// login page
app.get("/login", (req, res) => {
  const user = req.session["user_id"];
  const templateVars = { user: users[user] };
  
  // checks if user is logged in based on cookies to show homepage or login page
  if (user) {
    res.redirect(`/urls`);
  } else {
    res.render("urls_login", templateVars);
  }
});

// POST Requests

// adds new link to database and generates a random id
app.post("/urls", (req, res) => {
  const user = req.session["user_id"];

  // checks if user is logged in based on cookies to show homepage or error page
  if (user) {
    let longURL = req.body.longURL;
    // generates random id
    let id = generateRandomString();

    // saves key-value pair in urlDatabase
    urlDatabase[id] =
    {
      longURL,
      userID: user,
    };
    // redirects to new page with new short url created
    res.redirect(`/urls/${id}`);

  } else {
    res.status(401).send('Error 401: Unauthorized request. Please login to shorten URLs.');
  }
});

// edit url route
app.post("/urls/:id", (req, res) => {
  const user = req.session["user_id"];
  let id = req.params.id;

  // checks if user has authority to edit url
  if ((urlsForUser(user, urlDatabase))[id]) {
    let editURL = req.body.editURL;
    // updates the database with new longURL link
    urlDatabase[id] = {longURL: editURL, userID: user};
    res.redirect('/urls');
  } else {
    res.status(401).send('Error 401: You are not authorized to edit this URL.');
  }
});

// delete url route
app.post("/urls/:id/delete", (req, res) => {
  const user = req.session["user_id"];
  let id = req.params.id;

  // checks if user has authority to delete url
  if (urlsForUser(user, urlDatabase)[id]) {
    delete urlDatabase[id];
    res.redirect('/urls');
  } else {
    res.status(401).send('Error 401: You are not authorized to delete this URL.');
  }
});

// login form route
app.post("/login", (req, res) => {
  // check if email is found in database
  if (getUserByEmail(req.body.email, users)) {
    // true, now check if password matches database
    let user = getUserByEmail(req.body.email, users);
    if (bcrypt.compareSync(req.body.password, user.password)) { 
      // password matches, navitage to home page
      let userID = getUserByEmail(req.body.email, users).id;
      req.session["user_id"] = userID;
      res.redirect('/urls');
    } else { 
      // email in database but password does not match 
      res.status(403).send('Error 403: Incorrect password. Please try again.');
    }
  } else { 
    // email is not found in database 
    res.status(403).send('Error 403: The user does not exist. Please register for a new account.');
  }
});

// logout route
app.post("/logout", (req, res) => {
  // clear the session cookies and redirects to login page
  res.clearCookie("session");
  res.redirect('/login');
});

// registration form route
app.post("/register", (req, res) => {
 
  // check if email or password are empty strings
  if ((!req.body.email) || (!req.body.password)) {
    res.status(400).send('Error 400: Please enter a valid email or password.');
  }

  // check if the email exists in database
  if (getUserByEmail(req.body.email, users)) {
    // send error, email already used
    res.status(400).send('Error 400: An account with the email already exists. Please enter another email.');
  } else { 
    // user does not exist, create a new user
    let userID = generateRandomString();
    // adds new user to users database
    users[userID] = {
      id: userID,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    };
    // creates cookie and redirects to homepage
    req.session["user_id"] = userID;
    res.redirect('/urls');
  }
});

// Lets user know they are connected to the server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});