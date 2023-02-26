const { urlsForUser, userLookup, generateRandomString } = require('./helper_functions/helpers');
const { urlDatabase, users } = require('./databases/database');
const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['ja3nf3i'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));


// homepage
app.get("/", (req, res) => {
  if (!users[req.session['userID']]) {
    res.redirect('/login');
    return;
  }
  res.redirect('/urls');
});


//acount pages (Register, Login, Logout)
app.get('/register', (req, res) => {
  const templateVars = {
    user: users[req.session['userID']]
  };
  if (users[req.session['userID']]) {
    res.redirect('/urls');
    return;
  };
  res.render('register', templateVars);
});

app.post('/register', (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(400).send('Please enter both email and password. <a href="/register">Try again</a>');
    return;
  }
  if (userLookup(req.body.email, users)) {
    res.status(400).send('Email already exists. <a href="/register">Go back</a>');
    return;
  }
  const userID = generateRandomString();
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  users[userID] = {
    id: userID,
    email: req.body.email,
    password: hashedPassword
  };
  req.session['userID'] = userID;
  res.redirect('/urls');
});


app.get('/login', (req, res) => {
  const templateVars = {
    user: users[req.session['userID']]
  };
  if (users[req.session['userID']]) {
    res.redirect('/urls');
    return;
  };
  res.render('login', templateVars);
});

app.post('/login', (req, res) => {
  const user = userLookup(req.body.email, users);
  if (!user) {
    res.status(403).send('Email and password do not match. <a href="/login">Try again</a>');
    return;
  }
  if (!bcrypt.compareSync(req.body.password, user.password)) {
    res.status(403).send('Password is incorrect. <a href="/login">Try again</a>');
    return;
  }
  req.session['userID'] = user.id;
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  req.session.userID = null;
  req.session = null;
  res.redirect('/login');
});


//url pages (restricted pages/ need to be logged in)
app.get("/urls", (req, res) => {
  if (!users[req.session['userID']]) {
    res.status(401).send('you are not logged in. <a href="/login">Click here to login</a>');
    return;
  }
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session['userID']],
    userUrls: urlsForUser(req.session['userID'], urlDatabase)
  };
  res.render('urls_index', templateVars);
});

app.post("/urls", (req, res) => {
  if (!users[req.session['userID']]) {
    res.send('you need to be logged in to use this feature. <a href="/login">Click here to login</a>');
    return;
  };
  const shortURL = generateRandomString(req.body.longURL);
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    id: req.session['userID']
  };
  res.redirect(`/urls/${shortURL}`);
});


app.get("/urls/new", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session['userID']]
  };
  if (!users[req.session['userID']]) {
    res.redirect('/login');
    return;
  };
  res.render("urls_new", templateVars);
});

app.get('/urls/:id', (req, res) => {
  if (!users[req.session['userID']]) {
    res.status(401).send('you need to be logged in to use this feature. <a href="/login">Click here to login</a>');
    return;
  };
  if (!urlDatabase[req.params.id]) {
    res.status(400).send('id does not exist. <a href="/urls/new">Click here to create a new TinyURL</a>');
    return
  };
  if (urlDatabase[req.params.id].id !== req.session['userID']) {
    res.status(401).send('You do not own this URL. <a href="/urls/new">Click here to create your own</a>');
    return
  }
  const templateVars = {
    id: req.params.id, longURL: urlDatabase[req.params.id].longURL,
    user: users[req.session['userID']]
  };
  res.render('urls_show', templateVars);
});

app.post('/urls/:id', (req, res) => {
  if (!users[req.session['userID']]) {
    res.status(401).send('you need to be logged in to use this feature. <a href="/login">Click here to login</a>');
    return;
  };
  if (urlDatabase[req.params.id].id !== req.session['userID']) {
    res.status(401).send('You do not own this URL. <a href="/urls/new">Click here to create your own</a>');
    return
  }
  if (!urlDatabase[req.params.id]) {
    res.status(400).send('id does not exist. <a href="/urls/new">Click here to create a new TinyURL</a>');
    return
  };
  urlDatabase[req.params.id] = {
    longURL: req.body.longURL,
    id: req.session['userID']
  };
  res.redirect('/urls');
});

app.get('/u/:id', (req, res) => {
  longURL = urlDatabase[req.params.id];
  if (!longURL) {
    res.status(400).send(`url is not in the database. <a href="/urls/new">Click here to create a new TinyURL</a>`);
    return
  }
  res.redirect(longURL.longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  if (!users[req.session['userID']]) {
    res.status(401).send('you need to be logged in to use this feature. <a href="/login">Click here to login</a>');
    return;
  };
  if (urlDatabase[req.params.id].id !== req.session['userID']) {
    res.status(401).send('You do not own this URL. <a href="/urls/new">Click here to create your own</a>');
    return
  }
  if (!urlDatabase[req.params.id]) {
    res.status(400).send('id does not exist. <a href="/urls/new">Click here to create a new TinyURL</a>');
    return
  };
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});


// extra pages
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


// lets you know in the terminal when the app is online
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

