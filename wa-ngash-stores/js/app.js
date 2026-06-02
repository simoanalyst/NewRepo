/* ============================================================
   WA-NG'ASH STORES — Application Logic
   ============================================================ */

'use strict';

/* ── State ── */
let cart      = JSON.parse(localStorage.getItem('wng_cart')      || '[]');
let wishlist  = JSON.parse(localStorage.getItem('wng_wishlist')  || '[]');
let darkMode  = localStorage.getItem('wng_dark') === 'true';

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  applyTheme();
  initNav();
  initPageLoader();
  initScrollReveal();
  initBackToTop();
  updateCartBadge();
  updateWishlistBadge();

  const page = document.body.dataset.page;
  if (page === 'home')    initHome();
  if (page === 'shop')    initShop();
  if (page === 'product') initProductPage();
  if (page === 'about')   initAbout();
  if (page === 'contact') initContact();
  if (page === 'wishlist')initWishlistPage();
});

/* ══════════════════════════════════════
   THEME
══════════════════════════════════════ */
function applyTheme() {
  document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
}

function toggleTheme() {
  darkMode = !darkMode;
  localStorage.setItem('wng_dark', darkMode);
  applyTheme();
  document.querySelectorAll('.theme-icon').forEach(el => {
    el.className = `theme-icon ${darkMode ? 'fa-sun' : 'fa-moon'} fas`;
  });
}

/* ══════════════════════════════════════
   NAV
══════════════════════════════════════ */
function initNav() {
  const nav    = document.querySelector('.navbar');
  const burger = document.querySelector('.hamburger');
  const menu   = document.querySelector('.mobile-menu');

  if (!nav) return;

  /* Scroll effect */
  function onScroll() {
    const isHome = document.body.dataset.page === 'home';
    if (window.scrollY > 60) {
      nav.classList.add('scrolled');
      nav.classList.remove('transparent');
    } else {
      nav.classList.remove('scrolled');
      if (isHome) nav.classList.add('transparent');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Hamburger */
  if (burger && menu) {
    burger.addEventListener('click', () => {
      burger.classList.toggle('open');
      menu.classList.toggle('open');
    });
    /* Close on link click */
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      burger.classList.remove('open');
      menu.classList.remove('open');
    }));
  }

  /* Active link */
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(a => {
    if (a.getAttribute('href') === path) a.classList.add('active');
  });

  /* Theme toggle */
  document.querySelectorAll('.theme-toggle').forEach(btn => btn.addEventListener('click', toggleTheme));
  document.querySelectorAll('.theme-icon').forEach(el => {
    el.className = `theme-icon fas ${darkMode ? 'fa-sun' : 'fa-moon'}`;
  });

  /* Cart toggle */
  document.querySelectorAll('.cart-toggle').forEach(btn => btn.addEventListener('click', openCart));
}

/* ══════════════════════════════════════
   PAGE LOADER
══════════════════════════════════════ */
function initPageLoader() {
  const loader = document.querySelector('.page-loader');
  if (!loader) return;
  setTimeout(() => loader.classList.add('loaded'), 1200);
}

/* ══════════════════════════════════════
   SCROLL REVEAL
══════════════════════════════════════ */
function initScrollReveal() {
  const targets = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .stagger');
  if (!targets.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  targets.forEach(t => observer.observe(t));
}

/* ══════════════════════════════════════
   BACK TO TOP
══════════════════════════════════════ */
function initBackToTop() {
  const btn = document.querySelector('.back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ══════════════════════════════════════
   CART
══════════════════════════════════════ */
function saveCart() {
  localStorage.setItem('wng_cart', JSON.stringify(cart));
}

function updateCartBadge() {
  const total = cart.reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll('.cart-badge').forEach(el => {
    el.textContent = total;
    el.style.display = total > 0 ? 'flex' : 'none';
  });
}

function addToCart(productId, size = null, qty = 1) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const key = `${productId}-${size || 'default'}`;
  const existing = cart.find(i => i.key === key);

  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      key,
      id: productId,
      name: product.name,
      price: product.price,
      category: product.category,
      image: product.image,
      size: size,
      qty
    });
  }

  saveCart();
  updateCartBadge();
  renderCart();
  showToast(`"${product.name}" added to cart! 🛒`, 'success');
}

function removeFromCart(key) {
  cart = cart.filter(i => i.key !== key);
  saveCart();
  updateCartBadge();
  renderCart();
}

function updateCartQty(key, delta) {
  const item = cart.find(i => i.key === key);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  saveCart();
  updateCartBadge();
  renderCart();
}

function getCartTotal() {
  return cart.reduce((s, i) => s + i.price * i.qty, 0);
}

function renderCart() {
  const container = document.querySelector('.cart-items');
  const countBadge = document.querySelector('.cart-count-badge');
  if (!container) return;

  const totalCount = cart.reduce((s, i) => s + i.qty, 0);
  if (countBadge) countBadge.textContent = totalCount;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">🛒</div>
        <h3>Your cart is empty</h3>
        <p>Add items to get started</p>
        <a href="shop.html" class="btn btn-primary btn-sm" style="margin-top:0.5rem">Shop Now</a>
      </div>`;
    updateCartFooter();
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="cart-item" data-key="${item.key}">
      <div class="cart-item-image">
        <img src="${item.image}" alt="${item.name}" loading="lazy">
      </div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-meta">${formatCategory(item.category)}${item.size ? ' · Size ' + item.size : ''}</div>
        <div class="cart-item-controls">
          <button class="qty-btn" onclick="updateCartQty('${item.key}',-1)">−</button>
          <span class="qty-value">${item.qty}</span>
          <button class="qty-btn" onclick="updateCartQty('${item.key}',1)">+</button>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:0.5rem">
        <span class="cart-item-price">${formatPrice(item.price * item.qty)}</span>
        <button class="cart-item-remove" onclick="removeFromCart('${item.key}')" title="Remove">
          <i class="fas fa-trash-alt"></i>
        </button>
      </div>
    </div>`).join('');

  updateCartFooter();
}

function updateCartFooter() {
  const subtotal = document.querySelector('.cart-subtotal-amount');
  const total    = document.querySelector('.cart-total-amount');
  const shipping = 250;
  const sub = getCartTotal();

  if (subtotal) subtotal.textContent = formatPrice(sub);
  if (total)    total.textContent    = formatPrice(sub > 0 ? sub + shipping : 0);
}

function openCart() {
  renderCart();
  document.querySelector('.cart-overlay')?.classList.add('open');
  document.querySelector('.cart-sidebar')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.querySelector('.cart-overlay')?.classList.remove('open');
  document.querySelector('.cart-sidebar')?.classList.remove('open');
  document.body.style.overflow = '';
}

/* ══════════════════════════════════════
   WISHLIST
══════════════════════════════════════ */
function saveWishlist() {
  localStorage.setItem('wng_wishlist', JSON.stringify(wishlist));
}

function updateWishlistBadge() {
  document.querySelectorAll('.wishlist-badge').forEach(el => {
    el.textContent = wishlist.length;
    el.style.display = wishlist.length > 0 ? 'flex' : 'none';
  });
}

function toggleWishlist(productId, btn) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const idx = wishlist.indexOf(productId);
  if (idx === -1) {
    wishlist.push(productId);
    btn?.classList.add('wishlisted');
    showToast(`"${product.name}" added to wishlist! ♥`, 'warning');
  } else {
    wishlist.splice(idx, 1);
    btn?.classList.remove('wishlisted');
    showToast(`Removed from wishlist`, 'error');
  }
  saveWishlist();
  updateWishlistBadge();
}

function isWishlisted(productId) {
  return wishlist.includes(productId);
}

/* ══════════════════════════════════════
   PRODUCT CARD RENDERER
══════════════════════════════════════ */
function renderProductCard(product) {
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  const badges = product.tags.map(t => {
    const map = { new: 'badge-new', bestseller: 'badge-popular', popular: 'badge-hot', sale: 'badge-sale' };
    const labels = { new: 'New', bestseller: 'Best Seller', popular: 'Hot', sale: 'Sale' };
    return `<span class="badge ${map[t]}">${labels[t]}</span>`;
  }).join('');

  const wishlisted = isWishlisted(product.id);

  return `
    <div class="product-card" data-id="${product.id}">
      <div class="product-image-wrap">
        <img class="product-image" src="${product.image}" alt="${product.name}" loading="lazy">
        ${badges ? `<div class="product-badges">${badges}</div>` : ''}
        <div class="product-actions-hover">
          <button class="action-btn ${wishlisted ? 'wishlisted' : ''}"
            title="${wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}"
            onclick="handleWishlistClick(event, ${product.id})">
            <i class="fa${wishlisted ? 's' : 'r'} fa-heart"></i>
          </button>
          <button class="action-btn" title="Quick View" onclick="openQuickView(${product.id})">
            <i class="far fa-eye"></i>
          </button>
          <a href="product.html?id=${product.id}" class="action-btn" title="View Details">
            <i class="fas fa-arrow-right"></i>
          </a>
        </div>
      </div>
      <div class="product-info">
        <div class="product-category-tag">${formatCategory(product.category)}</div>
        <a href="product.html?id=${product.id}">
          <div class="product-name">${product.name}</div>
        </a>
        <div class="product-rating">
          <div class="stars">${renderStars(product.rating)}</div>
          <span class="rating-text">${product.rating} (${product.reviews})</span>
        </div>
        <div class="product-pricing">
          <span class="price-current">${formatPrice(product.price)}</span>
          ${product.originalPrice ? `<span class="price-original">${formatPrice(product.originalPrice)}</span>` : ''}
          ${discount ? `<span class="price-discount">-${discount}%</span>` : ''}
        </div>
        <button class="btn btn-add-cart" onclick="handleAddToCart(event, ${product.id})">
          <i class="fas fa-shopping-cart"></i> Add to Cart
        </button>
      </div>
    </div>`;
}

function handleWishlistClick(e, id) {
  e.stopPropagation();
  const btn = e.currentTarget;
  toggleWishlist(id, btn);
  /* Update icon */
  const icon = btn.querySelector('i');
  if (isWishlisted(id)) {
    icon.className = 'fas fa-heart';
    btn.title = 'Remove from wishlist';
  } else {
    icon.className = 'far fa-heart';
    btn.title = 'Add to wishlist';
  }
}

function handleAddToCart(e, id) {
  e.stopPropagation();
  const btn = e.currentTarget;
  btn.classList.add('added');
  btn.innerHTML = '<i class="fas fa-check"></i> Added!';
  setTimeout(() => {
    btn.classList.remove('added');
    btn.innerHTML = '<i class="fas fa-shopping-cart"></i> Add to Cart';
  }, 1800);
  addToCart(id);
}

/* ══════════════════════════════════════
   QUICK VIEW MODAL
══════════════════════════════════════ */
function openQuickView(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  const modal = document.querySelector('.modal-overlay');
  const content = document.querySelector('.modal-content');
  if (!modal || !content) return;

  const sizeBtns = product.sizes.map((s, i) =>
    `<button class="size-btn ${i === 0 ? 'selected' : ''}" onclick="selectSize(this)">${s}</button>`
  ).join('');

  content.innerHTML = `
    <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
    <div class="modal-grid">
      <div class="modal-image"><img src="${product.image}" alt="${product.name}"></div>
      <div class="modal-info">
        <div class="modal-category">${formatCategory(product.category)}</div>
        <h2 class="modal-name">${product.name}</h2>
        <div class="product-rating" style="margin-bottom:1rem">
          <div class="stars">${renderStars(product.rating)}</div>
          <span class="rating-text">${product.rating} (${product.reviews} reviews)</span>
        </div>
        <div class="modal-price-row">
          <span class="modal-price">${formatPrice(product.price)}</span>
          ${product.originalPrice ? `<span class="price-original">${formatPrice(product.originalPrice)}</span>` : ''}
          ${discount ? `<span class="badge badge-sale">-${discount}%</span>` : ''}
        </div>
        <p class="modal-desc">${product.description}</p>
        <div class="size-label">Select Size</div>
        <div class="size-options" id="modalSizes">${sizeBtns}</div>
        <div class="modal-actions">
          <button class="btn btn-modal-cart" onclick="addFromModal(${product.id})">
            <i class="fas fa-shopping-cart"></i> Add to Cart
          </button>
          <button class="action-btn ${isWishlisted(product.id) ? 'wishlisted' : ''}"
            style="width:44px;height:44px;border:2px solid var(--border);background:var(--surface)"
            onclick="handleWishlistClick(event, ${product.id})">
            <i class="fa${isWishlisted(product.id) ? 's' : 'r'} fa-heart"></i>
          </button>
        </div>
        <div style="margin-top:1rem">
          <a href="product.html?id=${product.id}" class="view-all">
            View Full Details <i class="fas fa-arrow-right"></i>
          </a>
        </div>
      </div>
    </div>`;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.querySelector('.modal-overlay')?.classList.remove('open');
  document.body.style.overflow = '';
}

function selectSize(btn) {
  btn.closest('.size-options').querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
}

function addFromModal(productId) {
  const selectedSize = document.querySelector('#modalSizes .size-btn.selected')?.textContent?.trim();
  addToCart(productId, selectedSize);
  closeModal();
  openCart();
}

/* ══════════════════════════════════════
   HOME PAGE
══════════════════════════════════════ */
function initHome() {
  initBestSellers();
  initCategoryCards();
  initTestimonials();
  initHeroAnimations();
  initNewsletterForm();
}

function initHeroAnimations() {
  /* Typing effect on hero tagline */
  const el = document.querySelector('.hero-title');
  if (!el) return;
  el.style.animationPlayState = 'running';
}

function initBestSellers() {
  const grid = document.querySelector('.best-sellers-grid');
  if (!grid) return;

  const bestsellers = PRODUCTS.filter(p => p.tags.includes('bestseller')).slice(0, 8);
  grid.innerHTML = bestsellers.map(renderProductCard).join('');
  grid.classList.add('stagger');
  setTimeout(() => initScrollReveal(), 50);
}

function initCategoryCards() {
  CATEGORIES.forEach(cat => {
    const cards = document.querySelectorAll(`[data-cat="${cat.id}"]`);
    cards.forEach(card => {
      card.addEventListener('click', () => {
        window.location.href = `shop.html?category=${cat.id}`;
      });
    });
  });
}

function initTestimonials() {
  const track  = document.querySelector('.testimonial-track');
  const dotsEl = document.querySelector('.carousel-dots');
  if (!track) return;

  track.innerHTML = TESTIMONIALS.map(t => `
    <div class="testimonial-card">
      <div class="testimonial-quote">"</div>
      <p class="testimonial-text">${t.text}</p>
      <div class="testimonial-author">
        <div class="author-avatar" style="background:linear-gradient(135deg,${t.color},${t.color}cc)">${t.initials}</div>
        <div>
          <div class="author-name">${t.name}</div>
          <div class="author-location"><i class="fas fa-map-marker-alt" style="margin-right:4px;font-size:0.7rem"></i>${t.location}</div>
          <div class="stars" style="margin-top:2px">${renderStars(t.rating)}</div>
        </div>
      </div>
    </div>`).join('');

  let current = 0;
  const cards = track.querySelectorAll('.testimonial-card');
  const visible = window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 3;
  const total = Math.ceil(cards.length / visible);

  if (dotsEl) {
    dotsEl.innerHTML = Array.from({length: total}, (_, i) =>
      `<div class="carousel-dot ${i === 0 ? 'active' : ''}" data-i="${i}"></div>`
    ).join('');
    dotsEl.querySelectorAll('.carousel-dot').forEach(d =>
      d.addEventListener('click', () => goToSlide(+d.dataset.i))
    );
  }

  function goToSlide(idx) {
    current = Math.max(0, Math.min(idx, total - 1));
    const cardW = cards[0]?.offsetWidth + 24 || 0;
    track.style.transform = `translateX(-${current * visible * cardW}px)`;
    dotsEl?.querySelectorAll('.carousel-dot').forEach((d, i) =>
      d.classList.toggle('active', i === current)
    );
  }

  document.querySelector('.carousel-prev')?.addEventListener('click', () => goToSlide(current - 1));
  document.querySelector('.carousel-next')?.addEventListener('click', () => goToSlide(current + 1));

  /* Auto-play */
  let timer = setInterval(() => goToSlide((current + 1) % total), 5000);
  track.addEventListener('mouseenter', () => clearInterval(timer));
  track.addEventListener('mouseleave', () => { timer = setInterval(() => goToSlide((current + 1) % total), 5000); });
}

function initNewsletterForm() {
  document.querySelector('.newsletter-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const input = e.target.querySelector('input');
    if (!input.value) return;
    showToast('🎉 You\'re subscribed! Welcome to the Wa-ng\'ash family.', 'success');
    input.value = '';
  });
}

/* ══════════════════════════════════════
   SHOP PAGE
══════════════════════════════════════ */
let shopFilters = {
  category: [],
  gender: [],
  minPrice: 0,
  maxPrice: Infinity,
  sort: 'popular',
  search: ''
};

function initShop() {
  const grid = document.querySelector('.shop-grid');
  if (!grid) return;

  /* Read URL params */
  const params = new URLSearchParams(window.location.search);
  const urlCat = params.get('category');
  if (urlCat) {
    shopFilters.category = [urlCat];
    /* Check the corresponding checkbox */
    setTimeout(() => {
      const cb = document.querySelector(`input[data-filter="category"][value="${urlCat}"]`);
      if (cb) cb.checked = true;
    }, 0);
  }

  renderShop();
  initShopFilters();
  initShopSearch();
}

function initShopFilters() {
  document.querySelectorAll('.filter-option input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', () => {
      const filterType = cb.dataset.filter;
      const val = cb.value;
      if (filterType === 'category' || filterType === 'gender') {
        if (cb.checked) shopFilters[filterType].push(val);
        else shopFilters[filterType] = shopFilters[filterType].filter(v => v !== val);
      }
      renderShop();
    });
  });

  document.getElementById('priceMin')?.addEventListener('input', e => {
    shopFilters.minPrice = +e.target.value || 0;
    renderShop();
  });
  document.getElementById('priceMax')?.addEventListener('input', e => {
    shopFilters.maxPrice = +e.target.value || Infinity;
    renderShop();
  });

  document.querySelector('.sort-select')?.addEventListener('change', e => {
    shopFilters.sort = e.target.value;
    renderShop();
  });

  document.querySelector('.filter-clear')?.addEventListener('click', () => {
    shopFilters = { category: [], gender: [], minPrice: 0, maxPrice: Infinity, sort: 'popular', search: shopFilters.search };
    document.querySelectorAll('.filter-option input[type="checkbox"]').forEach(cb => cb.checked = false);
    document.getElementById('priceMin') && (document.getElementById('priceMin').value = '');
    document.getElementById('priceMax') && (document.getElementById('priceMax').value = '');
    renderShop();
  });
}

function initShopSearch() {
  const input = document.querySelector('.search-input');
  if (!input) return;
  let timer;
  input.addEventListener('input', e => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      shopFilters.search = e.target.value.toLowerCase().trim();
      renderShop();
    }, 250);
  });
}

function renderShop() {
  const grid = document.querySelector('.shop-grid');
  const count = document.querySelector('.results-count');
  if (!grid) return;

  let filtered = PRODUCTS.filter(p => {
    if (shopFilters.category.length && !shopFilters.category.some(c => {
      if (c === 'eyeglasses') return p.category === 'mens-eyeglasses' || p.category === 'womens-eyeglasses';
      return p.category === c;
    })) return false;
    if (shopFilters.gender.length && !shopFilters.gender.includes(p.gender)) return false;
    if (p.price < shopFilters.minPrice) return false;
    if (shopFilters.maxPrice !== Infinity && p.price > shopFilters.maxPrice) return false;
    if (shopFilters.search) {
      const q = shopFilters.search;
      if (!p.name.toLowerCase().includes(q) && !p.category.includes(q) && !p.description.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  switch(shopFilters.sort) {
    case 'price-asc':  filtered.sort((a,b) => a.price - b.price); break;
    case 'price-desc': filtered.sort((a,b) => b.price - a.price); break;
    case 'rating':     filtered.sort((a,b) => b.rating - a.rating); break;
    case 'new':        filtered.sort((a,b) => (b.tags.includes('new') ? 1 : 0) - (a.tags.includes('new') ? 1 : 0)); break;
    default:           filtered.sort((a,b) => b.reviews - a.reviews);
  }

  if (count) count.textContent = `${filtered.length} product${filtered.length !== 1 ? 's' : ''} found`;

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:4rem;color:var(--text-muted)">
        <div style="font-size:3rem;margin-bottom:1rem">🔍</div>
        <h3 style="color:var(--text-light)">No products found</h3>
        <p>Try adjusting your filters or search term</p>
      </div>`;
    return;
  }

  grid.innerHTML = filtered.map(renderProductCard).join('');
  initScrollReveal();
}

/* ══════════════════════════════════════
   PRODUCT DETAIL PAGE
══════════════════════════════════════ */
function initProductPage() {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get('id'));
  const product = PRODUCTS.find(p => p.id === id);

  if (!product) {
    document.querySelector('.product-detail-grid').innerHTML =
      '<div style="grid-column:1/-1;text-align:center;padding:4rem"><h2>Product not found</h2><a href="shop.html" class="btn btn-primary" style="margin-top:1rem">Back to Shop</a></div>';
    return;
  }

  renderProductDetail(product);
  renderRelatedProducts(product);
}

function renderProductDetail(product) {
  const bg = `linear-gradient(145deg, ${product.bgColors[0]}, ${product.bgColors[1]})`;
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  /* Gallery */
  const mainImg = document.querySelector('.gallery-main');
  const thumbsEl = document.querySelector('.gallery-thumbs');
  if (mainImg) {
    mainImg.innerHTML = `<img src="${product.image}" alt="${product.name}">
      <div class="gallery-zoom-hint"><i class="fas fa-search-plus"></i> Hover to zoom</div>`;
  }
  /* Generate crop variants for thumbs */
  const cropVariants = ['center', 'top', 'bottom', 'left'];
  if (thumbsEl) {
    thumbsEl.innerHTML = cropVariants.map((crop, i) => {
      const url = product.image.replace('fit=crop', `fit=crop&crop=${crop}`);
      return `<div class="gallery-thumb ${i === 0 ? 'active' : ''}" onclick="selectThumb(this,'${url}')">
        <img src="${url}" alt="${product.name} view ${i+1}" loading="lazy">
      </div>`;
    }).join('');
  }

  /* Info */
  const nameEl = document.querySelector('.product-detail-name');
  const catEl  = document.querySelector('.product-detail-cat');
  const priceEl = document.querySelector('.detail-price-current');
  const origEl  = document.querySelector('.detail-price-original');
  const saveEl  = document.querySelector('.detail-price-save');
  const ratingEl = document.querySelector('.detail-rating');
  const reviewEl = document.querySelector('.detail-review-count');
  const descEl   = document.querySelector('.product-detail-desc');
  const featEl   = document.querySelector('.product-features');
  const sizesEl  = document.querySelector('.detail-sizes');
  const wishBtn  = document.querySelector('.btn-detail-wish');

  if (nameEl) nameEl.textContent = product.name;
  if (catEl)  catEl.textContent = formatCategory(product.category);
  if (priceEl) priceEl.textContent = formatPrice(product.price);
  if (origEl) {
    origEl.textContent = product.originalPrice ? formatPrice(product.originalPrice) : '';
    origEl.style.display = product.originalPrice ? '' : 'none';
  }
  if (saveEl) {
    saveEl.textContent = discount ? `Save ${discount}%` : '';
    saveEl.style.display = discount ? '' : 'none';
  }
  if (ratingEl) ratingEl.innerHTML = renderStars(product.rating);
  if (reviewEl) reviewEl.textContent = `(${product.reviews} reviews)`;
  if (descEl)   descEl.textContent = product.description;

  if (featEl) {
    featEl.innerHTML = product.features.map(f =>
      `<div class="feature-item"><i class="fas fa-check-circle"></i> ${f}</div>`
    ).join('');
  }

  if (sizesEl) {
    sizesEl.innerHTML = product.sizes.map((s, i) =>
      `<button class="size-btn ${i === 0 ? 'selected' : ''}" onclick="selectSize(this)">${s}</button>`
    ).join('');
  }

  if (wishBtn) {
    if (isWishlisted(product.id)) wishBtn.classList.add('active');
    wishBtn.addEventListener('click', () => {
      toggleWishlist(product.id, wishBtn);
      wishBtn.classList.toggle('active', isWishlisted(product.id));
    });
  }

  /* Qty controls */
  document.querySelector('.btn-qty-minus')?.addEventListener('click', () => {
    const v = document.querySelector('.detail-qty');
    if (v && +v.textContent > 1) v.textContent = +v.textContent - 1;
  });
  document.querySelector('.btn-qty-plus')?.addEventListener('click', () => {
    const v = document.querySelector('.detail-qty');
    if (v) v.textContent = +v.textContent + 1;
  });

  /* Add to cart */
  document.querySelector('.btn-detail-cart')?.addEventListener('click', () => {
    const size = document.querySelector('.detail-sizes .size-btn.selected')?.textContent?.trim();
    const qty  = +(document.querySelector('.detail-qty')?.textContent || 1);
    addToCart(product.id, size, qty);
    openCart();
  });

  /* Page title */
  document.title = `${product.name} — Wa-ng'ash Stores`;
}

function renderRelatedProducts(product) {
  const grid = document.querySelector('.related-grid');
  if (!grid) return;
  const related = PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
  grid.innerHTML = related.map(renderProductCard).join('');
}

function selectThumb(el, url) {
  document.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  const main = document.querySelector('.gallery-main img');
  if (main) main.src = url;
}

/* ══════════════════════════════════════
   ABOUT PAGE
══════════════════════════════════════ */
function initAbout() {
  /* Counter animation for stats */
  const counters = document.querySelectorAll('.stat-item-num[data-target]');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animateCounter(e.target);
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => observer.observe(c));
}

function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  const suffix = el.dataset.suffix || '';
  const duration = 2000;
  const start = Date.now();

  function update() {
    const progress = Math.min((Date.now() - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target).toLocaleString() + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

/* ══════════════════════════════════════
   CONTACT PAGE
══════════════════════════════════════ */
function initContact() {
  const form = document.querySelector('.contact-form');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;

    form.querySelectorAll('[required]').forEach(field => {
      const err = field.parentElement.querySelector('.form-error');
      if (!field.value.trim()) {
        field.classList.add('error');
        if (err) err.textContent = 'This field is required';
        valid = false;
      } else {
        field.classList.remove('error');
        if (err) err.textContent = '';
      }
    });

    if (!valid) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    btn.innerHTML = '<span class="spinner"></span> Sending...';
    btn.disabled = true;

    setTimeout(() => {
      btn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
      btn.style.background = '#10B981';
      showToast('🎉 Message sent! We\'ll get back to you within 24 hours.', 'success');
      form.reset();
      setTimeout(() => {
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
        btn.style.background = '';
        btn.disabled = false;
      }, 3000);
    }, 1800);
  });

  /* Live validation */
  form.querySelectorAll('.form-control').forEach(field => {
    field.addEventListener('blur', () => {
      const err = field.parentElement.querySelector('.form-error');
      if (field.required && !field.value.trim()) {
        field.classList.add('error');
        if (err) err.textContent = 'This field is required';
      } else {
        field.classList.remove('error');
        if (err) err.textContent = '';
      }
    });
  });
}

/* ══════════════════════════════════════
   WISHLIST PAGE
══════════════════════════════════════ */
function initWishlistPage() {
  renderWishlistPage();
}

function renderWishlistPage() {
  const grid = document.querySelector('.wishlist-grid');
  const empty = document.querySelector('.wishlist-empty');
  if (!grid) return;

  const items = PRODUCTS.filter(p => wishlist.includes(p.id));
  if (items.length === 0) {
    grid.style.display = 'none';
    if (empty) empty.style.display = 'flex';
    return;
  }
  grid.style.display = '';
  if (empty) empty.style.display = 'none';
  grid.innerHTML = items.map(renderProductCard).join('');
}

/* ══════════════════════════════════════
   CHECKOUT SIMULATION
══════════════════════════════════════ */
function openCheckout() {
  if (cart.length === 0) {
    showToast('Your cart is empty!', 'error');
    return;
  }
  closeCart();

  const overlay = document.querySelector('.checkout-overlay');
  const content = document.querySelector('.checkout-content');
  if (!overlay || !content) return;

  showCheckoutStep(1, content);
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function showCheckoutStep(step, container) {
  const steps = [
    {
      title: 'Delivery Details',
      icon: '📦',
      content: `
        <div class="form-row">
          <div class="form-group"><label class="form-label">First Name *</label><input class="form-control" type="text" placeholder="John" required></div>
          <div class="form-group"><label class="form-label">Last Name *</label><input class="form-control" type="text" placeholder="Doe" required></div>
        </div>
        <div class="form-group"><label class="form-label">Email *</label><input class="form-control" type="email" placeholder="john@example.com" required></div>
        <div class="form-group"><label class="form-label">Phone *</label><input class="form-control" type="tel" placeholder="+254 700 000 000" required></div>
        <div class="form-group"><label class="form-label">Delivery Address *</label><input class="form-control" type="text" placeholder="Street, Town" required></div>
        <div class="form-group"><label class="form-label">County / City *</label><input class="form-control" type="text" placeholder="Nairobi" required></div>
        <button class="btn btn-primary" style="width:100%;justify-content:center;margin-top:1rem" onclick="showCheckoutStep(2,document.querySelector('.checkout-content'))">
          Continue to Payment <i class="fas fa-arrow-right"></i>
        </button>`
    },
    {
      title: 'Payment Method',
      icon: '💳',
      content: `
        <div style="display:flex;flex-direction:column;gap:1rem;margin-bottom:1.5rem">
          ${['M-Pesa', 'Credit / Debit Card', 'Cash on Delivery'].map((m, i) => `
            <label style="display:flex;align-items:center;gap:1rem;padding:1rem;border:2px solid var(--border);border-radius:var(--r-md);cursor:pointer;transition:var(--t-fast)" class="payment-opt">
              <input type="radio" name="payment" value="${m}" ${i===0?'checked':''} style="accent-color:var(--primary)">
              <span style="font-weight:600;font-family:var(--font-heading)">${m}</span>
              <span style="margin-left:auto;font-size:1.5rem">${['📱','💳','💵'][i]}</span>
            </label>`).join('')}
        </div>
        <div style="background:var(--bg-secondary);border-radius:var(--r-md);padding:1rem;margin-bottom:1.5rem">
          <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem;font-size:0.9rem;color:var(--text-light)">
            <span>Subtotal</span><span>${formatPrice(getCartTotal())}</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem;font-size:0.9rem;color:var(--text-light)">
            <span>Shipping</span><span>${formatPrice(250)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:1.1rem;font-weight:800;font-family:var(--font-heading);color:var(--primary);padding-top:0.5rem;border-top:1px solid var(--border)">
            <span>Total</span><span>${formatPrice(getCartTotal() + 250)}</span>
          </div>
        </div>
        <button class="btn btn-gold" style="width:100%;justify-content:center" onclick="showCheckoutStep(3,document.querySelector('.checkout-content'))">
          Place Order <i class="fas fa-lock"></i>
        </button>`
    },
    {
      title: 'Order Confirmed!',
      icon: '🎉',
      content: `
        <div style="text-align:center;padding:2rem 1rem">
          <div style="font-size:5rem;margin-bottom:1.5rem;animation:float 3s ease-in-out infinite">🎉</div>
          <h2 style="color:var(--primary);margin-bottom:0.5rem">Order Placed!</h2>
          <p style="color:var(--text-light);margin-bottom:0.5rem">Thank you for shopping with Wa-ng'ash Stores!</p>
          <p style="font-size:0.9rem;color:var(--text-muted);margin-bottom:2rem">Order <strong style="color:var(--text)">#WNG-${Date.now().toString().slice(-6)}</strong> — You'll receive a confirmation SMS shortly.</p>
          <div style="background:var(--accent);border-radius:var(--r-md);padding:1.25rem;margin-bottom:2rem;text-align:left">
            <div style="display:flex;align-items:center;gap:0.75rem;font-size:0.88rem;color:var(--text-light);margin-bottom:0.5rem"><i class="fas fa-truck" style="color:var(--secondary)"></i> Estimated delivery: 2–4 business days</div>
            <div style="display:flex;align-items:center;gap:0.75rem;font-size:0.88rem;color:var(--text-light)"><i class="fas fa-phone" style="color:var(--secondary)"></i> Track order: +254 700 123 456</div>
          </div>
          <button class="btn btn-primary" style="width:100%;justify-content:center" onclick="closeCheckout()">
            Continue Shopping <i class="fas fa-shopping-bag"></i>
          </button>
        </div>`
    }
  ];

  if (step === 3) {
    cart = [];
    saveCart();
    updateCartBadge();
  }

  const s = steps[step - 1];
  container.innerHTML = `
    <div class="checkout-steps">
      ${steps.map((st, i) => `<div class="checkout-step ${i+1 < step ? 'done' : i+1 === step ? 'active' : ''}">
        <span class="checkout-step-num">${i+1 < step ? '✓' : i+1}</span>${st.title}
      </div>`).join('')}
    </div>
    <div style="text-align:center;font-size:2rem;margin-bottom:0.5rem">${s.icon}</div>
    <h3 style="margin-bottom:1.25rem;font-family:var(--font-heading)">${s.title}</h3>
    ${s.content}`;
}

function closeCheckout() {
  document.querySelector('.checkout-overlay')?.classList.remove('open');
  document.body.style.overflow = '';
}

/* ══════════════════════════════════════
   TOAST
══════════════════════════════════════ */
function showToast(message, type = 'success') {
  const container = document.querySelector('.toast-container');
  if (!container) return;

  const icons = { success: '✅', error: '❌', warning: '⭐' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type] || '💬'}</span><span>${message}</span>`;

  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('leaving');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/* ══════════════════════════════════════
   HELPERS
══════════════════════════════════════ */
function formatPrice(n) {
  return 'KSh ' + n.toLocaleString('en-KE');
}

function formatCategory(cat) {
  const map = {
    'mens-shoes': "Men's Shoes",
    'womens-shoes': "Women's Shoes",
    'mens-eyeglasses': "Men's Eyeglasses",
    'womens-eyeglasses': "Women's Eyeglasses",
    'purses': "Purses & Handbags"
  };
  return map[cat] || cat;
}

function renderStars(rating) {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return (
    '<i class="fas fa-star"></i>'.repeat(full) +
    (half ? '<i class="fas fa-star-half-alt"></i>' : '') +
    '<i class="far fa-star"></i>'.repeat(empty)
  );
}

/* Expose to HTML onclick handlers */
window.openCart         = openCart;
window.closeCart        = closeCart;
window.openCheckout     = openCheckout;
window.closeCheckout    = closeCheckout;
window.closeModal       = closeModal;
window.openQuickView    = openQuickView;
window.handleWishlistClick = handleWishlistClick;
window.handleAddToCart  = handleAddToCart;
window.addFromModal     = addFromModal;
window.selectSize       = selectSize;
window.selectThumb      = selectThumb;
window.updateCartQty    = updateCartQty;
window.removeFromCart   = removeFromCart;
window.toggleTheme      = toggleTheme;
