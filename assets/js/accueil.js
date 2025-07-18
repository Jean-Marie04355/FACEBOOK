window.addEventListener('DOMContentLoaded', function() {
  // Récupère l'utilisateur connecté depuis sessionStorage
  const user = JSON.parse(sessionStorage.getItem('user'));
  console.log('[DEBUG] Utilisateur connecté:', user);
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
  const suggestionsAside = document.getElementById('suggestionsAside');
  const suggestionsList = document.getElementById('suggestionsList');



  // Gestionnaire pour le bouton des invitations

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
    // Vérification que les ids sont bien numériques
    if (isNaN(senderId) || isNaN(receiverId)) {
      showNotification('Erreur : identifiant(s) utilisateur invalide(s)', 'error');
      return;
    }
    console.log("Données envoyées :", { sender_id: senderId, receiver_id: receiverId });
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

  let currentChatUserId = null;
  let chatInterval = null;

  // Charger la liste des conversations
  function loadChatUsers() {
    fetch(`../../api/get_friends.php?user_id=${user.id}`)
      .then(res => res.json())
      .then(data => {
        const list = document.getElementById('chatUsersList');
        list.innerHTML = '';
        if (!data.success || !data.friends || data.friends.length === 0) {
          list.innerHTML = '<li style="color:#888;">Aucun ami pour discuter.</li>';
          return;
        }
        data.friends.forEach(friend => {
          const li = document.createElement('li');
          li.innerHTML = `
            <img src="../../assets/images/${friend.photo_profil || 'logo.png'}" alt="Avatar">
            <span>${friend.nom} ${friend.prenom}</span>
          `;
          li.onclick = () => openChatBox(friend.id, friend.nom + ' ' + friend.prenom);
          list.appendChild(li);
        });
      });
  }

  // Ouvrir la fenêtre de chat
  function openChatBox(userId, userName) {
    currentChatUserId = userId;
    document.getElementById('chatUserName').textContent = userName;
    document.getElementById('chatBox').style.display = 'flex';
    loadMessages();
    if (chatInterval) clearInterval(chatInterval);
    chatInterval = setInterval(loadMessages, 3000);
  }

  // Fermer la fenêtre de chat
  function closeChatBox() {
    document.getElementById('chatBox').style.display = 'none';
    if (chatInterval) clearInterval(chatInterval);
  }

  // Charger les messages de la conversation
  function loadMessages() {
    if (!currentChatUserId) return;
    fetch(`../../api/get_messages.php?user_id=${currentChatUserId}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        const messagesDiv = document.getElementById('chatMessages');
        messagesDiv.innerHTML = '';
        data.forEach(msg => {
          const div = document.createElement('div');
          div.style.marginBottom = '10px';
          div.style.textAlign = msg.is_me ? 'right' : 'left';
          if (msg.type === 'image') {
            div.innerHTML = `<img src="../../assets/images/${msg.content}" style="max-width:120px;max-height:120px;border-radius:8px;">`;
          } else {
            div.textContent = msg.content;
          }
          messagesDiv.appendChild(div);
        });
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
      });
  }

  // Envoi d'un message texte ou image
  document.getElementById('chatForm').onsubmit = function(e) {
    e.preventDefault();
    const input = document.getElementById('chatInput');
    const image = document.getElementById('chatImage');
    const formData = new FormData();
    formData.append('user_id', currentChatUserId);
    formData.append('message', input.value);
    if (image.files[0]) {
      formData.append('image', image.files[0]);
    }
    fetch('../../api/send_message.php', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    })
    .then(res => res.json())
    .then(() => {
      input.value = '';
      image.value = '';
      loadMessages();
    });
  };

  // Recharger la liste des conversations au chargement
  window.addEventListener('DOMContentLoaded', loadChatUsers);

  // Ouvre la sidebar chat quand on clique sur l'icône Messages

  // Bouton pour fermer la sidebar chat
  const closeChatSidebarBtn = document.getElementById('closeChatSidebar');
  if (closeChatSidebarBtn) {
    closeChatSidebarBtn.onclick = function() {
      document.getElementById('chatSidebar').classList.remove('open');
      document.getElementById('chatBox').style.display = 'none';
    };
  }

  // Recherche d'amis pour démarrer une conversation
  const input = document.getElementById('globalSearchUserInput');
  const resultsList = document.getElementById('globalSearchResultsList');
  if (!input || !resultsList) return;

  input.addEventListener('input', function() {
    if (!user || !user.id || user.id === 0) {
      alert("Erreur : utilisateur non connecté ou id manquant ! Veuillez vous reconnecter.");
      return;
    }
    const q = this.value.trim();
    fetch(`../../api/search_users.php?q=${encodeURIComponent(q)}&user_id=${user.id}`, { credentials: 'include' })
      .then(res => res.json())
      .then(response => {
        const data = response.data || response; // support debug ou prod
        resultsList.innerHTML = '';
        if (!data || data.length === 0) {
          resultsList.innerHTML = '<li style="color:#888;">Aucun résultat</li>';
        } else {
          data.forEach(u => {
            const li = document.createElement('li');
            li.style.display = 'flex';
            li.style.alignItems = 'center';
            li.style.gap = '10px';
            li.style.padding = '8px 0';

            // Lien vers le profil sur le nom et la photo
            const profileLink = document.createElement('a');
            profileLink.href = `profile.html?id=${u.id}`;
            profileLink.style.display = 'flex';
            profileLink.style.alignItems = 'center';
            profileLink.style.gap = '10px';
            profileLink.style.textDecoration = 'none';
            profileLink.style.color = '#222';
            profileLink.innerHTML = `
              <img src="../../assets/images/${u.avatar || 'logo.png'}" alt="Avatar" style="width:32px;height:32px;border-radius:50%;">
              <span>${u.nom} ${u.prenom}</span>
            `;

            // Bouton invitation
            const btn = document.createElement('button');
            btn.className = 'invite-btn';
            btn.textContent = 'Envoyer invitation';
            btn.onclick = (e) => {
              e.stopPropagation();
              e.preventDefault();
              sendInvitation(user.id, u.id, u.nom + ' ' + u.prenom);
            };

            li.appendChild(profileLink);
            li.appendChild(btn);
            resultsList.appendChild(li);
          });
        }
        if (q.length > 0) {
          resultsList.classList.add('visible');
        } else {
          resultsList.classList.remove('visible');
        }
      });
  });

  // Fermer la liste si on clique ailleurs
  document.addEventListener('click', function(e) {
    if (!input.contains(e.target) && !resultsList.contains(e.target)) {
      resultsList.classList.remove('visible');
    }
  });

  // Fonction pour charger et afficher les invitations reçues
  function loadInvitations() {
    fetch(`../../api/get_invitations.php?user_id=${user.id}`)
      .then(res => res.json())
      .then(data => {
        const container = document.getElementById('invitationsContainer');
        if (!container) return;
        container.innerHTML = '';
        if (!data.length) {
          container.innerHTML = '<p style="text-align:center;color:#888;">Aucune invitation en attente.</p>';
          return;
        }
        data.forEach(inv => {
          const div = document.createElement('div');
          div.className = 'invitation-item-modern';
          div.innerHTML = `
            <img src="../../assets/images/${inv.avatar || 'logo.png'}" alt="avatar" class="invitation-avatar">
            <span class="invitation-name">${inv.nom} ${inv.prenom}</span>
            <button class="accept-inv-btn" title="Accepter"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></button>
            <button class="decline-inv-btn" title="Refuser"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
          `;
          div.querySelector('.accept-inv-btn').onclick = () => respondInvitation(inv.id, 'accepted', div);
          div.querySelector('.decline-inv-btn').onclick = () => respondInvitation(inv.id, 'declined', div);
          container.appendChild(div);
        });
      });
  }
  // Fonction pour répondre à une invitation
  function respondInvitation(invitationId, action, div) {
    fetch('../../api/respond_invitation.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invitation_id: invitationId, action })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        div.innerHTML = (action === 'accepted') ? '<span style="color:green;font-weight:bold;">Invitation acceptée</span>' : '<span style="color:red;font-weight:bold;">Invitation refusée</span>';
        if (action === 'accepted') {
          if (typeof loadMessengerFriends === 'function') loadMessengerFriends();
        }
      } else {
        div.innerHTML += '<span style="color:red;">Erreur</span>';
      }
    });
  }
  // Appelle loadInvitations() au chargement pour afficher les invitations reçues
  window.addEventListener('DOMContentLoaded', loadInvitations);

  // === Messenger Overlay : ouverture/fermeture ===
  const messengerOverlay = document.getElementById('messengerOverlay');
  if (messengerOverlay) messengerOverlay.style.display = 'none';

  // Fonction pour charger et afficher la liste des amis dans Messenger
  function loadMessengerFriends() {
    console.log('[DEBUG] Chargement des amis pour utilisateur:', user.id);
    fetch(`../../api/get_friends.php?user_id=${user.id}`)
      .then(res => res.json())
      .then(data => {
        console.log('[DEBUG] Réponse get_friends:', data);
        const list = document.getElementById('messengerFriendsList');
        list.innerHTML = '';
        if (!data.success || !data.friends || data.friends.length === 0) {
          console.log('[DEBUG] Aucun ami trouvé');
          list.innerHTML = '<li style="color:#888; text-align:center;">Aucun ami pour discuter.</li>';
          return;
        }
        
        console.log('[DEBUG] Amis trouvés:', data.friends.length);
        // Récupère les messages non lus
        return fetch(`../../api/get_unread_counts.php?user_id=${user.id}`)
          .then(res => res.text())
          .then(text => {
            try {
              const unreadCounts = JSON.parse(text);
              console.log('[DEBUG] Messages non lus:', unreadCounts);
              data.friends.forEach(friend => {
                const li = document.createElement('li');
                li.setAttribute('data-id', friend.id); // Ajoute l'ID de l'ami
                li.innerHTML = `
                  ${friend.photo_profil
                    ? `<img src="../../assets/images/${friend.photo_profil}" alt="Avatar" class="messenger-avatar">`
                    : `<span class="messenger-avatar messenger-avatar-default">💬</span>`
                  }
                  <span>${friend.nom} ${friend.prenom}</span>
                `;
                // Badge de messages non lus
                if (unreadCounts[friend.id]) {
                  const badge = document.createElement('span');
                  badge.className = 'unread-badge';
                  badge.textContent = unreadCounts[friend.id];
                  li.appendChild(badge);
                }
                li.onclick = () => openMessengerChat(friend);
                list.appendChild(li);
              });
            } catch (e) {
              console.error('[DEBUG] Erreur JSON get_unread_counts:', text);
              const list = document.getElementById('messengerFriendsList');
              list.innerHTML = '<li style="color:#f44336; text-align:center;">Erreur API: ' + text + '</li>';
            }
          });
      })
      .catch(error => {
        console.error('Erreur lors du chargement des amis:', error);
        const list = document.getElementById('messengerFriendsList');
        list.innerHTML = '<li style="color:#f44336; text-align:center;">Erreur de chargement des amis.</li>';
      });
  }
  // Affichage accueil Messenger par défaut (avatar/message)
  function showMessengerWelcome() {
    document.getElementById('messengerWelcome').style.display = 'flex';
    document.getElementById('messengerAvatarWelcome').style.display = 'flex';
    document.getElementById('messengerChatHeader').style.display = 'none';
    document.getElementById('messengerMessages').style.display = 'none';
    document.getElementById('messengerForm').style.display = 'none';
  }
  // Affichage de la discussion avec un ami
  function showMessengerChat() {
    document.getElementById('messengerWelcome').style.display = 'none';
    document.getElementById('messengerAvatarWelcome').style.display = 'none';
    document.getElementById('messengerChatHeader').style.display = 'flex';
    document.getElementById('messengerMessages').style.display = 'flex';
    document.getElementById('messengerForm').style.display = 'flex';
  }
  // Appeler l'accueil Messenger à l'ouverture du chat
  const openChatSidebarBtn = document.getElementById('openChatSidebar');
  if (openChatSidebarBtn) {
    openChatSidebarBtn.onclick = function() {
      const messengerOverlay = document.getElementById('messengerOverlay');
      if (messengerOverlay) messengerOverlay.style.display = 'flex';
      loadMessengerFriends();
      showMessengerWelcome(); // Affiche toujours l'accueil par défaut
      // Masquer l'ancienne sidebar chat si besoin
      const chatSidebar = document.getElementById('chatSidebar');
      if (chatSidebar) chatSidebar.style.display = 'none';
    };
  }
  // Quand on sélectionne un ami, afficher la discussion et stocker l'id
  function openMessengerChat(friend) {
    currentChatUserId = friend.id; // <-- Met à jour l'ami sélectionné
    document.getElementById('messengerChatName').textContent = friend.nom + ' ' + friend.prenom;
    if (friend.photo_profil) {
      document.getElementById('messengerChatAvatar').src = `../../assets/images/${friend.photo_profil}`;
      document.getElementById('messengerChatAvatar').style.display = '';
    } else {
      document.getElementById('messengerChatAvatar').style.display = 'none';
    }
    showMessengerChat();
    loadMessengerMessages(friend.id);
    localStorage.setItem('messenger_last_friend_id', friend.id);
    
    // Supprimer le badge de notification pour cet ami
    const friendLi = document.querySelector(`#messengerFriendsList li[data-id="${friend.id}"]`);
    if (friendLi) {
      const badge = friendLi.querySelector('.unread-badge');
      if (badge) {
        badge.remove();
      }
    }
    
    // Ajoute un attribut data-id pour pouvoir le retrouver
    const lis = document.querySelectorAll('#messengerFriendsList li');
    lis.forEach(li => {
      if (li.textContent.includes(friend.nom) && li.textContent.includes(friend.prenom)) {
        li.setAttribute('data-id', friend.id);
      }
    });
  }
  // Affichage des messages texte ET image dans Messenger
  function loadMessengerMessages(friendId) {
    // Log pour debug conversation privée
    console.log('[Messenger] Chargement messages entre', user.id, 'et', friendId);
    fetch(`../../api/get_messages.php?user_id=${friendId}&current_user_id=${user.id}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        const messagesDiv = document.getElementById('messengerMessages');
        messagesDiv.innerHTML = '';
        data.forEach(msg => {
          const div = document.createElement('div');
          div.className = 'messenger-message ' + (msg.is_me ? 'me' : 'other');
          if (msg.type === 'image') {
            div.innerHTML = `<img src="../../assets/images/${msg.content}" style="max-width:180px;max-height:180px;border-radius:8px;">`;
          } else {
            div.textContent = msg.content;
          }
          messagesDiv.appendChild(div);
        });
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
      });
  }
  // À la fermeture du chat, revient à l'écran d'accueil
  const closeMessengerOverlayBtn = document.getElementById('closeMessengerOverlay');
  if (closeMessengerOverlayBtn) {
    closeMessengerOverlayBtn.onclick = function() {
      // Revient à l'écran d'accueil au lieu de fermer
      showMessengerWelcome();
      // Réinitialise l'ami sélectionné
      currentChatUserId = null;
    };
  }

  // Bouton retour aux amis
  const backToFriendsBtn = document.getElementById('backToFriendsBtn');
  if (backToFriendsBtn) {
    backToFriendsBtn.onclick = function() {
      // Revient à l'écran d'accueil
      showMessengerWelcome();
      // Réinitialise l'ami sélectionné
      currentChatUserId = null;
    };
  }

  // Bouton croix bleue pour fermer complètement Messenger
  const closeMessengerCompletelyBtn = document.getElementById('closeMessengerCompletely');
  if (closeMessengerCompletelyBtn) {
    closeMessengerCompletelyBtn.onclick = function() {
      const messengerOverlay = document.getElementById('messengerOverlay');
      if (messengerOverlay) messengerOverlay.style.display = 'none';
      // Réinitialise l'ami sélectionné
      currentChatUserId = null;
    };
  }

  // Gestion de l'envoi de message dans Messenger
  const messengerForm = document.getElementById('messengerForm');
  if (messengerForm) {
    messengerForm.onsubmit = function(e) {
      e.preventDefault();
      console.log('[DEBUG] Tentative d\'envoi de message');
      const input = document.getElementById('messengerInput');
      const image = document.getElementById('messengerImage');
      if (!input.value.trim() && !image.files[0]) {
        console.log('[DEBUG] Aucun contenu à envoyer');
        return;
      }
      if (!currentChatUserId) {
        console.log('[DEBUG] Aucun ami sélectionné');
        return;
      }
      const formData = new FormData();
      formData.append('current_user_id', user.id); // id de l'utilisateur connecté
      formData.append('user_id', currentChatUserId); // id de l'ami sélectionné
      formData.append('message', input.value);
      if (image.files[0]) {
        formData.append('image', image.files[0]);
      }
      // Log pour debug conversation privée
      console.log('[Messenger] Envoi message de', user.id, 'à', currentChatUserId);
      fetch('../../api/send_message.php', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })
      .then(res => res.json())
      .then(data => {
        console.log('[DEBUG] Réponse envoi message:', data);
        input.value = '';
        image.value = '';
        if (typeof loadMessengerMessages === 'function') loadMessengerMessages(currentChatUserId);
      })
      .catch(error => {
        console.error('[DEBUG] Erreur envoi message:', error);
      });
    };
  }

  // Gestion du bouton photo pour ouvrir l'input fichier dans Messenger
  const messengerImageBtn = document.getElementById('messengerImageBtn');
  const messengerImageInput = document.getElementById('messengerImage');
  if (messengerImageBtn && messengerImageInput) {
    messengerImageBtn.onclick = function(e) {
      e.preventDefault();
      messengerImageInput.click();
    };
  }

  // Fonction pour charger et afficher les invitations envoyées
  function loadSentInvitations() {
    fetch(`../../api/get_invitations.php?user_id=${user.id}&sent=1`)
      .then(res => res.json())
      .then(data => {
        const container = document.getElementById('sentInvitationsContainer');
        if (!container) return;
        container.innerHTML = '';
        if (!data.length) {
          container.innerHTML = '<p style="text-align:center;color:#888;">Aucune invitation envoyée.</p>';
          return;
        }
        data.forEach(inv => {
          const div = document.createElement('div');
          div.className = 'invitation-item-modern';
          div.innerHTML = `
            <img src="../../assets/images/${inv.avatar || 'logo.png'}" alt="avatar" class="invitation-avatar">
            <span class="invitation-name">${inv.nom} ${inv.prenom}</span>
            <span class="sent-status">En attente</span>
          `;
          container.appendChild(div);
        });
      });
  }
  // Affichage dynamique de la section invitations
  const showInvitationsBtn = document.getElementById('showInvitations');
  if (showInvitationsBtn) {
    showInvitationsBtn.addEventListener('click', function() {
      // Masquer le feed et suggestions
      document.getElementById('articlesContainer').style.display = 'none';
      const aside = document.getElementById('suggestionsAside');
      if (aside) aside.style.display = 'none';
      // Afficher la section invitations
      document.getElementById('invitationsSection').style.display = 'block';
      // Charger les deux listes
      loadInvitations();
      loadSentInvitations();
    });
  }

  // Gestion du bouton Retour à l'accueil dans la section invitations
  const backToFeedBtn = document.getElementById('backToFeedBtn');
  if (backToFeedBtn) {
    backToFeedBtn.onclick = function() {
      document.getElementById('invitationsSection').style.display = 'none';
      document.getElementById('articlesContainer').style.display = 'block';
      const aside = document.getElementById('suggestionsAside');
      if (aside) aside.style.display = 'block';
    };
  }
});
