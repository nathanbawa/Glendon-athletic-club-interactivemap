document.addEventListener('DOMContentLoaded', () => {
  const modelViewer = document.querySelector('model-viewer');
  const hotspots = document.querySelectorAll('.Hotspot');
  let selectedHotspot = null;

  // ─────────────────────────────────────────
  // STARTING CAMERA STATE
  // Captured once on load — used by recenter, outside-click, deselect
  // ─────────────────────────────────────────
  const START_ORBIT  = "0deg 45deg 100m";
  const START_TARGET = "0m -1.3m 8.5m";
  const START_FOV    = "70deg";

  const SLOT_TO_KEY = {
    'hotspot-2': '1',   // Lobby
    'hotspot-20': '2',  // Weight room
    'hotspot-9': '3',   // Pool
    'hotspot-5': '4',   // Stretching
    'hotspot-6': '5',   // Spinning
    'hotspot-4': '6',   // Boxing
    'hotspot-3': '7',   // Golf
    'hotspot-18': '8',  // Squash
    'hotspot-10': '10', // M.Changing
    'hotspot-11': '11', // W.Changing
    'hotspot-7': '12',  // W.Locker
    'hotspot-8': '13',  // M.Locker
    'hotspot-21': '14', // Stairs
  };

  function resetCamera() {
    modelViewer.removeAttribute('min-camera-orbit');
    modelViewer.removeAttribute('max-camera-orbit');
    modelViewer.removeAttribute('interpolation-decay');
    modelViewer.cameraOrbit  = START_ORBIT;
    modelViewer.cameraTarget = START_TARGET;
    modelViewer.fieldOfView  = START_FOV;
    modelViewer.jumpCameraToGoal(); // Fixes sticky snap interpolation locally unconditionally
    if (typeof applyCameraLock === 'function') setTimeout(applyCameraLock, 50);
  }

  // ─────────────────────────────────────────
  // WAYPOINT ROUTE SYSTEM
  // ─────────────────────────────────────────
  const WAYPOINTS = [
    { id:24, label:'Lobby', key:'1', nx:-0.55, nz:16.54, ny: -1.25 },
    { id:25, label:'Swimming Pool', key:'3', nx:-22.76, nz:-5.47, ny: -1.25 },
    { id:26, label:'Weight Room', key:'2', nx:16.18, nz:-3.7, ny: -1.25 },
    { id:27, label:'Stretching Room', key:'4', nx:20.85, nz:16.97, ny: -1.25 },
    { id:28, label:'Spinning Room', key:'5', nx:27.99, nz:16.7, ny: -1.25 },
    { id:29, label:'Boxing Room', key:'6', nx:14.43, nz:16.71, ny: -1.25 },
    { id:30, label:'Golf Court', key:'7', nx:8.44, nz:16.72, ny: -1.25 },
    { id:31, label:'Squash Court', key:'8', nx:-17.5, nz:-28.07, ny: -1.25 },
    { id:32, label:'M.Changing Room', key:'10', nx:-9.94, nz:14.84, ny: -1.25 },
    { id:33, label:'W.Changing Room', key:'11', nx:-10, nz:19.78, ny: -1.25 },
    { id:34, label:'W.Locker Room', key:'12', nx:-5.08, nz:0.56, ny: -1.25 },
    { id:35, label:'M.Locker Room', key:'13', nx:-5.57, nz:-13.43, ny: -1.25 },
    { id:36, label:'Stairs 14', key:'14', nx:-2.01, nz:8.5, ny: -1.25 },
    { id:37, label:'Stairs 15', key:'15', nx:27.95, nz:3.72, ny: -1.25 },
    { id:38, label:'Stairs 16', key:'16', nx:-23.99, nz:-38.73, ny: -1.25 }
  ];

  const NEW_NODES = [
    { id:102, type:'lobycbonnection', nx:0.229, nz:18.117, ny:-2.699 },
    { id:103, type:'lobycbonnection', nx:3.087, nz:18.456, ny:-2.699 },
    { id:104, type:'lobycbonnection', nx:3.340, nz:15.883, ny:-2.699 },
    { id:105, type:'lobycbonnection', nx:3.615, nz:13.207, ny:-2.699 },
    { id:106, type:'halway', nx:4.041, nz:10.653, ny:-2.699 },
    { id:107, type:'halway', nx:3.879, nz:7.924, ny:-2.699 },
    { id:108, type:'halway', nx:3.812, nz:4.425, ny:-2.699 },
    { id:109, type:'halway', nx:3.523, nz:0.613, ny:-2.699 },
    { id:110, type:'halway', nx:3.561, nz:-2.420, ny:-2.699 },
    { id:111, type:'halway', nx:3.438, nz:-5.189, ny:-2.699 },
    { id:112, type:'halway', nx:3.940, nz:-8.366, ny:-2.699 },
    { id:113, type:'halway', nx:3.812, nz:-10.943, ny:-2.699 },
    { id:114, type:'halway', nx:3.633, nz:-13.022, ny:-2.699 },
    { id:115, type:'halway', nx:3.687, nz:-15.172, ny:-2.699 },
    { id:116, type:'halway', nx:3.604, nz:-18.018, ny:-2.699 },
    { id:117, type:'halway', nx:3.783, nz:-20.549, ny:-2.699 },
    { id:118, type:'halway', nx:3.766, nz:-22.969, ny:-2.699 },
    { id:119, type:'halway', nx:3.630, nz:-25.201, ny:-2.699 },
    { id:120, type:'halway', nx:0.230, nz:-26.110, ny:-2.699 },
    { id:121, type:'halway', nx:-2.009, nz:-25.759, ny:-2.699 },
    { id:122, type:'halway', nx:-1.600, nz:-27.931, ny:-2.699 },
    { id:123, type:'halway', nx:-1.512, nz:-31.432, ny:-2.699 },
    { id:124, type:'halway', nx:-1.290, nz:-34.217, ny:-2.699 },
    { id:125, type:'squashcourtconnection', nx:-4.274, nz:-34.545, ny:-2.699 },
    { id:126, type:'squashcourtconnection', nx:-7.669, nz:-34.680, ny:-2.699 },
    { id:127, type:'squashcourtconnection', nx:-10.356, nz:-34.696, ny:-2.699 },
    { id:128, type:'squashcourtconnection', nx:-13.446, nz:-34.824, ny:-2.699 },
    { id:129, type:'squashcourtconnection', nx:-13.661, nz:-30.266, ny:-2.699 },
    { id:130, type:'weightroom connection', nx:6.913, nz:7.422, ny:-2.699 },
    { id:131, type:'weightroom connection', nx:10.389, nz:7.471, ny:-2.699 },
    { id:132, type:'weightroom connection', nx:15.891, nz:7.532, ny:-2.699 },
    { id:133, type:'weightroom connection', nx:15.832, nz:3.786, ny:-2.699 },
    { id:134, type:'weightroom connection', nx:16.008, nz:1.307, ny:-2.699 },
    { id:135, type:'weightroom connection', nx:16.250, nz:-1.154, ny:-2.699 },
    { id:136, type:'golfcourtconnection', nx:6.860, nz:9.990, ny:-2.699 },
    { id:137, type:'halway', nx:11.212, nz:9.897, ny:-2.699 },
    { id:138, type:'boxingroomconnection', nx:14.994, nz:10.059, ny:-2.699 },
    { id:139, type:'halway', nx:18.148, nz:9.896, ny:-2.699 },
    { id:140, type:'halway', nx:20.216, nz:9.838, ny:-2.699 },
    { id:141, type:'halway', nx:21.552, nz:10.029, ny:-2.699 },
    { id:142, type:'halway', nx:23.351, nz:9.995, ny:-2.699 },
    { id:143, type:'halway', nx:25.382, nz:10.125, ny:-2.699 },
    { id:144, type:'halway', nx:26.963, nz:9.937, ny:-2.699 },
    { id:145, type:'halway', nx:28.448, nz:9.735, ny:-2.699 },
    { id:146, type:'stairsconnection', nx:28.430, nz:8.694, ny:-2.699 },
    { id:147, type:'stairsconnection', nx:28.464, nz:7.244, ny:-2.699 },
    { id:148, type:'stairsconnection', nx:28.467, nz:5.683, ny:-2.699 },
    { id:149, type:'halway', nx:2.102, nz:10.920, ny:-2.699 },
    { id:150, type:'halway', nx:-0.070, nz:10.872, ny:-2.699 },
    { id:151, type:'halway', nx:-1.815, nz:10.974, ny:-2.699 },
    { id:152, type:'halway', nx:-3.516, nz:10.953, ny:-2.699 },
    { id:153, type:'halway', nx:-5.550, nz:11.256, ny:-2.699 },
    { id:154, type:'halway', nx:-7.501, nz:11.410, ny:-2.699 },
    { id:155, type:'halway', nx:-9.304, nz:11.356, ny:-2.699 },
    { id:156, type:'halway', nx:-10.844, nz:11.471, ny:-2.699 },
    { id:157, type:'halway', nx:-12.300, nz:11.423, ny:-2.699 },
    { id:158, type:'halway', nx:-14.136, nz:11.816, ny:-2.699 },
    { id:159, type:'m.changingroomconection', nx:-15.364, nz:13.258, ny:-2.699 },
    { id:160, type:'m.changingroomconection', nx:-15.167, nz:15.867, ny:-2.699 },
    { id:161, type:'m.changingroomconection', nx:-13.235, nz:15.805, ny:-2.699 },
    { id:162, type:'m.changingroomconection', nx:-11.724, nz:15.868, ny:-2.699 },
    { id:163, type:'w.changingroomconection', nx:-15.003, nz:17.607, ny:-2.699 },
    { id:164, type:'w.changingroomconection', nx:-13.022, nz:17.785, ny:-2.699 },
    { id:165, type:'w.changingroomconection', nx:-11.687, nz:17.929, ny:-2.699 },
    { id:166, type:'halway', nx:5.485, nz:10.096, ny:-2.699 },
    { id:167, type:'golfcourtconnection', nx:8.332, nz:10.209, ny:-2.699 },
    { id:168, type:'golfcourtconnection', nx:8.407, nz:11.803, ny:-2.699 },
    { id:169, type:'golfcourtconnection', nx:8.378, nz:13.349, ny:-2.699 },
    { id:170, type:'halway', nx:13.203, nz:9.956, ny:-2.699 },
    { id:171, type:'boxingroomconection', nx:14.896, nz:11.774, ny:-2.699 },
    { id:172, type:'boxingroomconection', nx:14.666, nz:13.632, ny:-2.699 },
    { id:173, type:'stretchingroomconection', nx:20.397, nz:11.532, ny:-2.699 },
    { id:174, type:'stretchingroomconection', nx:20.373, nz:12.778, ny:-2.699 },
    { id:175, type:'stretchingroomconection', nx:20.511, nz:14.238, ny:-2.699 },
    { id:176, type:'spinningroomconection', nx:27.065, nz:11.507, ny:-2.699 },
    { id:177, type:'spinningroomconection', nx:26.978, nz:12.932, ny:-2.699 },
    { id:178, type:'spinningroomconection', nx:26.951, nz:14.374, ny:-2.699 },
    { id:179, type:'stairsconection', nx:1.935, nz:9.674, ny:-2.699 },
    { id:180, type:'stairsconnection', nx:1.894, nz:8.444, ny:-2.699 },
    { id:181, type:'squashcourtconnection', nx:-13.493, nz:-32.581, ny:-2.699 },
    { id:182, type:'stairsconnection', nx:-16.344, nz:-34.765, ny:-2.699 },
    { id:183, type:'stairsconnection', nx:-18.329, nz:-34.479, ny:-2.699 },
    { id:184, type:'stairsconnection', nx:-20.023, nz:-34.434, ny:-2.699 },
    { id:185, type:'stairsconnection', nx:-21.987, nz:-34.224, ny:-2.699 },
    { id:186, type:'stairsconnection', nx:-24.579, nz:-34.981, ny:-2.699 },
    { id:187, type:'w.lockerroomconnection', nx:2.386, nz:-0.980, ny:1.176 },
    { id:188, type:'w.lockerroomconnection', nx:1.264, nz:-0.972, ny:-2.699 },
    { id:189, type:'w.lockerroomconnection', nx:0.267, nz:-0.815, ny:-2.699 },
    { id:190, type:'w.lockerroomconnection', nx:-0.716, nz:-0.627, ny:-2.699 },
    { id:191, type:'M.lockerroomconnection', nx:2.035, nz:-10.768, ny:-2.699 },
    { id:192, type:'M.lockerroomconnection', nx:0.934, nz:-10.813, ny:-2.699 },
    { id:193, type:'M.lockerroomconnection', nx:-0.116, nz:-10.701, ny:-2.699 },
    { id:194, type:'swimmingpoolconnection', nx:-14.335, nz:10.203, ny:-2.699 },
    { id:196, type:'swimmingpoolconnection', nx:-14.422, nz:7.511, ny:-2.699 },
    { id:197, type:'swimmingpoolconnection', nx:-14.618, nz:4.905, ny:-2.699 },
    { id:198, type:'swimmingpoolconnection', nx:-14.724, nz:2.616, ny:-2.699 },
    { id:199, type:'swimmingpoolconnection', nx:-14.591, nz:0.915, ny:-2.699 }
  ];

  NEW_NODES.forEach(n => WAYPOINTS.push(n));

  const waypointMap = {};
  WAYPOINTS.forEach(w => waypointMap[w.id] = w);

  const _dist = (n1, n2) => Math.hypot(n1.nx - n2.nx, n1.nz - n2.nz);
  const CONNECTIONS = [];

  const graphNodes = NEW_NODES; 
  const halwayNodes = graphNodes.filter(g => g.type === 'halway');
  
  // 1. Weave identical groups cleanly within 6.5 meters natively (fixes large trace gaps)
  for(let i = 0; i < graphNodes.length; i++) {
    for(let j = i+1; j < graphNodes.length; j++) {
      const A = graphNodes[i], B = graphNodes[j];
      if (_dist(A, B) < 6.5) { 
        if (A.type === 'halway' && B.type === 'halway') CONNECTIONS.push([A.id, B.id]);
        else if (A.type === B.type && A.type !== 'halway') CONNECTIONS.push([A.id, B.id]);
      }
    }
  }

  // 2. Safely bridge each isolated Room-Connection group into the nearest available Hallway skeleton point linearly
  let elbowCounter = 200;
  const uniqueTypes = [...new Set(graphNodes.filter(g => g.type !== 'halway').map(g => g.type))];
  uniqueTypes.forEach(type => {
      const typeNodes = graphNodes.filter(g => g.type === type);
      let bestRoomNode = null, bestHallNode = null, minD = Infinity;

      typeNodes.forEach(rn => {
         halwayNodes.forEach(hn => {
            let d = _dist(rn, hn);
            if (d < minD) { minD = d; bestRoomNode = rn; bestHallNode = hn; }
            if (d < 3.2) {
               // Dynamically inject sharp 90-degree tracking elbow corner natively
               const elbow = { id: elbowCounter++, type:'elbow', nx:rn.nx, ny:rn.ny, nz:hn.nz };
               WAYPOINTS.push(elbow); waypointMap[elbow.id] = elbow;
               CONNECTIONS.push([rn.id, elbow.id]); CONNECTIONS.push([elbow.id, hn.id]);
            }
         });
      });
      if (bestRoomNode && bestHallNode) {
         const elbow = { id: elbowCounter++, type:'elbow', nx:bestRoomNode.nx, ny:bestRoomNode.ny, nz:bestHallNode.nz };
         WAYPOINTS.push(elbow); waypointMap[elbow.id] = elbow;
         CONNECTIONS.push([bestRoomNode.id, elbow.id]); CONNECTIONS.push([elbow.id, bestHallNode.id]);
      }
  });

  const MAP_ALIAS = {
    '1': ['lobycbonnection'],
    '3': ['swimmingpoolconnection'],
    '2': ['weightroom connection'],
    '4': ['stretchingroomconection'],
    '5': ['spinningroomconection'],
    '6': ['boxingroomconnection', 'boxingroomconection'],
    '7': ['golfcourtconnection'],
    '8': ['squashcourtconnection'],
    '10': ['m.changingroomconection'],
    '11': ['w.changingroomconection'],
    '12': ['w.lockerroomconnection'],
    '13': ['M.lockerroomconnection'],
    '14': ['stairsconnection', 'stairsconection'],
    '15': ['stairsconnection', 'stairsconection'],
    '16': ['stairsconnection', 'stairsconection']
  };

  // 3. Bond original static visual destinations perfectly into the parsed annotation layer
  WAYPOINTS.filter(w => w.id < 100).forEach(room => {
    const aliases = MAP_ALIAS[room.key] || [];
    const viable = graphNodes.filter(g => aliases.includes(g.type)).sort((a,b) => _dist(room, a) - _dist(room, b));
    if (viable.length > 0) {
       const v = viable[0];
       // Embed orthogonal terminating joint to visually preserve sharp square traces directly connecting into the click-dot
       const elbow = { id: elbowCounter++, type:'elbow', nx:room.nx, ny:room.ny, nz:v.nz };
       WAYPOINTS.push(elbow); waypointMap[elbow.id] = elbow;
       CONNECTIONS.push([room.id, elbow.id]); CONNECTIONS.push([elbow.id, v.id]);
    }
  });

  const adjacency = {};
  WAYPOINTS.forEach(w => adjacency[w.id] = []);
  CONNECTIONS.forEach(([a, b]) => {
    if (!adjacency[a]) adjacency[a] = [];
    if (!adjacency[b]) adjacency[b] = [];
    adjacency[a].push(b);
    adjacency[b].push(a);
  });

  function astar(startId, endId) {
    const dist = (a, b) => Math.hypot(waypointMap[a].nx - waypointMap[b].nx, waypointMap[a].nz - waypointMap[b].nz);
    const open = new Set([startId]);
    const cameFrom = {};
    const gScore = { [startId]: 0 };
    const fScore = { [startId]: dist(startId, endId) };
    while (open.size) {
      let current = [...open].reduce((a, b) => (fScore[a] ?? Infinity) < (fScore[b] ?? Infinity) ? a : b);
      if (current === endId) {
        const path = [];
        while (current !== undefined) { path.unshift(current); current = cameFrom[current]; }
        return path;
      }
      open.delete(current);
      for (const neighbor of (adjacency[current] || [])) {
        const tentative = (gScore[current] ?? 0) + dist(current, neighbor);
        if (tentative < (gScore[neighbor] ?? Infinity)) {
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
  let currentRoutePathIds = [];
  let routeDrawLoop = null;

  function clearRoute() {
    if (routeSVG) routeSVG.innerHTML = '';
    document.querySelectorAll('.routing-hotspot').forEach(el => el.remove());
    if (routeDrawLoop) {
      cancelAnimationFrame(routeDrawLoop);
      routeDrawLoop = null;
    }
    currentRoutePathIds = [];
  }

  function drawRoute(pathIds) {
    clearRoute();
    if (!pathIds || pathIds.length < 2) return;

    currentRoutePathIds = pathIds;

    // Inject temporary hotspots precisely tracking world-floor elevation
    pathIds.forEach((id) => {
      const w = waypointMap[id];
      const h = document.createElement('div');
      h.className = 'routing-hotspot';
      // Native model-viewer tracker REQUIRES "hotspot-" prefix strictly!
      h.slot = `hotspot-route-${id}`;
      const py = w.ny !== undefined ? w.ny.toFixed(2) : '-1.15';
      h.dataset.position = `${w.nx.toFixed(2)} ${py} ${w.nz.toFixed(2)}`;
      h.dataset.normal = "0 1 0";
      h.style.width = '0px';
      h.style.height = '0px';
      h.style.pointerEvents = 'none';
      mv.appendChild(h);
    });

    // Begin render lock
    if (!routeDrawLoop) loopRouteSVG();
  }

  function loopRouteSVG() {
    if (currentRoutePathIds && currentRoutePathIds.length > 0) {
      updateRouteSVG();
      routeDrawLoop = requestAnimationFrame(loopRouteSVG);
    } else {
      routeDrawLoop = null;
    }
  }

  function updateRouteSVG() {
    if (!currentRoutePathIds || currentRoutePathIds.length < 2) return;
    
    // Pull the absolute screen coordinates rendered natively by model-viewer's projection matrix
    const points = currentRoutePathIds.map(id => {
      const h = mv.querySelector(`[slot="hotspot-route-${id}"]`);
      if (!h) return null;
      const rect = h.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0 && rect.left === 0) return null; // ModelViewer parses pending slots
      return { x: rect.left, y: rect.top };
    }).filter(p => p !== null);

    if (points.length < 2) return;
    
    // Ensure perfectly straight segments natively matching original coordinates unconditionally
    const d = points.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(' ');

    if (!routeSVG) return;

    let mainPath = document.getElementById('animated-route-path');
    let startCircle = routeSVG.querySelector('.route-start');
    let endCircle = routeSVG.querySelector('.route-end');

    if (!mainPath) {
      // Native angular trace using dotted red layout globally plus small animating box tracer sequence
      routeSVG.innerHTML = `
        <defs>
          <path id="route-path-ref"></path>
        </defs>
        <path id="animated-route-path" stroke="#E31837" stroke-dasharray="8 8" stroke-width="6" fill="none" stroke-linecap="square" stroke-linejoin="miter"></path>
        <circle class="route-start" r="6" fill="#1D9E75" stroke="white" stroke-width="2"></circle>
        <circle class="route-end" r="6" fill="#E31837" stroke="white" stroke-width="2"></circle>
        <rect id="route-runner" width="12" height="12" fill="#E31837" x="-6" y="-6" rx="2" ry="2" stroke="white" stroke-width="2" filter="drop-shadow(0 0 6px rgba(227,24,55,0.8))">
          <animateMotion dur="3.5s" repeatCount="indefinite">
             <mpath href="#route-path-ref"/>
          </animateMotion>
        </rect>
      `;
      mainPath = document.getElementById('animated-route-path');
      startCircle = routeSVG.querySelector('.route-start');
      endCircle = routeSVG.querySelector('.route-end');
    }

    mainPath.setAttribute('d', d);
    routeSVG.querySelector('#route-path-ref').setAttribute('d', d);
    startCircle.setAttribute('cx', points[0].x);
    startCircle.setAttribute('cy', points[0].y);
    endCircle.setAttribute('cx', points[points.length-1].x);
    endCircle.setAttribute('cy', points[points.length-1].y);
  }

  window.addEventListener('resize', () => {
    // Vector paths now natively inherit resize scale shifts through modelViewer matrix!
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
    mv.setAttribute('min-camera-orbit', 'auto 20deg 40m');
    mv.setAttribute('max-camera-orbit', 'auto 75deg 150m');

    mv.autoRotate = false;

    const labelText = h.querySelector('.hotspot-label')?.textContent?.trim() || 'Room Details';
    showInfoCard(labelText);

    const itineraryBtn = document.getElementById('itinerary-btn');
    if (itineraryBtn) {
      itineraryBtn.classList.add('show-itinerary');
      itineraryBtn.dataset.targetSlot = h.slot;
    }
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
  const deselectAll = (fullReset = true) => {
    if (window.itineraryDelay) clearTimeout(window.itineraryDelay);
    if (window.itineraryOrbit) clearTimeout(window.itineraryOrbit);
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

    const itineraryBtn = document.getElementById('itinerary-btn');
    if (itineraryBtn) {
      itineraryBtn.classList.remove('show-itinerary');
    }

    // Re-lock camera natively allowing slight zoom-out but clamping strict boundaries
    if (typeof applyCameraLock === 'function') applyCameraLock();
    if (fullReset) resetCamera();
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
      deselectAll(false); // Gracefully unlock constraints to allow zoom-out without violently snapping array limits
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
    const SYNONYMS = {
      'weight room': ['gym', 'fitness', 'workout', 'weights', 'lifting'],
      'spinning room': ['cycling', 'bike', 'spin', 'cardio'],
      'swimming pool': ['swim', 'water', 'lane', 'aquatics'],
      'stretching room': ['stretch', 'yoga', 'warmup', 'pilates'],
      'squash court': ['racket', 'tennis', 'wall'],
      'boxing room': ['box', 'fight', 'ring', 'sparring'],
      'golf court': ['putt', 'swing', 'club', 'golf'],
      'locker room': ['lockers', 'change', 'shower', 'washroom'],
      'changing room': ['change', 'clothes', 'dressing'],
      'lobby': ['entrance', 'front', 'desk', 'reception']
    };

    searchPillNode.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      hotspots.forEach(h => {
        const labelText = h.querySelector('.hotspot-label');
        if (!labelText) return;
        
        const baseName = labelText.textContent.toLowerCase().trim();
        let isMatch = false;
        
        if (query === '' || baseName.includes(query)) {
          isMatch = true;
        } else {
          // Check synonym aliases dynamically
          for (const [key, aliases] of Object.entries(SYNONYMS)) {
            if (baseName.includes(key)) {
              if (aliases.some(alias => alias.includes(query) || query.includes(alias))) {
                isMatch = true;
                break;
              }
            }
          }
        }
        
        if (isMatch) h.classList.remove('faded-out');
        else h.classList.add('faded-out');
      });
    });
  }

  // ─────────────────────────────────────────
  // MODEL LOAD & GRAPH CLEANUP
  // ─────────────────────────────────────────
  modelViewer.addEventListener('load', () => {
    // 1. Elevate Hotspots cleanly
    hotspots.forEach(h => {
      if (h.dataset.position) {
        const pos = h.dataset.position.split(' ');
        if (pos.length === 3) {
          const y = parseFloat(pos[1]) + 2.0;
          h.dataset.position = `${pos[0]} ${y}m ${pos[2]}`;
        }
      }
    });

    try {
      if (modelViewer.model && modelViewer.model.materials) {
         modelViewer.model.materials.forEach(mat => {
            const n = mat.name.toLowerCase();
            if (n.includes('void') || n.includes('background')) {
               mat.setAlphaMode('OPAQUE');
            }
         });
      }

      const symbols = Object.getOwnPropertySymbols(modelViewer);
      const sceneSymbol = symbols.find(s => s.toString() === 'Symbol(scene)');
      if (sceneSymbol && modelViewer[sceneSymbol]) {
        modelViewer[sceneSymbol].traverse((child) => {
          if (child.isMesh) {
            const name = child.name.toLowerCase();
            const mName = (child.material && child.material.name) ? child.material.name.toLowerCase() : '';
            if (name.includes('plane') || name.includes('background') || mName.includes('void')) {
              child.visible = true; 
            }
          }
        });
      }
    } catch(err) {}

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
      mv.setAttribute('min-camera-orbit', 'auto 0deg 50m');
      mv.setAttribute('max-camera-orbit', 'auto 75deg 150m');
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

    if (nz > BOUND_Z)  { nz = BOUND_Z;  clamped = true; }
    if (nz < -BOUND_Z) { nz = -BOUND_Z; clamped = true; }

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
    if (window.innerWidth > 768 || (selectedHotspot && (!currentRoutePathIds || !currentRoutePathIds.length))) {
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
      mv.setAttribute('max-camera-orbit', `${t}deg 75deg 150m`);
    } else if (e.touches.length >= 2) {
      window.isCustomScrolling = false;
      // Allow freedom for two finger native rotation twists to execute perfectly
      mv.setAttribute('min-camera-orbit', 'auto 0deg 50m');
      mv.setAttribute('max-camera-orbit', 'auto 75deg 150m');
    }
  }, { passive: true });

  mv.addEventListener('touchmove', (e) => {
    if (!window.isCustomScrolling || window.innerWidth > 768 || e.touches.length !== 1 || (selectedHotspot && (!currentRoutePathIds || !currentRoutePathIds.length))) return;

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

  // ─────────────────────────────────────────
  // ITINERARY BUTTON
  // ─────────────────────────────────────────
  const itineraryBtn = document.getElementById('itinerary-btn');
  if (itineraryBtn) {
    itineraryBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetSlot = itineraryBtn.dataset.targetSlot;
      if (!targetSlot) return;

      const targetKey = SLOT_TO_KEY[targetSlot];
      if (!targetKey) return;

      const targetWaypoint = waypointForRoom(targetKey);
      if (!targetWaypoint) return;

      // Clear any locked ranges to allow top-down camera pitch natively
      mv.setAttribute('min-camera-orbit', 'auto 0deg 50m');
      mv.setAttribute('max-camera-orbit', 'auto 75deg 150m');

      // Ensure camera transitions smoothly
      mv.setAttribute('interpolation-decay', '400');
      requestAnimationFrame(() => {
        mv.cameraOrbit = "0deg 0deg 120m";
        mv.cameraTarget = START_TARGET;
        mv.fieldOfView = "60deg";
      });

      const pathIds = astar(24, targetWaypoint.id);
      if (pathIds && pathIds.length > 0) {
        currentRoutePathIds = pathIds;
        drawRoute(pathIds);

        // Cancel any pending cinematic timeouts if user clicks multiple itineraries rapidly
        if (window.itineraryDelay) clearTimeout(window.itineraryDelay);
        if (window.itineraryOrbit) clearTimeout(window.itineraryOrbit);
        
        // Wait 3.5 seconds for the user to visually digest the entire raw drawn top-down route
        window.itineraryDelay = setTimeout(() => {
          // Drop down smoothly to 45 degree angle maintaining existing X-axis rotation natively
          mv.setAttribute('interpolation-decay', '600');
          mv.cameraOrbit = "auto 45deg 120m";
          
          // Initiate slow continuous spin effect automatically
          window.itineraryOrbit = setTimeout(() => {
             mv.setAttribute('auto-rotate-delay', '0');
             mv.setAttribute('rotation-per-second', '12deg'); 
             mv.autoRotate = true;
          }, 1500); // 1.5s after the pitch drop begins
        }, 3500);
      }
    });
  }

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

  const cancelCinematic = () => {
    if (window.itineraryDelay) clearTimeout(window.itineraryDelay);
    if (window.itineraryOrbit) clearTimeout(window.itineraryOrbit);
  };

  modelViewer.addEventListener('pointerdown', () => { hideGesturePrompt(); cancelCinematic(); });
  modelViewer.addEventListener('wheel', () => { hideGesturePrompt(); cancelCinematic(); });
  modelViewer.addEventListener('camera-change', (e) => {
    if (e.detail.source === 'user-interaction') { hideGesturePrompt(); cancelCinematic(); }
  });

});
