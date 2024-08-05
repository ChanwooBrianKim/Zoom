document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.querySelector('input[name="username"]').value;
  const password = document.querySelector('input[name="password"]').value;

  try {
    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to login');
    }

    const data = await response.json();
    localStorage.setItem('token', data.token); // Store the token in local storage
    alert('Login successful');
    window.location.href = '/'; // Redirect to home page or dashboard
  } catch (error) {
    console.error('Error:', error);
    alert('Error: ' + error.message);
  }
});
