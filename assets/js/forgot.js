// Écoute de la soumission du formulaire
document.getElementById('forgotForm').addEventListener('submit', async function(e) {
  e.preventDefault();  // Empêche le rechargement

  const messageDiv = document.getElementById('forgotMessage');
  messageDiv.textContent = '';  // Reset message
  messageDiv.className = '';    // Reset classes

  const formData = new FormData(this);

  try {
    // Envoi POST à l'API backend (à créer)
    const response = await fetch('../../api/forgot_password.php', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();

    // Affiche message selon succès ou erreur
    messageDiv.textContent = result.message;
    messageDiv.className = result.success ? 'success' : 'error';

  } catch (error) {
    // Message erreur réseau ou serveur
    messageDiv.textContent = "Erreur réseau ou serveur.";
    messageDiv.className = 'error';
  }
});
