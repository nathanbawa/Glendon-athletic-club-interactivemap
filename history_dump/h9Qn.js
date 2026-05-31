const ROOMS = [
  { id: 'golf', name: 'Golf Court', icon: '⛳', color: '#7cc576' },
  { id: 'lobby', name: 'Lobby', icon: '🏢', color: '#f5c16c' },
  { id: 'men-change', name: 'Men Changing Room', icon: '🚪', color: '#90a4ae' },
  { id: 'women-change', name: 'Women Changing Room', icon: '🚪', color: '#90a4ae' },
  { id: 'women-locker', name: 'Women Locker Room', icon: '🚪', color: '#8faadc' },
  { id: 'men-locker', name: 'Men Locker Room', icon: '🚪', color: '#8faadc' },
  { id: 'pool', name: 'Swimming Pool', icon: '🏊', color: '#4da3ff' },
  { id: 'squash', name: 'Squash Courts', icon: '🏸', color: '#aed581' },
  { id: 'weight', name: 'Weight Room', icon: '🏋️', color: '#7cc576' }
];

class GymViewer {
  constructor() {
    this.modelViewer = document.getElementById('modelViewer');
    this.legendContainer = document.getElementById('legend');
    this.hotspots = [];
    this.overlapDetectionTimeout = null;
    this.isDetecting = false;

    if (this.modelViewer && this.legendContainer) this.init();
  }

  init() {
    this.createLegend();
    this.cacheHotspots();
    this.bindEvents();
    requestAnimationFrame(() => this.detectOverlaps());
  }

  createLegend() {
    const fragment = document.createDocumentFragment();
    ROOMS.forEach(room => {
      const item = document.createElement('div');
      item.className = 'legend-item';

      const color = document.createElement('div');
      color.className = 'legend-item-color';
      color.style.backgroundColor = room.color;

      const icon = document.createElement('span');
      icon.className = 'legend-item-icon';
      icon.textContent = room.icon;

      const text = document.createElement('span');
      text.textContent = room.name;

      item.append(color, icon, text);
      fragment.appendChild(item);
    });
    this.legendContainer.appendChild(fragment);
  }

  cacheHotspots() {
    this.hotspots = Array.from(this.modelViewer.querySelectorAll('.Hotspot'))
      .map(el => {
        const label = el.querySelector('.HotspotAnnotation');
        const roomId = el.getAttribute('data-room-id');
        return label && roomId ? { element: el, label, roomId } : null;
      })
      .filter(Boolean);
  }

  bindEvents() {
    const schedule = () => this.scheduleOverlapDetection();
    this.modelViewer.addEventListener('camera-change', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });

    this.hotspots.forEach(({ element }) => {
      element.addEventListener('mouseenter', () => element.classList.add('active'));
      element.addEventListener('mouseleave', () => element.classList.remove('active'));
      element.addEventListener('focus', () => element.classList.add('active'));
      element.addEventListener('blur', () => element.classList.remove('active'));
      element.addEventListener('click', () => this.focusCameraOnHotspot(element));
    });
  }

  scheduleOverlapDetection() {
    if (this.isDetecting) return;
    clearTimeout(this.overlapDetectionTimeout);
    this.overlapDetectionTimeout = setTimeout(() => this.detectOverlaps(), 120);
  }

  detectOverlaps() {
    this.isDetecting = true;
    const visible = [];

    for (const hotspot of this.hotspots) {
      const rect = hotspot.label.getBoundingClientRect();
      if (rect.width && rect.height) visible.push({ hotspot, rect });
      hotspot.element.classList.remove('overlapping');
    }

    for (let i = 0; i < visible.length; i++) {
      for (let j = i + 1; j < visible.length; j++) {
        if (!(visible[i].rect.right < visible[j].rect.left ||
              visible[i].rect.left > visible[j].rect.right ||
              visible[i].rect.bottom < visible[j].rect.top ||
              visible[i].rect.top > visible[j].rect.bottom)) {
          visible[i].hotspot.element.classList.add('overlapping');
          visible[j].hotspot.element.classList.add('overlapping');
        }
      }
    }

    this.isDetecting = false;
  }

  focusCameraOnHotspot(el) {
    const position = el.getAttribute('data-position');
    if (!position) return;

    const coords = position.match(/([-\d.]+)m\s+([-\d.]+)m\s+([-\d.]+)m/);
    if (!coords) return;

    const [ , x, y, z ] = coords.map(Number);
    const distance = 50;

    requestAnimationFrame(() => {
      this.modelViewer.cameraOrbit = `0deg 75deg ${distance}m`;
      this.modelViewer.cameraTarget = `${x}m ${y}m ${z}m`;
    });
  }
}

document.addEventListener('DOMContentLoaded', () => new GymViewer());