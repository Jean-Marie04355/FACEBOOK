window.addEventListener('DOMContentLoaded', function() {
  // Récupère l'utilisateur connecté depuis sessionStorage
  const user = JSON.parse(sessionStorage.getItem('user'));
  if (!user) {
    window.location.href = 'login.html'; // Redirige si pas connecté
  }

  // ===== AFFICHAGE DE L'AVATAR ET DU NOM DANS L'EN-TÊTE =====
  
  // Récupération de l'élément avatar dans l'en-tête
  const headerAvatarDiv = document.getElementById('headerUserAvatar');
  
  // Vérification si l'utilisateur a une photo de profil
  if (headerAvatarDiv) {
    if (user.photo_profil) {
      // Si l'utilisateur a une photo de profil, on l'affiche
      headerAvatarDiv.innerHTML = `<img src="../../assets/images/${user.photo_profil}" alt="avatar" style="width:100%;height:100%;object-fit:cover;">`;
    } else {
      // Sinon, on affiche les initiales de l'utilisateur
      const initiales = (user.prenom[0] + user.nom[0]).toUpperCase();
      headerAvatarDiv.textContent = initiales;
    }
  }

  // Affichage du nom complet de l'utilisateur
  const nameSpan = document.getElementById('userName');
  if (nameSpan) {
    nameSpan.textContent = user.prenom + ' ' + user.nom;
  }

  // Affiche l'avatar et le nom dans la sidebar
  const sidebarName = document.getElementById('sidebarUserName');
  const sidebarAvatar = document.getElementById('sidebarAvatar');
  if (sidebarName) {
    sidebarName.textContent = user.prenom + ' ' + user.nom;
  }
  if (sidebarAvatar) {
    if (user.photo_profil) {
      sidebarAvatar.innerHTML = `<img src="../../assets/images/${user.photo_profil}" alt="avatar" style="width:100%;height:100%;object-fit:cover;">`;
    } else {
      sidebarAvatar.textContent = (user.prenom[0] + user.nom[0]).toUpperCase();
    }
  }

  const articles = [
    {
      id: 1,
      author: { prenom: 'Jean', nom: 'Dupont', avatar: '../../assets/images/R.jpg' },
      description: "Voici la description de l'article. Très sympa !",
      image: '../../assets/images/R.jpg',  // Chemin de l'image article
      likes: 12,
      dislikes: 1,
      comments: [
        { user: 'Marie', text: 'Superbe photo !' },
        { user: 'Paul', text: "J'adore !" }
      ]
    },
    // Tu peux ajouter d'autres articles ici
  ];

  const feedContainer = document.querySelector('.fb-main-feed');

  function getVote(articleId) {
    return localStorage.getItem(`fb_vote_${articleId}`); // 'like' | 'dislike' | null
  }

  function renderFeed() {
    feedContainer.innerHTML = '';
    articles.forEach(article => {
      const vote = getVote(article.id);
      const likeActive = vote === 'like' ? 'like-btn active' : 'like-btn';
      const dislikeActive = vote === 'dislike' ? 'dislike-btn active' : 'dislike-btn';

      const articleHTML = `
        <article class="article">
          <div class="article-user">
            <img src="${article.author.avatar}" alt="avatar" class="avatar" />
            <span>${article.author.prenom} ${article.author.nom}</span>
          </div>
          <p>${article.description}</p>
          ${article.image ? `<img src="${article.image}" alt="photo article" class="article-image" />` : ''}
          <div class="article-actions">
            <button class="${likeActive}" data-id="${article.id}" aria-label="Like">👍 ${article.likes}</button>
            <button class="${dislikeActive}" data-id="${article.id}" aria-label="Dislike">👎 ${article.dislikes}</button>
            <button class="toggle-comments-btn" data-id="${article.id}">Commentaires (${article.comments.length})</button>
          </div>
          <div class="comments-section" id="comments-${article.id}" style="display:none;">
            <div class="comments-list">
              ${article.comments.map(c => `<p><strong>${c.user}:</strong> ${c.text}</p>`).join('')}
            </div>
            <input type="text" class="comment-input" data-id="${article.id}" placeholder="Ajouter un commentaire..." />
            <button class="add-comment-btn" data-id="${article.id}">Envoyer</button>
          </div>
        </article>
      `;
      feedContainer.insertAdjacentHTML('beforeend', articleHTML);
    });
    addListeners();
  }

  function addListeners() {
    document.querySelectorAll('.like-btn').forEach(btn => {
      btn.onclick = () => toggleVote(btn.dataset.id, 'like');
    });
    document.querySelectorAll('.dislike-btn').forEach(btn => {
      btn.onclick = () => toggleVote(btn.dataset.id, 'dislike');
    });
    document.querySelectorAll('.toggle-comments-btn').forEach(btn => {
      btn.onclick = () => toggleComments(btn.dataset.id);
    });
    document.querySelectorAll('.add-comment-btn').forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.id;
        const input = document.querySelector(`.comment-input[data-id="${id}"]`);
        addComment(id, input.value);
        input.value = '';
      };
    });
  }

  function toggleVote(id, type) {
    const article = articles.find(a => a.id == id);
    if (!article) return;
    const currentVote = getVote(id);

    if (currentVote === type) {
      localStorage.removeItem(`fb_vote_${id}`);
      if (type === 'like') article.likes--;
      else article.dislikes--;
    } else {
      if (currentVote) {
        if (currentVote === 'like') article.likes--;
        else article.dislikes--;
      }
      localStorage.setItem(`fb_vote_${id}`, type);
      if (type === 'like') article.likes++;
      else article.dislikes++;
    }
    renderFeed();
  }

  function toggleComments(id) {
    const section = document.getElementById(`comments-${id}`);
    section.style.display = section.style.display === 'none' ? 'block' : 'none';
  }

  function addComment(id, text) {
    if (!text.trim()) return;
    const article = articles.find(a => a.id == id);
    if (!article) return;

    const user = JSON.parse(sessionStorage.getItem('user')) || { prenom: 'Anonyme' };

    article.comments.push({ user: user.prenom, text });
    renderFeed();
  }

  renderFeed();

  const showUsersBtn = document.getElementById('showUsers');
  const showInvitationsBtn = document.getElementById('showInvitations');
  const suggestionsAside = document.getElementById('suggestionsAside');
  const suggestionsList = document.getElementById('suggestionsList');



  // Gestionnaire pour le bouton des invitations
  if (showInvitationsBtn) {
    showInvitationsBtn.addEventListener('click', function() {
      window.location.href = 'invitations.html';
    });
  }

  // Gestionnaire pour le bouton de déconnexion
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
        sessionStorage.clear();
        window.location.href = '../../index.html';
      }
    });
  }

  // Gestionnaire pour le bouton des amis (double-clic)
  if (showUsersBtn) {
    let clickCount = 0;
    let clickTimer = null;
    
    showUsersBtn.addEventListener('click', function() {
      clickCount++;
      
      if (clickCount === 1) {
        clickTimer = setTimeout(() => {
          // Clic simple : afficher les suggestions d'amis
      suggestionsAside.style.display = 'block';
          loadUserSuggestions();
          clickCount = 0;
        }, 200);
      } else {
        // Double-clic : aller à la page des amis
        clearTimeout(clickTimer);
        clickCount = 0;
        window.location.href = 'friends.html';
      }
    });
  }

  function loadUserSuggestions() {
      fetch(`../../api/get_users.php?user_id=${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            suggestionsList.innerHTML = '';
            data.users.forEach(u => {
              const li = document.createElement('li');
              li.textContent = u.prenom + ' ' + u.nom + ' ';
              const btn = document.createElement('button');
              btn.textContent = 'Ajouter';
              btn.onclick = function() {
              sendInvitation(user.id, u.id, u.prenom + ' ' + u.nom);
              };
              li.appendChild(btn);
            // Ajout du bouton Voir profil
            const profileBtn = document.createElement('button');
            profileBtn.textContent = 'Voir profil';
            profileBtn.style.marginLeft = '8px';
            profileBtn.onclick = function() {
              window.location.href = `profile.html?id=${u.id}`;
            };
            li.appendChild(profileBtn);
              suggestionsList.appendChild(li);
            });
          }
        });
  }

  // Fonction pour envoyer une invitation
  function sendInvitation(senderId, receiverId, receiverName) {
    fetch('../../api/send_invitation.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender_id: senderId,
        receiver_id: receiverId
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showNotification('Invitation envoyée à ' + receiverName, 'success');
      } else {
        showNotification(data.message, 'error');
      }
    })
    .catch(error => {
      console.error('Erreur:', error);
      showNotification('Erreur lors de l\'envoi de l\'invitation', 'error');
    });
  }

  // Fonction pour afficher les notifications
  function showNotification(message, type = 'info') {
    // Créer l'élément de notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      border-radius: 5px;
      color: white;
      font-weight: bold;
      z-index: 10000;
      max-width: 300px;
      word-wrap: break-word;
    `;
    
    // Couleurs selon le type
    if (type === 'success') {
      notification.style.backgroundColor = '#4CAF50';
    } else if (type === 'error') {
      notification.style.backgroundColor = '#f44336';
    } else {
      notification.style.backgroundColor = '#2196F3';
    }
    
    // Ajouter au DOM
    document.body.appendChild(notification);
    
    // Supprimer après 3 secondes
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  }
});
