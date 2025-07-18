// ==================== GESTION DES SECTIONS ====================

function showSection(sectionId) {
  // Masquer toutes les sections
  document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));

  // Afficher la section demandée
  const section = document.getElementById(sectionId);
  if (section) section.classList.add('active');

  // Gérer l’état actif du menu latéral
  document.querySelectorAll('.sidebar .nav li').forEach(li => li.classList.remove('active'));
  const activeMenu = document.getElementById('menu-' + sectionId);
  if (activeMenu) activeMenu.classList.add('active');

  // Charger les données selon la section
  if (sectionId === 'utilisateurs') chargerUtilisateurs();
  if (sectionId === 'statistiques') {
    chargerStatistiques();
    chargerActiviteMensuelle();
  }
}

// ==================== FILTRER SECTIONS SELON RÔLE ====================

function filtrerSectionsParRole() {
  const role = localStorage.getItem("adminUserRole");

  if (role === "moderator") { // Attention: "moderator" en anglais
    const interdites = ['stats', 'roles', 'maintenance', 'settings'];
    interdites.forEach(id => {
      const section = document.getElementById(id);
      const menu = document.getElementById('menu-' + id);
      if (section) section.style.display = 'none';
      if (menu) menu.style.display = 'none';
    });
  }
}

// ==================== GESTION DES UTILISATEURS ====================

let utilisateurs = [];

function chargerUtilisateurs() {
  const container = document.getElementById('utilisateurs');
  container.innerHTML = "Chargement...";

  fetch('../../api/admin/get_users.php')
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        utilisateurs = data.users;
        afficherUtilisateurs(utilisateurs);
      } else {
        container.innerHTML = `<p class="error">${data.message}</p>`;
      }
    })
    .catch(() => {
      container.innerHTML = `<p class="error">Erreur réseau</p>`;
    });
}

function afficherUtilisateurs(liste) {
  const container = document.getElementById('utilisateurs');
  const role = localStorage.getItem("adminUserRole");

  if (liste.length === 0) {
    container.innerHTML = "<p>Aucun utilisateur trouvé.</p>";
    return;
  }

  let html = `
    <table class="admin-table">
      <thead>
        <tr><th>ID</th><th>Nom</th><th>Prénom</th><th>Email</th><th>Rôle</th><th>Actions</th></tr>
      </thead>
      <tbody>`;

  liste.forEach(user => {
    html += `
      <tr data-id="${user.id}">
        <td>${user.id}</td>
        <td>${user.nom}</td>
        <td>${user.prenom}</td>
        <td>${user.email}</td>
        <td>${user.user_role}</td>
        <td>
          ${role === "admin" ? `<button class="btn-edit" onclick="modifierUtilisateur(${user.id})">Modifier</button>` : ''}
          <button class="btn-delete" onclick="supprimerUtilisateur(${user.id})">Supprimer</button>
        </td>
      </tr>`;
  });

  html += `</tbody></table>`;
  container.innerHTML = html;
}

function modifierUtilisateur(id) {
  const user = utilisateurs.find(u => u.id == id);
  if (!user) return;

  document.getElementById('edit-id').value = user.id;
  document.getElementById('edit-nom').value = user.nom;
  document.getElementById('edit-prenom').value = user.prenom;
  document.getElementById('edit-email').value = user.email;
  document.getElementById('edit-role').value = user.user_role;

  document.getElementById('editModal').style.display = 'flex';
}

function fermerModal() {
  document.getElementById('editModal').style.display = 'none';
}

document.getElementById('editForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const formData = new FormData(this);

  fetch('../../api/admin/update_user.php', {
    method: 'POST',
    body: formData
  })
    .then(res => res.json())
    .then(result => {
      alert(result.message);
      if (result.success) {
        const id = formData.get('id');
        const index = utilisateurs.findIndex(u => u.id == id);
        if (index !== -1) {
          utilisateurs[index] = {
            ...utilisateurs[index],
            nom: formData.get('nom'),
            prenom: formData.get('prenom'),
            email: formData.get('email'),
            user_role: formData.get('user_role')
          };
        }

        afficherUtilisateurs(utilisateurs);
        fermerModal();
      }
    })
    .catch(() => {
      alert("Erreur réseau lors de la mise à jour.");
    });
});

function supprimerUtilisateur(id) {
  if (!confirm("Confirmer la suppression de cet utilisateur ?")) return;

  const formData = new FormData();
  formData.append("id", id);

  fetch(`../../api/admin/delete_user.php`, {
    method: 'POST',
    body: formData
  })
    .then(res => res.json())
    .then(result => {
      alert(result.message);
      if (result.success) {
        utilisateurs = utilisateurs.filter(u => u.id != id);
        afficherUtilisateurs(utilisateurs);
      }
    })
    .catch(() => {
      alert("Erreur lors de la suppression.");
    });
}

// ==================== STATISTIQUES ====================

function chargerStatistiques() {
  fetch('../../api/admin/get_stats.php')
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        document.getElementById('stat-total-users').innerText = `👥 Utilisateurs : ${data.total_users}`;
        document.getElementById('stat-admins').innerText = `👑 Admins : ${data.admins}`;
        document.getElementById('stat-moderateurs').innerText = `🧑‍⚖️ Modérateurs : ${data.moderateurs}`;
        document.getElementById('stat-users').innerText = `🙋 Utilisateurs simples : ${data.users}`;
        document.getElementById('stat-posts').innerText = `📝 Publications : ${data.total_posts}`;

        const ctx = document.getElementById('rolesChart').getContext('2d');
        new Chart(ctx, {
          type: 'pie',
          data: {
            labels: ['Admins', 'Modérateurs', 'Utilisateurs'],
            datasets: [{
              label: 'Répartition des rôles',
              data: [data.admins, data.moderateurs, data.users],
              backgroundColor: ['#ff6384', '#36a2eb', '#ffce56']
            }]
          },
          options: { responsive: true }
        });
      } else {
        alert("Erreur lors du chargement des statistiques.");
      }
    })
    .catch(() => {
      alert("Erreur réseau lors du chargement des statistiques.");
    });
}

function chargerActiviteMensuelle() {
  fetch('../../api/admin/get_stats_monthly.php')
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        const mois = Array.from(new Set([
          ...Object.keys(data.inscriptions),
          ...Object.keys(data.publications),
          ...Object.keys(data.commentaires)
        ])).sort();

        const inscriptionsData = mois.map(m => data.inscriptions[m] || 0);
        const publicationsData = mois.map(m => data.publications[m] || 0);
        const commentairesData = mois.map(m => data.commentaires[m] || 0);

        const ctx = document.getElementById('monthlyCombinedChart').getContext('2d');
        new Chart(ctx, {
          type: 'bar',
          data: {
            labels: mois,
            datasets: [
              {
                label: '👤 Inscriptions',
                data: inscriptionsData,
                backgroundColor: '#42a5f5'
              },
              {
                label: '📝 Publications',
                data: publicationsData,
                backgroundColor: '#66bb6a'
              },
              {
                label: '💬 Commentaires',
                data: commentairesData,
                backgroundColor: '#ffa726'
              }
            ]
          },
          options: {
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: 'Activité mensuelle combinée'
              }
            },
            scales: {
              y: { beginAtZero: true, title: { display: true, text: 'Nombre' } },
              x: { title: { display: true, text: 'Mois' } }
            }
          }
        });
      } else {
        alert("Erreur de chargement des données mensuelles.");
      }
    })
    .catch(() => {
      alert("Erreur réseau.");
    });
}

// ==================== INIT ====================

document.addEventListener("DOMContentLoaded", function () {
  filtrerSectionsParRole();
  showSection('utilisateurs'); // Page par défaut au chargement
});
