// News page: simple category filter
document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.filter-tab');
  const cards = document.querySelectorAll('.news-card');

  function apply(filter) {
    cards.forEach(card => {
      const cat = card.getAttribute('data-category');
      const show = filter === 'all' || cat === filter;
      card.style.display = show ? 'block' : 'none';
    });
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      apply(tab.getAttribute('data-filter'));
    });
  });

  apply('all');
});

