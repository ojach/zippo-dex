const input = document.querySelector('[data-search]');
const list = document.querySelector('[data-results]');

if (input && list) {
  const pageSize = 18;
  let articles = [];
  let matchingArticles = [];
  let currentPage = 1;
  const originalHtml = list.innerHTML;
  // Reuse the existing pagination element so search and normal browsing
  // always share the same styling and never appear as two separate navs.
  const originalPagination = list.parentElement?.querySelector('nav.pagination') || null;
  const pagination = originalPagination || document.createElement('nav');
  const originalPaginationHtml = originalPagination?.innerHTML || '';
  const originalPaginationDisplay = originalPagination?.style.display || '';
  const originalPaginationLabel = originalPagination?.getAttribute('aria-label');
  if (!originalPagination) {
    pagination.className = 'pagination';
    list.after(pagination);
    pagination.style.display = 'none';
  }

  const restorePagination = () => {
    pagination.innerHTML = originalPaginationHtml;
    pagination.style.display = originalPagination ? originalPaginationDisplay : 'none';
    if (originalPaginationLabel === null || originalPaginationLabel === undefined) {
      pagination.removeAttribute('aria-label');
    } else {
      pagination.setAttribute('aria-label', originalPaginationLabel);
    }
  };

  const addText = (parent, tag, text, className) => {
    const element = document.createElement(tag);
    element.textContent = text;
    if (className) element.className = className;
    parent.append(element);
    return element;
  };

  const renderPagination = () => {
    const pageCount = Math.ceil(matchingArticles.length / pageSize);
    pagination.replaceChildren();
    pagination.style.display = pageCount > 1 ? originalPaginationDisplay : 'none';
    pagination.setAttribute('aria-label', 'Search result pages');
    if (pageCount <= 1) return;

    const makePageLink = (text, targetPage) => {
      const link = document.createElement('a');
      link.href = '#article-search';
      link.textContent = text;
      link.addEventListener('click', (event) => {
        event.preventDefault();
        currentPage = targetPage;
        renderResults();
      });
      return link;
    };

    if (currentPage > 1) {
      pagination.append(makePageLink('← 前の18件', currentPage - 1));
    }
    const status = document.createElement('span');
    status.setAttribute('aria-live', 'polite');
    status.textContent = `${currentPage} / ${pageCount}`;
    pagination.append(status);
    if (currentPage < pageCount) {
      pagination.append(makePageLink('次の18件 →', currentPage + 1));
    }
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
      restorePagination();
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
      pagination.replaceChildren();
      pagination.style.display = 'none';
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
