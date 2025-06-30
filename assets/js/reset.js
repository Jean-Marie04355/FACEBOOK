// Récupérer token dans l'URL
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

const form = document.getElementById('resetForm');
const msg = document.getElementById('resetMessage');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const newPass = form.new_password.value;
  const confirmPass = form.confirm_password.value;

  if (newPass !== confirmPass) {
    msg.textContent = 'Les mots de passe ne correspondent pas.';
    msg.className = 'fb-message error';
    return;
  }

  const formData = new FormData();
  formData.append('token', token);
  formData.append('new_password', newPass);

  try {
    const res = await fetch('../../api/reset_password.php', { method: 'POST', body: formData });
    const data = await res.json();

    msg.textContent = data.message;
    msg.className = 'fb-message ' + (data.success ? 'success' : 'error');

    if (data.success) {
      setTimeout(() => window.location.href = '../../index.html', 2000);
    }
  } catch {
    msg.textContent = 'Erreur serveur.';
    msg.className = 'fb-message error';
  }
});
