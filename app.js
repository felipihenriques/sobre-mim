/* Content navigation, project filters and accessible search. */
(() => {
  'use strict';
  const query = selector => document.querySelector(selector);
  const filters = [...document.querySelectorAll('[data-filter]')];
  const cards = [...document.querySelectorAll('.project-card[data-category]')];
  const dialog = query('#search-dialog');
  const input = query('#search-input');
  const results = query('#search-results');
  const menu = query('#menu-button');
  const navigation = query('#main-nav');
  let searchOpener = null;

  function filterProjects(category) {
    filters.forEach(button => {
      const active = button.dataset.filter === category;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    cards.forEach(card => { card.hidden = category !== 'all' && card.dataset.category !== category; });
    const count = cards.filter(card => !card.hidden).length;
    query('#project-count').textContent = `${count} ${count === 1 ? 'item' : 'itens'}`;
  }
  filters.forEach(button => button.addEventListener('click', () => filterProjects(button.dataset.filter)));

  const entries = [
    { name: 'Linha do tempo', description: 'Experiência, liderança e Engenharia de Software', target: 'linha-do-tempo' },
    { name: 'Marketplace Digital', description: 'Projeto para cliente · AS IS · TO BE · automação', target: 'marketplace-project' },
    { name: 'HG Games', description: 'Projeto para cliente · desenvolvimento web', target: 'hg-games' },
    { name: 'Fluxograma', description: 'Processos · estoque · pagamento · entrega · suporte', target: 'python-project' },
    { name: 'Fluxograma + Código', description: 'Python · diagrams.net · condicionais · lógica de programação', target: 'flow-code-project' },
    { name: 'Voa Mundo', description: 'Interface mobile · UX/UI · passagens · pagamentos', target: 'voa-mundo-project' },
    { name: 'AWS', description: 'Preparação para certificação em nuvem', target: 'formacao' },
    { name: 'Sobre mim', description: 'Felipi Guimarães · 21 anos · Engenharia de Software · Supervisor Operacional · liderança', target: 'sobre' },
    { name: 'Conhecimentos', description: 'HTML, CSS, JavaScript, Git, GitHub, Python, Lua, MySQL, banco de dados e inteligência artificial IA', target: 'conhecimentos' }
  ];
  const normalize = value => value.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  function renderResults() {
    const term = normalize(input.value.trim());
    results.replaceChildren();
    entries.filter(entry => normalize(`${entry.name} ${entry.description}`).includes(term)).forEach(entry => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'search-result';
      const title = document.createElement('strong');
      const description = document.createElement('small');
      title.textContent = entry.name;
      description.textContent = entry.description;
      button.append(title, description);
      button.addEventListener('click', () => {
        const destination = document.getElementById(entry.target);
        if (!destination) return;
        if (destination.hidden) filterProjects('all');
        searchOpener = null;
        dialog.close();
        destination.setAttribute('tabindex', '-1');
        destination.focus({ preventScroll: true });
        destination.scrollIntoView({ behavior: document.body.classList.contains('reduced-motion') ? 'auto' : 'smooth' });
      });
      results.append(button);
    });
    if (!results.childElementCount) {
      const empty = document.createElement('p');
      empty.className = 'search-empty';
      empty.setAttribute('role', 'status');
      empty.textContent = 'Nenhum resultado. Tente “Python”, “AWS” ou “conhecimentos”.';
      results.append(empty);
    }
  }

  function openSearch() {
    if (dialog.open) return;
    searchOpener = document.activeElement;
    input.value = '';
    renderResults();
    dialog.showModal();
    input.focus();
  }
  query('#search-button')?.addEventListener('click', openSearch);
  query('#search-close')?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => searchOpener?.focus());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  input.addEventListener('input', renderResults);
  dialog.addEventListener('keydown', event => {
    const buttons = [...results.querySelectorAll('button')];
    if (event.key === 'Enter' && event.target === input) {
      event.preventDefault();
      buttons[0]?.click();
    }
    if (!['ArrowDown', 'ArrowUp'].includes(event.key) || !buttons.length) return;
    event.preventDefault();
    const index = buttons.indexOf(document.activeElement);
    if (event.key === 'ArrowUp' && index <= 0) input.focus();
    else buttons[Math.min(buttons.length - 1, Math.max(0, index + (event.key === 'ArrowDown' ? 1 : -1)))].focus();
  });
  document.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      if (dialog.open) dialog.close(); else openSearch();
    }
  });

  function closeMenu() {
    navigation.classList.remove('open');
    menu.setAttribute('aria-expanded', 'false');
  }
  menu.addEventListener('click', () => {
    const open = navigation.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(open));
  });
  navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('click', event => {
    if (!navigation.contains(event.target) && !menu.contains(event.target)) closeMenu();
  });
})();
