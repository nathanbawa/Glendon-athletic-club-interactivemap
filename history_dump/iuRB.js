const ROOMS = [/* unchanged data */];

class GymViewer {
  constructor() {
    this.modelViewer = document.getElementById('modelViewer');
    this.legendContainer = document.getElementById('legend');
    this.hotspots = [];
    this.overlapScheduled = false;

    if (this.modelViewer && this.legendContainer) this.init();
  }

  init() {
    this.createLegend();
    this.setupHotspotReferences();
    this.setupEventListeners();
    this.detectOverlaps();
  }

  createLegend() {
    const roomsByCategory = ROOMS.reduce((acc, r) => {
      (acc[r.category] ??= []).push(r);
      return acc;
    }, {});

    const itemsContainer = document.createElement('div');
    itemsContainer.className = 'legend-items';

    Object.entries(roomsByCategory).forEach(([category, rooms]) => {
      const heading = document.createElement('button');
      heading.className = 'legend-category-toggle';
      heading.dataset.category = category;
      heading.textContent = category;
      heading.setAttribute('aria-pressed', 'true');
      itemsContainer.appendChild(heading);

      rooms.forEach(room => {
        const item = document.createElement('div');
        item.className = 'legend-item';
        item.dataset.roomId = room.id;
        item.dataset.category = category;
        item.innerHTML = `
          <span class="legend-number" style="background:${room.numberColor}">${room.number}</span>
          <div class="legend-item-color" style="background:${room.color}"></div>
          <span class="legend-item-icon">${room.icon}</span>
          <span>${room.name}</span>
        `;
        itemsContainer.appendChild(item);
      });
    });

    this.legendContainer.appendChild(itemsContainer);
  }

  setupHotspotReferences() {
    this.hotspots = [...this.modelViewer.querySelectorAll('.Hotspot')].map(el => ({
      element: el,
      label: el.querySelector('.HotspotAnnotation'),
      roomId: el.dataset.roomId
    }));
  }

  setupEventListeners() {
    this.modelViewer.addEventListener('camera-change', () => this.scheduleOverlap());
    window.addEventListener('resize', () => this.scheduleOverlap());
  }

  scheduleOverlap() {
    if (this.overlapScheduled) return;
    this.overlapScheduled = true;
    requestAnimationFrame(() => {
      this.detectOverlaps();
      this.overlapScheduled = false;
    });
  }

  detectOverlaps() {
    const visible = this.hotspots
      .filter(h => h.label?.offsetParent !== null)
      .map(h => ({ h, rect: h.label.getBoundingClientRect() }));

    this.hotspots.forEach(h => h.element.classList.remove('overlapping'));

    for (let i = 0; i < visible.length; i++) {
      for (let j = i + 1; j < visible.length; j++) {
        const a = visible[i].rect;
        const b = visible[j].rect;
        if (!(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom)) {
          visible[i].h.element.classList.add('overlapping');
          visible[j].h.element.classList.add('overlapping');
        }
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', () => new GymViewer());