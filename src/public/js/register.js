document.getElementById('registerForm').addEventListener('submit', async (e) => {
  // Prevent the default form submission behavior (which would normally refresh the page)
  e.preventDefault();

  // Get the values entered by the user in the form fields
  const username = document.querySelector('input[name="username"]').value;
  const password = document.querySelector('input[name="password"]').value;

  try {
    // Send a POST request to the /auth/register endpoint with the username and password
    const response = await fetch('/auth/register', {
      method: 'POST', // HTTP method POST for sending data to the server
      headers: {
        'Content-Type': 'application/json', // Specify that the request body is in JSON format
      },
      body: JSON.stringify({ username, password }), // Convert the data to a JSON string to send in the request
    });

    // If the response from the server is not OK (e.g., registration failed), handle the error
    if (!response.ok) {
      const errorData = await response.json(); // Get error details from the server's response
      throw new Error(errorData.error || 'Failed to register'); // Throw an error with the error message from the server or a default message
    }

    // If registration is successful, show a success message and redirect to the login page
    const data = await response.json(); // Parse the response data (likely contains success info)
    alert('Registration successful'); // Alert the user that registration was successful
    window.location.href = '/login'; // Redirect the user to the login page after successful registration
  } catch (error) {
    // Catch and handle any errors that occur during the registration process
    console.error('Error:', error); // Log the error to the console for debugging
    alert('Error: ' + error.message); // Show an alert with the error message
  }
});
