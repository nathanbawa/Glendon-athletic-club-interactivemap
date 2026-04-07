document.addEventListener('DOMContentLoaded', () => {
  const modelViewer = document.querySelector('model-viewer');
  const hotspots = document.querySelectorAll('.Hotspot');
  let selectedHotspot = null;

  // ─────────────────────────────────────────
  // STARTING CAMERA STATE
  // Captured once on load — used by recenter, outside-click, deselect
  // ─────────────────────────────────────────
  const START_ORBIT  = "360deg 45deg 100m";
  const START_TARGET = "0m -1.3m 8.5m";
  const START_FOV    = "70deg";

  function resetCamera() {
    modelViewer.cameraOrbit  = START_ORBIT;
    modelViewer.cameraTarget = START_TARGET;
    modelViewer.fieldOfView  = START_FOV;
  }

  // ─────────────────────────────────────────
  // WAYPOINT ROUTE SYSTEM
  // ─────────────────────────────────────────
  const WAYPOINTS = [
    { id:24, label:'Lobby', key:'1', px:313, py:538, nx:-0.55, nz:16.54 },
    { id:25, label:'Swimming Pool', key:'3', px:111, py:323, nx:-22.76, nz:-5.47 },
    { id:26, label:'Weight Room', key:'2', px:504, py:323, nx:16.18, nz:-3.7 },
    { id:27, label:'Stretching Room', key:'4', px:507, py:518, nx:20.85, nz:16.97 },
    { id:28, label:'Spinning Room', key:'5', px:577, py:525, nx:27.99, nz:16.7 },
    { id:29, label:'Boxing Room', key:'6', px:458, py:524, nx:14.43, nz:16.71 },
    { id:30, label:'Golf Court', key:'7', px:390, py:525, nx:8.44, nz:16.72 },
    { id:31, label:'Squash Court', key:'8', px:197, py:117, nx:-17.5, nz:-28.07 },
    { id:32, label:'M.Changing Room', key:'10', px:275, py:260, nx:-9.94, nz:14.84 },
    { id:33, label:'W.Changing Room', key:'11', px:270, py:376, nx:-10, nz:19.78 },
    { id:34, label:'W.Locker Room', key:'12', px:214, py:504, nx:-5.08, nz:0.56 },
    { id:35, label:'M.Locker Room', key:'13', px:213, py:524, nx:-5.57, nz:-13.43 },
    { id:36, label:'Stairs 14', key:'14', px:315, py:456, nx:-2.01, nz:8.5 },
    { id:37, label:'Stairs 15', key:'15', px:583, py:414, nx:27.95, nz:3.72 },
    { id:38, label:'Stairs 16', key:'16', px:100, py:25, nx:-23.99, nz:-38.73 },
    { id:39, label:'c39', key:'c39', px:356, py:177, nx:0, nz:0 },
    { id:40, label:'c40', key:'c40', px:345, py:279, nx:0, nz:0 },
    { id:41, label:'c41', key:'c41', px:357, py:279, nx:0, nz:0 },
    { id:42, label:'c42', key:'c42', px:357, py:368, nx:0, nz:0 },
    { id:43, label:'c43', key:'c43', px:346, py:367, nx:0, nz:0 },
    { id:44, label:'c44', key:'c44', px:357, py:448, nx:0, nz:0 },
    { id:45, label:'c45', key:'c45', px:366, py:448, nx:0, nz:0 },
    { id:46, label:'c46', key:'c46', px:367, py:469, nx:0, nz:0 },
    { id:47, label:'c47', key:'c47', px:359, py:491, nx:0, nz:0 },
    { id:48, label:'c48', key:'c48', px:316, py:492, nx:0, nz:0 },
    { id:49, label:'c49', key:'c49', px:357, py:478, nx:0, nz:0 },
    { id:50, label:'c50', key:'c50', px:315, py:477, nx:0, nz:0 },
    { id:51, label:'c51', key:'c51', px:199, py:478, nx:0, nz:0 },
    { id:52, label:'c52', key:'c52', px:172, py:492, nx:0, nz:0 },
    { id:53, label:'c53', key:'c53', px:171, py:478, nx:0, nz:0 },
    { id:54, label:'c54', key:'c54', px:172, py:508, nx:0, nz:0 },
    { id:55, label:'c55', key:'c55', px:175, py:526, nx:0, nz:0 },
    { id:56, label:'c56', key:'c56', px:401, py:477, nx:0, nz:0 },
    { id:57, label:'c57', key:'c57', px:465, py:477, nx:0, nz:0 },
    { id:58, label:'c58', key:'c58', px:516, py:476, nx:0, nz:0 },
    { id:59, label:'c59', key:'c59', px:558, py:478, nx:0, nz:0 },
    { id:60, label:'c60', key:'c60', px:402, py:463, nx:0, nz:0 },
    { id:61, label:'c61', key:'c61', px:462, py:461, nx:0, nz:0 },
    { id:62, label:'c62', key:'c62', px:515, py:462, nx:0, nz:0 },
    { id:63, label:'c63', key:'c63', px:557, py:463, nx:0, nz:0 },
    { id:64, label:'c64', key:'c64', px:572, py:465, nx:0, nz:0 },
    { id:65, label:'c65', key:'c65', px:584, py:465, nx:0, nz:0 },
    { id:66, label:'c66', key:'c66', px:506, py:443, nx:0, nz:0 },
    { id:67, label:'c67', key:'c67', px:503, py:383, nx:0, nz:0 },
    { id:68, label:'c68', key:'c68', px:438, py:445, nx:0, nz:0 },
    { id:69, label:'c69', key:'c69', px:361, py:122, nx:0, nz:0 },
    { id:70, label:'c70', key:'c70', px:356, py:150, nx:0, nz:0 },
    { id:71, label:'c71', key:'c71', px:354, py:133, nx:0, nz:0 },
    { id:72, label:'c72', key:'c72', px:320, py:132, nx:0, nz:0 },
    { id:73, label:'c73', key:'c73', px:310, py:135, nx:0, nz:0 },
    { id:74, label:'c74', key:'c74', px:308, py:91, nx:0, nz:0 },
    { id:75, label:'c75', key:'c75', px:322, py:91, nx:0, nz:0 },
    { id:76, label:'c76', key:'c76', px:306, py:57, nx:0, nz:0 },
    { id:77, label:'c77', key:'c77', px:288, py:57, nx:0, nz:0 },
    { id:78, label:'c78', key:'c78', px:230, py:56, nx:0, nz:0 },
    { id:79, label:'c79', key:'c79', px:197, py:56, nx:0, nz:0 },
    { id:80, label:'c80', key:'c80', px:358, py:518, nx:0, nz:0 },
    { id:81, label:'c81', key:'c81', px:356, py:536, nx:0, nz:0 },
    { id:82, label:'c82', key:'c82', px:313, py:507, nx:0, nz:0 },
    { id:83, label:'c83', key:'c83', px:304, py:280, nx:0, nz:0 },
    { id:84, label:'c84', key:'c84', px:279, py:283, nx:0, nz:0 },
    { id:85, label:'c85', key:'c85', px:128, py:382, nx:0, nz:0 }
  ];

  const CONNECTIONS = [
    [41,42],[44,45],[42,44],[45,68],[68,66],[66,67],[44,49],[49,46],[46,60],[60,61],[61,62],[62,63],[63,64],[64,65],[49,50],[50,48],[48,82],[49,47],[47,80],[80,81],[50,51],[51,53],[53,52],[52,54],[54,55],[41,40],[41,39],[39,70],[70,71],[71,69],[71,72],[72,73],[73,74],[74,75],[74,76],[76,77],[77,78],[78,79],[79,31],[40,83],[83,84],[84,32],[42,43],[43,33],[60,56],[56,30],[61,57],[57,29],[62,58],[58,27],[63,59],[59,28],[65,37],[50,36],[53,85],[85,25],[55,35],[54,34]
  ];

  const waypointMap = {};
  WAYPOINTS.forEach(w => waypointMap[w.id] = w);

  const adjacency = {};
  WAYPOINTS.forEach(w => adjacency[w.id] = []);
  CONNECTIONS.forEach(([a, b]) => {
    adjacency[a].push(b);
    adjacency[b].push(a);
  });

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

  function waypointForRoom(roomKey) {
    return WAYPOINTS.find(w => w.key === roomKey) || null;
  }

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
    const shadow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    shadow.setAttribute('d', d);
    shadow.setAttribute('stroke', 'rgba(0,0,0,0.25)');
    shadow.setAttribute('stroke-width', '6');
    shadow.setAttribute('fill', 'none');
    shadow.setAttribute('stroke-linecap', 'round');
    shadow.setAttribute('stroke-linejoin', 'round');
    routeSVG.appendChild(shadow);
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    path.setAttribute('stroke', '#E31837');
    path.setAttribute('stroke-width', '4');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    routeSVG.appendChild(path);
    const startDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    startDot.setAttribute('cx', points[0].x);
    startDot.setAttribute('cy', points[0].y);
    startDot.setAttribute('r', '7');
    startDot.setAttribute('fill', '#1D9E75');
    startDot.setAttribute('stroke', 'white');
    startDot.setAttribute('stroke-width', '2');
    routeSVG.appendChild(startDot);
    const endDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    endDot.setAttribute('cx', points[points.length - 1].x);
    endDot.setAttribute('cy', points[points.length - 1].y);
    endDot.setAttribute('r', '7');
    endDot.setAttribute('fill', '#E31837');
    endDot.setAttribute('stroke', 'white');
    endDot.setAttribute('stroke-width', '2');
    routeSVG.appendChild(endDot);
    setTimeout(() => {
      const totalLength = path.getTotalLength();
      if (!totalLength || totalLength < 1) return;
      path.setAttribute('stroke-dasharray', totalLength);
      path.setAttribute('stroke-dashoffset', totalLength);
      requestAnimationFrame(() => {
        path.style.transition = 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)';
        path.setAttribute('stroke-dashoffset', '0');
      });
    }, 50);
  }

  function clearRoute() {
    if (routeSVG) routeSVG.innerHTML = '';
  }

  let currentRoutePathIds = [];
  window.addEventListener('resize', () => {
    if (currentRoutePathIds && currentRoutePathIds.length) drawRoute(currentRoutePathIds);
  });

  // ─────────────────────────────────────────
  // CAMERA ORBIT MODES
  // Switches between locked (no rotation) and orbit-only (hotspot selected)
  // ─────────────────────────────────────────
  const mv = modelViewer;

  function enterLockedMode() {
    if (window.innerWidth <= 768) {
      mv.setAttribute('disable-pan', '');
      // Theta locked to exactly 360deg — hold-swipe CANNOT tilt the camera
      mv.setAttribute('min-camera-orbit', '359.5deg 44.5deg 40m');
      mv.setAttribute('max-camera-orbit', '360.5deg 45.5deg 180m');
      mv.setAttribute('zoom-sensitivity', '1.2');
      mv.setAttribute('interpolation-decay', '100');
    } else {
      mv.removeAttribute('disable-pan');
      mv.setAttribute('min-camera-orbit', 'auto 0deg 20m');
      mv.setAttribute('max-camera-orbit', 'auto 90deg 150m');
      mv.setAttribute('interpolation-decay', '200');
    }
    mv.autoRotate = false;
  }

  function enterHotspotOrbitMode() {
    // Free theta+phi so the user can orbit around the selected hotspot
    // but limit height strictly
    mv.removeAttribute('disable-pan');
    mv.setAttribute('min-camera-orbit', 'auto 45deg 20m'); // No top down
    mv.setAttribute('max-camera-orbit', 'auto 85deg 150m');
    mv.setAttribute('interpolation-decay', '400'); // Smoother slower transition floats
    mv.autoRotate = false;
  }

  // ─────────────────────────────────────────
  // INFO CARD
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
    const descEl  = document.getElementById('info-desc');
    const container = document.getElementById('info-dropdown-content');
    if (titleEl && descEl && container) {
      titleEl.textContent = labelStr;
      descEl.innerHTML = ROOM_DETAILS[labelStr] || "Click the Learn More button to view full club scheduling and availability details.";
      container.classList.add('force-show');
      infoInteracted = false;
      if (infoTimeout) clearTimeout(infoTimeout);
      infoTimeout = setTimeout(() => {
        if (!infoInteracted) container.classList.remove('force-show');
      }, 5000);
    }
  };

  const setupInfoInteractions = () => {
    const container = document.getElementById('info-dropdown-content');
    const closeBtn  = document.getElementById('info-close-btn');
    if (container) container.addEventListener('pointerdown', () => { infoInteracted = true; });
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
  // HOTSPOT SELECTION
  // ─────────────────────────────────────────
  const selectHotspot = (h) => {
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

    const colorNode = h.querySelector('.hotspot-number');
    if (colorNode) {
      const bg = window.getComputedStyle(colorNode).backgroundColor;
      h.style.setProperty('--ping-color', bg);
    }

    // --- Inject Drag Hint ---
    const marker = h.querySelector('.hotspot-marker');
    if (marker) {
      let hint = marker.querySelector('.hotspot-hint');
      if (!hint) {
        hint = document.createElement('div');
        hint.className = 'hotspot-hint';
        hint.innerHTML = `
          <span class="hint-arrow left">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 2 A5 5 0 0 0 3 2" stroke="white" stroke-width="1.8" stroke-linecap="round" fill="none"/>
              <polyline points="2.2,0.8 3,2.4 4.8,1.8" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            </svg>
          </span>
          <span class="hint-finger">👆</span>
          <span class="hint-arrow right">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 2 A5 5 0 0 1 9 2" stroke="white" stroke-width="1.8" stroke-linecap="round" fill="none"/>
              <polyline points="9.8,0.8 9,2.4 7.2,1.8" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            </svg>
          </span>`;
        marker.appendChild(hint);
      }
      
      hint.classList.remove('hint-hiding');
      
      if (h._hintTimer) clearTimeout(h._hintTimer);
      h._hintTimer = setTimeout(() => {
        hint.classList.add('hint-hiding');
      }, 2500);
    }

    // ── Camera: pan to the hotspot position, keep the starting angle (360deg 45deg),
    //    just bring radius in slightly for a subtle zoom focus.
    const pos = h.dataset.position; // e.g. "14.43m -1.05m 16.70m"
    if (pos) {
      const parts = pos.split(' ');
      if (parts.length === 3) {
        const x = parseFloat(parts[0]);
        const y = parseFloat(parts[1]);
        const z = parseFloat(parts[2]);
        // Smooth out the target snapping jump 
        mv.setAttribute('interpolation-decay', '400');
        
        // Set target to the hotspot — keeps same vertical/horizontal camera angle natively
        mv.cameraTarget = `${x}m ${y}m ${z}m`;
        // Slight zoom in: from 100m → 65m
        if (window.innerWidth <= 768) {
          mv.cameraOrbit = "360deg 45deg 65m";
        } else {
          // Desktop: bring radius in but allow orbit freedom
          const currentOrbit = mv.getCameraOrbit();
          const theta = (currentOrbit.theta * 180 / Math.PI).toFixed(1);
          const phi   = (currentOrbit.phi   * 180 / Math.PI).toFixed(1);
          mv.cameraOrbit = `${theta}deg ${phi}deg 65m`;
        }
      }
    }

    // Allow orbit-only when hotspot is selected
    enterHotspotOrbitMode();

    mv.autoRotate = false;

    const labelText = h.querySelector('.hotspot-label')?.textContent?.trim() || 'Room Details';
    showInfoCard(labelText);
  };

  window.triggerHotspot = (selector) => {
    const h = document.querySelector(selector);
    if (h) {
      if (typeof navigator.vibrate === 'function') navigator.vibrate(40);
      selectHotspot(h);
    }
  };

  // ─────────────────────────────────────────
  // DESELECT — always resets camera to start
  // ─────────────────────────────────────────
  const deselectAll = () => {
    selectedHotspot = null;
    hotspots.forEach(h => h.classList.remove('selected', 'faded-out'));
    mv.autoRotate = false;
    clearRoute();
    currentRoutePathIds = [];

    const titleEl   = document.getElementById('info-title');
    const descEl    = document.getElementById('info-desc');
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

    // Re-lock camera and reset to starting position
    enterLockedMode();
    resetCamera();
  };

  // ─────────────────────────────────────────
  // HOTSPOT CLICK / TAP
  // ─────────────────────────────────────────
  hotspots.forEach(h => {
    h.addEventListener('click', (e) => {
      e.stopPropagation();
      if (typeof navigator.vibrate === 'function') navigator.vibrate(40);
      selectHotspot(h);
    });
  });

  // ─────────────────────────────────────────
  // BACKGROUND CLICK → deselect + recenter
  // ─────────────────────────────────────────
  mv.addEventListener('click', (e) => {
    if (e.target === mv) {
      deselectAll(); // already calls resetCamera() + enterLockedMode()
    }
  });

  // ─────────────────────────────────────────
  // LEGEND & SEARCH CONTROLS
  // ─────────────────────────────────────────
  const legendBtn       = document.getElementById('mobile-legend-btn');
  const legendMenu      = document.getElementById('mobile-legend-menu');
  const expandableSearch = document.querySelector('.expandable-search');
  const searchPillNode  = document.querySelector('.search-pill-input');
  const infoDropdownTrigger = document.getElementById('info-dropdown-trigger');
  const container       = document.getElementById('info-dropdown-content');

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
          const descEl  = document.getElementById('info-desc');
          if (titleEl && descEl) {
            titleEl.textContent = "Glendon Athletic Club";
            descEl.innerHTML = `<strong>Hours:</strong><br>Mon-Thu: 7 AM - 10:30 PM<br>Fri: 7 AM - 9 PM<br>Sat-Sun: 8 AM - 8 PM`;
          }
          container.classList.add('force-show');
        }
      }
    });
  }

  if (legendBtn && legendMenu) {
    legendBtn.addEventListener('click', () => {
      const isShowing = legendMenu.classList.toggle('show');
      if (isShowing && searchPillNode) {
        searchPillNode.blur();
        searchPillNode.value = '';
        searchPillNode.dispatchEvent(new Event('input'));
      }
    });
  }

  if (searchPillNode) {
    if (expandableSearch) {
      expandableSearch.addEventListener('click', () => searchPillNode.focus());
    }
    searchPillNode.addEventListener('focus', () => {
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

  // ─────────────────────────────────────────
  // MODEL LOAD
  // ─────────────────────────────────────────
  modelViewer.addEventListener('load', () => {
    hotspots.forEach(h => {
      if (h.dataset.position) {
        const pos = h.dataset.position.split(' ');
        if (pos.length === 3) {
          const y = parseFloat(pos[1]) + 2.0;
          h.dataset.position = `${pos[0]} ${y}m ${pos[2]}`;
        }
      }
    });

    const screen = document.getElementById('loading-screen');
    if (screen) {
      screen.style.opacity = '0';
      setTimeout(() => screen.style.display = 'none', 500);
    }
  });

  setTimeout(() => {
    const screen = document.getElementById('loading-screen');
    if (screen) {
      screen.style.opacity = '0';
      setTimeout(() => screen.style.display = 'none', 500);
    }
  }, 10000);

  function debounce(fn, delay) {
    let timer;
    return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
  }

  // ─────────────────────────────────────────
  // APPLY CAMERA LOCK (responsive)
  // ─────────────────────────────────────────
  const applyCameraLock = () => {
    mv.setAttribute('camera-controls', '');
    if (window.innerWidth <= 768) {
      mv.setAttribute('disable-pan', '');
      mv.setAttribute('zoom-sensitivity', '1.2');
      mv.setAttribute('interpolation-decay', '100');
      mv.setAttribute('min-camera-orbit', '359.5deg 44.5deg 40m');
      mv.setAttribute('max-camera-orbit', '360.5deg 45.5deg 180m');
    } else {
      mv.removeAttribute('disable-pan');
      mv.removeAttribute('zoom-sensitivity');
      mv.setAttribute('interpolation-decay', '200');
      mv.setAttribute('min-camera-orbit', 'auto 0deg 20m');
      mv.setAttribute('max-camera-orbit', 'auto 90deg 150m');
      hotspots.forEach(h => h.classList.remove('mobile-hotspot-disabled'));
    }
  };

  applyCameraLock();
  window.addEventListener('resize', debounce(() => {
    applyCameraLock();
    // If a hotspot is selected, stay in orbit mode; otherwise re-lock
    if (selectedHotspot) {
      enterHotspotOrbitMode();
    }
  }, 200));

  // ─────────────────────────────────────────
  // HOTSPOT VISIBILITY OBSERVER
  // ─────────────────────────────────────────
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'data-visible') {
        const h = mutation.target;
        if (h.dataset.visible === 'false' || !h.hasAttribute('data-visible')) {
          h.classList.add('angled-away');
        } else {
          h.classList.remove('angled-away');
        }
      }
    });
  });

  hotspots.forEach(h => observer.observe(h, { attributes: true }));

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

  // ─────────────────────────────────────────
  // DEV OVERLAY
  // ─────────────────────────────────────────
  const updateDevOverlay = () => {
    const orbit  = modelViewer.getCameraOrbit();
    const target = modelViewer.getCameraTarget();
    const fov    = modelViewer.getFieldOfView();
    const thetaDeg = (orbit.theta * 180 / Math.PI).toFixed(2);
    const phiDeg   = (orbit.phi   * 180 / Math.PI).toFixed(2);
    const radius   = orbit.radius.toFixed(2);
    const orbitStr  = `${thetaDeg}deg ${phiDeg}deg ${radius}m`;
    const targetStr = `${target.x.toFixed(2)}m ${target.y.toFixed(2)}m ${target.z.toFixed(2)}m`;
    const fovStr    = `${fov.toFixed(2)}deg`;
    const zoomSens  = modelViewer.getAttribute('zoom-sensitivity') || "Default";
    const orbitSens = modelViewer.getAttribute('orbit-sensitivity') || "Default";
    let sizeStr = "Evaluating...";
    const size = modelViewer.getDimensions();
    if (size && size.x) sizeStr = `${size.x.toFixed(2)}m x ${size.y.toFixed(2)}m x ${size.z.toFixed(2)}m`;

    const devOrbit    = document.getElementById('dev-orbit');
    const devTarget   = document.getElementById('dev-target');
    const devFov      = document.getElementById('dev-fov');
    const devZoom     = document.getElementById('dev-zoom');
    const devOrbitSens = document.getElementById('dev-orbit-sens');
    const devSize     = document.getElementById('dev-size');
    if (devOrbit && devTarget && devFov) {
      devOrbit.innerText  = orbitStr;
      devTarget.innerText = targetStr;
      devFov.innerText    = fovStr;
    }
    if (devZoom)     devZoom.innerText     = zoomSens;
    if (devOrbitSens) devOrbitSens.innerText = orbitSens;
    if (devSize)     devSize.innerText     = sizeStr;
  };

  // ─────────────────────────────────────────
  // CAMERA-CHANGE: pan clamp
  // ─────────────────────────────────────────
  modelViewer.addEventListener('camera-change', (e) => {
    updateDevOverlay();
    const target = modelViewer.getCameraTarget();
    let clamped = false;
    const BOUND_X = 45;
    const BOUND_Z = 65;
    let nx = target.x;
    let nz = target.z;

    if (nx > BOUND_X)  { nx = BOUND_X;  clamped = true; }
    if (nx < -BOUND_X) { nx = -BOUND_X; clamped = true; }

    if (window.innerWidth <= 768 && !selectedHotspot) {
      // Full Z lock in base mode
      if (Math.abs(nz - 8.5) > 0.01) { nz = 8.5; clamped = true; }
    } else {
      if (nz > BOUND_Z)  { nz = BOUND_Z;  clamped = true; }
      if (nz < -BOUND_Z) { nz = -BOUND_Z; clamped = true; }
    }

    if (clamped && e.detail.source === 'user-interaction') {
      modelViewer.cameraTarget = `${nx}m ${target.y}m ${nz}m`;
    }
  });

  // ─────────────────────────────────────────
  // CUSTOM MOBILE 1-FINGER X/Z SCROLL
  // Only active when NO hotspot is selected
  // ─────────────────────────────────────────
  window.isCustomScrolling = false;
  let scrollStartX = 0;
  let scrollStartY = 0;
  let startCameraX = 0;
  let startCameraZ = 0;

  mv.addEventListener('touchstart', (e) => {
    // Only intercept single-finger touches in base (no hotspot selected) mode on mobile
    if (window.innerWidth > 768 || selectedHotspot) {
      window.isCustomScrolling = false;
      return;
    }
    
    if (e.touches.length === 1) {
      window.isCustomScrolling = true;
      scrollStartX = e.touches[0].clientX;
      scrollStartY = e.touches[0].clientY;
      startCameraX = mv.getCameraTarget().x;
      startCameraZ = mv.getCameraTarget().z;

      // Aggressively lock theta around the current angle so the finger drag acts purely as a 2D pan slider natively!
      const currentOrbit = mv.getCameraOrbit();
      const t = (currentOrbit.theta * 180 / Math.PI).toFixed(1);
      mv.setAttribute('min-camera-orbit', `${t}deg 45deg 40m`);
      mv.setAttribute('max-camera-orbit', `${t}deg 85deg 180m`);
    } else if (e.touches.length >= 2) {
      window.isCustomScrolling = false;
      // Allow freedom for two finger native rotation twists to execute perfectly
      mv.setAttribute('min-camera-orbit', 'auto 45deg 40m');
      mv.setAttribute('max-camera-orbit', 'auto 85deg 180m');
    }
  }, { passive: true });

  mv.addEventListener('touchmove', (e) => {
    if (!window.isCustomScrolling || window.innerWidth > 768 || e.touches.length !== 1 || selectedHotspot) return;

    const deltaX = e.touches[0].clientX - scrollStartX;
    const deltaY = e.touches[0].clientY - scrollStartY;

    const orbit = mv.getCameraOrbit();
    const radiusStr = orbit.radius;
    let radius = 100;
    if (radiusStr) radius = parseFloat(radiusStr);
    const panSpeed = 0.0016 * radius;

    // Map screen drag accurately via trig to world 3D vectors based on exact current camera orientation
    const theta = orbit.theta;
    const mapDX = deltaX * Math.cos(theta) - deltaY * Math.sin(theta);
    const mapDZ = deltaX * Math.sin(theta) + deltaY * Math.cos(theta);

    let newX = startCameraX - (mapDX * panSpeed);
    let newZ = startCameraZ - (mapDZ * panSpeed);
    
    if (newX > 45)  newX = 45;
    if (newX < -45) newX = -45;
    if (newZ > 65)  newZ = 65;
    if (newZ < -65) newZ = -65;

    mv.cameraTarget = `${newX}m -1.3m ${newZ}m`;
  }, { passive: true });

  mv.addEventListener('touchend', () => {
    window.isCustomScrolling = false;
  });

  modelViewer.addEventListener('load', updateDevOverlay);

  const copyBtn = document.getElementById('dev-copy-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const orbitStr  = document.getElementById('dev-orbit').innerText;
      const targetStr = document.getElementById('dev-target').innerText;
      const fovStr    = document.getElementById('dev-fov').innerText;
      const copyString = `camera-orbit="${orbitStr}"\ncamera-target="${targetStr}"\nfield-of-view="${fovStr}"`;
      navigator.clipboard.writeText(copyString).then(() => {
        const orig = copyBtn.innerText;
        copyBtn.innerText = "Copied!";
        setTimeout(() => copyBtn.innerText = orig, 1500);
      });
    });
  }

  // ─────────────────────────────────────────
  // SEARCH — keyboard zoom out + restore on blur
  // ─────────────────────────────────────────
  const mobileSearchInputRef = document.querySelector('.search-pill-input');
  if (mobileSearchInputRef) {
    mobileSearchInputRef.addEventListener('focus', () => {
      mv.cameraOrbit  = "360deg 45deg 165m";
      mv.cameraTarget = START_TARGET;
      mv.fieldOfView  = START_FOV;
    });
    mobileSearchInputRef.addEventListener('blur', () => {
      resetCamera();
    });
  }

  // ─────────────────────────────────────────
  // RECENTER BUTTON
  // Full reset: deselect hotspot + restore start camera
  // ─────────────────────────────────────────
  const mobileResetBtn = document.getElementById('mobile-reset-btn');
  if (mobileResetBtn) {
    mobileResetBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deselectAll(); // handles enterLockedMode() + resetCamera()
    });
  }

  // ─────────────────────────────────────────
  // GESTURE TUTORIAL OVERLAY
  // ─────────────────────────────────────────
  modelViewer.addEventListener('load', () => {
    setTimeout(() => {
      const prompt = document.getElementById('gesture-prompt-overlay');
      if (prompt) prompt.classList.add('show-prompt');
    }, 1200);
  });

  const hideGesturePrompt = () => {
    const prompt = document.getElementById('gesture-prompt-overlay');
    if (prompt && prompt.classList.contains('show-prompt')) {
      prompt.classList.remove('show-prompt');
      setTimeout(() => {
        if (prompt) prompt.style.display = 'none';
        showLegendPrompt();
      }, 600);
    }
  };

  let legendPromptDismissed = false;
  const legendPromptEl = document.getElementById('legend-prompt-overlay');

  const showLegendPrompt = () => {
    if (legendPromptDismissed) return;
    if (legendPromptEl) legendPromptEl.classList.add('show-prompt');
    if (legendBtn) legendBtn.classList.add('pulsating');
    setTimeout(() => { if (!legendPromptDismissed) hideLegendPrompt(); }, 5000);
  };

  const hideLegendPrompt = () => {
    legendPromptDismissed = true;
    if (legendPromptEl && legendPromptEl.classList.contains('show-prompt')) {
      legendPromptEl.classList.remove('show-prompt');
      setTimeout(() => { if (legendPromptEl) legendPromptEl.style.display = 'none'; }, 500);
    }
    if (legendBtn) legendBtn.classList.remove('pulsating');
  };

  if (legendBtn) legendBtn.addEventListener('click', () => hideLegendPrompt());

  modelViewer.addEventListener('pointerdown', hideGesturePrompt);
  modelViewer.addEventListener('wheel', hideGesturePrompt);
  modelViewer.addEventListener('camera-change', (e) => {
    if (e.detail.source === 'user-interaction') hideGesturePrompt();
  });

});
