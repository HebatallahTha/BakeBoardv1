// Utilities
function getPosts() {
  return JSON.parse(localStorage.getItem("bakeboard_posts") || "[]");
}

function savePosts(posts) {
  localStorage.setItem("bakeboard_posts", JSON.stringify(posts));
}

function getPostById(id) {
  const posts = getPosts();
  return posts.find(post => post.id === id);
}

function updatePostById(id, updatedData) {
  const posts = getPosts().map(p => p.id === id ? { ...p, ...updatedData } : p);
  savePosts(posts);
}

function generateId() {
  return Date.now().toString(); // simple unique ID
}

// Create Post
const createForm = document.getElementById("create-post-form");
if (createForm) {
  createForm.addEventListener("submit", e => {
    e.preventDefault();
    const title = document.getElementById("title").value;
    const content = document.getElementById("content").value;
    const image = document.getElementById("image").value;

   const tags = document.getElementById("tags").value.split(",").map(t => t.trim());

const newPost = {
  id: generateId(),
  title,
  content,
  image,
  createdAt: new Date().toISOString(),
  upvotes: 0,
  comments: [],
  tags
};


    const posts = getPosts();
    posts.unshift(newPost);
    savePosts(posts);

    window.location.href = "index.html";
  });
}

// Home Feed
const postFeed = document.getElementById("post-feed");
if (postFeed) {
  function renderFeed(posts) {
  postFeed.innerHTML = "";
  posts.forEach(post => {
    const div = document.createElement("div");
    div.className = "post-card";
    div.innerHTML = `
      <h3>${post.title}</h3>
      <p>🗓️ ${new Date(post.createdAt).toLocaleString()} • ❤️ ${post.upvotes} upvotes</p>
      ${post.image ? `<img src="${post.image}" alt="bake" />` : ""}
      <div class="tags">${(post.tags || []).map(tag => `<span class="tag">#${tag}</span>`).join(" ")}</div>
      <button onclick="goToPost('${post.id}')">View Post</button>
    `;
    postFeed.appendChild(div);
  });
}

  function goToPost(id) {
    window.location.href = `post.html?id=${id}`;
  }

  window.goToPost = goToPost; // expose to global for onclick

  // Initial load
  let posts = getPosts();
  renderFeed(posts);

  // Search
  const searchInput = document.getElementById("search");
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const keyword = searchInput.value.toLowerCase();
      const filtered = posts.filter(p => p.title.toLowerCase().includes(keyword));
      
      renderFeed(filtered);
    });
  }
}

// Post View
const postDetails = document.getElementById("post-details");
if (postDetails) {
  const params = new URLSearchParams(window.location.search);
  const postId = params.get("id");
  const post = getPostById(postId);

  if (!post) {
    postDetails.innerHTML = "<p>Post not found 😢</p>";
} else {
    postDetails.innerHTML = `
        <div class="post-card">
            <h2>${post.title}</h2>
            <p>${post.content}</p>
            ${post.image ? `<img src="${post.image}" alt="bake" />` : ""}
            <p>🗓️ ${new Date(post.createdAt).toLocaleString()}</p>
            <button id="upvote-btn">❤️ Upvote (${post.upvotes})</button>
            <a href="edit.html?id=${post.id}" class="btn">✏️ Edit Post</a>
        </div>
    `;
    // ... rest of the code

    document.getElementById("upvote-btn").addEventListener("click", () => {
      post.upvotes++;
      updatePostById(post.id, { upvotes: post.upvotes });
      location.reload(); // refresh to update count
    });

    // Load comments
    const commentList = document.getElementById("comment-list");
    post.comments.forEach(comment => {
      const li = document.createElement("li");
      li.textContent = comment;
      commentList.appendChild(li);
    });

    // Add comment
    const commentForm = document.getElementById("comment-form");
    commentForm.addEventListener("submit", e => {
      e.preventDefault();
      const newComment = document.getElementById("comment-input").value;
      post.comments.push(newComment);
      updatePostById(post.id, { comments: post.comments });
      location.reload();
    });
  }
}
// Edit Post
const editForm = document.getElementById("edit-post-form");
if (editForm) {
  const params = new URLSearchParams(window.location.search);
  const postId = params.get("id");
  const post = getPostById(postId);

  if (!post) {
    editForm.innerHTML = "<p>Post not found.</p>";
  } else {
    // Pre-fill
    document.getElementById("edit-title").value = post.title;
    document.getElementById("edit-content").value = post.content;
    document.getElementById("edit-image").value = post.image;
    document.getElementById("edit-tags").value = (post.tags || []).join(", ");

    editForm.addEventListener("submit", (e) => {
      e.preventDefault();
      post.title = document.getElementById("edit-title").value;
      post.content = document.getElementById("edit-content").value;
      post.image = document.getElementById("edit-image").value;
      post.tags = document.getElementById("edit-tags").value.split(",").map(t => t.trim());

      updatePostById(postId, post);
      window.location.href = `post.html?id=${postId}`;
    });
  }
}
editForm.addEventListener("submit", (e) => {
  e.preventDefault();
  post.title = document.getElementById("edit-title").value;
  post.content = document.getElementById("edit-content").value;
  post.image = document.getElementById("edit-image").value;
  post.tags = document.getElementById("edit-tags").value.split(",").map(t => t.trim());

  console.log("Updating post:", post);
  updatePostById(postId, post);

  window.location.href = `post.html?id=${postId}`;
});
