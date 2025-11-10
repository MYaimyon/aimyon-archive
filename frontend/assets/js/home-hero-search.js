(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const hero = document.querySelector('.home-hero__content');
    if (!hero || hero.querySelector('.hero-search')) return;

    const title = hero.querySelector('.home-hero__title');
    const subtitle = hero.querySelector('.home-hero__subtitle');

    const form = document.createElement('form');
    form.className = 'hero-search';
    form.action = 'search.html';
    form.method = 'get';
    form.setAttribute('role', 'search');
    form.setAttribute('aria-label', 'Site search');

    const input = document.createElement('input');
    input.type = 'search';
    input.name = 'q';
    input.placeholder = 'Search albums, songs, places';
    input.autocomplete = 'off';

    const button = document.createElement('button');
    button.type = 'submit';
    button.textContent = 'Search';

    form.append(input, button);

    if (subtitle) {
      hero.insertBefore(form, subtitle);
    } else if (title) {
      hero.insertBefore(form, title.nextSibling);
    } else {
      hero.insertBefore(form, hero.firstChild);
    }
  });
})();

