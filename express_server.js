const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs"); // tells the Express app to use EJS as its templating engine

// middleware which will make data from body of POST request readable
app.use(express.urlencoded({ extended: true }));

// function to generate a random short URL ID
function generateRandomString() {
  const alphanumericCharacters = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUyVvWwXxYyZz0123456789';
  let result = '';
  for (let i = 1; i <= 6; i++) {
    result += alphanumericCharacters.charAt(Math.floor(Math.random() * alphanumericCharacters.length));
  }
  return result;
}

console.log(generateRandomString());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
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

// delete url button
app.post("/urls/:id/delete", (req, res) => {
  let shortURL = req.params.id;
  delete urlDatabase[shortURL];
  res.redirect('/urls'); // redirects to urls_index page
  console.log(urlDatabase);

});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});