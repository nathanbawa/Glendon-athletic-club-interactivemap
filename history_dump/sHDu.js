const ROOMS = [
  { id: 'lobby', name: 'Lobby', icon: '🏢', color: '#f5c16c' },
  { id: 'women-locker', name: 'Women Locker Room', icon: '🚪', color: '#8faadc' },
  { id: 'men-locker', name: 'Men Locker Room', icon: '🚪', color: '#8faadc' },
  { id: 'pool', name: 'Swimming Pool', icon: '🏊', color: '#4da3ff' },
  { id: 'golf', name: 'Golf Court', icon: '⛳', color: '#7cc576' },
  { id: 'boxing', name: 'Boxing Room', icon: '🥊', color: '#e57373' },
  { id: 'stretching', name: 'Stretching Room', icon: '🧘', color: '#ba68c8' },
  { id: 'weight', name: 'Weight Room', icon: '🏋️', color: '#7cc576' }
];

class GymViewer {
  constructor() {
    this.modelViewer = document.getElementById('modelViewer');
    this.legend = document.getElementById('legend');
    this.hotspots = [];
    if (this.modelViewer) this.init();
  }

  init() {
    this.createLegend();
    this.collectHotspots();
    this.bindEvents();
  }

  createLegend() {
    ROOMS.forEach(room => {
      const item = document.createElement('div');
      item.className = 'legend-item';

      item.innerHTML = `
        <div class="legend-item-color" style="background:${room.color}"></div>
        <span class="legend-item-icon">${room.icon}</span>
        <span>${room.name}</span>
      `;

      this.legend.appendChild(item);
    });
  }

  collectHotspots() {
    document.querySelectorAll('.Hotspot').forEach(el => {
      this.hotspots.push({
        el,
        label: el.querySelector('.HotspotAnnotation'),
        room: el.dataset.roomId
      });
    });
  }

  bindEvents() {
    this.hotspots.forEach(h => {
      h.el.addEventListener('mouseenter', () => h.el.classList.add('active'));
      h.el.addEventListener('mouseleave', () => h.el.classList.remove('active'));
      h.el.addEventListener('click', () => this.focusCamera(h.el));
    });

    document.getElementById('legendToggle')?.addEventListener('click', () => {
      this.legend.classList.toggle('collapsed');
    });
  }

  focusCamera(hotspot) {
    const pos = hotspot.dataset.position.match(/([-\d.]+)m\s+([-\d.]+)m\s+([-\d.]+)m/);
    if (!pos) return;

    const [ , x, y, z ] = pos.map(Number);

    this.modelViewer.cameraTarget = `${x}m ${y}m ${z}m`;
    this.modelViewer.cameraOrbit = `0deg 75deg 50m`;
  }
}

document.addEventListener('DOMContentLoaded', () => new GymViewer());