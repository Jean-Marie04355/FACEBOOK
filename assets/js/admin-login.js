document.getElementById('adminLoginForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const formData = new FormData(this);
  const messageDiv = document.getElementById('adminLoginMessage');

  try {
    const response = await fetch('../../api/login.php', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();

    if (result.success && result.user.role === 'admin') {
      sessionStorage.setItem('user', JSON.stringify(result.user));
      window.location.href = '../admin/dashboard.html';
    } else {
      messageDiv.textContent = "Accès refusé : rôle non autorisé.";
      messageDiv.className = 'fb-message error';
    }
  } catch (error) {
    messageDiv.textContent = "Erreur réseau ou serveur.";
    messageDiv.className = 'fb-message error';
  }
});
