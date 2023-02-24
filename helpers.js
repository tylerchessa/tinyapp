//helper funcitons


const generateRandomString = () => {
  return Math.random().toString(36).slice(2, 8);
};

//search user by email
const userLookup = (email, users) => {
  const keys = Object.keys(users) 
  for (let user of keys) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return undefined;
};

//search urls made by user
const urlsForUser = (id, database) => {
  const newObject = {};
  const shortUrls = Object.keys(database)
  for (let shortUrl of shortUrls) {
  if (database[shortUrl].id === id) {
    newObject[shortUrl] = database[shortUrl].longURL
  }
}
return newObject
};

module.exports = { 
  urlsForUser, 
  userLookup,
  generateRandomString
};