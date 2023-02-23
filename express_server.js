const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
};

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    user: users[req.cookies['userID']]
  };
  res.send("Hello!", templateVars);
});

app.get('/register', (req, res) => {
  const templateVars = { 
    user: users[req.cookies['userID']]
  };
  res.render('register', templateVars);
});

app.post('/register', (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(400).send('Please enter both email and password')
    return;
  }
  if (userLookup(req.body.email)) {
    res.status(400).send('Email already exists')
    return;
  }
  const userID = generateRandomString();
  users[userID] = {
    id: userID,
    email: req.body.email,
    password: req.body.password
  }
  res.cookie('userID', userID)
  res.redirect('/urls');
})


app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    user: users[req.cookies['userID']]
  };
  res.render('urls_index', templateVars);
});


app.get("/urls/new", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    user: users[req.cookies['userID']]
  };
  res.render("urls_new", templateVars);
});

app.get('/u/:id', (req, res) => {
  console.log(req.params.id)
  longURL = urlDatabase[req.params.id]
  console.log(longURL)
  res.redirect(longURL)
})

app.get('/urls/:id', (req, res) => {
  const templateVars = { 
    id: req.params.id, longURL: urlDatabase[req.params.id],
      user: users[req.cookies['userID']]
    };
  res.render('urls_show', templateVars);
}); 

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const shortURL = generateRandomString(req.body.longURL)
  urlDatabase[shortURL] = req.body.longURL
  res.redirect(`/urls/${shortURL}`);
});

app.get('/login', (req, res) => {
  const templateVars = { 
    user: users[req.cookies['userID']]
  };
  res.render('login', templateVars);
});

app.post('/login', (req, res) => {
  const user = userLookup(req.body.email)
  console.log(user)
  if (!user) {
    res.status(403).send('Email does not exist')
    return;
  }
  if (user.password !== req.body.password) {
    res.status(403).send('Password is incorrect')
    return;
  }
  res.cookie('userID', user.id)
  res.redirect('/urls')
})

app.post('/logout', (req, res) => {
  res.clearCookie('userID', users.id);
  res.redirect('/login')
})

app.post('/urls/:id', (req, res) => {
  console.log(req.body)
  urlDatabase[req.params.id] = req.body.longURL
  res.redirect('/urls')
})

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id]
  res.redirect('/urls')
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  return Math.random().toString(36).slice(2, 8);
};

const userLookup = (email) => {
  const keys = Object.keys(users) 
  for (let user of keys) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return false;
};