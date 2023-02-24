const { assert } = require('chai');

const { userLookup } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('userLookup', function() {
  it('should return a user with valid email', function() {
    const user = userLookup("user@example.com", testUsers)
    const expectedUserID = testUsers.userRandomID;
    assert.equal(user, expectedUserID);
    // Write your assert statement here
  });
  it('should not equal if no user matches', function() {
    const user = userLookup("user5@example.com", testUsers)
    const expectedUserID = testUsers.userRandomID;
    assert.notEqual(user, expectedUserID);
    // Write your assert statement here
  }) 
  it('should return false if no user matches', function() {
    const user = userLookup("user5@example.com", testUsers)
    assert.equal(user, undefined);
    // Write your assert statement here
  })
});