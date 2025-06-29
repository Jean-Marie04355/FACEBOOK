document.getElementById('indexLoginForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const formData = new FormData(this);
  const messageDiv = document.getElementById('indexLoginMessage');

  try {
    const response = await fetch('api/login.php', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();

    messageDiv.textContent = result.message;
    messageDiv.className = 'fb-message ' + (result.success ? 'success' : 'error');

    if (result.success) {
      sessionStorage.setItem('user', JSON.stringify(result.user));
      window.location.href = 'vues/clients/accueil.html';
    }

  } catch (error) {
    messageDiv.textContent = "Erreur réseau ou serveur.";
    messageDiv.className = 'fb-message error';
  }
});
