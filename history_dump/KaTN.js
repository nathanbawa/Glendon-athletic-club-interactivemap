const ROOMS = [
  { id: 'cycling', name: 'Cycling Room', icon: '🚴', color: '#ffb74d', number: '1', numberColor: '#c2410c', category: 'Studios' },
  { id: 'stretching', name: 'Stretching Room', icon: '🧘', color: '#ba68c8', number: '2', numberColor: '#7c3aed', category: 'Studios' },
  { id: 'boxing', name: 'Boxing Room', icon: '🥊', color: '#e57373', number: '3', numberColor: '#b91c1c', category: 'Studios' },
  { id: 'golf', name: 'Golf Court', icon: '⛳', color: '#7cc576', number: '4', numberColor: '#166534', category: 'Courts' },
  { id: 'squash', name: 'Squash Courts', icon: '🏸', color: '#aed581', number: '11', numberColor: '#166534', category: 'Courts' },
  { id: 'pool', name: 'Swimming Pool', icon: '🏊', color: '#4da3ff', number: '10', numberColor: '#1d4ed8', category: 'Aquatics' },
  { id: 'weight', name: 'Weight Room', icon: '🏋️', color: '#7cc576', number: '12', numberColor: '#334155', category: 'Fitness' },
  { id: 'lobby', name: 'Lobby', icon: '🏢', color: '#f5c16c', number: '5', numberColor: '#92400e', category: 'Amenities' },
  { id: 'men-change', name: 'Men Changing Room', icon: '🚪', color: '#90a4ae', number: '6', numberColor: '#475569', category: 'Locker Rooms' },
  { id: 'women-change', name: 'Women Changing Room', icon: '🚪', color: '#90a4ae', number: '7', numberColor: '#475569', category: 'Locker Rooms' },
  { id: 'women-locker', name: 'Women Locker Room', icon: '🚪', color: '#8faadc', number: '8', numberColor: '#475569', category: 'Locker Rooms' },
  { id: 'men-locker', name: 'Men Locker Room', icon: '🚪', color: '#8faadc', number: '9', numberColor: '#475569', category: 'Locker Rooms' },
  { id: 'stairs', name: 'Stairs', icon: 'S', color: '#8faadc', number: '13', numberColor: '#0f172a', category: 'Stairs' },
  { id: 'exit', name: 'Exit', icon: 'E', color: '#ef5350', number: '14', numberColor: '#b91c1c', category: 'Exits' }
];

class GymViewer {
  constructor() {
    this.modelViewer = document.getElementById('modelViewer');
    this.legendContainer = document.getElementById('legend');
    this.hotspots = [];
    this.overlapDetectionTimeout = null;

    if (this.modelViewer && this.legendContainer) {
      this.init();
    }
  }

  init() {
    this.createLegend();
    this.setupHotspotReferences();
    this.setupEventListeners();
  }

  createLegend() {
    const uniqueRooms = {};
    ROOMS.forEach(room => {
      if (!uniqueRooms[room.id]) uniqueRooms[room.id] = room;
    });

    const roomsByCategory = {};
    Object.values(uniqueRooms).forEach(room => {
      if (!roomsByCategory[room.category]) roomsByCategory[room.category] = [];
      roomsByCategory[room.category].push(room);
    });

    const itemsContainer = document.createElement('div');
    itemsContainer.className = 'legend-items';

    Object.keys(roomsByCategory).forEach(category => {
      const heading = document.createElement('button');
      heading.type = 'button';
      heading.className = 'legend-category-toggle';
      const eye = document.createElement('span');
      eye.className = 'toggle-eye';
      eye.setAttribute('aria-hidden', 'true');
      heading.appendChild(eye);
      heading.appendChild(document.createTextNode(category));
      heading.setAttribute('data-category', category);
      heading.setAttribute('aria-pressed', 'true');
      heading.setAttribute('title', 'Toggle visibility');
      heading.setAttribute('aria-label', `Toggle visibility: ${category}`);
      itemsContainer.appendChild(heading);

      roomsByCategory[category].forEach(room => {
        const item = document.createElement('div');
        item.className = 'legend-item';
        item.setAttribute('data-category', category);
        item.setAttribute('data-room-id', room.id);

        const number = document.createElement('span');
        number.className = 'legend-number';
        number.textContent = room.number;
        number.style.backgroundColor = room.numberColor;

        const color = document.createElement('div');
        color.className = 'legend-item-color';
        color.style.backgroundColor = room.color;

        const icon = document.createElement('span');
        icon.className = 'legend-item-icon';
        icon.textContent = room.icon;

        const text = document.createElement('span');
        text.textContent = room.name;

        const toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'legend-item-toggle';
        toggle.setAttribute('aria-pressed', 'true');
        toggle.setAttribute('aria-label', `Toggle visibility: ${room.name}`);

        const toggleEye = document.createElement('span');
        toggleEye.className = 'toggle-eye';
        toggleEye.setAttribute('aria-hidden', 'true');
        toggle.appendChild(toggleEye);

        item.appendChild(number);
        item.appendChild(color);
        item.appendChild(icon);
        item.appendChild(text);

        if (room.id === 'lobby') {
          const youAreHere = document.createElement('span');
          youAreHere.className = 'legend-you-are-here';
          youAreHere.textContent = 'You are here';
          item.appendChild(youAreHere);
        }

        item.appendChild(toggle);
        item.addEventListener('click', event => {
          if (event.target.closest('.legend-item-toggle')) return;
          this.setLegendSelection(room.id);
        });
        itemsContainer.appendChild(item);
      });
    });

    this.legendContainer.appendChild(itemsContainer);
  }

  setupHotspotReferences() {
    const hotspotElements = this.modelViewer.querySelectorAll('.Hotspot');
    const roomMap = new Map(ROOMS.map(room => [room.id, room]));

    hotspotElements.forEach(element => {
      const label = element.querySelector('.HotspotAnnotation');
      const roomId = element.getAttribute('data-room-id');
      if (label && roomId) {
        this.hotspots.push({ element, label, roomId });
      }

      const numberBadge = element.querySelector('.hotspot-number');
      const room = roomMap.get(roomId);
      if (numberBadge && room && room.numberColor) {
        numberBadge.style.backgroundColor = room.numberColor;
      }

      if (room && room.category) {
        element.setAttribute('data-category', room.category);
      }
    });
  }

  setupEventListeners() {
    this.modelViewer.addEventListener('camera-change', () => {
      this.scheduleOverlapDetection();
    });

    window.addEventListener('resize', () => {
      this.scheduleOverlapDetection();
    });

    setInterval(() => this.detectOverlaps(), 500);

    this.hotspots.forEach(hotspot => {
      hotspot.element.addEventListener('mouseenter', () => {
        this.setHotspotActive(hotspot.element, true);
      });

      hotspot.element.addEventListener('mouseleave', () => {
        this.setHotspotActive(hotspot.element, false);
      });

      hotspot.element.addEventListener('click', () => {
        this.focusCameraOnHotspot(hotspot.element);
        this.setLegendSelection(hotspot.roomId);
      });

      hotspot.element.addEventListener('focus', () => {
        this.setHotspotActive(hotspot.element, true);
      });

      hotspot.element.addEventListener('blur', () => {
        this.setHotspotActive(hotspot.element, false);
      });
    });

    const legendToggle = document.getElementById('legendToggle');
    if (legendToggle) {
      legendToggle.addEventListener('click', () => {
        const isCollapsed = this.legendContainer.classList.toggle('collapsed');
        legendToggle.textContent = isCollapsed ? 'Expand' : 'Collapse';
        legendToggle.setAttribute('aria-expanded', isCollapsed ? 'false' : 'true');
      });
    }

    this.setupCategoryToggles();
    this.setupLegendItemToggles();
    this.setupLegendSearch();
  }

  setupCategoryToggles() {
    const categoryButtons = this.legendContainer.querySelectorAll('.legend-category-toggle');
    if (!categoryButtons.length) return;

    categoryButtons.forEach(button => {
      button.addEventListener('click', () => {
        const category = button.getAttribute('data-category');
        if (!category) return;

        const isActive = button.getAttribute('aria-pressed') === 'true';
        button.setAttribute('aria-pressed', isActive ? 'false' : 'true');
        button.classList.toggle('is-off', isActive);

        const items = this.legendContainer.querySelectorAll(`.legend-item[data-category="${category}"]`);
        items.forEach(item => item.classList.toggle('is-hidden', isActive));

        this.hotspots.forEach(hotspot => {
          if (hotspot.element.getAttribute('data-category') === category) {
            hotspot.element.style.display = isActive ? 'none' : '';
          }
        });
      });
    });
  }

  setupLegendItemToggles() {
    const itemToggles = this.legendContainer.querySelectorAll('.legend-item-toggle');
    if (!itemToggles.length) return;

    itemToggles.forEach(button => {
      button.addEventListener('click', event => {
        event.stopPropagation();
        const item = button.closest('.legend-item');
        if (!item) return;

        const roomId = item.getAttribute('data-room-id');
        const isActive = button.getAttribute('aria-pressed') === 'true';
        button.setAttribute('aria-pressed', isActive ? 'false' : 'true');
        item.classList.toggle('is-off', isActive);

        this.hotspots.forEach(hotspot => {
          if (hotspot.roomId === roomId) {
            hotspot.element.style.display = isActive ? 'none' : '';
          }
        });
      });
    });
  }

  setupLegendSearch() {
    const searchInput = document.getElementById('legendSearch');
    if (!searchInput) return;

    const items = Array.from(this.legendContainer.querySelectorAll('.legend-item'));
    const itemMap = new Map(items.map(item => [item.getAttribute('data-room-id'), item]));

    searchInput.addEventListener('input', () => {
      const query = searchInput.value.trim().toLowerCase();
      items.forEach(item => {
        const text = item.textContent.toLowerCase();
        const matches = !query || text.includes(query);
        item.classList.toggle('is-search-hidden', !matches);
      });

      this.hotspots.forEach(hotspot => {
        const item = itemMap.get(hotspot.roomId);
        if (!item) return;
        hotspot.element.classList.toggle('is-search-hidden', item.classList.contains('is-search-hidden'));
      });
    });
  }

  setLegendSelection(roomId) {
    const legendItems = this.legendContainer.querySelectorAll('.legend-item');
    legendItems.forEach(item => {
      const isMatch = item.getAttribute('data-room-id') === roomId;
      item.classList.toggle('active', isMatch);
    });

    this.hotspots.forEach(hotspot => {
      const isMatch = hotspot.roomId === roomId;
      hotspot.element.classList.toggle('active', isMatch);
      hotspot.element.classList.toggle('dimmed', !isMatch);
    });
  }

  setHotspotActive(hotspotElement, isActive) {
    if (isActive) hotspotElement.classList.add('active');
    else hotspotElement.classList.remove('active');
  }

  scheduleOverlapDetection() {
    clearTimeout(this.overlapDetectionTimeout);
    this.overlapDetectionTimeout = setTimeout(() => this.detectOverlaps(), 100);
  }

  detectOverlaps() {
    const visibleLabels = [];

    this.hotspots.forEach(hotspot => {
      const label = hotspot.label;
      if (label.offsetParent !== null) {
        const rect = label.getBoundingClientRect();
        visibleLabels.push({ hotspot, rect });
      }
    });

    this.hotspots.forEach(h => h.element.classList.remove('overlapping'));

    for (let i = 0; i < visibleLabels.length; i++) {
      for (let j = i + 1; j < visibleLabels.length; j++) {
        if (this.rectsOverlap(visibleLabels[i].rect, visibleLabels[j].rect)) {
          visibleLabels[i].hotspot.element.classList.add('overlapping');
          visibleLabels[j].hotspot.element.classList.add('overlapping');
        }
      }
    }
  }

  rectsOverlap(r1, r2) {
    return !(r1.right < r2.left ||
             r1.left > r2.right ||
             r1.bottom < r2.top ||
             r1.top > r2.bottom);
  }

  focusCameraOnHotspot(hotspotElement) {
    const position = hotspotElement.getAttribute('data-position');
    if (!position) return;

    const coords = position.match(/([-\d.]+)m\s+([-\d.]+)m\s+([-\d.]+)m/);
    if (!coords) return;

    const x = parseFloat(coords[1]);
    const y = parseFloat(coords[2]);
    const z = parseFloat(coords[3]);

    let distance = 50;
    let azimuth = 0;
    const orbit = this.modelViewer.cameraOrbit;
    if (orbit) {
      const orbitMatch = orbit.match(/([-\d.]+)deg\s+([-\d.]+)deg\s+([-\d.]+)m/);
      if (orbitMatch) {
        azimuth = parseFloat(orbitMatch[1]);
        distance = parseFloat(orbitMatch[3]);
      }
    }

    this.modelViewer.cameraTarget = `${x}m ${y}m ${z}m`;
    this.modelViewer.cameraOrbit = `${azimuth}deg 70deg ${distance}m`;
    this.modelViewer.cameraTarget = `${x}m ${y}m ${z}m`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new GymViewer();
});
