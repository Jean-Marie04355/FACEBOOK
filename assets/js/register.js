document.getElementById('registerForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const form = this;
  const formData = new FormData(form);
  const messageDiv = document.getElementById('registerMessage');

  try {
    const response = await fetch('../../api/inscription.php', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();

    // Affichage du message
    messageDiv.textContent = result.message;
    messageDiv.className = 'fb-message ' + (result.success ? 'success' : 'error');

    if (result.success) {
      form.reset();
    }

  } catch (error) {
    messageDiv.textContent = "Erreur réseau ou serveur.";
    messageDiv.className = 'fb-message error';
  }
});
