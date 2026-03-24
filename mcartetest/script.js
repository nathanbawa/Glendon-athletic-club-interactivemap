document.addEventListener('DOMContentLoaded', () => {
  const modelViewer = document.querySelector('model-viewer');
  const legendPanel = document.getElementById('legend-panel');
  const legendHeader = document.querySelector('.legend-header');
  const legendContent = document.querySelector('.legend-content');
  const searchInputs = document.querySelectorAll('.legend-search');
  const legendItems = document.querySelectorAll('.legend-item');
  const hotspots = document.querySelectorAll('.Hotspot');
  const legendCategories = document.querySelectorAll('.legend-category');

  // --- Legend Collapse ---
  legendHeader.addEventListener('click', () => {
    const isMinimized = legendPanel.classList.toggle('minimized');
    const icon = legendHeader.querySelector('.collapse-btn i');
    icon.classList.toggle('fa-chevron-up', !isMinimized);
    icon.classList.toggle('fa-chevron-down', isMinimized);
  });

  // --- Search ---
  searchInputs.forEach(searchInput => {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();

      // Keep both inputs visually synced
      searchInputs.forEach(i => { if(i !== e.target) i.value = e.target.value; });

      const visibleHotspots = new Set();
      let isSearchEmpty = !query;

    legendItems.forEach(item => {
      const label = item.querySelector('.item-label').textContent.toLowerCase();
      const match = isSearchEmpty || label.includes(query);
      item.style.display = match ? 'flex' : 'none';

      if (match) {
        const category = item.dataset.category;
        const number = item.dataset.number;
        if (category) {
          Array.from(hotspots).forEach(h => {
            const hLabel = h.querySelector('.hotspot-label').textContent;
            if (hLabel === category || (category === 'Exit' && hLabel.includes('Exit')) || (category === 'Stairs' && hLabel.includes('Stairs'))) {
              visibleHotspots.add(h);
            }
          });
        } else if (number) {
          const hotspot = Array.from(hotspots).find(h => h.querySelector('.hotspot-number').textContent === number);
          if (hotspot) visibleHotspots.add(hotspot);
        }
      }
    });

    // Hide/show category titles
    legendCategories.forEach(category => {
      const anyVisible = Array.from(category.querySelectorAll('.legend-item')).some(
        item => item.style.display !== 'none'
      );
      category.style.display = anyVisible ? 'block' : 'none';
    });
    
    // Hide unmatched hotspots
    hotspots.forEach(h => {
      if (isSearchEmpty || visibleHotspots.has(h)) {
        h.classList.remove('search-hidden');
      } else {
        h.classList.add('search-hidden');
      }
    });
  });
});

  // --- Initialize Exit Hotspots ---
  hotspots.forEach(h => {
    const label = h.querySelector('.hotspot-label');
    if (label && label.textContent.includes('Exit')) {
      h.classList.add('exit-hotspot');
    }
  });

  // --- Eye Toggle ---
  const toggleVisibility = (elements, show) => {
    elements.forEach(el => {
      if (show) {
        el.classList.remove('eye-hidden');
      } else {
        el.classList.add('eye-hidden');
      }
    });
  };

  legendItems.forEach(item => {
    const eyeBtn = item.querySelector('.eye-toggle');
    if (!eyeBtn) return;

    eyeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const icon = eyeBtn.querySelector('i');
      const isCurrentlyVisible = !icon.classList.contains('fa-eye-slash');
      const newVisibleState = !isCurrentlyVisible;
      
      const category = item.dataset.category;
      const number = item.dataset.number;

      if (category) {
        const categoryHotspots = Array.from(hotspots).filter(h => {
          const hLabel = h.querySelector('.hotspot-label').textContent;
          return hLabel === category || (category === 'Exit' && hLabel.includes('Exit')) || (category === 'Stairs' && hLabel.includes('Stairs'));
        });
        toggleVisibility(categoryHotspots, newVisibleState);
      } else if (number) {
        const hotspot = Array.from(hotspots).find(h => h.querySelector('.hotspot-number').textContent === number);
        if (hotspot) {
          toggleVisibility([hotspot], newVisibleState);
        }
      }
      
      if (newVisibleState) {
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
        eyeBtn.classList.remove('hidden-state');
      } else {
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
        eyeBtn.classList.add('hidden-state');
      }
    });
  });

  // --- Category Toggle ---
  const categoryHeaders = document.querySelectorAll('.category-header');
  categoryHeaders.forEach(header => {
    const catToggleBtn = header.querySelector('.category-toggle');
    if (!catToggleBtn) return;

    catToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const icon = catToggleBtn.querySelector('i');
      const isCurrentlyVisible = !icon.classList.contains('fa-eye-slash');
      const newVisibleState = !isCurrentlyVisible;

      // Update the category button icon
      if (newVisibleState) {
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
        catToggleBtn.classList.remove('hidden-state');
      } else {
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
        catToggleBtn.classList.add('hidden-state');
      }

      // Find all items within this category and toggle them
      const categoryContainer = header.closest('.legend-category');
      const items = categoryContainer.querySelectorAll('.legend-item');
      
      items.forEach(item => {
        const itemEyeBtn = item.querySelector('.eye-toggle');
        const itemIcon = itemEyeBtn.querySelector('i');
        
        // Update individual item icon state
        if (newVisibleState) {
          itemIcon.classList.remove('fa-eye-slash');
          itemIcon.classList.add('fa-eye');
          itemEyeBtn.classList.remove('hidden-state');
        } else {
          itemIcon.classList.remove('fa-eye');
          itemIcon.classList.add('fa-eye-slash');
          itemEyeBtn.classList.add('hidden-state');
        }

        // Toggle map hotspots
        const categoryLabel = item.dataset.category;
        const number = item.dataset.number;

        if (categoryLabel) {
          const categoryHotspots = Array.from(hotspots).filter(h => {
            const hLabel = h.querySelector('.hotspot-label').textContent;
            return hLabel === categoryLabel || (categoryLabel === 'Exit' && hLabel.includes('Exit')) || (categoryLabel === 'Stairs' && hLabel.includes('Stairs'));
          });
          toggleVisibility(categoryHotspots, newVisibleState);
        } else if (number) {
          const hotspot = Array.from(hotspots).find(h => h.querySelector('.hotspot-number').textContent === number);
          if (hotspot) {
            toggleVisibility([hotspot], newVisibleState);
          }
        }
      });
    });
  });

  // --- Legend Item Click (Auto-Focus and Filter) ---
  legendItems.forEach(item => {
    item.style.cursor = 'pointer'; 
    
    item.addEventListener('click', (e) => {
      // Ignore if they are physically clicking the eye visibility toggle
      if (e.target.closest('.eye-toggle')) return;

      const categoryLabel = item.dataset.category;
      const number = item.dataset.number;
      
      let targetHotspot = null;

      // Filter and hide all other hotspots
      hotspots.forEach(h => {
        let isMatch = false;
        
        const hLabelNode = h.querySelector('.hotspot-label');
        const hNumNode = h.querySelector('.hotspot-number');
        
        const hLabel = hLabelNode ? hLabelNode.textContent : "";
        const hNum = hNumNode ? hNumNode.textContent : "";
        
        if (number && hNum === number) isMatch = true;
        if (categoryLabel && (hLabel === categoryLabel || (categoryLabel === 'Exit' && hLabel.includes('Exit')) || (categoryLabel === 'Stairs' && hLabel.includes('Stairs')))) isMatch = true;
        
        if (isMatch) {
            h.classList.remove('faded-out'); 
            h.style.display = 'inline-flex';
            if(!targetHotspot) targetHotspot = h;
        } else {
            h.classList.add('faded-out'); 
        }
      });
      
      // Auto-orbit and focus camera identically to tapping the hotspot cleanly
      if (targetHotspot) {
         targetHotspot.click();
      }
      
      // Auto-collapse legend slightly to half-state on mobile so model is fully framed but legend still peeks
      if (isMobile() && typeof currentState !== 'undefined') {
         currentState = snapStates.HALF;
         legendPanel.style.transform = `translateY(65%)`;
         if(minimizeBtn) minimizeBtn.querySelector('i').classList.replace('fa-chevron-up', 'fa-chevron-down');
      }
    });
  });

  // --- Hotspot Selection & Camera View ---
  const annotationClicked = (annotation) => {
    let dataset = annotation.dataset;
    
    // Automatically fallback to position for target and keep current orbit if none provided, 
    // ensuring the camera correctly focuses on the clicked room
    if (dataset.target || dataset.position) {
      modelViewer.cameraTarget = dataset.target || dataset.position;
    }
  };

  // ─────────────────────────────────────────
  // CONSTANTS
  // ─────────────────────────────────────────
  const mv = modelViewer;


  // ─────────────────────────────────────────
  // HOTSPOT LOGIC
  // ─────────────────────────────────────────
  const selectHotspot = (h) => {
    if (selectedHotspot === h) return;
    selectedHotspot = h;

    hotspots.forEach(other => {
      other.classList.remove('selected');
      if (other !== h) {
        other.classList.add('faded-out');
      }
    });
    h.classList.remove('faded-out');
    h.classList.add('selected');

    // Rely on existing native alignment logic flawlessly
    annotationClicked(h);
  };

  const deselectAll = () => {
    selectedHotspot = null;
    hotspots.forEach(h => {
      h.classList.remove('selected', 'faded-out');
    });
  };

  // ─────────────────────────────────────────
  // HOTSPOT CLICK/TAP
  // ─────────────────────────────────────────
  hotspots.forEach(h => {
    h.addEventListener('pointerup', (e) => {
      e.stopPropagation();
      if (typeof navigator.vibrate === 'function') navigator.vibrate(40);
      selectHotspot(h);
    });
  });

// --- Reset View Button ---
const resetBtn = document.getElementById('reset-view-btn');
if (resetBtn) {
  resetBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    // Glide camera back to the requested 45-degree starter position perfectly
    modelViewer.cameraOrbit = "360deg 45deg 100m";
    modelViewer.cameraTarget = "0m -1.3m 8.5m";
    modelViewer.fieldOfView = "70deg";
  });
}

// Background Click Deselect
mv.addEventListener('click', (e) => {
  if (e.target === mv && selectedHotspot) {
    deselectAll();
  }
});

  // --- Initialization & Performance Optimizations ---
  modelViewer.addEventListener('load', () => {
    // 1. Elevate Hotspots on Y axis to float above the mesh surface perfectly
    hotspots.forEach(h => {
        if (h.dataset.position) {
            const pos = h.dataset.position.split(' ');
            if (pos.length === 3) {
                const y = parseFloat(pos[1]) + 2.0; 
                h.dataset.position = `${pos[0]} ${y}m ${pos[2]}`;
            }
        }
    });

    // Temporarily hide all hotspots during camera development
    hotspots.forEach(h => {
      h.style.display = 'none';
    });

    // 2. Automatically trigger the hide function for Exits and Stairs correctly through the legend UI
    const categories = document.querySelectorAll('.legend-category');
    categories.forEach(cat => {
        const titleEl = cat.querySelector('h3');
        if (titleEl) {
            const title = titleEl.textContent.toLowerCase();
            if (title.includes('exit') || title.includes('stairs')) {
                const toggles = cat.querySelectorAll('.eye-toggle');
                toggles.forEach(t => {
                   if (!t.querySelector('i').classList.contains('fa-eye-slash')) t.click();
                });
            }
        }
    });

    const screen = document.getElementById('loading-screen');
    if (screen) {
      screen.style.opacity = '0';
      setTimeout(() => screen.style.display = 'none', 500);
    }
  });

  // Force hide loading screen after 10 seconds maximum
  setTimeout(() => {
    const screen = document.getElementById('loading-screen');
    if (screen) {
      screen.style.opacity = '0';
      setTimeout(() => screen.style.display = 'none', 500);
    }
  }, 10000);

  // --- Optimization: Debounce Resize Listeners ---
  function debounce(fn, delay) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }
  window.addEventListener('resize', debounce(() => {
    // existing resize logic (none currently)
  }, 200));

  modelViewer.addEventListener('load', () => {
    // Preserve logic to show legend on load seamlessly
    legendPanel.classList.remove('loading-hidden');
  });

  // the easiest method to handle the fading natively on model viewer is looking at the 'data-visible'
  // model viewer sets 'data-visible' to true or false.

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'data-visible') {
        const h = mutation.target;
        // modelViewer natively sets data-visible=false when strongly pointing away
        // However, instead of hiding entirely we modify its style according to requirements
        if(h.dataset.visible === 'false' || h.dataset.visible === false || !h.hasAttribute('data-visible')){
           h.classList.add('angled-away');
        } else {
           h.classList.remove('angled-away');
        }
      }
    });
  });

  hotspots.forEach(h => {
    // Override the native hide behaviour:
    // Model-viewer naturally sets opacity to 0 via their default rules in CSS or JS. 
    // We handle it via CSS overriding and the MutationObserver monitoring the data tag.
    
    // Inject a <style> tag if not already injected that forces model-viewer to not hide the buttons completely when 'data-visible' is false.
    observer.observe(h, { attributes: true });
  });
  
  // Model viewer naturally hides buttons that aren't visible with a built-in style. 
  // We need to override this behavior so our CSS opacity transition works.
  const style = document.createElement('style');
  style.textContent = `
    .Hotspot:not([data-visible]) {
      display: inline-flex !important;
      visibility: visible !important;
    }
    
    .Hotspot:not([data-visible]) > * {
      opacity: 1 !important;
      pointer-events: auto !important;
      transform: none !important;
    }
  `;
  document.head.appendChild(style);


  // --- Mobile Location FAB ---
  const mobileLocBtn = document.getElementById('mobile-location-btn');
  if (mobileLocBtn) {
    mobileLocBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      // Locate Hotspot 1 (Lobby / You are here marker) natively in the DOM list
      const youAreHereHotspot = Array.from(hotspots).find(h => {
        const numWrap = h.querySelector('.hotspot-number');
        return numWrap && numWrap.textContent.trim() === '1';
      });
      if (youAreHereHotspot) {
        youAreHereHotspot.click(); // Triggers existing annotationClicked auto-focus
      }
    });
  }



  // --- Mobile Drawer Drag Logic ---
  const dragArea = document.getElementById('mobile-drag-area');
  const minimizeBtn = document.getElementById('mobile-minimize-btn');

  let isDragging = false;
  let startY = 0;
  let initialTransformY = 0;
  
  const getPanelHeight = () => legendPanel.offsetHeight;
  
  const snapStates = {
    HIDDEN: 'HIDDEN',
    HALF: 'HALF',
    FULL: 'FULL'
  };
  let currentState = snapStates.HIDDEN; // Default collapsed state per user request

  const isMobile = () => window.innerWidth <= 768;
  
  const updateLayoutMode = (yPos) => {
      const threshold = legendPanel.offsetHeight * 0.45;
      if (yPos < threshold) {
          legendPanel.classList.remove('layout-horizontal');
      } else {
          legendPanel.classList.add('layout-horizontal');
      }
  };
  
  if(isMobile()) {
      legendPanel.style.transform = `translateY(calc(100% - 40px))`;
      legendPanel.style.transition = `transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)`;
      updateLayoutMode(legendPanel.offsetHeight * 0.8); // Initially horizontal since Hidden
  }

  const getTransformY = () => {
    const style = window.getComputedStyle(legendPanel);
    const matrix = new DOMMatrixReadOnly(style.transform);
    return matrix.m42;
  };

  const handleDragStart = (e) => {
    if (!isMobile()) return;
    isDragging = true;
    startY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
    initialTransformY = getTransformY();
    
    legendPanel.style.transition = 'none';
    legendPanel.classList.add('dragging');
  };

  const handleDragMove = (e) => {
    if (!isDragging || !isMobile()) return;
    
    const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
    const deltaY = clientY - startY;
    
    let newY = initialTransformY + deltaY;
    
    const panelHeight = getPanelHeight();
    const maxPush = panelHeight - 40; // 40px remaining for the handle visibility
    
    if (newY < 193) newY = 193; // Mathematically override to exactly 193px offset per explicit prompt
    if (newY > maxPush) newY = maxPush;
    
    legendPanel.style.transform = `translateY(${newY}px)`;
    updateLayoutMode(newY);
  };

  const handleDragEnd = () => {
    if (!isDragging || !isMobile()) return;
    isDragging = false;
    
    legendPanel.style.transition = 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)';
    legendPanel.classList.remove('dragging');
    
    const panelHeight = getPanelHeight();
    const currentYPix = getTransformY();
    
    const hiddenY = panelHeight - 40;
    const halfY = panelHeight * 0.65;
    const fullY = 193;
    
    const distances = [
      { state: snapStates.FULL, dist: Math.abs(currentYPix - fullY), val: '193px' },
      { state: snapStates.HALF, dist: Math.abs(currentYPix - halfY), val: '65%' },
      { state: snapStates.HIDDEN, dist: Math.abs(currentYPix - hiddenY), val: 'calc(100% - 40px)' }
    ];
    
    distances.sort((a, b) => a.dist - b.dist);
    const closest = distances[0];
    
    currentState = closest.state;
    legendPanel.style.transform = `translateY(${closest.val})`;

    if (currentState === snapStates.FULL) {
        updateLayoutMode(193);
    } else if (currentState === snapStates.HALF) {
        updateLayoutMode(getPanelHeight() * 0.65);
    } else {
        updateLayoutMode(getPanelHeight() - 40);
    }
    
    const icon = minimizeBtn.querySelector('i');
    if(currentState === snapStates.HIDDEN) {
        icon.classList.remove('fa-chevron-down');
        icon.classList.add('fa-chevron-up');
    } else {
        icon.classList.remove('fa-chevron-up');
        icon.classList.add('fa-chevron-down');
    }
  };

  if (dragArea) {
      dragArea.addEventListener('mousedown', handleDragStart);
      dragArea.addEventListener('touchstart', handleDragStart, { passive: true });
  }

  window.addEventListener('mousemove', handleDragMove);
  window.addEventListener('touchmove', handleDragMove, { passive: true });

  window.addEventListener('mouseup', handleDragEnd);
  window.addEventListener('touchend', handleDragEnd);

  if (minimizeBtn) {
      minimizeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if(currentState === snapStates.HIDDEN) {
              currentState = snapStates.HALF;
              legendPanel.style.transform = `translateY(65%)`;
              minimizeBtn.querySelector('i').classList.replace('fa-chevron-up', 'fa-chevron-down');
          } else {
              currentState = snapStates.HIDDEN;
              legendPanel.style.transform = `translateY(calc(100% - 40px))`;
              minimizeBtn.querySelector('i').classList.replace('fa-chevron-down', 'fa-chevron-up');
          }
      });
  }

  const existingResizeHandler = window.onresize || function(){};
  window.addEventListener('resize', debounce(() => {
    existingResizeHandler();
    if (!isMobile()) {
        legendPanel.style.transform = '';
        legendPanel.style.transition = '';
        legendPanel.classList.remove('layout-horizontal');
    } else {
        if (currentState === snapStates.HALF) {
            legendPanel.style.transform = `translateY(65%)`;
            updateLayoutMode(legendPanel.offsetHeight * 0.65);
        } else if (currentState === snapStates.FULL) {
            legendPanel.style.transform = `translateY(193px)`;
            updateLayoutMode(193);
        } else {
            legendPanel.style.transform = `translateY(calc(100% - 40px))`;
            updateLayoutMode(legendPanel.offsetHeight - 40);
        }
    }
  }, 200));

  // --- Developer Settings HUD Logic ---
  const updateDevOverlay = () => {
    const orbit = modelViewer.getCameraOrbit();
    const target = modelViewer.getCameraTarget();
    const fov = modelViewer.getFieldOfView();

    const thetaDeg = (orbit.theta * 180 / Math.PI).toFixed(2);
    const phiDeg = (orbit.phi * 180 / Math.PI).toFixed(2);
    const radius = orbit.radius.toFixed(2);

    const orbitStr = `${thetaDeg}deg ${phiDeg}deg ${radius}m`;
    const targetStr = `${target.x.toFixed(2)}m ${target.y.toFixed(2)}m ${target.z.toFixed(2)}m`;
    const fovStr = `${fov.toFixed(2)}deg`;
    
    const zoomSens = modelViewer.getAttribute('zoom-sensitivity') || "Default";
    const orbitSens = modelViewer.getAttribute('orbit-sensitivity') || "Default";
    let sizeStr = "Evaluating...";
    const size = modelViewer.getDimensions();
    if (size && size.x) {
        sizeStr = `${size.x.toFixed(2)}m x ${size.y.toFixed(2)}m x ${size.z.toFixed(2)}m`;
    }

    const devOrbit = document.getElementById('dev-orbit');
    const devTarget = document.getElementById('dev-target');
    const devFov = document.getElementById('dev-fov');
    const devZoom = document.getElementById('dev-zoom');
    const devOrbitSens = document.getElementById('dev-orbit-sens');
    const devSize = document.getElementById('dev-size');
    
    if(devOrbit && devTarget && devFov) {
        devOrbit.innerText = orbitStr;
        devTarget.innerText = targetStr;
        devFov.innerText = fovStr;
    }
    if (devZoom) devZoom.innerText = zoomSens;
    if (devOrbitSens) devOrbitSens.innerText = orbitSens;
    if (devSize) devSize.innerText = sizeStr;
  };

  modelViewer.addEventListener('camera-change', updateDevOverlay);
  modelViewer.addEventListener('load', updateDevOverlay);



  const copyBtn = document.getElementById('dev-copy-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const orbitStr = document.getElementById('dev-orbit').innerText;
      const targetStr = document.getElementById('dev-target').innerText;
      const fovStr = document.getElementById('dev-fov').innerText;

      const copyString = `camera-orbit="${orbitStr}"\ncamera-target="${targetStr}"\nfield-of-view="${fovStr}"`;
      
      navigator.clipboard.writeText(copyString).then(() => {
        const orig = copyBtn.innerText;
        copyBtn.innerText = "Copied!";
        setTimeout(() => copyBtn.innerText = orig, 1500);
      });
    });
  }

});
