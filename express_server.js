const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello!");
});


app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});


app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get('/u/:id', (req, res) => {
  console.log(req.params.id)
  longURL = urlDatabase[req.params.id]
  console.log(longURL)
  res.redirect(longURL)
})

app.get('/urls/:id', (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id]};
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

