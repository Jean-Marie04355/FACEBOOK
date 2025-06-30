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
      { user: 'Paul', text: 'J’adore !' }
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
