/**
 * Détecte les hotspots qui se chevauchent et ajoute une classe de transparence
 */

function detectHotspotOverlap() {
  const hotspots = document.querySelectorAll('.Hotspot');
  const positions = [];

  // Réinitialiser les classes overlapping
  hotspots.forEach(hotspot => {
    hotspot.classList.remove('overlapping');
  });

  // Obtenir les positions de tous les hotspots visibles
  hotspots.forEach((hotspot, index) => {
    const span = hotspot.querySelector('span');
    if (span && span.offsetParent !== null) { // Vérifie si visible
      const rect = span.getBoundingClientRect();
      positions.push({
        index,
        element: hotspot,
        span,
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

  // Déterminer les chevauchements
  for (let i = 0; i < positions.length; i++) {
    let isOverlapping = false;
    
    for (let j = 0; j < positions.length; j++) {
      if (i !== j) {
        if (rectsOverlap(positions[i].rect, positions[j].rect)) {
          isOverlapping = true;
          break;
        }
      }
    }

    if (isOverlapping) {
      positions[i].element.classList.add('overlapping');
    }
  }
}

/**
 * Vérifie si deux rectangles se chevauchent
 */
function rectsOverlap(rect1, rect2) {
  return !(rect1.right < rect2.left || 
           rect1.left > rect2.right || 
           rect1.bottom < rect2.top || 
           rect1.top > rect2.bottom);
}

/**
 * Lance la détection avec un délai pour éviter les appels trop fréquents
 */
let detectionTimeout;
function scheduleDetection() {
  clearTimeout(detectionTimeout);
  detectionTimeout = setTimeout(detectHotspotOverlap, 100);
}

// Détecter au chargement
document.addEventListener('DOMContentLoaded', () => {
  detectHotspotOverlap();
  
  // Relancer la détection en cas de changement de caméra ou redimensionnement
  const modelViewer = document.querySelector('model-viewer');
  if (modelViewer) {
    modelViewer.addEventListener('camera-change', scheduleDetection);
  }
  
  window.addEventListener('resize', scheduleDetection);
  
  // Relancer périodiquement pour s'assurer que tout fonctionne
  setInterval(detectHotspotOverlap, 500);
});

// Si le document est déjà chargé (pour les scripts chargés tardivement)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', detectHotspotOverlap);
} else {
  setTimeout(detectHotspotOverlap, 100);
}
