const { urlDatabase } = require('./express_server');

// function to generate a random short URL ID
const generateRandomString = () => {
  const alphanumericCharacters = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUyVvWwXxYyZz0123456789';
  let result = '';
  for (let i = 1; i <= 6; i++) {
    result += alphanumericCharacters.charAt(Math.floor(Math.random() * alphanumericCharacters.length));
  }
  return result;
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
};

module.exports = { generateRandomString, getUserByEmail, urlsForUser };