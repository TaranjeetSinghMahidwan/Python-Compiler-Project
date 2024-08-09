const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const port = 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse JSON
app.use(bodyParser.json());

const usersFile = path.join(__dirname, 'users.json');

// Utility function to save users to file
function saveUsers(users) {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}

// Endpoint for user signup
app.post('/signup', (req, res) => {
  const { username, password } = req.body;

  if (!fs.existsSync(usersFile)) {
    fs.writeFileSync(usersFile, JSON.stringify([]));
  }

  const users = JSON.parse(fs.readFileSync(usersFile));
  const userExists = users.find(user => user.username === username);

  if (userExists) {
    return res.json({ error: 'Username already exists' });
  }

  users.push({ username, password });
  saveUsers(users);
  res.json({ message: 'Signup successful' });
});

// Endpoint for user login
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!fs.existsSync(usersFile)) {
    return res.json({ error: 'No users found' });
  }

  const users = JSON.parse(fs.readFileSync(usersFile));
  const user = users.find(user => user.username === username && user.password === password);

  if (user) {
    res.json({ message: 'Login successful' });
  } else {
    res.json({ error: 'Invalid credentials' });
  }
});

// Endpoint to run the Python code
app.post('/run', (req, res) => {
  const { code } = req.body;

  const filePath = path.join(__dirname, 'temp.py');
  fs.writeFileSync(filePath, code);

  exec(`python3 ${filePath}`, (error, stdout, stderr) => {
    if (error) {
      res.status(500).json({ error: stderr || error.message });
    } else {
      res.json({ output: stdout });
    }

    fs.unlinkSync(filePath); // Clean up the temporary file
  });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
