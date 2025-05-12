const nadeGrid = document.getElementById('nade-grid');
const teamRadios = document.querySelectorAll('input[name="team"]');
const nadeRadios = document.querySelectorAll('input[name="nade"]');
let subFilterContainer = null;
let subFilter = "";

// Загружаем JSON из корня сайта
fetch('/grenades.json')
  .then(res => {
    if (!res.ok) throw new Error('Не удалось загрузить grenades.json');
    return res.json();
  })
  .then(data => {
    const currentMapGrenades = data.filter(g => g.map === currentMap);

    function renderSubFilters(grenades, type) {
      const uniqueSubtypes = Array.from(
        new Set(grenades.filter(g => g.type === type && g.subtype).map(g => g.subtype))
      );

      if (subFilterContainer) subFilterContainer.remove();
      if (uniqueSubtypes.length === 0) return;

      subFilterContainer = document.createElement('div');
      subFilterContainer.className = 'nade-filter';

      uniqueSubtypes.forEach(sub => {
        const input = document.createElement('input');
        const id = `sub-${sub}`;
        input.type = 'radio';
        input.name = 'subtype';
        input.value = sub;
        input.id = id;
        if (sub === subFilter || !subFilter) input.checked = true;

        const label = document.createElement('label');
        label.htmlFor = id;
        label.textContent = sub;

        subFilterContainer.appendChild(input);
        subFilterContainer.appendChild(label);
      });

      nadeGrid.parentNode.insertBefore(subFilterContainer, nadeGrid);
      document.querySelectorAll('input[name="subtype"]').forEach(r =>
        r.addEventListener('change', () => {
          subFilter = document.querySelector('input[name="subtype"]:checked').value;
          render();
        })
      );

      subFilter = document.querySelector('input[name="subtype"]:checked')?.value || "";
    }

    function render() {
      const team = document.querySelector('input[name="team"]:checked').value;
      const nade = document.querySelector('input[name="nade"]:checked').value;

      nadeGrid.innerHTML = '';
      const filteredAll = currentMapGrenades.filter(g => g.team === team && g.type === nade);

      renderSubFilters(filteredAll, nade);

      const filtered = filteredAll.filter(g =>
        !subFilter || g.subtype === subFilter || !g.subtype
      );

      if (filtered.length === 0) {
        nadeGrid.innerHTML = '<p style="text-align:center; color:#888;">Нет данных для выбранных фильтров.</p>';
        return;
      }

      filtered.forEach(g => {
        const div = document.createElement('div');
        div.className = 'nade-item';
        div.innerHTML = `
          <h3>${g.title}</h3>
          <img src="${g.preview || g.image}" alt="${g.title}" style="max-width: 100%; border-radius: 8px;" />
        `;
        div.addEventListener('click', () => {
          document.getElementById('popup-overlay').style.display = 'flex';
          document.getElementById('popup-video').src = g.video || '';
          document.getElementById('popup-position').src = g.positioning || '';
          document.getElementById('popup-aim').src = g.aim || '';
          document.getElementById('popup-tag-position').textContent = g.tags?.position || '';
          document.getElementById('popup-tag-throw').textContent = g.tags?.throw || '';
          document.getElementById('popup-tag-note').textContent = g.tags?.note || '';
        });
        nadeGrid.appendChild(div);
      });
    }

    teamRadios.forEach(r => r.addEventListener('change', render));
    nadeRadios.forEach(r => r.addEventListener('change', render));

    // Закрытие по крестику
    document.getElementById('popup-close').addEventListener('click', () => {
      closePopup();
    });

    // Закрытие по клику вне попапа
    document.getElementById('popup-overlay').addEventListener('click', (e) => {
      const popup = document.querySelector('.popup');
      if (!popup.contains(e.target)) {
        closePopup();
      }
    });

    function closePopup() {
      document.getElementById('popup-overlay').style.display = 'none';
      const video = document.getElementById('popup-video');
      video.pause();
      video.src = '';
    }

    render();
  })
  .catch(err => {
    console.error('Ошибка загрузки JSON:', err);
    nadeGrid.innerHTML = '<p style="color: red;">Ошибка загрузки данных.</p>';
  });
