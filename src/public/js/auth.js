// Asynchronous function to handle user login
async function login(username, password) {
  // Send a POST request to the '/auth/login' route with the user's credentials
  const response = await fetch('/auth/login', {
    method: 'POST', // HTTP method is POST
    headers: {
      'Content-Type': 'application/json' // Set the content type to JSON for sending data
    },
    // Send the username and password as the request body, converted to a JSON string
    body: JSON.stringify({ username, password })
  });
  
  // Check if the login request was successful
  if (response.ok) {
    // Parse the JSON response from the server
    const data = await response.json();
    // Save the token received from the server in localStorage for later use
    localStorage.setItem('token', data.token);
    // Redirect the user to the home page or chat page
    window.location.href = '/';
  } else {
    // If login failed, log the error message from the server response
    console.error('Login failed:', await response.json());
  }
}

  
  // Example usage
  // login('testuser', 'password123');
  