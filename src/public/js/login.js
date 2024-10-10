document.getElementById('loginForm').addEventListener('submit', async (e) => {
  // Prevent the default form submission behavior (page refresh)
  e.preventDefault();

  // Get the username and password values from the form inputs
  const username = document.querySelector('input[name="username"]').value;
  const password = document.querySelector('input[name="password"]').value;

  try {
    // Make a POST request to the /auth/login endpoint with the user's credentials
    const response = await fetch('/auth/login', {
      method: 'POST', // HTTP method is POST
      headers: {
        'Content-Type': 'application/json', // The data being sent is JSON
      },
      body: JSON.stringify({ username, password }), // Convert the username and password to a JSON string
    });

    // If the server response is not OK (e.g., login failed), handle the error
    if (!response.ok) {
      const errorData = await response.json(); // Get the error response from the server
      throw new Error(errorData.error || 'Failed to login'); // Throw an error with the error message from the server or a default message
    }

    // Parse the response data (expected to include a JWT token)
    const data = await response.json();
    // Store the JWT token in local storage for future use (to authenticate further requests)
    localStorage.setItem('token', data.token);
    // Show a success message
    alert('Login successful');
    // Redirect the user to the home page or dashboard after a successful login
    window.location.href = '/';
  } catch (error) {
    // Handle errors such as network issues or invalid login credentials
    console.error('Error:', error); // Log the error in the console for debugging purposes
    alert('Error: ' + error.message); // Show an error message to the user
  }
});
