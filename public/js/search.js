const input = document.querySelector('[data-search]');
const list = document.querySelector('[data-results]');

if (input && list) {
  const pageSize = 18;
  let articles = [];
  let matchingArticles = [];
  let currentPage = 1;
  const originalHtml = list.innerHTML;
  let pagination = null;

  const addText = (parent, tag, text, className) => {
    const element = document.createElement(tag);
    element.textContent = text;
    if (className) element.className = className;
    parent.append(element);
    return element;
  };

  const removePagination = () => {
    pagination?.remove();
    pagination = null;
  };

  const renderPagination = () => {
    removePagination();
    const pageCount = Math.ceil(matchingArticles.length / pageSize);
    if (pageCount <= 1) return;

    pagination = document.createElement('nav');
    pagination.className = 'pagination';
    pagination.setAttribute('aria-label', 'Search result pages');

    const previous = document.createElement('button');
    previous.type = 'button';
    previous.textContent = '← 前の18件';
    previous.disabled = currentPage === 1;
    previous.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage -= 1;
        renderResults();
      }
    });

    const status = document.createElement('span');
    status.setAttribute('aria-live', 'polite');
    status.textContent = `${currentPage} / ${pageCount}`;

    const next = document.createElement('button');
    next.type = 'button';
    next.textContent = '次の18件 →';
    next.disabled = currentPage === pageCount;
    next.addEventListener('click', () => {
      if (currentPage < pageCount) {
        currentPage += 1;
        renderResults();
      }
    });

    pagination.append(previous, status, next);
    list.after(pagination);
  };

  const renderResults = () => {
    list.replaceChildren();
    const pageArticles = matchingArticles.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    for (const article of pageArticles) {
      const item = document.createElement('li');
      item.className = 'article-card';
      item.dataset.card = '';

      const link = document.createElement('a');
      link.className = 'gallery-card-link';
      link.href = article.url;

      if (article.thumbnail) {
        const image = document.createElement('img');
        image.className = 'gallery-thumbnail';
        image.src = article.thumbnail;
        image.alt = article.title || '';
        image.loading = 'lazy';
        link.append(image);
      } else {
        const placeholder = document.createElement('span');
        placeholder.className = 'gallery-thumbnail gallery-placeholder';
        placeholder.setAttribute('aria-hidden', 'true');
        link.append(placeholder);
      }

      addText(link, 'h2', article.title || '');
      item.append(link);
      if (article.category) addText(item, 'div', article.category, 'article-meta');
      list.append(item);
    }

    renderPagination();
  };

  // Search titles, descriptions, excerpts, and categories (including Japanese names).
  const normalize = (value) => String(value ?? '').normalize('NFKC').toLocaleLowerCase();

  const updateSearch = () => {
    const query = normalize(input.value.trim());
    if (!query) {
      removePagination();
      list.innerHTML = originalHtml;
      return;
    }

    matchingArticles = articles.filter((article) =>
      [article.title, article.description, article.excerpt, article.category]
        .filter(Boolean)
        .some((value) => normalize(value).includes(query))
    );
    currentPage = 1;

    if (!matchingArticles.length) {
      removePagination();
      list.replaceChildren();
      addText(list, 'li', input.dataset.noResults || 'No matching articles.', 'empty');
      return;
    }

    renderResults();
  };

  input.addEventListener('input', updateSearch);

  fetch(input.dataset.indexUrl || 'search-index.json')
    .then((response) => {
      if (!response.ok) throw new Error('Search index unavailable');
      return response.json();
    })
    .then((data) => {
      articles = Array.isArray(data) ? data : [];
      // Re-run searches typed before the index finished loading.
      if (input.value.trim()) updateSearch();
    })
    .catch((error) => console.warn('Search index could not be loaded:', error));
}
