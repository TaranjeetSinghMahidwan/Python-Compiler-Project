const codeInput = CodeMirror.fromTextArea(document.getElementById('codeInput'), {
  mode: 'python',
  lineNumbers: true,
  indentUnit: 4,
  tabSize: 4,
  autoClearEmptyLines: true,
  matchBrackets: true,
  lineWrapping: true
});

// Utility function to show alert messages
function showAlert(message, isSuccess = false) {
  const alertBox = document.createElement('div');
  alertBox.textContent = message;
  alertBox.className = `alert-box ${isSuccess ? 'success' : ''}`;
  document.body.appendChild(alertBox);
  setTimeout(() => {
    alertBox.remove();
  }, 3000);
}

// Validate Signup Input
function validateSignup(username, password) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(username)) {
    showAlert("Username must be in the form of an email address.");
    return false;
  }
  if (password.length > 8) {
    showAlert("Password should be a maximum of 8 characters.");
    return false;
  }
  if (password.toLowerCase() === "password") {
    showAlert("Password cannot be 'password'.");
    return false;
  }
  if (username === password) {
    showAlert("Username and password cannot be the same.");
    return false;
  }
  return true;
}

// Handle Sign Up
document.getElementById('signupForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const username = document.getElementById('signupUsername').value;
  const password = document.getElementById('signupPassword').value;

  if (!validateSignup(username, password)) return;

  const response = await fetch('/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const result = await response.json();
  if (result.message) {
    showAlert(result.message, true);  // Show success message
  } else if (result.error) {
    showAlert(result.error);  // Show error message
  }
});

// Handle Login
document.getElementById('loginForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;

  const response = await fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const result = await response.json();
  if (result.message === 'Login successful') {
    showAlert(result.message, true);  // Show success message
    document.getElementById('authSection').style.display = 'none';
    document.getElementById('compilerSection').style.display = 'block';
  } else if (result.error) {
    showAlert(result.error);  // Show error message
  }
});

async function runCode() {
  const code = codeInput.getValue();
  const response = await fetch('/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code })
  });

  if (!response.ok) {
    const error = await response.json();
    showAlert(`Error: ${error.error}`);  // Show error message
    return;
  }

  const result = await response.json();
  document.getElementById('consoleOutput').textContent = result.output;
}

function downloadCode() {
  const code = codeInput.getValue();
  const blob = new Blob([code], { type: 'text/x-python' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'code.py';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
