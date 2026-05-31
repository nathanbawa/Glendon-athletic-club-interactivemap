// Configuration des salles
const ROOMS = [
  {
    id: 'lobby',
    name: 'Lobby',
    position: '-0.465m -1.556m 16.845m',
    icon: '🏢',
    color: '#f5c16c'
  },
  {
    id: 'women-locker',
    name: 'Women Locker Room',
    position: '-5.224m -1.028m -0.964m',
    icon: '🚪',
    color: '#8faadc'
  },
  {
    id: 'men-locker',
    name: 'Men Locker Room',
    position: '-6.623m -1.022m -12.298m',
    icon: '🚪',
    color: '#8faadc'
  },
  {
    id: 'pool',
    name: 'Swimming Pool',
    position: '-23.436m -1.043m -5.563m',
    icon: '🏊',
    color: '#4da3ff'
  },
  {
    id: 'golf',
    name: 'Golf Court',
    position: '8.065m -1.033m 15.761m',
    icon: '⛳',
    color: '#7cc576'
  },
  {
    id: 'boxing',
    name: 'Boxing Room',
    position: '14.131m -1.058m 15.917m',
    icon: '🥊',
    color: '#e57373'
  },
  {
    id: 'stretching',
    name: 'Stretching Room',
    position: '20.581m -1.039m 16.087m',
    icon: '🧘',
    color: '#ba68c8'
  },
  {
    id: 'weight',
    name: 'Weight Room',
    position: '16.158m -1.057m -3.158m',
    icon: '🏋️',
    color: '#7cc576'
  }
];

/**
 * Classe principale pour gérer le visualiseur de salle de sport
 */
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

  /**
   * Initialise l'application
   */
  init() {
    this.createLegend();
    this.createHotspots();
    this.setupEventListeners();
  }

  /**
   * Crée la légende avec les salles uniques
   */
  createLegend() {
    const uniqueRooms = {};
    
    ROOMS.forEach(room => {
      if (!uniqueRooms[room.id]) {
        uniqueRooms[room.id] = room;
      }
    });

    Object.values(uniqueRooms).forEach(room => {
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
      
      item.appendChild(color);
      item.appendChild(icon);
      item.appendChild(text);
      
      this.legendContainer.appendChild(item);
    });
  }

  /**
   * Crée tous les hotspots et les ajoute au model-viewer
   */
  createHotspots() {
    ROOMS.forEach((room, index) => {
      const hotspot = document.createElement('button');
      hotspot.className = 'hotspot';
      hotspot.id = `hotspot-${room.id}`;
      hotspot.slot = `hotspot-${index + 1}`;
      hotspot.setAttribute('data-position', room.position);
      hotspot.setAttribute('data-room-id', room.id);
      hotspot.setAttribute('aria-label', room.name);

      const label = document.createElement('div');
      label.className = 'hotspot-label';
      label.textContent = room.name;

      hotspot.appendChild(label);
      this.modelViewer.appendChild(hotspot);

      this.hotspots.push({
        element: hotspot,
        label: label,
        roomId: room.id
      });
    });
  }

  /**
   * Configure tous les event listeners
   */
  setupEventListeners() {
    // Événements de la caméra
    this.modelViewer.addEventListener('camera-change', () => {
      this.scheduleOverlapDetection();
    });

    // Événements de redimensionnement
    window.addEventListener('resize', () => {
      this.scheduleOverlapDetection();
    });

    // Détection périodique
    setInterval(() => this.detectOverlaps(), 500);

    // Événements des hotspots individuels
    this.hotspots.forEach(hotspot => {
      hotspot.element.addEventListener('mouseenter', () => {
        this.setHotspotActive(hotspot.element, true);
      });

      hotspot.element.addEventListener('mouseleave', () => {
        this.setHotspotActive(hotspot.element, false);
      });

      hotspot.element.addEventListener('click', () => {
        this.handleHotspotClick(hotspot.roomId);
      });

      hotspot.element.addEventListener('focus', () => {
        this.setHotspotActive(hotspot.element, true);
      });

      hotspot.element.addEventListener('blur', () => {
        this.setHotspotActive(hotspot.element, false);
      });
    });
  }

  /**
   * Active ou désactive l'état d'un hotspot
   */
  setHotspotActive(hotspotElement, isActive) {
    if (isActive) {
      hotspotElement.classList.add('active');
    } else {
      hotspotElement.classList.remove('active');
    }
  }

  /**
   * Programme la détection de chevauchement avec délai
   */
  scheduleOverlapDetection() {
    clearTimeout(this.overlapDetectionTimeout);
    this.overlapDetectionTimeout = setTimeout(() => this.detectOverlaps(), 100);
  }

  /**
   * Détecte les hotspots qui se chevauchent
   */
  detectOverlaps() {
    const visibleLabels = [];

    // Collecter tous les labels visibles
    this.hotspots.forEach(hotspot => {
      const label = hotspot.label;
      if (label.offsetParent !== null) {
        const rect = label.getBoundingClientRect();
        visibleLabels.push({
          hotspot,
          rect: {
            left: rect.left,
            top: rect.top,
            right: rect.right,
            bottom: rect.bottom,
            width: rect.width,
            height: rect.height
          }
        });
      }
    });

    // Réinitialiser les classes overlapping
    this.hotspots.forEach(h => h.element.classList.remove('overlapping'));

    // Détecter les chevauchements
    for (let i = 0; i < visibleLabels.length; i++) {
      for (let j = i + 1; j < visibleLabels.length; j++) {
        if (this.rectsOverlap(visibleLabels[i].rect, visibleLabels[j].rect)) {
          visibleLabels[i].hotspot.element.classList.add('overlapping');
          visibleLabels[j].hotspot.element.classList.add('overlapping');
        }
      }
    }
  }

  /**
   * Vérifie si deux rectangles se chevauchent
   */
  rectsOverlap(rect1, rect2) {
    return !(rect1.right < rect2.left ||
             rect1.left > rect2.right ||
             rect1.bottom < rect2.top ||
             rect1.top > rect2.bottom);
  }

  /**
   * Gère le clic sur un hotspot
   */
  handleHotspotClick(roomId) {
    console.log(`Room selected: ${roomId}`);
    // Ajouter ici les actions au clic (navigation, modal, etc.)
  }
}

// Initialisation au chargement du DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new GymViewer();
  });
} else {
  new GymViewer();
}
