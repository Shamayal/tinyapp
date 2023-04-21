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
const urlsForUser = function(id, data) {
  let userURLs = {};
  for (let tinyLink in data) {
    if (data[tinyLink].userID === id) {
      userURLs[tinyLink] = data[tinyLink].longURL;
    }
  }
  return userURLs;
};

module.exports = { generateRandomString, getUserByEmail, urlsForUser };