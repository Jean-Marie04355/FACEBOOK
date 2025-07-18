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

  // ====== GESTION DU FORMULAIRE DE PUBLICATION ======
  const postForm = document.getElementById('postForm');
  const postFormMessage = document.getElementById('postFormMessage');
  const articlesContainer = document.getElementById('articlesContainer');

  // Fonction pour afficher les posts
  function renderPosts(posts) {
    articlesContainer.querySelectorAll('.article').forEach(e => e.remove());
    posts.forEach(post => {
      const postDiv = document.createElement('article');
      postDiv.className = 'article';
      
      // Calculer le total des réactions
      const totalReactions = Object.values(post.reactions).reduce((sum, count) => sum + count, 0);
      
      // Créer le HTML des réactions
      const reactionsHtml = `
        <div class="reactions-container" style="position:relative;">
          <button class="reaction-btn" data-post-id="${post.id}" style="background:none;border:none;padding:8px 12px;border-radius:20px;cursor:pointer;font-size:16px;transition:background 0.2s;" onmouseover="this.style.background='#f0f2f5'">
            ${post.user_reaction ? getEmoji(post.user_reaction) : '👍'} ${totalReactions > 0 ? totalReactions : ''}
          </button>
          <div class="reactions-menu" data-post-id="${post.id}" style="position:absolute;bottom:100%;left:0;background:white;border:1px solid #ddd;border-radius:8px;padding:8px;box-shadow:0 2px 10px rgba(0,0,0,0.1);display:none;z-index:1000;">
            <button class="emoji-btn" data-type="like" data-post-id="${post.id}" style="background:none;border:none;padding:4px;cursor:pointer;font-size:20px;border-radius:50%;transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.2)'">👍</button>
            <button class="emoji-btn" data-type="love" data-post-id="${post.id}" style="background:none;border:none;padding:4px;cursor:pointer;font-size:20px;border-radius:50%;transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.2)'">❤️</button>
            <button class="emoji-btn" data-type="haha" data-post-id="${post.id}" style="background:none;border:none;padding:4px;cursor:pointer;font-size:20px;border-radius:50%;transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.2)'">😂</button>
            <button class="emoji-btn" data-type="wow" data-post-id="${post.id}" style="background:none;border:none;padding:4px;cursor:pointer;font-size:20px;border-radius:50%;transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.2)'">😮</button>
            <button class="emoji-btn" data-type="sad" data-post-id="${post.id}" style="background:none;border:none;padding:4px;cursor:pointer;font-size:20px;border-radius:50%;transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.2)'">😢</button>
            <button class="emoji-btn" data-type="angry" data-post-id="${post.id}" style="background:none;border:none;padding:4px;cursor:pointer;font-size:20px;border-radius:50%;transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.2)'">😡</button>
          </div>
        </div>
      `;
      
      postDiv.innerHTML = `
        <div class="article-user">
          <img src="../../assets/images/${post.photo_profil || ''}" alt="avatar" class="avatar" />
          <span>${post.prenom || ''} ${post.nom || ''}</span>
          <span style="margin-left:auto;font-size:12px;color:#888;">${post.date_post ? new Date(post.date_post).toLocaleString() : ''}</span>
          ${post.id_user == user.id ? `<button class='delete-post-btn' data-post-id='${post.id}' style='margin-left:12px;background:#f44336;color:white;border:none;padding:4px 10px;border-radius:4px;font-size:13px;cursor:pointer;'>Supprimer</button>` : ''}
        </div>
        <p>${post.contenu ? post.contenu.replace(/</g, '&lt;').replace(/>/g, '&gt;') : ''}</p>
        ${post.image ? `<img src="../../${post.image}" alt="photo post" class="article-image" style="max-width:100%;margin:10px 0;" />` : ''}
        ${post.video ? `<video controls src="../../${post.video}" style="max-width:100%;margin:10px 0;"></video>` : ''}
        <div class="article-actions" style="margin-top:10px;">
          ${reactionsHtml}
        </div>
        <div class="comments-section" id="comments-${post.id}" style="margin-top:10px;background:#f9f9f9;padding:10px;border-radius:6px;">
          <div class="comments-list" id="comments-list-${post.id}">
            <em>Chargement des commentaires...</em>
          </div>
          <form class="add-comment-form" data-post-id="${post.id}" style="display:flex;gap:8px;margin-top:8px;">
            <input type="text" class="comment-input" placeholder="Ajouter un commentaire..." style="flex:1;padding:6px;border-radius:4px;border:1px solid #ccc;">
            <button type="submit" style="background:#1877f2;color:white;border:none;padding:6px 12px;border-radius:4px;">Envoyer</button>
          </form>
        </div>
      `;
      articlesContainer.appendChild(postDiv);
      loadComments(post.id);
    });
    addReactionListeners();
    addCommentListeners();
    addDeletePostListeners();
  }

  // Charger les commentaires d'un post
  function loadComments(postId) {
    const listDiv = document.getElementById(`comments-list-${postId}`);
    fetch(`../../api/get_comments.php?id_post=${postId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          if (data.comments.length === 0) {
            listDiv.innerHTML = '<span style="color:#888;">Aucun commentaire.</span>';
          } else {
            listDiv.innerHTML = data.comments.map(c => {
              let avatarHtml = '';
              if (c.photo_profil) {
                avatarHtml = `<img src='../../assets/images/${c.photo_profil}' alt='avatar' style='width:28px;height:28px;border-radius:50%;object-fit:cover;margin-right:8px;'>`;
              } else {
                const initials = (c.prenom[0] + c.nom[0]).toUpperCase();
                avatarHtml = `<div style='width:28px;height:28px;border-radius:50%;background:#1877f2;color:white;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:13px;margin-right:8px;'>${initials}</div>`;
              }
              return `<div style='margin-bottom:6px;display:flex;align-items:center;gap:8px;'>${avatarHtml}<strong>${c.prenom} ${c.nom}</strong> : ${c.texte.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
                ${c.id_user == user.id ? `<button class='delete-comment-btn' data-comment-id='${c.id}' data-post-id='${postId}' style='margin-left:8px;background:#f44336;color:white;border:none;padding:2px 8px;border-radius:3px;font-size:12px;cursor:pointer;'>Supprimer</button>` : ''}
              </div>`;
            }).join('');
            addDeleteCommentListeners();
          }
        } else {
          listDiv.innerHTML = '<span style="color:red;">Erreur chargement commentaires.</span>';
        }
      })
      .catch(() => {
        listDiv.innerHTML = '<span style="color:red;">Erreur réseau.</span>';
      });
  }

  // Ajoute les listeners sur les formulaires d'ajout de commentaire
  function addCommentListeners() {
    document.querySelectorAll('.add-comment-form').forEach(form => {
      form.onsubmit = function(e) {
        e.preventDefault();
        const postId = this.getAttribute('data-post-id');
        const input = this.querySelector('.comment-input');
        const texte = input.value.trim();
        if (!texte) return;
        fetch('../../api/add_comment.php', {
          method: 'POST',
          headers: {'Content-Type': 'application/x-www-form-urlencoded'},
          body: new URLSearchParams({
            id_user: user.id,
            id_post: postId,
            texte: texte
          })
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            input.value = '';
            loadComments(postId);
          }
        });
      };
    });
  }

  // Ajoute les listeners sur les réactions
  function addReactionListeners() {
    // Gestion du menu d'émojis
    document.querySelectorAll('.reaction-btn').forEach(btn => {
      btn.onmouseenter = function() {
        const postId = this.getAttribute('data-post-id');
        const menu = document.querySelector(`.reactions-menu[data-post-id="${postId}"]`);
        menu.style.display = 'block';
      };
      
      btn.onmouseleave = function() {
        const postId = this.getAttribute('data-post-id');
        const menu = document.querySelector(`.reactions-menu[data-post-id="${postId}"]`);
        setTimeout(() => {
          if (!menu.matches(':hover')) {
            menu.style.display = 'none';
          }
        }, 200);
      };
    });

    // Gestion des clics sur les émojis
    document.querySelectorAll('.emoji-btn').forEach(btn => {
      btn.onclick = function() {
        const postId = this.getAttribute('data-post-id');
        const type = this.getAttribute('data-type');
        fetch('../../api/like_post.php', {
          method: 'POST',
          headers: {},
          body: new URLSearchParams({
            id_user: user.id,
            id_post: postId,
            type: type
          })
        })
        .then(res => res.json())
        .then(() => loadPosts());
      };
    });

    // Fermer le menu quand on quitte
    document.querySelectorAll('.reactions-menu').forEach(menu => {
      menu.onmouseleave = function() {
        this.style.display = 'none';
      };
    });
  }

  // Ajoute les listeners sur les boutons de suppression de commentaire
  function addDeleteCommentListeners() {
    document.querySelectorAll('.delete-comment-btn').forEach(btn => {
      btn.onclick = function() {
        if (!confirm('Supprimer ce commentaire ?')) return;
        const commentId = this.getAttribute('data-comment-id');
        const postId = this.getAttribute('data-post-id');
        fetch('../../api/delete_comment.php', {
          method: 'POST',
          headers: {'Content-Type': 'application/x-www-form-urlencoded'},
          body: new URLSearchParams({
            id_comment: commentId,
            id_user: user.id
          })
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            loadComments(postId);
          }
        });
      };
    });
  }

  // Ajoute les listeners sur les boutons de suppression de post
  function addDeletePostListeners() {
    document.querySelectorAll('.delete-post-btn').forEach(btn => {
      btn.onclick = function() {
        if (!confirm('Supprimer cette publication ?')) return;
        const postId = this.getAttribute('data-post-id');
        fetch('../../api/delete_post.php', {
          method: 'POST',
          headers: {'Content-Type': 'application/x-www-form-urlencoded'},
          body: new URLSearchParams({
            id_post: postId,
            id_user: user.id
          })
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            loadPosts();
          }
        });
      };
    });
  }

  // Fonction pour charger les posts depuis l'API
  function loadPosts() {
    fetch('../../api/get_posts.php')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          renderPosts(data.posts);
        } else {
          articlesContainer.innerHTML = '<p style="color:red;">Erreur lors du chargement du fil d\'actualité.</p>';
        }
      })
      .catch(() => {
        articlesContainer.innerHTML = '<p style="color:red;">Erreur réseau.</p>';
      });
  }

  // Gestion de la soumission du formulaire de publication
  if (postForm) {
    postForm.addEventListener('submit', function(e) {
      e.preventDefault();
      postFormMessage.textContent = '';
      const formData = new FormData(postForm);
      formData.append('id_user', user.id);
      fetch('../../api/create_post.php', {
        method: 'POST',
        body: formData
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          postForm.reset();
          postFormMessage.style.color = 'green';
          postFormMessage.textContent = data.message;
          loadPosts();
        } else {
          postFormMessage.style.color = 'red';
          postFormMessage.textContent = data.message;
        }
      })
      .catch(() => {
        postFormMessage.style.color = 'red';
        postFormMessage.textContent = "Erreur réseau.";
      });
    });
  }

  // Charger les posts au chargement de la page
  loadPosts();

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
