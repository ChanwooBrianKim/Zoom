async function login(username, password) {
    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('token', data.token);
      window.location.href = '/'; // Redirect to the home page or chat page
    } else {
      console.error('Login failed:', await response.json());
    }
  }
  
  // Example usage
  // login('testuser', 'password123');
  