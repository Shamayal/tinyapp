// function to generate a random short URL ID
const generateRandomString = () => {
  const alphanumericCharacters = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUyVvWwXxYyZz0123456789';
  let result = '';
  for (let i = 1; i <= 6; i++) {
    // randomly selects an index of the character and adds that letter to the string
    result += alphanumericCharacters.charAt(Math.floor(Math.random() * alphanumericCharacters.length));
  }
  return result;
};

// look up user by email address
const getUserByEmail = function(email, users) {
  for (let user in users) {
    // loops through users to find the object value that equals the email passed as the argument
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
    // loops through the database to find a user id that matches the id passed as the argument
    if (data[tinyLink].userID === id) {
      // match found, shortURL and longURL key-value pair added to object
      userURLs[tinyLink] = data[tinyLink].longURL;
    }
  }
  return userURLs;
};

module.exports = { generateRandomString, getUserByEmail, urlsForUser };