// render.js — reads content/site.json and content/products.json
// and fills in the page. Edit those JSON files (directly, or via
// the /admin content dashboard) and the site updates automatically.

async function loadJSON(path) {
  const res = await fetch(path + '?v=' + Date.now());
  if (!res.ok) throw new Error('Failed to load ' + path);
  return res.json();
}

function el(tag, attrs = {}, html = '') {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
  if (html) node.innerHTML = html;
  return node;
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

function renderSite(site) {
  // Logo
  const logo = site.logo || 'images/mg-mehta-logo.png';
  const navLogo = document.getElementById('nav-logo-img');
  const footerLogo = document.getElementById('footer-logo-img');
  if (navLogo) navLogo.src = logo;
  if (footerLogo) footerLogo.src = logo;

  // Hero
  document.getElementById('hero-eyebrow').textContent = site.hero.eyebrow;
  document.getElementById('hero-title').innerHTML = `${escapeHTML(site.hero.title)}<br><em>${escapeHTML(site.hero.titleEmphasis)}</em>`;
  document.getElementById('hero-subtitle').textContent = site.hero.subtitle;

  const mosaic = document.getElementById('hero-mosaic');
  mosaic.innerHTML = '';
  const classes = ['big', '', '', 'small3', 'small3'];
  (site.hero.images || []).forEach((src, i) => {
    const cls = classes[i] || '';
    mosaic.appendChild(el('img', cls ? { class: cls, src, alt: '' } : { src, alt: '' }));
  });

  // Brands
  const brandsRow = document.getElementById('brands-row');
  brandsRow.innerHTML = '';
  (site.brands || []).forEach(b => {
    brandsRow.appendChild(el('span', { class: 'brand-chip' }, escapeHTML(b)));
  });

  // About
  document.getElementById('about-title').innerHTML = `${escapeHTML(site.about.titleLine1)}<br>${escapeHTML(site.about.titleLine2)}`;
  document.getElementById('about-p1').textContent = site.about.paragraph1;
  document.getElementById('about-p2').textContent = site.about.paragraph2;

  const statsWrap = document.getElementById('about-stats');
  statsWrap.innerHTML = '';
  (site.about.stats || []).forEach(s => {
    statsWrap.appendChild(el('div', { class: 'stat' },
      `<div class="stat-num">${escapeHTML(s.num)}</div><div class="stat-label">${escapeHTML(s.label)}</div>`));
  });

  const photosWrap = document.getElementById('about-photos');
  photosWrap.innerHTML = '';
  (site.about.photos || []).forEach(src => {
    photosWrap.appendChild(el('img', { src, alt: '' }));
  });

  // Contact
  const phonesWrap = document.getElementById('contact-phones');
  phonesWrap.innerHTML = '';
  (site.contact.phones || []).forEach(p => {
    const digits = p.replace(/[^\d+]/g, '');
    phonesWrap.appendChild(el('a', { href: `tel:${digits}` }, escapeHTML(p)));
    phonesWrap.appendChild(document.createElement('br'));
  });

  const emailEl = document.getElementById('contact-email');
  emailEl.textContent = site.contact.email;
  emailEl.href = `mailto:${site.contact.email}`;

  const footerEmail = document.getElementById('footer-email');
  footerEmail.textContent = site.contact.email;
  footerEmail.href = `mailto:${site.contact.email}`;

  document.getElementById('contact-address').innerHTML = escapeHTML(site.contact.address).replace(/, /g, ',<br>');
  document.getElementById('contact-hours').innerHTML = `${escapeHTML(site.contact.hoursLine1)}<br>${escapeHTML(site.contact.hoursLine2)}`;
}

function renderProducts(data) {
  const container = document.getElementById('products-container');
  container.innerHTML = '';

  (data.categories || []).forEach(cat => {
    const block = el('div', { class: 'category-block' });
    block.appendChild(el('h3', { class: 'category-heading' }, escapeHTML(cat.name)));
    const grid = el('div', { class: 'products-grid' });

    (cat.products || []).forEach(p => {
      const card = el('div', { class: 'product-card' });
      if (p.image) {
        card.appendChild(el('div', { class: 'product-img-wrap' },
          `<img class="product-img" src="${p.image}" alt="${escapeHTML(p.name)}" loading="lazy">`));
      } else {
        card.appendChild(el('div', {
          class: 'product-img-wrap',
          style: 'background:#1a1210; display:flex; align-items:center; justify-content:center; padding:1rem;'
        }, `<span style="color:var(--gold); font-family:var(--ff-display); font-size:1rem; font-weight:700; text-align:center;">${escapeHTML(p.name)}</span>`));
      }
      card.appendChild(el('div', { class: 'product-body' },
        `<div class="product-name">${escapeHTML(p.name)}</div><div class="product-desc">${escapeHTML(p.description)}</div>`));
      grid.appendChild(card);
    });

    block.appendChild(grid);
    container.appendChild(block);
  });

  // Static "ask us" CTA card appended after the last category
  const lastGrid = container.querySelector('.category-block:last-child .products-grid');
  if (lastGrid) {
    lastGrid.appendChild(el('div', {
      class: 'product-card',
      style: 'background: var(--ink); align-items:center; justify-content:center; text-align:center; padding: 2rem 1.5rem;'
    }, `
      <div style="font-size:1.1rem; font-family:var(--ff-display); font-weight:700; color:var(--gold); margin-bottom:.7rem;">54+ Products in Total</div>
      <div style="font-size:.83rem; color:rgba(253,246,238,.65); line-height:1.7; margin-bottom:1.3rem;">Couldn't find what you need? Call or WhatsApp — we likely stock it.</div>
      <a href="https://wa.me/919727771607" target="_blank" style="background:var(--rust);color:#fff;padding:.6rem 1.3rem;border-radius:4px;text-decoration:none;font-size:.82rem;font-weight:600;">Ask Us Now</a>
    `));
  }
}

Promise.all([loadJSON('content/site.json'), loadJSON('content/products.json')])
  .then(([site, products]) => {
    renderSite(site);
    renderProducts(products);
  })
  .catch(err => {
    console.error('Content failed to load:', err);
  });
