document.addEventListener('DOMContentLoaded', () => {
  const modelViewer = document.querySelector('model-viewer');
  const hotspots = document.querySelectorAll('.Hotspot');
  let selectedHotspot = null;

  // ─────────────────────────────────────────
  // WAYPOINT ROUTE SYSTEM
  // ─────────────────────────────────────────
  const WAYPOINTS = [
    { id: 24, label: '1:Lobby', key: '1', px: 228, py: 425, nx: -1.5, nz: 34.9 },
    { id: 25, label: '2:Weight room', key: '2', px: 346, py: 278, nx: 23.5, nz: 5.5 },
    { id: 26, label: '3:Swimming Pool', key: '3', px: 69, py: 264, nx: -35.3, nz: 2.7 },
    { id: 27, label: '4:Stretching', key: '4', px: 386, py: 427, nx: 32, nz: 35.3 },
    { id: 28, label: '5:Spinning', key: '5', px: 433, py: 428, nx: 42, nz: 35.5 },
    { id: 29, label: '6:Boxing', key: '6', px: 339, py: 427, nx: 22, nz: 35.3 },
    { id: 30, label: '7:Golf', key: '7', px: 292, py: 424, nx: 12.1, nz: 34.7 },
    { id: 31, label: '8:Squash', key: '8', px: 120, py: 104, nx: -24.5, nz: -29.3 },
    { id: 32, label: '10:M.Changing', key: '10', px: 195, py: 209, nx: -8.5, nz: -8.3 },
    { id: 33, label: '11:W.Changing', key: '11', px: 198, py: 310, nx: -7.9, nz: 11.9 },
    { id: 34, label: '12:W.Locker', key: '12', px: 160, py: 446, nx: -16, nz: 39.1 },
    { id: 35, label: '13:M.Locker', key: '13', px: 160, py: 413, nx: -16, nz: 32.5 },
    { id: 36, label: '14:Stairs-14', key: '14', px: 216, py: 366, nx: -4.1, nz: 23.1 },
    { id: 37, label: '15:Stairs-15', key: '15', px: 438, py: 335, nx: 43.1, nz: 16.9 },
    { id: 38, label: '16:Stairs-16', key: '16', px: 61, py: 24, nx: -37, nz: -45.3 },
    { id: 39, label: 'c39', key: 'c39', px: 18, py: 50, nx: -46.1, nz: -40.1 },
    { id: 40, label: 'c40', key: 'c40', px: 52, py: 48, nx: -38.9, nz: -40.5 },
    { id: 41, label: 'c41', key: 'c41', px: 81, py: 46, nx: -32.7, nz: -40.9 },
    { id: 42, label: 'c42', key: 'c42', px: 113, py: 50, nx: -25.9, nz: -40.1 },
    { id: 43, label: 'c43', key: 'c43', px: 143, py: 48, nx: -19.6, nz: -40.5 },
    { id: 44, label: 'c44', key: 'c44', px: 175, py: 48, nx: -12.8, nz: -40.5 },
    { id: 45, label: 'c45', key: 'c45', px: 208, py: 45, nx: -5.8, nz: -41.1 },
    { id: 46, label: 'c46', key: 'c46', px: 227, py: 46, nx: -1.7, nz: -40.9 },
    { id: 47, label: 'c47', key: 'c47', px: 236, py: 60, nx: 0.2, nz: -38.1 },
    { id: 48, label: 'c48', key: 'c48', px: 234, py: 80, nx: -0.2, nz: -34.1 },
    { id: 49, label: 'c49', key: 'c49', px: 231, py: 103, nx: -0.9, nz: -29.5 },
    { id: 50, label: 'c50', key: 'c50', px: 229, py: 124, nx: -1.3, nz: -25.3 },
    { id: 51, label: 'c51', key: 'c51', px: 250, py: 126, nx: 3.1, nz: -24.9 },
    { id: 52, label: 'c52', key: 'c52', px: 269, py: 126, nx: 7.2, nz: -24.9 },
    { id: 53, label: 'c53', key: 'c53', px: 267, py: 153, nx: 6.8, nz: -19.5 },
    { id: 54, label: 'c54', key: 'c54', px: 266, py: 175, nx: 6.5, nz: -15.1 },
    { id: 55, label: 'c55', key: 'c55', px: 268, py: 200, nx: 7, nz: -10.1 },
    { id: 56, label: 'c56', key: 'c56', px: 266, py: 225, nx: 6.5, nz: -5.1 },
    { id: 57, label: 'c57', key: 'c57', px: 266, py: 251, nx: 6.5, nz: 0.1 },
    { id: 58, label: 'c58', key: 'c58', px: 266, py: 274, nx: 6.5, nz: 4.7 },
    { id: 59, label: 'c59', key: 'c59', px: 267, py: 300, nx: 6.8, nz: 9.9 },
    { id: 60, label: 'c60', key: 'c60', px: 266, py: 326, nx: 6.5, nz: 15.1 },
    { id: 61, label: 'c61', key: 'c61', px: 267, py: 340, nx: 6.8, nz: 17.9 },
    { id: 62, label: 'c62', key: 'c62', px: 266, py: 359, nx: 6.5, nz: 21.7 },
    { id: 63, label: 'c63', key: 'c63', px: 265, py: 387, nx: 6.3, nz: 27.3 },
    { id: 64, label: 'c64', key: 'c64', px: 278, py: 367, nx: 9.1, nz: 23.3 },
    { id: 65, label: 'c65', key: 'c65', px: 304, py: 368, nx: 14.6, nz: 23.5 },
    { id: 66, label: 'c66', key: 'c66', px: 334, py: 368, nx: 21, nz: 23.5 },
    { id: 67, label: 'c67', key: 'c67', px: 356, py: 368, nx: 25.7, nz: 23.5 },
    { id: 68, label: 'c68', key: 'c68', px: 383, py: 365, nx: 31.4, nz: 22.9 },
    { id: 69, label: 'c69', key: 'c69', px: 403, py: 365, nx: 35.6, nz: 22.9 },
    { id: 70, label: 'c70', key: 'c70', px: 423, py: 370, nx: 39.9, nz: 23.9 },
    { id: 71, label: 'c71', key: 'c71', px: 446, py: 368, nx: 44.8, nz: 23.5 },
    { id: 72, label: 'c72', key: 'c72', px: 447, py: 345, nx: 45, nz: 18.9 },
    { id: 73, label: 'c73', key: 'c73', px: 265, py: 370, nx: 6.3, nz: 23.9 },
    { id: 74, label: 'c74', key: 'c74', px: 243, py: 360, nx: 1.7, nz: 21.9 },
    { id: 75, label: 'c75', key: 'c75', px: 220, py: 356, nx: -3.2, nz: 21.1 },
    { id: 76, label: 'c76', key: 'c76', px: 251, py: 373, nx: 3.4, nz: 24.5 },
    { id: 77, label: 'c77', key: 'c77', px: 222, py: 380, nx: -2.8, nz: 25.9 },
    { id: 78, label: 'c78', key: 'c78', px: 194, py: 378, nx: -8.7, nz: 25.5 },
    { id: 79, label: 'c79', key: 'c79', px: 174, py: 375, nx: -13, nz: 24.9 },
    { id: 80, label: 'c80', key: 'c80', px: 148, py: 378, nx: -18.5, nz: 25.5 },
    { id: 81, label: 'c81', key: 'c81', px: 128, py: 386, nx: -22.8, nz: 27.1 },
    { id: 82, label: 'c82', key: 'c82', px: 132, py: 359, nx: -21.9, nz: 21.7 },
    { id: 83, label: 'c83', key: 'c83', px: 132, py: 336, nx: -21.9, nz: 17.1 },
    { id: 84, label: 'c84', key: 'c84', px: 266, py: 400, nx: 6.5, nz: 29.9 },
    { id: 85, label: 'c85', key: 'c85', px: 256, py: 414, nx: 4.4, nz: 32.7 }
  ];

  const CONNECTIONS = [[39, 40], [40, 41], [41, 42], [42, 43], [43, 44], [44, 45], [45, 46], [46, 47], [47, 48], [48, 49], [49, 50], [50, 51], [51, 52], [52, 53], [53, 54], [54, 55], [55, 56], [56, 57], [57, 58], [58, 59], [59, 60], [60, 61], [61, 62], [62, 64], [62, 73], [62, 76], [62, 63], [64, 65], [65, 66], [66, 67], [67, 68], [68, 69], [69, 70], [70, 71], [71, 72], [73, 74], [74, 75], [75, 36], [36, 77], [77, 78], [78, 79], [79, 80], [80, 81], [81, 82], [82, 83], [63, 84], [84, 85], [85, 24], [85, 30], [85, 29], [84, 35], [84, 34], [66, 27], [67, 29], [71, 28], [72, 37], [58, 25], [59, 33], [55, 32], [42, 31], [83, 26], [39, 38]];

  // Build adjacency map
  const waypointMap = {};
  WAYPOINTS.forEach(w => waypointMap[w.id] = w);

  const adjacency = {};
  WAYPOINTS.forEach(w => adjacency[w.id] = []);
  CONNECTIONS.forEach(([a, b]) => {
    adjacency[a].push(b);
    adjacency[b].push(a);
  });

  // A* pathfinding using px/py pixel coords as the heuristic
  function astar(startId, endId) {
    const dist = (a, b) => Math.hypot(waypointMap[a].px - waypointMap[b].px, waypointMap[a].py - waypointMap[b].py);
    const open = new Set([startId]);
    const cameFrom = {};
    const gScore = { [startId]: 0 };
    const fScore = { [startId]: dist(startId, endId) };

    while (open.size) {
      let current = [...open].reduce((a, b) => (fScore[a] || Infinity) < (fScore[b] || Infinity) ? a : b);
      if (current === endId) {
        const path = [];
        while (current !== undefined) { path.unshift(current); current = cameFrom[current]; }
        return path;
      }
      open.delete(current);
      for (const neighbor of (adjacency[current] || [])) {
        const tentative = (gScore[current] || 0) + dist(current, neighbor);
        if (tentative < (gScore[neighbor] || Infinity)) {
          cameFrom[neighbor] = current;
          gScore[neighbor] = tentative;
          fScore[neighbor] = tentative + dist(neighbor, endId);
          open.add(neighbor);
        }
      }
    }
    return [];
  }

  // Find the waypoint node closest to a given hotspot key (room number)
  function waypointForRoom(roomKey) {
    return WAYPOINTS.find(w => w.key === roomKey) || null;
  }

  // Draw the route as animated SVG path
  const routeSVG = document.getElementById('route-overlay');

  function drawRoute(pathIds) {
    if (!routeSVG) return;
    routeSVG.innerHTML = '';
    if (!pathIds || pathIds.length < 2) return;

    const REF_W = 472, REF_H = 500;
    const scaleX = window.innerWidth / REF_W;
    const scaleY = window.innerHeight / REF_H;

    const points = pathIds.map(id => {
      const w = waypointMap[id];
      return { x: w.px * scaleX, y: w.py * scaleY };
    });

    const d = points.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(' ');

    // Shadow line
    const shadow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    shadow.setAttribute('d', d);
    shadow.setAttribute('stroke', 'rgba(0,0,0,0.25)');
    shadow.setAttribute('stroke-width', '6');
    shadow.setAttribute('fill', 'none');
    shadow.setAttribute('stroke-linecap', 'round');
    shadow.setAttribute('stroke-linejoin', 'round');
    routeSVG.appendChild(shadow);

    // Main route line — append FIRST before measuring
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    path.setAttribute('stroke', '#E31837');
    path.setAttribute('stroke-width', '4');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    routeSVG.appendChild(path);

    // Start dot
    const startDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    startDot.setAttribute('cx', points[0].x);
    startDot.setAttribute('cy', points[0].y);
    startDot.setAttribute('r', '7');
    startDot.setAttribute('fill', '#1D9E75');
    startDot.setAttribute('stroke', 'white');
    startDot.setAttribute('stroke-width', '2');
    routeSVG.appendChild(startDot);

    // End dot
    const endDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    endDot.setAttribute('cx', points[points.length - 1].x);
    endDot.setAttribute('cy', points[points.length - 1].y);
    endDot.setAttribute('r', '7');
    endDot.setAttribute('fill', '#E31837');
    endDot.setAttribute('stroke', 'white');
    endDot.setAttribute('stroke-width', '2');
    routeSVG.appendChild(endDot);

    // FIX: measure length AFTER element is in DOM, guard against 0
    // Use setTimeout to guarantee browser has completed layout pass
    setTimeout(() => {
      const totalLength = path.getTotalLength();
      if (!totalLength || totalLength < 1) return; // guard — never set dasharray to 0
      path.setAttribute('stroke-dasharray', totalLength);
      path.setAttribute('stroke-dashoffset', totalLength);
      // Set transition AFTER setting initial dashoffset so it doesn't animate from 0
      requestAnimationFrame(() => {
        path.style.transition = 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)';
        path.setAttribute('stroke-dashoffset', '0');
      });
    }, 50); // 50ms gives browser time to complete the layout pass
  }

  function clearRoute() {
    if (routeSVG) routeSVG.innerHTML = '';
  }

  // Re-scale route on window resize
  let currentRoutePathIds = [];
  window.addEventListener('resize', () => {
    if (currentRoutePathIds && currentRoutePathIds.length) drawRoute(currentRoutePathIds);
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
  // INFO CARD DICTIONARY AND AUTO-HIDE LOGIC
  // ─────────────────────────────────────────
  const ROOM_DETAILS = {
    'Boxing room': "Our Boxing studio is equipped with four heavy bags, one speed bag and battle ropes. Gloves may be borrowed at Reception but for hygienic reasons, it is advised that you either bring your own gloves or purchase gloves/hand wraps at Reception. The space is accessible during Club hours.",
    'Golf Court': "The indoor golf driving range is available for use by members during regular club hours. There are two practice tees which are divided by a mesh curtain. Clubs and balls are provided if required.",
    'Spinning room': "The Glendon Athletic Club offers Group Cycling classes. All GAC members can attend our Group Cycle classes at no additional charge.",
    'Stretching room': "The Stretching Room is a self-contained area equipped with mats, stability balls, medicine balls and a Precor stretch machine. It also features music specially programmed for this area. As a consideration to others, members are asked to refrain from bringing equipment from the Weight Room into the Stretching Room. Clean athletic footwear with non-marking soles must be worn in the Group Exercise Room.",
    'Swimming Pool': "The pool is 25 yards long and six lanes wide and features floor-to-ceiling windows. Our Pool offers different sessions: Lengths Swim, Senior Swim, Rec Swim, Aquafitness, etc.",
    'Squash court': "All GAC members have access to four international squash courts and three outdoor tennis courts. Courts may be reserved at www.glendonac.ca up to three days in advance.",
    'Weight room': "The Weight Room features a large selection of free weights, selectorized machines and cardio equipment."
  };

  let infoTimeout = null;
  let infoInteracted = false;

  const showInfoCard = (labelStr) => {
    const titleEl = document.getElementById('info-title');
    const descEl = document.getElementById('info-desc');
    const container = document.getElementById('info-dropdown-content');

    if (titleEl && descEl && container) {
      titleEl.textContent = labelStr;
      descEl.innerHTML = ROOM_DETAILS[labelStr] || "Click the Learn More button to view full club scheduling and availability details.";

      container.classList.add('force-show');
      infoInteracted = false;

      if (infoTimeout) clearTimeout(infoTimeout);
      infoTimeout = setTimeout(() => {
        if (!infoInteracted) {
          container.classList.remove('force-show');
        }
      }, 5000); // Highlight lasts for 5 seconds
    }
  };

  const setupInfoInteractions = () => {
    const container = document.getElementById('info-dropdown-content');
    const closeBtn = document.getElementById('info-close-btn');

    if (container) {
      container.addEventListener('pointerdown', () => {
        infoInteracted = true;
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (container) container.classList.remove('force-show');
        if (document.activeElement) document.activeElement.blur();
      });
    }
  };
  setupInfoInteractions();

  // ─────────────────────────────────────────
  // HOTSPOT LOGIC
  // ─────────────────────────────────────────
  const selectHotspot = (h) => {
    // Disabled hotspot click for now
    return;
    /*
    if (selectedHotspot === h) return;
    selectedHotspot = h;

    hotspots.forEach(other => {
      other.classList.remove('selected');
      other.style.removeProperty('--ping-color');

      const hasYouAreHere = other.querySelector('.you-are-here') !== null;
      if (other !== h && !hasYouAreHere) {
        other.classList.add('faded-out');
      } else {
        other.classList.remove('faded-out');
      }
    });
    h.classList.add('selected');

    // Dynamically clone the marker color for the outer wrapper ping effect
    const colorNode = h.querySelector('.hotspot-number');
    if (colorNode) {
      const bg = window.getComputedStyle(colorNode).backgroundColor;
      h.style.setProperty('--ping-color', bg);
    }

    // Rely on existing native alignment logic flawlessly
    annotationClicked(h);

    // Auto-orbit around selected hotspot
    modelViewer.autoRotate = true;
    modelViewer.setAttribute('rotation-per-second', '10deg');
    modelViewer.autoRotateDelay = 200;

    // Update Info Dropdown securely via the new logical card handler
    const labelText = h.querySelector('.hotspot-label')?.textContent?.trim() || 'Room Details';
    showInfoCard(labelText);
    */
  };

  // Expose to window for inline HTML legend to trigger
  window.triggerHotspot = (selector) => {
    const h = document.querySelector(selector);
    if (h) {
      if (typeof navigator.vibrate === 'function') navigator.vibrate(40);
      selectHotspot(h);
    }
  };

  const deselectAll = () => {
    selectedHotspot = null;
    hotspots.forEach(h => {
      h.classList.remove('selected', 'faded-out');
    });
    modelViewer.autoRotate = false;
    clearRoute();
    currentRoutePathIds = [];

    // Reset Info Dropdown seamlessly
    const titleEl = document.getElementById('info-title');
    const descEl = document.getElementById('info-desc');
    const container = document.getElementById('info-dropdown-content');

    if (titleEl && descEl && container) {
      container.classList.remove('force-show');
      titleEl.textContent = "Glendon Athletic Club";
      descEl.innerHTML = `
        <strong>Hours:</strong><br>
        Mon-Thu: 7 AM - 10:30 PM<br>
        Fri: 7 AM - 9 PM<br>
        Sat-Sun: 8 AM - 8 PM
      `;
    }
  };

  // ─────────────────────────────────────────
  // HOTSPOT CLICK/TAP
  // ─────────────────────────────────────────
  // Desable entirely
  /*
  hotspots.forEach(h => {
    h.addEventListener('pointerup', (e) => {
      e.stopPropagation();
      if (typeof navigator.vibrate === 'function') navigator.vibrate(40);
      selectHotspot(h);
    });
  });
  */

  // --- End of Info Dropdown Logic ---

  // Background Click Deselect
  mv.addEventListener('click', (e) => {
    // deselect all interactions
    if (e.target === mv) {
      deselectAll();
      mv.cameraOrbit = "360deg 45deg 100m";
      mv.cameraTarget = "0m -1.3m 8.5m";
    }
  });

  // --- Legend & Search Mutual Exclusion Controller ---
  const legendBtn = document.getElementById('mobile-legend-btn');
  const legendMenu = document.getElementById('mobile-legend-menu');
  const expandableSearch = document.querySelector('.expandable-search');
  const searchPillNode = document.querySelector('.search-pill-input');
  const infoDropdownTrigger = document.getElementById('info-dropdown-trigger');
  const container = document.getElementById('info-dropdown-content'); // Re-declare or ensure scope

  // Close legend and natively toggle info card on explicit click
  if (infoDropdownTrigger) {
    infoDropdownTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      if (legendMenu) legendMenu.classList.remove('show');
      if (container) {
        if (container.classList.contains('force-show')) {
          container.classList.remove('force-show');
          if (document.activeElement) document.activeElement.blur();
        } else {
          const titleEl = document.getElementById('info-title');
          const descEl = document.getElementById('info-desc');
          if (titleEl && descEl) {
            titleEl.textContent = "Glendon Athletic Club";
            descEl.innerHTML = `<strong>Hours:</strong><br>Mon-Thu: 7 AM - 10:30 PM<br>Fri: 7 AM - 9 PM<br>Sat-Sun: 8 AM - 8 PM`;
          }
          container.classList.add('force-show');
        }
      }
    });
  }

  // 1. Legend Toggle Logic
  if (legendBtn && legendMenu) {
    legendBtn.addEventListener('click', () => {
      const isShowing = legendMenu.classList.toggle('show');
      // If opening the Legend, forcefully close the Search Bar
      if (isShowing && searchPillNode) {
        searchPillNode.blur();
        searchPillNode.value = ''; // clear out search so map perfectly resets
        searchPillNode.dispatchEvent(new Event('input')); // trigger reset naturally natively
      }
    });
  }

  // 2. Search Logic & Legend Exclusion
  if (searchPillNode) {
    if (expandableSearch) {
      expandableSearch.addEventListener('click', () => searchPillNode.focus());
    }

    searchPillNode.addEventListener('focus', () => {
      // If opening the Search Bar, violently close the Legend
      if (legendMenu) legendMenu.classList.remove('show');
    });

    searchPillNode.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      hotspots.forEach(h => {
        const labelText = h.querySelector('.hotspot-label');
        if (!labelText) return;
        if (query === '' || labelText.textContent.toLowerCase().includes(query)) {
          h.classList.remove('faded-out');
        } else {
          h.classList.add('faded-out');
        }
      });
    });
  }

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

    // Hotspots restored natively



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

  const applyCameraLock = () => {
    if (window.innerWidth <= 768) {
      modelViewer.setAttribute('camera-controls', ''); 
      modelViewer.setAttribute('disable-pan', ''); // Disable multi-touch panning securely
      
      // Tune speed and smoothness: raise sensitivity for faster zooming, lower decay for quicker response
      modelViewer.setAttribute('zoom-sensitivity', '1.2'); // Dialed down zoom speed significantly
      modelViewer.setAttribute('interpolation-decay', '100'); // Smoother glide

      // Allow slight wiggle on Phi/Theta so pinch zoom doesn't break, but visually locks rotation
      modelViewer.setAttribute('min-camera-orbit', '359.5deg 44.5deg 40m'); // Prevents zooming in too close
      modelViewer.setAttribute('max-camera-orbit', '360.5deg 45.5deg 180m'); 

      // Give hotspots a disabled class
      hotspots.forEach(h => h.classList.add('mobile-hotspot-disabled'));
    } else {
      modelViewer.setAttribute('camera-controls', '');
      modelViewer.removeAttribute('disable-pan');
      modelViewer.removeAttribute('zoom-sensitivity');
      modelViewer.setAttribute('interpolation-decay', '200'); // default
      modelViewer.setAttribute('min-camera-orbit', 'auto 0deg 20m');
      modelViewer.setAttribute('max-camera-orbit', 'auto 90deg 150m');
      
      hotspots.forEach(h => h.classList.remove('mobile-hotspot-disabled'));
    }
  };

  // Run on first load
  applyCameraLock();

  window.addEventListener('resize', debounce(() => {
    applyCameraLock();
  }, 200));



  // the easiest method to handle the fading natively on model viewer is looking at the 'data-visible'
  // model viewer sets 'data-visible' to true or false.

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'data-visible') {
        const h = mutation.target;
        // modelViewer natively sets data-visible=false when strongly pointing away
        // However, instead of hiding entirely we modify its style according to requirements
        if (h.dataset.visible === 'false' || h.dataset.visible === false || !h.hasAttribute('data-visible')) {
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

    if (devOrbit && devTarget && devFov) {
      devOrbit.innerText = orbitStr;
      devTarget.innerText = targetStr;
      devFov.innerText = fovStr;
    }
    if (devZoom) devZoom.innerText = zoomSens;
    if (devOrbitSens) devOrbitSens.innerText = orbitSens;
    if (devSize) devSize.innerText = sizeStr;
  };

  modelViewer.addEventListener('camera-change', (e) => {
    updateDevOverlay();

    // Pan Restrictions (Clamps X and Z to keep model in view)
    const target = modelViewer.getCameraTarget();
    let clamped = false;
    const BOUND_X = 45;
    const BOUND_Z = 65;

    let nx = target.x;
    let nz = target.z;

    if (nx > BOUND_X) { nx = BOUND_X; clamped = true; }
    if (nx < -BOUND_X) { nx = -BOUND_X; clamped = true; }
    
    if (window.innerWidth <= 768) {
      // Complete vertical lock on mobile (Z-axis). 8.5m is the starting depth.
      if (Math.abs(nz - 8.5) > 0.01) {
        nz = 8.5;
        clamped = true;
      }
    } else {
      if (nz > BOUND_Z) { nz = BOUND_Z; clamped = true; }
      if (nz < -BOUND_Z) { nz = -BOUND_Z; clamped = true; }
    }

    if (clamped && e.detail.source === 'user-interaction') {
      modelViewer.cameraTarget = `${nx}m ${target.y}m ${nz}m`;
    }
  });

  // --- Custom Mobile Horizontal Scroll (1-Finger) ---
  let isCustomScrolling = false;
  let scrollStartX = 0;
  let startCameraX = 0;

  mv.addEventListener('touchstart', (e) => {
    if (window.innerWidth > 768 || e.touches.length !== 1) {
      isCustomScrolling = false;
      return;
    }
    isCustomScrolling = true;
    scrollStartX = e.touches[0].clientX;
    startCameraX = mv.getCameraTarget().x;
  }, { passive: true });

  mv.addEventListener('touchmove', (e) => {
    if (!isCustomScrolling || window.innerWidth > 768 || e.touches.length !== 1) return;
    
    const deltaX = e.touches[0].clientX - scrollStartX;
    
    // Scale horizontal move speed based on zoom so it always feels 1:1 mapped to finger
    const radiusStr = mv.getCameraOrbit().radius; 
    let radius = 100;
    if (radiusStr) {
      radius = parseFloat(radiusStr);
    }
    const panSpeed = 0.0016 * radius; // Sweet spot for scroll speed

    let newX = startCameraX - (deltaX * panSpeed);

    // Hard bounds on the building horizontally
    if (newX > 45) newX = 45;
    if (newX < -45) newX = -45;

    // Lock Y (-1.3) and Z (8.5) explicitly so there's absolutely 0 vertical drifting
    mv.cameraTarget = `${newX}m -1.3m 8.5m`;
  }, { passive: true });

  mv.addEventListener('touchend', () => {
    isCustomScrolling = false;
  });
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

  // --- Mobile Search Keyboard Auto-Recenter ---
  const mobileSearchInputRef = document.querySelector('.search-pill-input');
  if (mobileSearchInputRef) {
    mobileSearchInputRef.addEventListener('focus', () => {
      // Glides camera to starter view with zoomed out perspective by 65% to accommodate keyboard 
      modelViewer.cameraOrbit = "360deg 45deg 165m";
      modelViewer.cameraTarget = "0m -1.3m 8.5m";
      modelViewer.fieldOfView = "70deg";
    });
    
    mobileSearchInputRef.addEventListener('blur', () => {
      // "When out of the search bar the camera goes back to starting position"
      modelViewer.cameraOrbit = "360deg 45deg 100m";
      modelViewer.cameraTarget = "0m -1.3m 8.5m";
      modelViewer.fieldOfView = "70deg";
    });
  }

  // --- Mobile Reset View Button ---
  const mobileResetBtn = document.getElementById('mobile-reset-btn');
  if (mobileResetBtn) {
    mobileResetBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      // Reset to exact starter view
      modelViewer.cameraOrbit = "360deg 45deg 100m";
      modelViewer.cameraTarget = "0m -1.3m 8.5m";
      modelViewer.fieldOfView = "70deg";
    });
  }
  // --- Custom Gesture Tutorial Overlay ---
  modelViewer.addEventListener('load', () => {
    // Show the tutorial prompt securely 1.2s after load completes natively
    setTimeout(() => {
      const prompt = document.getElementById('gesture-prompt-overlay');
      if (prompt) {
        prompt.classList.add('show-prompt');
      }
    }, 1200);
  });

  const hideGesturePrompt = () => {
    const prompt = document.getElementById('gesture-prompt-overlay');
    if (prompt && prompt.classList.contains('show-prompt')) {
      prompt.classList.remove('show-prompt');
      setTimeout(() => {
        if (prompt) prompt.style.display = 'none';
        // Show legend prompt after gesture prompt is hidden
        showLegendPrompt();
      }, 600);
    }
  };

  // --- Legend Prompt Overlay ---
  let legendPromptDismissed = false;
  const legendPromptEl = document.getElementById('legend-prompt-overlay');

  const showLegendPrompt = () => {
    // Only show if not already dismissed
    if (legendPromptDismissed) return;

    if (legendPromptEl) {
      legendPromptEl.classList.add('show-prompt');
    }
    if (legendBtn) {
      legendBtn.classList.add('pulsating');
    }

    // Auto-dismiss after 5 seconds if not interacted with
    setTimeout(() => {
      if (!legendPromptDismissed) {
        hideLegendPrompt();
      }
    }, 5000);
  };

  const hideLegendPrompt = () => {
    legendPromptDismissed = true;

    if (legendPromptEl && legendPromptEl.classList.contains('show-prompt')) {
      legendPromptEl.classList.remove('show-prompt');
      setTimeout(() => {
        if (legendPromptEl) legendPromptEl.style.display = 'none';
      }, 500);
    }
    if (legendBtn) {
      legendBtn.classList.remove('pulsating');
    }
  };

  // Dismiss legend prompt on legend button click
  if (legendBtn) {
    legendBtn.addEventListener('click', () => {
      hideLegendPrompt();
    });
  }

  modelViewer.addEventListener('pointerdown', hideGesturePrompt);
  modelViewer.addEventListener('wheel', hideGesturePrompt);
  modelViewer.addEventListener('camera-change', (e) => {
    if (e.detail.source === 'user-interaction') {
      hideGesturePrompt();
    }
  });

});
