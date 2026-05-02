// Game catalog filtering and sorting functionality
export function initGameCatalog() {
  const grid = document.querySelector("[data-games-grid]");
  const searchInput = document.querySelector("[data-search-input]");
  const categoryFilter = document.querySelector("[data-category-filter]");
  const sortSelect = document.querySelector("[data-sort-select]");
  const countTarget = document.querySelector("[data-results-count]");
  const emptyState = document.querySelector("[data-empty-state]");

  if (!grid || !searchInput || !categoryFilter || !sortSelect || !countTarget || !emptyState) {
    return;
  }

  const items = Array.from(grid.querySelectorAll("[data-game-item]"));
  const params = new URLSearchParams(window.location.search);

  // Sanitize URL parameters
  const sanitizeInput = (str) => {
    if (typeof str !== 'string') return '';
    return str.replace(/<[^>]*>/g, '').replace(/[<>"'`]/g, '').trim().slice(0, 100);
  };

  const validateCategory = (cat) => {
    const allowed = Array.from(categoryFilter.options).map(opt => opt.value);
    return allowed.includes(cat) ? cat : 'all';
  };

  const validateSort = (sort) => {
    const allowed = ['featured', 'newest', 'title'];
    return allowed.includes(sort) ? sort : 'featured';
  };

  const initialQuery = sanitizeInput(params.get("q") || "");
  const initialCategory = validateCategory(params.get("category") || "all");
  const initialSort = validateSort(params.get("sort") || "featured");

  searchInput.value = initialQuery;
  categoryFilter.value = initialCategory;
  sortSelect.value = initialSort;

  const sorters = {
    featured: (a, b) => {
      const aFeatured = Number(a.dataset.featured || "0");
      const bFeatured = Number(b.dataset.featured || "0");
      if (aFeatured !== bFeatured) return bFeatured - aFeatured;
      return (a.dataset.title || "").localeCompare(b.dataset.title || "");
    },
    newest: (a, b) =>
      new Date(b.dataset.createdAt || "1970-01-01").getTime() -
      new Date(a.dataset.createdAt || "1970-01-01").getTime(),
    title: (a, b) => (a.dataset.title || "").localeCompare(b.dataset.title || "")
  };

  const updateUrl = (query, category, sort) => {
    const next = new URL(window.location.href);

    const sanitizedQuery = sanitizeInput(query);
    const validatedCategory = validateCategory(category);
    const validatedSort = validateSort(sort);

    if (sanitizedQuery) next.searchParams.set("q", sanitizedQuery);
    else next.searchParams.delete("q");

    if (validatedCategory && validatedCategory !== "all") next.searchParams.set("category", validatedCategory);
    else next.searchParams.delete("category");

    if (validatedSort && validatedSort !== "featured") next.searchParams.set("sort", validatedSort);
    else next.searchParams.delete("sort");

    history.replaceState({}, "", next);
  };

  const applyFilters = () => {
    const query = sanitizeInput(searchInput.value);
    const category = validateCategory(categoryFilter.value);
    const sort = validateSort(sortSelect.value);

    const visibleItems = items.filter((item) => {
      const matchesQuery =
        !query ||
        (item.dataset.title || "").includes(query) ||
        (item.dataset.shortDescription || "").includes(query) ||
        (item.dataset.category || "").includes(query);

      const matchesCategory =
        category === "all" || (item.dataset.category || "").split("|").includes(category);

      item.hidden = !(matchesQuery && matchesCategory);
      return matchesQuery && matchesCategory;
    });

    visibleItems
      .sort(sorters[sort] || sorters.featured)
      .forEach((item) => {
        grid.appendChild(item);
      });

    countTarget.textContent = String(visibleItems.length);
    emptyState.hidden = visibleItems.length > 0;
    updateUrl(query, category, sort);
  };

  searchInput.addEventListener("input", applyFilters);
  categoryFilter.addEventListener("change", applyFilters);
  sortSelect.addEventListener("change", applyFilters);
  applyFilters();
}
