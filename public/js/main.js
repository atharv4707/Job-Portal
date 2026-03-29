// Check if user is authenticated
async function checkAuth() {
  try {
    const response = await fetch('/api/auth/current');
    if (response.ok) {
      const data = await response.json();
      updateNavigation(data.user);
      return data.user;
    }
    return null;
  } catch (error) {
    return null;
  }
}

// Update navigation based on auth status
function updateNavigation(user) {
  const navLinks = document.getElementById('navLinks');
  if (!navLinks) return;
  
  if (user) {
    navLinks.innerHTML = `
      <li><a href="/"><i class="fas fa-home"></i> Home</a></li>
      <li><a href="/jobs"><i class="fas fa-briefcase"></i> Browse Jobs</a></li>
      <li><a href="/dashboard"><i class="fas fa-tachometer-alt"></i> Dashboard</a></li>
      <li><a href="/profile"><i class="fas fa-user"></i> Profile</a></li>
      <li><a href="#" onclick="logout()" class="btn btn-secondary"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
    `;
  }
}

// Logout function
async function logout() {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  } catch (error) {
    console.error('Logout error:', error);
  }
}
