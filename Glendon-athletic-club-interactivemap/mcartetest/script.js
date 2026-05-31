document.addEventListener('DOMContentLoaded', () => {
  const modelViewer = document.querySelector('model-viewer');
  const hotspots = document.querySelectorAll('.Hotspot');
  let selectedHotspot = null;
  let isItineraryMode = false;
  let currentHotspotActivation = 0;

  // ─────────────────────────────────────────
  // STARTING CAMERA STATE
  // Captured once on load — used by recenter, outside-click, deselect
  // ─────────────────────────────────────────
  const START_ORBIT = "360deg 45deg 100m";
  const START_TARGET = "0m -1.3m 8.5m";
  const START_FOV = "70deg";
  const QUICK_TRANSITION_DECAY = "90";
  const MOBILE_ZOOM_SENSITIVITY = "0.72";
  const DESKTOP_ZOOM_SENSITIVITY = "0.82";
  const TOP_VIEW_ZOOM_SENSITIVITY = "0.78";
  const MOBILE_PAN_SPEED_FACTOR = 0.00135;
  const TOUCH_PAN_DEADZONE = 8;
  const EMPTY_TAP_DEADZONE = 8;
  const CAMERA_RESET_GUARD_MS = 650;
  const CAMERA_BOUNDS_X = 45;
  const CAMERA_BOUNDS_Z = 65;
  let guardedCameraState = null;
  let guardCameraUntil = 0;
  let backgroundPointerSnapshot = null;

  function applyQuickCameraTransition() {
    modelViewer.setAttribute('interpolation-decay', QUICK_TRANSITION_DECAY);
  }

  function captureCameraState() {
    const orbit = modelViewer.getCameraOrbit();
    const target = modelViewer.getCameraTarget();
    const fov = modelViewer.getFieldOfView();
    return {
      orbit: `${(orbit.theta * 180 / Math.PI).toFixed(2)}deg ${(orbit.phi * 180 / Math.PI).toFixed(2)}deg ${orbit.radius.toFixed(2)}m`,
      target: `${target.x.toFixed(2)}m ${target.y.toFixed(2)}m ${target.z.toFixed(2)}m`,
      fov: `${fov.toFixed(2)}deg`
    };
  }

  function applyCameraState(state) {
    if (!state) return;
    applyQuickCameraTransition();
    modelViewer.cameraOrbit = state.orbit;
    modelViewer.cameraTarget = state.target;
    modelViewer.fieldOfView = state.fov;
  }

  function guardCameraState(state, durationMs = CAMERA_RESET_GUARD_MS) {
    guardedCameraState = state;
    guardCameraUntil = performance.now() + durationMs;
  }

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
    'hotspot-22': '15', // Stairs
    'hotspot-23': '16', // Stairs
    // Floor 2 hotspots
    'hotspot-gymnasium': '17',      // Gymnasium (Floor 2)
    'hotspot-dance-studio': '18',   // Dance Studio (Floor 2)
    'hotspot-back-stairs-f2': '19', // Lobby Stairs (Floor 2)
  };

  function resetCamera() {
    const startState = {
      orbit: START_ORBIT,
      target: START_TARGET,
      fov: START_FOV
    };
    applyCameraState(startState);
    guardCameraState(startState);
  }

  // ─────────────────────────────────────────
  // WAYPOINT ROUTE SYSTEM
  // ─────────────────────────────────────────
  const WAYPOINTS = [
    { id: 24, label: 'Lobby', key: '1', nx: -0.55, nz: 16.54, ny: -1.25 },
    { id: 25, label: 'Swimming Pool', key: '3', nx: -22.76, nz: -5.47, ny: -1.25 },
    { id: 26, label: 'Weight Room', key: '2', nx: 16.18, nz: -3.7, ny: -1.25 },
    { id: 27, label: 'Stretching Room', key: '4', nx: 20.85, nz: 16.97, ny: -1.25 },
    { id: 28, label: 'Spinning Room', key: '5', nx: 27.99, nz: 16.7, ny: -1.25 },
    { id: 29, label: 'Boxing Room', key: '6', nx: 14.43, nz: 16.71, ny: -1.25 },
    { id: 30, label: 'Golf Court', key: '7', nx: 8.44, nz: 16.72, ny: -1.25 },
    { id: 31, label: 'Squash Court', key: '8', nx: -17.5, nz: -28.07, ny: -1.25 },
    { id: 32, label: 'M.Changing Room', key: '10', nx: -9.94, nz: 14.84, ny: -1.25 },
    { id: 33, label: 'W.Changing Room', key: '11', nx: -10, nz: 19.78, ny: -1.25 },
    { id: 34, label: 'W.Locker Room', key: '12', nx: -5.08, nz: 0.56, ny: -1.25 },
    { id: 35, label: 'M.Locker Room', key: '13', nx: -5.57, nz: -13.43, ny: -1.25 },
    { id: 36, label: 'Lobby Stairs', key: '14', nx: -2.01, nz: 8.5, ny: -1.25 },
    { id: 37, label: 'W. Locker Room Stairs', key: '15', nx: 1.338, nz: -0.959, ny: -1.535 },
    { id: 38, label: 'M. Locker Room Stairs', key: '16', nx: 1.750, nz: -11.628, ny: -2.898 },
    { id: 903, label: 'Lobby Stairs', key: '19', nx: -9.20, nz: 3.69, ny: 1.23 },
    { id: 900, label: 'Gymnasium', nx: 6.017, nz: -15.05, ny: 0.23 },
    { id: 901, label: 'Dance Studio', nx: -12.21, nz: -15.05, ny: 0.23 }
  ];

  const NEW_NODES = [
    { id: 102, type: 'lobycbonnection', nx: 0.229, nz: 18.117, ny: -2.699 },
    { id: 103, type: 'lobycbonnection', nx: 3.087, nz: 18.456, ny: -2.699 },
    { id: 104, type: 'lobycbonnection', nx: 3.340, nz: 15.883, ny: -2.699 },
    { id: 105, type: 'lobycbonnection', nx: 3.615, nz: 13.207, ny: -2.699 },
    { id: 106, type: 'halway', nx: 4.041, nz: 10.653, ny: -2.699 },
    { id: 107, type: 'halway', nx: 3.879, nz: 7.924, ny: -2.699 },
    { id: 108, type: 'halway', nx: 3.812, nz: 4.425, ny: -2.699 },
    { id: 109, type: 'halway', nx: 3.523, nz: 0.613, ny: -2.699 },
    { id: 110, type: 'halway', nx: 3.561, nz: -2.420, ny: -2.699 },
    { id: 111, type: 'halway', nx: 3.438, nz: -5.189, ny: -2.699 },
    { id: 112, type: 'halway', nx: 3.940, nz: -8.366, ny: -2.699 },
    { id: 113, type: 'halway', nx: 3.812, nz: -10.943, ny: -2.699 },
    { id: 114, type: 'halway', nx: 3.633, nz: -13.022, ny: -2.699 },
    { id: 115, type: 'halway', nx: 3.687, nz: -15.172, ny: -2.699 },
    { id: 116, type: 'halway', nx: 3.604, nz: -18.018, ny: -2.699 },
    { id: 117, type: 'halway', nx: 3.783, nz: -20.549, ny: -2.699 },
    { id: 118, type: 'halway', nx: 3.766, nz: -22.969, ny: -2.699 },
    { id: 119, type: 'halway', nx: 3.630, nz: -25.201, ny: -2.699 },
    { id: 120, type: 'halway', nx: 0.230, nz: -26.110, ny: -2.699 },
    { id: 121, type: 'halway', nx: -2.009, nz: -25.759, ny: -2.699 },
    { id: 122, type: 'halway', nx: -1.600, nz: -27.931, ny: -2.699 },
    { id: 123, type: 'halway', nx: -1.512, nz: -31.432, ny: -2.699 },
    { id: 124, type: 'halway', nx: -1.290, nz: -34.217, ny: -2.699 },
    { id: 125, type: 'squashcourtconnection', nx: -4.274, nz: -34.545, ny: -2.699 },
    { id: 126, type: 'squashcourtconnection', nx: -7.669, nz: -34.680, ny: -2.699 },
    { id: 127, type: 'squashcourtconnection', nx: -10.356, nz: -34.696, ny: -2.699 },
    { id: 128, type: 'squashcourtconnection', nx: -13.446, nz: -34.824, ny: -2.699 },
    { id: 129, type: 'squashcourtconnection', nx: -13.661, nz: -30.266, ny: -2.699 },
    { id: 130, type: 'weightroom connection', nx: 6.913, nz: 7.422, ny: -2.699 },
    { id: 131, type: 'weightroom connection', nx: 10.389, nz: 7.471, ny: -2.699 },
    { id: 132, type: 'weightroom connection', nx: 15.891, nz: 7.532, ny: -2.699 },
    { id: 133, type: 'weightroom connection', nx: 15.832, nz: 3.786, ny: -2.699 },
    { id: 134, type: 'weightroom connection', nx: 16.008, nz: 1.307, ny: -2.699 },
    { id: 135, type: 'weightroom connection', nx: 16.250, nz: -1.154, ny: -2.699 },
    { id: 136, type: 'golfcourtconnection', nx: 6.860, nz: 9.990, ny: -2.699 },
    { id: 137, type: 'halway', nx: 11.212, nz: 9.897, ny: -2.699 },
    { id: 138, type: 'boxingroomconnection', nx: 14.994, nz: 10.059, ny: -2.699 },
    { id: 139, type: 'halway', nx: 18.148, nz: 9.896, ny: -2.699 },
    { id: 140, type: 'halway', nx: 20.216, nz: 9.838, ny: -2.699 },
    { id: 141, type: 'halway', nx: 21.552, nz: 10.029, ny: -2.699 },
    { id: 142, type: 'halway', nx: 23.351, nz: 9.995, ny: -2.699 },
    { id: 143, type: 'halway', nx: 25.382, nz: 10.125, ny: -2.699 },
    { id: 144, type: 'halway', nx: 26.963, nz: 9.937, ny: -2.699 },
    { id: 145, type: 'halway', nx: 28.448, nz: 9.735, ny: -2.699 },
    { id: 146, type: 'stairsconnection', nx: 28.430, nz: 8.694, ny: -2.699 },
    { id: 147, type: 'stairsconnection', nx: 28.464, nz: 7.244, ny: -2.699 },
    { id: 148, type: 'stairsconnection', nx: 28.467, nz: 5.683, ny: -2.699 },
    { id: 149, type: 'halway', nx: 2.102, nz: 10.920, ny: -2.699 },
    { id: 150, type: 'halway', nx: -0.070, nz: 10.872, ny: -2.699 },
    { id: 151, type: 'halway', nx: -1.815, nz: 10.974, ny: -2.699 },
    { id: 152, type: 'halway', nx: -3.516, nz: 10.953, ny: -2.699 },
    { id: 153, type: 'halway', nx: -5.550, nz: 11.256, ny: -2.699 },
    { id: 154, type: 'halway', nx: -7.501, nz: 11.410, ny: -2.699 },
    { id: 155, type: 'halway', nx: -9.304, nz: 11.356, ny: -2.699 },
    { id: 156, type: 'halway', nx: -10.844, nz: 11.471, ny: -2.699 },
    { id: 157, type: 'halway', nx: -12.300, nz: 11.423, ny: -2.699 },
    { id: 158, type: 'halway', nx: -14.136, nz: 11.816, ny: -2.699 },
    { id: 159, type: 'm.changingroomconection', nx: -15.364, nz: 13.258, ny: -2.699 },
    { id: 160, type: 'm.changingroomconection', nx: -15.167, nz: 15.867, ny: -2.699 },
    { id: 161, type: 'm.changingroomconection', nx: -13.235, nz: 15.805, ny: -2.699 },
    { id: 162, type: 'm.changingroomconection', nx: -11.724, nz: 15.868, ny: -2.699 },
    { id: 163, type: 'w.changingroomconection', nx: -15.003, nz: 17.607, ny: -2.699 },
    { id: 164, type: 'w.changingroomconection', nx: -13.022, nz: 17.785, ny: -2.699 },
    { id: 165, type: 'w.changingroomconection', nx: -11.687, nz: 17.929, ny: -2.699 },
    { id: 166, type: 'halway', nx: 5.485, nz: 10.096, ny: -2.699 },
    { id: 167, type: 'golfcourtconnection', nx: 8.332, nz: 10.209, ny: -2.699 },
    { id: 168, type: 'golfcourtconnection', nx: 8.407, nz: 11.803, ny: -2.699 },
    { id: 169, type: 'golfcourtconnection', nx: 8.378, nz: 13.349, ny: -2.699 },
    { id: 170, type: 'halway', nx: 13.203, nz: 9.956, ny: -2.699 },
    { id: 171, type: 'boxingroomconection', nx: 14.896, nz: 11.774, ny: -2.699 },
    { id: 172, type: 'boxingroomconection', nx: 14.666, nz: 13.632, ny: -2.699 },
    { id: 173, type: 'stretchingroomconection', nx: 20.397, nz: 11.532, ny: -2.699 },
    { id: 174, type: 'stretchingroomconection', nx: 20.373, nz: 12.778, ny: -2.699 },
    { id: 175, type: 'stretchingroomconection', nx: 20.511, nz: 14.238, ny: -2.699 },
    { id: 176, type: 'spinningroomconection', nx: 27.065, nz: 11.507, ny: -2.699 },
    { id: 177, type: 'spinningroomconection', nx: 26.978, nz: 12.932, ny: -2.699 },
    { id: 178, type: 'spinningroomconection', nx: 26.951, nz: 14.374, ny: -2.699 },
    { id: 179, type: 'stairsconection', nx: 1.935, nz: 9.674, ny: -2.699 },
    { id: 180, type: 'stairsconnection', nx: 1.894, nz: 8.444, ny: -2.699 },
    { id: 181, type: 'squashcourtconnection', nx: -13.493, nz: -32.581, ny: -2.699 },
    { id: 182, type: 'stairsconnection', nx: -16.344, nz: -34.765, ny: -2.699 },
    { id: 183, type: 'stairsconnection', nx: -18.329, nz: -34.479, ny: -2.699 },
    { id: 184, type: 'stairsconnection', nx: -20.023, nz: -34.434, ny: -2.699 },
    { id: 185, type: 'stairsconnection', nx: -21.987, nz: -34.224, ny: -2.699 },
    { id: 186, type: 'stairsconnection', nx: -24.579, nz: -34.981, ny: -2.699 },
    { id: 187, type: 'w.lockerroomconnection', nx: 2.386, nz: -0.980, ny: 1.176 },
    { id: 188, type: 'w.lockerroomconnection', nx: 1.264, nz: -0.972, ny: -2.699 },
    { id: 189, type: 'w.lockerroomconnection', nx: 0.267, nz: -0.815, ny: -2.699 },
    { id: 190, type: 'w.lockerroomconnection', nx: -0.716, nz: -0.627, ny: -2.699 },
    { id: 191, type: 'M.lockerroomconnection', nx: 2.035, nz: -10.768, ny: -2.699 },
    { id: 192, type: 'M.lockerroomconnection', nx: 0.934, nz: -10.813, ny: -2.699 },
    { id: 193, type: 'M.lockerroomconnection', nx: -0.116, nz: -10.701, ny: -2.699 },
    { id: 194, type: 'swimmingpoolconnection', nx: -14.335, nz: 10.203, ny: -2.699 },
    { id: 196, type: 'swimmingpoolconnection', nx: -14.422, nz: 7.511, ny: -2.699 },
    { id: 197, type: 'swimmingpoolconnection', nx: -14.618, nz: 4.905, ny: -2.699 },
    { id: 198, type: 'swimmingpoolconnection', nx: -14.724, nz: 2.616, ny: -2.699 },
    { id: 199, type: 'swimmingpoolconnection', nx: -14.591, nz: 0.915, ny: -2.699 },

    // ═════════════════════════════════════════════════════════════
    // FLOOR 2 TRACED PATHS
    // ═════════════════════════════════════════════════════════════

    // PATH 1: Gymnasium ↔ Dance Studio (ids 200–206)
    { id: 200, type: 'f2_gym_dance', nx: 4.492,   nz: -14.997, ny: -1.774 },
    { id: 201, type: 'f2_gym_dance', nx: 2.619,   nz: -15.099, ny: -1.774 },
    { id: 202, type: 'f2_gym_dance', nx: -0.189,  nz: -15.408, ny: -1.774 },
    { id: 203, type: 'f2_gym_dance', nx: -1.788,  nz: -15.460, ny: -1.774 },
    { id: 204, type: 'f2_gym_dance', nx: -3.345,  nz: -14.843, ny: -0.759 },
    { id: 205, type: 'f2_gym_dance', nx: -4.910,  nz: -15.869, ny: -1.768 },
    { id: 206, type: 'f2_gym_dance', nx: -7.250,  nz: -15.869, ny: -1.768 },

    // PATH 2: Lobby stairs → Gymnasium (ids 210–226)
    { id: 210, type: 'f2_lobby_gym', nx: -12.569, nz: 3.057,   ny: -1.855 },
    { id: 211, type: 'f2_lobby_gym', nx: -12.512, nz: 4.678,   ny: -1.855 },
    { id: 212, type: 'f2_lobby_gym', nx: -10.895, nz: 4.678,   ny: -1.855 },
    { id: 213, type: 'f2_lobby_gym', nx: -8.027,  nz: 4.579,   ny: -1.855 },
    { id: 214, type: 'f2_lobby_gym', nx: -5.592,  nz: 4.379,   ny: -1.855 },
    { id: 215, type: 'f2_lobby_gym', nx: -3.636,  nz: 3.722,   ny: -1.855 },
    { id: 216, type: 'f2_lobby_gym', nx: -2.364,  nz: 2.539,   ny: -1.855 },
    { id: 217, type: 'f2_lobby_gym', nx: -0.785,  nz: 2.539,   ny: -1.855 },
    { id: 218, type: 'f2_lobby_gym', nx: -0.407,  nz: 2.398,   ny: -0.925 },
    { id: 219, type: 'f2_lobby_gym', nx: -0.090,  nz: -0.609,  ny: -1.774 },
    { id: 220, type: 'f2_lobby_gym', nx: 0.079,   nz: -3.763,  ny: -1.774 },
    { id: 221, type: 'f2_lobby_gym', nx: 0.444,   nz: -6.872,  ny: -1.774 },
    { id: 222, type: 'f2_lobby_gym', nx: 0.752,   nz: -10.242, ny: -1.774 },
    { id: 223, type: 'f2_lobby_gym', nx: 1.046,   nz: -12.985, ny: -1.774 },
    { id: 224, type: 'f2_lobby_gym', nx: 2.443,   nz: -13.835, ny: -1.774 },
    { id: 225, type: 'f2_lobby_gym', nx: 3.014,   nz: -13.835, ny: -1.774 },
    { id: 226, type: 'f2_lobby_gym', nx: 3.858,   nz: -13.907, ny: -1.774 },

    // PATH 3: W. Locker stairs → Gymnasium (ids 230–238)
    { id: 230, type: 'f2_wlocker_gym', nx: -3.731, nz: -8.021,  ny: -1.852 },
    { id: 231, type: 'f2_wlocker_gym', nx: -2.478, nz: -7.658,  ny: -1.278 },
    { id: 232, type: 'f2_wlocker_gym', nx: -0.623, nz: -8.337,  ny: -1.774 },
    { id: 233, type: 'f2_wlocker_gym', nx: 0.761,  nz: -8.684,  ny: -1.774 },
    { id: 234, type: 'f2_wlocker_gym', nx: 2.356,  nz: -8.634,  ny: -1.774 },
    { id: 235, type: 'f2_wlocker_gym', nx: 4.086,  nz: -9.233,  ny: -1.774 },
    { id: 236, type: 'f2_wlocker_gym', nx: 5.381,  nz: -9.434,  ny: -1.774 },
    { id: 237, type: 'f2_wlocker_gym', nx: 5.656,  nz: -11.021, ny: -1.774 },
    { id: 238, type: 'f2_wlocker_gym', nx: 5.701,  nz: -12.977, ny: -1.774 },

    // PATH 4: W. Locker stairs → Dance Studio (ids 240–244)
    { id: 240, type: 'f2_wlocker_dance', nx: -6.659,  nz: -7.132,  ny: -1.318 },
    { id: 241, type: 'f2_wlocker_dance', nx: -8.330,  nz: -7.736,  ny: -1.768 },
    { id: 242, type: 'f2_wlocker_dance', nx: -10.578, nz: -8.235,  ny: -1.768 },
    { id: 243, type: 'f2_wlocker_dance', nx: -11.713, nz: -9.883,  ny: -1.768 },
    { id: 244, type: 'f2_wlocker_dance', nx: -12.041, nz: -11.576, ny: -1.768 },

    // PATH 5: M. Locker stairs → Dance Studio (ids 250–255)
    { id: 250, type: 'f2_mlocker_dance', nx: -5.226,  nz: -15.926, ny: -1.768 },
    { id: 251, type: 'f2_mlocker_dance', nx: -6.334,  nz: -14.485, ny: 0.090 },
    { id: 252, type: 'f2_mlocker_dance', nx: -7.473,  nz: -16.237, ny: -1.768 },
    { id: 253, type: 'f2_mlocker_dance', nx: -8.816,  nz: -15.794, ny: -1.768 },
    { id: 254, type: 'f2_mlocker_dance', nx: -10.304, nz: -15.356, ny: -1.768 },
    { id: 255, type: 'f2_mlocker_dance', nx: -10.984, nz: -15.182, ny: -1.768 },

    // PATH 6: M. Locker → Gymnasium bridge (ids 260–262)
    { id: 260, type: 'f2_mlocker_gym', nx: -9.324,  nz: -15.402, ny: -1.768 },
    { id: 261, type: 'f2_mlocker_gym', nx: -10.662, nz: -15.145, ny: -1.768 },
    { id: 262, type: 'f2_mlocker_gym', nx: -12.270, nz: -15.351, ny: -1.768 }
  ];

  NEW_NODES.forEach(n => WAYPOINTS.push(n));

  const waypointMap = {};
  WAYPOINTS.forEach(w => waypointMap[w.id] = w);

  const _dist = (n1, n2) => Math.hypot(n1.nx - n2.nx, n1.nz - n2.nz);
  const CONNECTIONS = [];

  const graphNodes = NEW_NODES;
  const halwayNodes = graphNodes.filter(g => g.type === 'halway');

  // 1. Weave identical groups cleanly within 6.5 meters natively (fixes large trace gaps)
  for (let i = 0; i < graphNodes.length; i++) {
    for (let j = i + 1; j < graphNodes.length; j++) {
      const A = graphNodes[i], B = graphNodes[j];
      if (_dist(A, B) < 6.5) {
        if (A.type === 'halway' && B.type === 'halway') CONNECTIONS.push([A.id, B.id]);
        else if (A.type === B.type && A.type !== 'halway') CONNECTIONS.push([A.id, B.id]);
      }
    }
  }

  // 2. Safely bridge each isolated Room-Connection group into the nearest available Hallway skeleton point linearly
  const uniqueTypes = [...new Set(graphNodes.filter(g => g.type !== 'halway').map(g => g.type))];
  uniqueTypes.forEach(type => {
    const typeNodes = graphNodes.filter(g => g.type === type);
    let bestRoomNode = null, bestHallNode = null, minD = Infinity;

    typeNodes.forEach(rn => {
      halwayNodes.forEach(hn => {
        let d = _dist(rn, hn);
        if (d < minD) { minD = d; bestRoomNode = rn; bestHallNode = hn; }
        if (d < 3.2) CONNECTIONS.push([rn.id, hn.id]);
      });
    });
    if (bestRoomNode && bestHallNode) CONNECTIONS.push([bestRoomNode.id, bestHallNode.id]);
  });

  // Manual bridges for stair routes that need to traverse the squash-side corridor.
  CONNECTIONS.push([181, 182]);
  CONNECTIONS.push([181, 183]);
  CONNECTIONS.push([145, 146]);
  CONNECTIONS.push([146, 147]);
  CONNECTIONS.push([147, 148]);
  CONNECTIONS.push([37, 188]);
  CONNECTIONS.push([38, 191]);

  // ═════════════════════════════════════════════════════════════
  // FLOOR 2 TRACED PATHS — Waypoint Connections
  // ═════════════════════════════════════════════════════════════

  // PATH 1: Gymnasium ↔ Dance Studio chain
  CONNECTIONS.push([900, 200]);   // Gymnasium → path start
  CONNECTIONS.push([200, 201]);
  CONNECTIONS.push([201, 202]);
  CONNECTIONS.push([202, 203]);
  CONNECTIONS.push([203, 204]);
  CONNECTIONS.push([204, 205]);
  CONNECTIONS.push([205, 206]);
  CONNECTIONS.push([206, 901]);   // path end   Dance Studio
  CONNECTIONS.push([900, 901]);   // direct Gymnasium ↔ Dance Studio bridge

  // PATH 2: Lobby stairs → Gymnasium chain
  CONNECTIONS.push([903, 210]);   // Lobby Stairs hotspot → path start
  CONNECTIONS.push([36, 903]);    // Floor 1 lobby stairs → Floor 2 lobby stairs
  CONNECTIONS.push([210, 211]);
  CONNECTIONS.push([211, 212]);
  CONNECTIONS.push([212, 213]);
  CONNECTIONS.push([213, 214]);
  CONNECTIONS.push([214, 215]);
  CONNECTIONS.push([215, 216]);
  CONNECTIONS.push([216, 217]);
  CONNECTIONS.push([217, 218]);
  CONNECTIONS.push([218, 219]);
  CONNECTIONS.push([219, 220]);
  CONNECTIONS.push([220, 221]);
  CONNECTIONS.push([221, 222]);
  CONNECTIONS.push([222, 223]);
  CONNECTIONS.push([223, 224]);
  CONNECTIONS.push([224, 225]);
  CONNECTIONS.push([225, 226]);
  CONNECTIONS.push([226, 900]);   // path end → Gymnasium

  // PATH 3: W. Locker stairs → Gymnasium chain
  CONNECTIONS.push([37, 230]);   // Floor 1 W. locker stairs → Floor 2 W. locker stairs
  CONNECTIONS.push([230, 231]);
  CONNECTIONS.push([231, 232]);
  CONNECTIONS.push([232, 233]);
  CONNECTIONS.push([233, 234]);
  CONNECTIONS.push([234, 235]);
  CONNECTIONS.push([235, 236]);
  CONNECTIONS.push([236, 237]);
  CONNECTIONS.push([237, 238]);
  CONNECTIONS.push([238, 900]);   // path end → Gymnasium
  // Bridge start of path 3 into path 4 (they share the stairs area)
  CONNECTIONS.push([230, 240]);

  // PATH 4: W. Locker stairs → Dance Studio chain
  CONNECTIONS.push([240, 241]);
  CONNECTIONS.push([241, 242]);
  CONNECTIONS.push([242, 243]);
  CONNECTIONS.push([243, 244]);
  CONNECTIONS.push([244, 901]);   // path end → Dance Studio

  // PATH 5: M. Locker stairs → Dance Studio chain
  CONNECTIONS.push([38, 250]);   // Floor 1 M. locker stairs → Floor 2 M. locker stairs
  CONNECTIONS.push([250, 251]);
  CONNECTIONS.push([251, 252]);
  CONNECTIONS.push([252, 253]);
  CONNECTIONS.push([253, 254]);
  CONNECTIONS.push([254, 255]);
  CONNECTIONS.push([255, 901]);   // path end → Dance Studio
  // Bridge path 5 into path 6 (they share the M. locker area)
  CONNECTIONS.push([250, 260]);

  // PATH 6: M. Locker → Gymnasium bridge chain
  CONNECTIONS.push([260, 261]);
  CONNECTIONS.push([261, 262]);
  CONNECTIONS.push([262, 900]);   // path end → Gymnasium

  // ── Cross-path bridges (shared corridor junctions) ──
  // Path 2 corridor passes near path 1 — bridge at the gymnasium end
  CONNECTIONS.push([226, 200]);   // lobby→gym path meets gym→dance path start
  // Path 3 corridor passes near path 1 — bridge at gymnasium end
  CONNECTIONS.push([238, 200]);   // wlocker→gym path meets gym→dance path start
  // Path 5/6 meet path 1 at Dance Studio end
  CONNECTIONS.push([206, 255]);   // gym→dance end meets mlocker→dance end
  CONNECTIONS.push([206, 244]);   // gym→dance end meets wlocker→dance end

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
    const viable = graphNodes.filter(g => aliases.includes(g.type)).sort((a, b) => _dist(room, a) - _dist(room, b));
    if (viable.length > 0) CONNECTIONS.push([room.id, viable[0].id]);
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
  let currentFullRoutePathIds = [];
  let routeDrawLoop = null;
  let routeTraceStart = 0;
  let routeTraceDuration = 0;
  let routeRunnerStarted = false;

  function getNodeFloor(id) {
    if ((id >= 200 && id < 300) || id === 900 || id === 901 || id === 903) return 2;
    return 1;
  }

  function getRouteSegmentForFloor(pathIds, floor) {
    if (!pathIds || pathIds.length < 2) return [];
    const startIndex = pathIds.findIndex(id => getNodeFloor(id) === floor);
    if (startIndex === -1) return [];
    let endIndex = startIndex;
    while (endIndex + 1 < pathIds.length && getNodeFloor(pathIds[endIndex + 1]) === floor) {
      endIndex++;
    }
    return pathIds.slice(startIndex, endIndex + 1);
  }

  function clearRoute(resetFull = true) {
    if (routeSVG) routeSVG.innerHTML = '';
    document.querySelectorAll('.routing-hotspot').forEach(el => el.remove());
    if (routeDrawLoop) {
      cancelAnimationFrame(routeDrawLoop);
      routeDrawLoop = null;
    }
    routeTraceStart = 0;
    routeTraceDuration = 0;
    routeRunnerStarted = false;
    currentRoutePathIds = [];
    if (resetFull) currentFullRoutePathIds = [];
  }

  function drawRoute(pathIds) {
    clearRoute(false);
    if (!pathIds || pathIds.length < 2) return;

    currentRoutePathIds = pathIds;
    routeTraceStart = performance.now();
    routeTraceDuration = 0;
    routeRunnerStarted = false;

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

  function renderRouteForCurrentFloor() {
    const floor = window.currentFloor || 1;
    const segment = getRouteSegmentForFloor(currentFullRoutePathIds, floor);
    drawRoute(segment);
  }

  function loopRouteSVG() {
    if (currentRoutePathIds && currentRoutePathIds.length > 0) {
      updateRouteSVG();
      routeDrawLoop = requestAnimationFrame(loopRouteSVG);
    } else {
      routeDrawLoop = null;
    }
  }

  function simplifyPath(pts, epsilon) {
    if (pts.length <= 2) return pts;
    let dmax = 0;
    let index = 0;
    const end = pts.length - 1;
    for (let i = 1; i < end; i++) {
      const p = pts[i], a = pts[0], b = pts[end];
      const num = Math.abs((b.y - a.y) * p.x - (b.x - a.x) * p.y + b.x * a.y - b.y * a.x);
      const den = Math.hypot(b.y - a.y, b.x - a.x) || 1;
      const d = num / den;
      if (d > dmax) { dmax = d; index = i; }
    }
    if (dmax > epsilon) {
      const rec1 = simplifyPath(pts.slice(0, index + 1), epsilon);
      const rec2 = simplifyPath(pts.slice(index), epsilon);
      return rec1.slice(0, -1).concat(rec2);
    } else {
      return [pts[0], pts[end]];
    }
  }

  function updateRouteSVG() {
    if (!currentRoutePathIds || currentRoutePathIds.length < 2) return;

    // Pull the absolute screen coordinates rendered natively by model-viewer's projection matrix
    const rawPoints = currentRoutePathIds.map(id => {
      const h = mv.querySelector(`[slot="hotspot-route-${id}"]`);
      if (!h) return null;
      const rect = h.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0 && rect.left === 0) return null; // ModelViewer parses pending slots
      return { x: rect.left, y: rect.top };
    }).filter(p => p !== null);

    if (rawPoints.length < 2) return;

    // Simplify points to create straight lines and sharp 90-degree-like turns (removes jagged micro-jitters)
    const points = simplifyPath(rawPoints, 10);

    // Ensure perfectly straight segments natively matching original coordinates unconditionally
    const d = points.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(' ');

    if (!routeSVG) return;

    let mainPath = document.getElementById('animated-route-path');
    let revealPath = document.getElementById('route-reveal-path');
    let startCircle = routeSVG.querySelector('.route-start');
    let endCircle = routeSVG.querySelector('.route-end');
    let routeRunner = document.getElementById('route-runner');
    let routeRunnerMotion = document.getElementById('route-runner-motion');

    if (!mainPath) {
      // Native angular trace using dotted red layout globally plus small animating box tracer sequence
      routeSVG.innerHTML = `
        <defs>
          <path id="route-path-ref"></path>
          <mask id="route-reveal-mask">
            <rect width="100%" height="100%" fill="black"></rect>
            <path id="route-reveal-path" stroke="white" stroke-width="16" fill="none" stroke-linecap="square" stroke-linejoin="miter"></path>
          </mask>
        </defs>
        <path id="animated-route-path" stroke="#E31837" stroke-dasharray="6 5" stroke-width="6" fill="none" stroke-linecap="square" stroke-linejoin="miter" mask="url(#route-reveal-mask)"></path>
        <circle class="route-start" r="6" fill="#1D9E75" stroke="white" stroke-width="2"></circle>
        <circle class="route-end" r="6" fill="#E31837" stroke="white" stroke-width="2" opacity="0"></circle>
        <rect id="route-runner" width="12" height="12" fill="#E31837" x="-6" y="-6" rx="2" ry="2" stroke="white" stroke-width="2" filter="drop-shadow(0 0 6px rgba(227,24,55,0.8))" opacity="0">
          <animateMotion id="route-runner-motion" begin="indefinite" dur="3.5s" repeatCount="indefinite">
             <mpath href="#route-path-ref"/>
          </animateMotion>
        </rect>
      `;
      mainPath = document.getElementById('animated-route-path');
      revealPath = document.getElementById('route-reveal-path');
      startCircle = routeSVG.querySelector('.route-start');
      endCircle = routeSVG.querySelector('.route-end');
      routeRunner = document.getElementById('route-runner');
      routeRunnerMotion = document.getElementById('route-runner-motion');
    }

    mainPath.setAttribute('d', d);
    routeSVG.querySelector('#route-path-ref').setAttribute('d', d);
    revealPath.setAttribute('d', d);
    startCircle.setAttribute('cx', points[0].x);
    startCircle.setAttribute('cy', points[0].y);
    endCircle.setAttribute('cx', points[points.length - 1].x);
    endCircle.setAttribute('cy', points[points.length - 1].y);

    const totalLength = revealPath.getTotalLength();
    if (!routeTraceDuration) {
      routeTraceDuration = Math.min(2200, Math.max(900, totalLength * 4));
    }

    const elapsed = Math.max(0, performance.now() - routeTraceStart);
    const progress = Math.min(elapsed / routeTraceDuration, 1);
    const revealedLength = totalLength * progress;
    const hiddenLength = Math.max(totalLength - revealedLength, 0.001);

    revealPath.style.strokeDasharray = `${revealedLength} ${hiddenLength}`;
    revealPath.style.strokeDashoffset = '0';
    endCircle.style.opacity = progress > 0.96 ? '1' : '0';

    if (progress >= 1) {
      routeRunner.style.opacity = '1';
      if (!routeRunnerStarted && routeRunnerMotion) {
        routeRunnerStarted = true;
        routeRunnerMotion.beginElement();
      }
    } else {
      routeRunner.style.opacity = '0';
    }
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
      mv.setAttribute('min-camera-orbit', '360deg 45deg 40m');
      mv.setAttribute('max-camera-orbit', '360deg 45deg 180m');
      mv.setAttribute('zoom-sensitivity', MOBILE_ZOOM_SENSITIVITY);
      mv.setAttribute('interpolation-decay', QUICK_TRANSITION_DECAY);
    } else {
      mv.removeAttribute('disable-pan');
      mv.setAttribute('min-camera-orbit', '360deg 45deg 20m');
      mv.setAttribute('max-camera-orbit', '360deg 45deg 150m');
      mv.setAttribute('zoom-sensitivity', DESKTOP_ZOOM_SENSITIVITY);
      mv.setAttribute('interpolation-decay', QUICK_TRANSITION_DECAY);
    }
    mv.autoRotate = false;
  }

  function enterHotspotOrbitMode() {
    enterLockedMode();
    applyQuickCameraTransition();
  }

  function enterItineraryTopView() {
    isItineraryMode = true;
    mv.removeAttribute('disable-pan');
    mv.setAttribute('zoom-sensitivity', TOP_VIEW_ZOOM_SENSITIVITY);
    applyQuickCameraTransition();
    mv.setAttribute('min-camera-orbit', '0deg 0deg 55m');
    mv.setAttribute('max-camera-orbit', '0deg 0deg 150m');
    // Zoom out to show all hotspots
    mv.cameraOrbit = '0deg 0deg 120m';
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
    const descEl = document.getElementById('info-desc');
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
    const closeBtn = document.getElementById('info-close-btn');
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

  const routeState = {
    mode: 'normal',
    startHotspot: null,
    startNodeId: null,
    destinationHotspot: null,
  };

  const SLOT_TO_NODE_ID = {
    'hotspot-2': 24,
    'hotspot-20': 26,
    'hotspot-9': 25,
    'hotspot-5': 27,
    'hotspot-6': 28,
    'hotspot-4': 29,
    'hotspot-3': 30,
    'hotspot-18': 31,
    'hotspot-10': 32,
    'hotspot-11': 33,
    'hotspot-7': 34,
    'hotspot-8': 35,
    'hotspot-21': 36,
    'hotspot-22': 37,
    'hotspot-23': 38,
    'hotspot-gymnasium': 900,
    'hotspot-dance-studio': 901,
    'hotspot-back-stairs-f2': 903,
    'hotspot-stairs-new-1': 230,   // M. Locker Stairs → PATH 3 (W.locker→gym) — was incorrectly 250
    'hotspot-stairs-new-2': 250,   // W. Locker Stairs → PATH 5 (M.locker→dance) — was incorrectly 230
  };

  let navigatePopupEl = null;
  let navigatePopupHotspot = null;

  function ensureNavigatePopup() {
    if (navigatePopupEl) return navigatePopupEl;

    navigatePopupEl = document.createElement('div');
    navigatePopupEl.id = 'navigate-popup';
    navigatePopupEl.innerHTML = `
      <div class="nav-btn-wrapper">
        <button class="nav-btn" id="nav-start-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 10 4 15 9 20"></polyline>
            <path d="M20 4v7a4 4 0 0 1-4 4H4"></path>
          </svg>
          Navigate from here
        </button>
      </div>
    `;
    document.body.appendChild(navigatePopupEl);
    return navigatePopupEl;
  }

  window.onAfterFloorSwitch = () => {
    if (currentFullRoutePathIds.length > 1) {
      renderRouteForCurrentFloor();
    }
    if (routeState.mode === 'selectingDestination' && routeState.startHotspot) {
      highlightSelectableHotspots(routeState.startHotspot);
      positionNavigatePopup();
    }
  };

  function hideNavigatePopup() {
    if (navigatePopupEl) navigatePopupEl.classList.remove('visible');
  }

  function positionNavigatePopup(hotspotEl = navigatePopupHotspot) {
    if (!navigatePopupEl || !hotspotEl) return;

    const rect = hotspotEl.getBoundingClientRect();
    if (rect.width <= 0 && rect.height <= 0) {
      hideNavigatePopup();
      return;
    }

    const popupRect = navigatePopupEl.getBoundingClientRect();
    const left = Math.min(
      window.innerWidth - popupRect.width - 12,
      Math.max(12, rect.left + (rect.width / 2) - (popupRect.width / 2))
    );
    const top = Math.max(12, rect.top - popupRect.height - 14);

    navigatePopupEl.style.left = `${left}px`;
    navigatePopupEl.style.top = `${top}px`;
  }

  function showNavigatePopup(hotspotEl) {
    if (hotspotEl.classList.contains('legend-only-hotspot')) return;

    const slot = hotspotEl.slot;
    if (!SLOT_TO_NODE_ID[slot]) return;

    const popup = ensureNavigatePopup();
    popup.classList.add('visible');
    navigatePopupHotspot = hotspotEl;
    requestAnimationFrame(() => positionNavigatePopup(hotspotEl));

    const startBtn = popup.querySelector('#nav-start-btn');
    if (startBtn) {
      startBtn.onclick = (e) => {
        e.stopPropagation();
        if (navigatePopupHotspot) startRouteMode(navigatePopupHotspot);
      };
    }
  }

  function startRouteMode(fromHotspot) {
    routeState.mode = 'selectingDestination';
    routeState.startHotspot = fromHotspot;
    routeState.startNodeId = SLOT_TO_NODE_ID[fromHotspot.slot];
    routeState.destinationHotspot = null;

    const card = document.getElementById('info-dropdown-content');
    if (card) card.classList.remove('force-show');
    hideNavigatePopup();

    const label = fromHotspot.querySelector('.hotspot-label')?.textContent?.trim() || 'here';
    const currentFloor = parseInt(fromHotspot.dataset.floor || `${window.currentFloor || 1}`, 10);
    const otherFloor = currentFloor === 1 ? 2 : 1;
    showRouteBanner(`<div class="route-banner-text">Starting from <strong>${label}</strong> - tap any destination</div>
      <button class="route-banner-floor" onclick="window.switchFloor && window.switchFloor(${otherFloor})">Go to Floor ${otherFloor}</button>`);
    highlightSelectableHotspots(fromHotspot);
  }

  function handleRouteDestinationClick(hotspotEl) {
    if (routeState.mode !== 'selectingDestination') return false;

    if (hotspotEl === routeState.startHotspot) {
      exitRouteMode();
      return true;
    }

    const destNodeId = SLOT_TO_NODE_ID[hotspotEl.slot];
    if (!destNodeId) return false;

    routeState.destinationHotspot = hotspotEl;
    executeRoute(routeState.startNodeId, destNodeId, routeState.startHotspot, hotspotEl);
    return true;
  }

  function executeRoute(startId, endId, startEl, endEl) {
    const startLabel = startEl?.querySelector('.hotspot-label')?.textContent?.trim() || '?';
    const endLabel = endEl?.querySelector('.hotspot-label')?.textContent?.trim() || '?';
    const startFloor = parseInt(startEl?.dataset.floor || '1', 10);
    const endFloor = parseInt(endEl?.dataset.floor || '1', 10);

    enterItineraryTopView();
    requestAnimationFrame(() => {
      mv.cameraOrbit = '0deg 0deg 160m';   // zoom out further to show all hotspots
      mv.cameraTarget = '0m -1.3m 0m';     // center the view on the whole floor
      mv.fieldOfView = '75deg';            // wider FOV to show more
    });

    const pathIds = astar(startId, endId);
    console.log(`[Route] ${startLabel} (${startId}) -> ${endLabel} (${endId}) | nodes:`, pathIds);

    if (pathIds && pathIds.length > 0) {
      currentFullRoutePathIds = pathIds;
      renderRouteForCurrentFloor();
      const floorCta = startFloor !== endFloor
        ? `<button class="route-banner-floor" onclick="window.switchFloor && window.switchFloor(${endFloor})">Go to Floor ${endFloor}</button>`
        : '';
      showRouteBanner(`<div class="route-banner-text"><strong>${startLabel}</strong> -> <strong>${endLabel}</strong></div>
        ${floorCta}
        <button class="route-banner-close" onclick="exitRouteMode()">Clear</button>`);
    } else {
      showRouteBanner(`<div class="route-banner-text">No path found between ${startLabel} and ${endLabel}.</div>
        <button class="route-banner-close" onclick="exitRouteMode()">Close</button>`);
      console.warn(`[Route] No path: check CONNECTIONS for ${startId} <-> ${endId}`);
    }

    exitRouteSelectionMode();
  }

  function exitRouteSelectionMode() {
    routeState.mode = 'normal';
    clearHighlights();
  }

  function exitRouteMode() {
    routeState.mode = 'normal';
    routeState.startHotspot = null;
    routeState.startNodeId = null;
    routeState.destinationHotspot = null;
    clearHighlights();
    hideRouteBanner();
    hideNavigatePopup();
    clearRoute();
    currentRoutePathIds = [];
    currentFullRoutePathIds = [];
  }
  window.exitRouteMode = exitRouteMode;

  function highlightSelectableHotspots(excludeEl) {
    document.querySelectorAll('.Hotspot').forEach(h => {
      if (h === excludeEl) {
        h.classList.add('route-origin');
        return;
      }

      const floorMatch = !h.dataset.floor ||
        parseInt(h.dataset.floor, 10) === (window.currentFloor || 1);
      const hasNode = !!SLOT_TO_NODE_ID[h.slot];

      if (floorMatch && hasNode && !h.classList.contains('legend-only-hotspot')) {
        h.classList.add('route-selectable');
        h.classList.remove('faded-out');
      } else {
        h.classList.add('route-dimmed');
      }
    });
  }

  function clearHighlights() {
    document.querySelectorAll('.Hotspot').forEach(h => {
      h.classList.remove('route-selectable', 'route-origin', 'route-dimmed');
    });
  }

  let routeBannerEl = null;

  function showRouteBanner(html) {
    if (!routeBannerEl) {
      routeBannerEl = document.createElement('div');
      routeBannerEl.id = 'route-banner';
      document.body.appendChild(routeBannerEl);
    }
    routeBannerEl.innerHTML = html;
    routeBannerEl.classList.add('visible');
  }

  function hideRouteBanner() {
    if (routeBannerEl) routeBannerEl.classList.remove('visible');
  }

  // ─────────────────────────────────────────
  // HOTSPOT SELECTION
  // ─────────────────────────────────────────
  const selectHotspot = (h) => {
    if (selectedHotspot === h) return;
    isItineraryMode = false;
    selectedHotspot = h;

    document.querySelectorAll('.legend-only-hotspot').forEach(exitHotspot => {
      if (exitHotspot !== h) exitHotspot.classList.remove('legend-only-active');
    });

    hotspots.forEach(other => {
      other.classList.remove('selected');
      other.style.removeProperty('--ping-color');
      const youAreHereMarker = other.querySelector('.you-are-here');
      const hasVisibleYouAreHere = youAreHereMarker && youAreHereMarker.style.display !== 'none';
      if (other !== h && !hasVisibleYouAreHere) {
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

      let recenterHint = marker.querySelector('.hotspot-recenter-hint');
      if (!recenterHint) {
        recenterHint = document.createElement('div');
        recenterHint.className = 'hotspot-recenter-hint';
        recenterHint.innerHTML = `<span class="recenter-hint-hand">👆</span><span>Tap outside to recenter</span>`;
        marker.appendChild(recenterHint);
      }

      recenterHint.classList.add('show-recenter-hint');
      if (h._recenterHintTimer) clearTimeout(h._recenterHintTimer);
      h._recenterHintTimer = setTimeout(() => {
        recenterHint.classList.remove('show-recenter-hint');
      }, 3200);
    }

    // ── Camera: pan to the hotspot position, keep the starting angle (360deg 45deg),
    //    just bring radius in slightly for a subtle zoom focus.
    const pos = h.dataset.target || h.dataset.position; // e.g. "14.43m -1.05m 16.70m"
    if (pos) {
      const parts = pos.split(' ');
      if (parts.length === 3) {
        const x = parseFloat(parts[0]);
        const y = parseFloat(parts[1]);
        const z = parseFloat(parts[2]);
        // Keep scripted moves quick but smooth.
        applyQuickCameraTransition();

        // Set target to the hotspot — keeps same vertical/horizontal camera angle natively
        mv.cameraTarget = `${x}m ${y}m ${z}m`;
        // Slight zoom in: from 100m → 65m
        if (window.innerWidth <= 768) {
          mv.cameraOrbit = "360deg 45deg 65m";
        } else {
          // Desktop: bring radius in but allow orbit freedom
          const currentOrbit = mv.getCameraOrbit();
          const theta = (currentOrbit.theta * 180 / Math.PI).toFixed(1);
          const phi = (currentOrbit.phi * 180 / Math.PI).toFixed(1);
          mv.cameraOrbit = `${theta}deg ${phi}deg 65m`;
        }
      }
    }

    // Keep the selected hotspot active, but preserve navigation until outside click reset.
    enterLockedMode();
    applyQuickCameraTransition();

    mv.autoRotate = false;

    const labelText = h.querySelector('.hotspot-label')?.textContent?.trim() || 'Room Details';
    showInfoCard(labelText);
    showNavigatePopup(h);
  };

  const activateHotspot = async (hotspotEl, { legendOnly = false } = {}) => {
    if (!hotspotEl) return;

    const activationId = ++currentHotspotActivation;
    const targetFloor = hotspotEl.dataset.floor ? parseInt(hotspotEl.dataset.floor, 10) : (window.currentFloor || 1);

    if (typeof window.switchFloor === 'function' && targetFloor !== (window.currentFloor || 1)) {
      await window.switchFloor(targetFloor);
    }

    if (activationId !== currentHotspotActivation) return;

    if (legendOnly) hotspotEl.classList.add('legend-only-active');
    if (typeof navigator.vibrate === 'function') navigator.vibrate(40);
    selectHotspot(hotspotEl);
  };

  window.triggerHotspot = (selector) => {
    const h = document.querySelector(selector);
    if (h) {
      activateHotspot(h);
    }
  };

  window.triggerLegendOnlyHotspot = (selector) => {
    const h = document.querySelector(selector);
    if (h) {
      activateHotspot(h, { legendOnly: true });
    }
  };

  window.triggerLegendOnlyHotspots = () => {
    deselectAll();
    document.querySelectorAll('.legend-only-hotspot').forEach(h => {
      h.classList.add('legend-only-active');
      h.classList.remove('faded-out', 'selected');
    });
    hotspots.forEach(h => {
      const youAreHereMarker = h.querySelector('.you-are-here');
      const hasVisibleYouAreHere = youAreHereMarker && youAreHereMarker.style.display !== 'none';
      if (!h.classList.contains('legend-only-hotspot') && !hasVisibleYouAreHere) {
        h.classList.add('faded-out');
      }
    });
  };

  // ─────────────────────────────────────────
  // DESELECT — always resets camera to start
  // ─────────────────────────────────────────
  const deselectAll = () => {
    isItineraryMode = false;
    selectedHotspot = null;
    hideNavigatePopup();
    hotspots.forEach(h => h.classList.remove('selected', 'faded-out'));
    hotspots.forEach(h => {
      const recenterHint = h.querySelector('.hotspot-recenter-hint');
      if (recenterHint) recenterHint.classList.remove('show-recenter-hint');
      if (h._recenterHintTimer) clearTimeout(h._recenterHintTimer);
    });
    mv.autoRotate = false;
    clearRoute();
    currentRoutePathIds = [];
    exitRouteMode();

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

    // Re-lock camera and reset to starting position
    enterLockedMode();
    resetCamera();
  };

  window.onBeforeFloorSwitch = () => {
    if (routeState.mode === 'selectingDestination') return;
    if (currentFullRoutePathIds.length > 1) return;
    if (!selectedHotspot && !isItineraryMode) return;
    deselectAll();
  };

  // ─────────────────────────────────────────
  // HOTSPOT CLICK / TAP
  // ─────────────────────────────────────────
  hotspots.forEach(h => {
    h.addEventListener('click', (e) => {
      e.stopPropagation();
      if (typeof navigator.vibrate === 'function') navigator.vibrate(40);
      if (handleRouteDestinationClick(h)) return;
      selectHotspot(h);
    });
  });

  // ─────────────────────────────────────────
  // BACKGROUND CLICK → deselect + recenter
  // ─────────────────────────────────────────
  mv.addEventListener('pointerdown', (e) => {
    if (e.target !== mv) {
      backgroundPointerSnapshot = null;
      return;
    }

    backgroundPointerSnapshot = {
      clientX: e.clientX,
      clientY: e.clientY,
      camera: captureCameraState()
    };
  }, true);

  mv.addEventListener('pointerup', (e) => {
    if (!backgroundPointerSnapshot || e.target !== mv) {
      backgroundPointerSnapshot = null;
      return;
    }

    const moved = Math.hypot(
      e.clientX - backgroundPointerSnapshot.clientX,
      e.clientY - backgroundPointerSnapshot.clientY
    );

    if (moved < EMPTY_TAP_DEADZONE && !selectedHotspot && !isItineraryMode) {
      e.preventDefault();
      e.stopPropagation();
      applyCameraState(backgroundPointerSnapshot.camera);
      guardCameraState(backgroundPointerSnapshot.camera, 250);
    }

    backgroundPointerSnapshot = null;
  }, true);

  mv.addEventListener('pointercancel', () => {
    backgroundPointerSnapshot = null;
  }, true);

  mv.addEventListener('click', (e) => {
    if (e.target === mv && (selectedHotspot || isItineraryMode)) {
      deselectAll(); // already calls resetCamera() + enterLockedMode()
    }
  });

  // ─────────────────────────────────────────
  // LEGEND & SEARCH CONTROLS
  // ─────────────────────────────────────────
  const legendBtn = document.getElementById('mobile-legend-btn');
  const legendMenu = document.getElementById('mobile-legend-menu');
  const desktopLegendBtn = document.getElementById('desktop-legend-btn');
  const desktopLegendMenu = document.getElementById('desktop-legend-menu');
  const expandableSearch = document.querySelector('.expandable-search');
  const searchPillNode = document.querySelector('.search-pill-input');
  const infoDropdownTrigger = document.getElementById('info-dropdown-trigger');
  const container = document.getElementById('info-dropdown-content');

  const closeLegendMenus = () => {
    if (legendMenu) legendMenu.classList.remove('show');
    if (desktopLegendMenu) desktopLegendMenu.classList.remove('show');
  };

  if (infoDropdownTrigger) {
    infoDropdownTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      closeLegendMenus();
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

  if (legendBtn && legendMenu) {
    legendBtn.addEventListener('click', () => {
      const isShowing = legendMenu.classList.toggle('show');
      if (isShowing && desktopLegendMenu) desktopLegendMenu.classList.remove('show');
      if (isShowing && searchPillNode) {
        searchPillNode.blur();
        searchPillNode.value = '';
        searchPillNode.dispatchEvent(new Event('input'));
      }
    });
  }

  if (desktopLegendBtn && desktopLegendMenu) {
    desktopLegendBtn.addEventListener('click', () => {
      const isShowing = desktopLegendMenu.classList.toggle('show');
      if (isShowing && legendMenu) legendMenu.classList.remove('show');
    });
  }

  if (searchPillNode) {
    if (expandableSearch) {
      expandableSearch.addEventListener('click', () => searchPillNode.focus());
    }
    searchPillNode.addEventListener('focus', () => {
      closeLegendMenus();
    });
    const SEARCH_SYNONYMS = {
      'weight room': ['gym', 'gymm', 'fitness', 'workout', 'weights', 'lifting'],
      'spinning room': ['spinning', 'spin', 'bike', 'bicycle', 'cycling', 'cycle'],
      'swimming pool': ['pool', 'swim', 'aquatics', 'water'],
      'stretching room': ['stretching', 'stretch', 'mobility', 'warmup'],
      'boxing room': ['boxing', 'box', 'fight'],
      'golf court': ['golf', 'putting', 'swing'],
      'squash court': ['squash', 'racquet', 'racket'],
      'lobby': ['entrance', 'entry', 'front desk', 'reception'],
      'gymnasium': ['basketball', 'court', 'sports hall'],
      'dance studio': ['dance', 'studio', 'classroom'],
      'lobby stairs': ['stairs', 'stairwell', 'second floor'],
      'm. locker room stairs': ['stairs', 'locker stairs', 'men stairs'],
      'w. locker room stairs': ['stairs', 'locker stairs', 'women stairs']
    };
    searchPillNode.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      hotspots.forEach(h => {
        const labelText = h.querySelector('.hotspot-label');
        if (!labelText) return;

        const label = labelText.textContent.toLowerCase();
        const synonymMatches = Object.entries(SEARCH_SYNONYMS).some(([name, aliases]) => {
          return label.includes(name) && aliases.some(alias => alias.includes(query) || query.includes(alias));
        });

        if (query === '' || label.includes(query) || synonymMatches) {
          h.classList.remove('faded-out');
        } else {
          h.classList.add('faded-out');
        }
      });
    });
  }

  document.addEventListener('click', (e) => {
    if (legendBtn && legendBtn.contains(e.target)) return;
    if (legendMenu && legendMenu.contains(e.target)) return;
    if (desktopLegendBtn && desktopLegendBtn.contains(e.target)) return;
    if (desktopLegendMenu && desktopLegendMenu.contains(e.target)) return;
    closeLegendMenus();
  });

  // ─────────────────────────────────────────
  // MODEL LOAD
  // ─────────────────────────────────────────
  modelViewer.addEventListener('load', () => {
    hotspots.forEach(h => {
      if (h.dataset.position && !h.dataset.adjusted) {
        const pos = h.dataset.position.split(' ');
        if (pos.length === 3) {
          const y = parseFloat(pos[1]) + 2.0;
          h.dataset.position = `${pos[0]} ${y}m ${pos[2]}`;

          if (h.dataset.target) {
            const tgt = h.dataset.target.split(' ');
            if (tgt.length === 3) {
              const tgtY = parseFloat(tgt[1]) + 2.0;
              h.dataset.target = `${tgt[0]} ${tgtY}m ${tgt[2]}`;
            }
          }

          h.dataset.adjusted = 'true';
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
      mv.setAttribute('zoom-sensitivity', MOBILE_ZOOM_SENSITIVITY);
      mv.setAttribute('interpolation-decay', QUICK_TRANSITION_DECAY);
      mv.setAttribute('min-camera-orbit', '360deg 45deg 40m');
      mv.setAttribute('max-camera-orbit', '360deg 45deg 180m');
    } else {
      mv.removeAttribute('disable-pan');
      mv.setAttribute('zoom-sensitivity', DESKTOP_ZOOM_SENSITIVITY);
      mv.setAttribute('interpolation-decay', QUICK_TRANSITION_DECAY);
      mv.setAttribute('min-camera-orbit', '360deg 45deg 20m');
      mv.setAttribute('max-camera-orbit', '360deg 45deg 150m');
      hotspots.forEach(h => h.classList.remove('mobile-hotspot-disabled'));
    }
  };

  applyCameraLock();
  window.addEventListener('resize', debounce(() => {
    if (isItineraryMode) {
      enterItineraryTopView();
    } else {
      applyCameraLock();
    }
    // If a hotspot is selected, stay in orbit mode; otherwise re-lock
    if (!isItineraryMode && selectedHotspot) {
      enterHotspotOrbitMode();
    }
    positionNavigatePopup();
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
  // ─────────────────────────────────────────
  // CAMERA-CHANGE: pan clamp
  // ─────────────────────────────────────────
  modelViewer.addEventListener('camera-change', (e) => {
    if (guardedCameraState && performance.now() < guardCameraUntil) {
      const source = e.detail?.source || '';
      if (source === 'user-interaction') {
        applyCameraState(guardedCameraState);
        return;
      }
    }

    const target = modelViewer.getCameraTarget();
    let clamped = false;
    let nx = target.x;
    let nz = target.z;

    if (nx > CAMERA_BOUNDS_X) { nx = CAMERA_BOUNDS_X; clamped = true; }
    if (nx < -CAMERA_BOUNDS_X) { nx = -CAMERA_BOUNDS_X; clamped = true; }

    if (window.innerWidth <= 768 && !selectedHotspot && !isItineraryMode) {
      // Full Z lock in base mode
      if (Math.abs(nz - 8.5) > 0.01) { nz = 8.5; clamped = true; }
    } else {
      if (nz > CAMERA_BOUNDS_Z) { nz = CAMERA_BOUNDS_Z; clamped = true; }
      if (nz < -CAMERA_BOUNDS_Z) { nz = -CAMERA_BOUNDS_Z; clamped = true; }
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
    // Keep parallel navigation active on mobile, including when a hotspot is selected.
    if (window.innerWidth > 768) {
      window.isCustomScrolling = false;
      return;
    }

    if (e.touches.length === 1) {
      window.isCustomScrolling = true;
      scrollStartX = e.touches[0].clientX;
      scrollStartY = e.touches[0].clientY;
      startCameraX = mv.getCameraTarget().x;
      startCameraZ = mv.getCameraTarget().z;

      if (isItineraryMode) {
        enterItineraryTopView();
      } else {
        mv.setAttribute('min-camera-orbit', '360deg 45deg 40m');
        mv.setAttribute('max-camera-orbit', '360deg 45deg 180m');
      }
    } else if (e.touches.length >= 2) {
      window.isCustomScrolling = false;
      if (isItineraryMode) {
        enterItineraryTopView();
      } else {
        mv.setAttribute('min-camera-orbit', '360deg 45deg 40m');
        mv.setAttribute('max-camera-orbit', '360deg 45deg 180m');
      }
    }
  }, { passive: true });

  mv.addEventListener('touchmove', (e) => {
    if (!window.isCustomScrolling || window.innerWidth > 768 || e.touches.length !== 1) return;

    const deltaX = e.touches[0].clientX - scrollStartX;
    const deltaY = e.touches[0].clientY - scrollStartY;
    const dragDistance = Math.hypot(deltaX, deltaY);
    if (dragDistance < TOUCH_PAN_DEADZONE) return;

    const orbit = mv.getCameraOrbit();
    const radiusStr = orbit.radius;
    let radius = 100;
    if (radiusStr) radius = parseFloat(radiusStr);
    const panSpeed = MOBILE_PAN_SPEED_FACTOR * radius;

    // Map screen drag accurately via trig to world 3D vectors based on exact current orientation
    const theta = Math.PI * 2;
    const mapDX = deltaX * Math.cos(theta) - deltaY * Math.sin(theta);
    const mapDZ = deltaX * Math.sin(theta) + deltaY * Math.cos(theta);

    let newX = startCameraX - (mapDX * panSpeed);
    let newZ = startCameraZ - (mapDZ * panSpeed);

    if (newX > 45) newX = 45;
    if (newX < -45) newX = -45;
    if (newZ > 65) newZ = 65;
    if (newZ < -65) newZ = -65;

    mv.cameraTarget = `${newX}m -1.3m ${newZ}m`;
  }, { passive: true });

  mv.addEventListener('touchend', () => {
    window.isCustomScrolling = false;
  });

  // ─────────────────────────────────────────
  // SEARCH — keyboard zoom out + restore on blur
  // ─────────────────────────────────────────
  const mobileSearchInputRef = document.querySelector('.search-pill-input');
  if (mobileSearchInputRef) {
    mobileSearchInputRef.addEventListener('focus', () => {
      hideGesturePrompt();
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
  const gesturePromptEl = document.getElementById('gesture-prompt-overlay');
  const legendPromptEl = document.getElementById('legend-prompt-overlay');
  const GESTURE_PROMPT_INITIAL_DELAY = 650;
  const GESTURE_PROMPT_REPEAT_DELAY = 18000;
  const GESTURE_PROMPT_VISIBLE_MS = 5200;
  const LEGEND_PROMPT_VISIBLE_MS = 3600;
  let gesturePromptTimeout = null;
  let legendPromptTimeout = null;
  let promptCycleTimeout = null;

  const canShowAmbientPrompts = () => {
    const infoOpen = container && container.classList.contains('force-show');
    const searchActive = expandableSearch && expandableSearch.matches(':focus-within');
    return !selectedHotspot && !isItineraryMode && !infoOpen && !searchActive;
  };

  const clearPromptCycleTimers = () => {
    if (gesturePromptTimeout) clearTimeout(gesturePromptTimeout);
    if (legendPromptTimeout) clearTimeout(legendPromptTimeout);
    if (promptCycleTimeout) clearTimeout(promptCycleTimeout);
    gesturePromptTimeout = null;
    legendPromptTimeout = null;
    promptCycleTimeout = null;
  };

  const schedulePromptCycle = (delay = GESTURE_PROMPT_REPEAT_DELAY) => {
    if (promptCycleTimeout) clearTimeout(promptCycleTimeout);
    promptCycleTimeout = setTimeout(() => {
      showGesturePrompt();
    }, delay);
  };

  const hideLegendPrompt = () => {
    if (legendPromptTimeout) clearTimeout(legendPromptTimeout);
    if (legendPromptEl) legendPromptEl.classList.remove('show-prompt');
    if (legendBtn) legendBtn.classList.remove('pulsating');
  };

  const showLegendPrompt = () => {
    if (!canShowAmbientPrompts()) return;
    if (legendPromptEl) legendPromptEl.style.display = '';
    if (legendPromptEl) legendPromptEl.classList.add('show-prompt');
    if (legendBtn) legendBtn.classList.add('pulsating');
    if (legendPromptTimeout) clearTimeout(legendPromptTimeout);
    legendPromptTimeout = setTimeout(() => {
      hideLegendPrompt();
      schedulePromptCycle();
    }, LEGEND_PROMPT_VISIBLE_MS);
  };

  const hideGesturePrompt = ({ scheduleNext = true } = {}) => {
    if (gesturePromptTimeout) clearTimeout(gesturePromptTimeout);
    if (gesturePromptEl) gesturePromptEl.classList.remove('show-prompt');
    hideLegendPrompt();
    if (scheduleNext) schedulePromptCycle();
  };

  const showGesturePrompt = () => {
    if (!canShowAmbientPrompts()) {
      schedulePromptCycle();
      return;
    }
    clearPromptCycleTimers();
    if (gesturePromptEl) {
      gesturePromptEl.style.display = '';
      gesturePromptEl.classList.add('show-prompt');
    }
    gesturePromptTimeout = setTimeout(() => {
      hideGesturePrompt({ scheduleNext: false });
      showLegendPrompt();
    }, GESTURE_PROMPT_VISIBLE_MS);
  };

  modelViewer.addEventListener('load', () => {
    schedulePromptCycle(GESTURE_PROMPT_INITIAL_DELAY);
  });

  if (legendBtn) legendBtn.addEventListener('click', () => {
    hideLegendPrompt();
    schedulePromptCycle();
  });

  modelViewer.addEventListener('pointerdown', () => hideGesturePrompt());
  modelViewer.addEventListener('wheel', () => hideGesturePrompt());
  modelViewer.addEventListener('camera-change', (e) => {
    if (e.detail.source === 'user-interaction') hideGesturePrompt();
    positionNavigatePopup();
  });

});

// ═══════════════════════════════════════════════════════════
// FLOOR SELECTOR — paste at the very bottom of script.js
// (outside / after the closing `});` of DOMContentLoaded)
// ═══════════════════════════════════════════════════════════

(function () {
  const mv = document.querySelector('model-viewer');

  // ── CONFIG ──────────────────────────────────────────────
  const FLOOR_1_SRC = 'Gacmapfinale_compressed.glb';   // your existing floor 1 model
  const FLOOR_2_SRC = 'testmap2ndfloor-compressed.glb';        // ← rename to match your actual file

  // How far up the camera target should shift when going to floor 2.
  // Adjust this number to match how tall one floor is in your model's units.
  const FLOOR_Y_LIFT = 4.5;   // metres — tweak this to taste

  const TRANSITION_MS = 680;   // total crossfade duration in ms
  // ────────────────────────────────────────────────────────

  let currentFloor = 1;
  let isTransitioning = false;

  // Expose currentFloor globally so itinerary logic can access it
  window.currentFloor = currentFloor;

  const btn1 = document.getElementById('floor-btn-1');
  const btn2 = document.getElementById('floor-btn-2');
  const overlay = document.getElementById('floor-transition-overlay');
  let transitionPromise = Promise.resolve();

  if (!btn1 || !btn2 || !mv) return; // safety guard

  // Hide Floor 2 hotspots initially
  document.querySelectorAll('.Hotspot').forEach(h => {
    if (h.dataset.floor && parseInt(h.dataset.floor) !== currentFloor) {
      h.style.display = 'none';
    }
  });

  // ── Helpers ─────────────────────────────────────────────

  /**
   * Update the visibility of you-are-here markers based on current floor
   */
  function updateYouAreHereVisibility() {
    document.querySelectorAll('.you-are-here').forEach(marker => {
      const hotspotEl = marker.closest('.Hotspot');
      if (hotspotEl) {
        const hotspotFloor = parseInt(hotspotEl.dataset.floor);
        marker.style.display = (hotspotFloor === window.currentFloor) ? '' : 'none';
      }
    });
  }

  function setFloorHotspotVisibility(targetFloor) {
    document.querySelectorAll('.Hotspot').forEach(h => {
      if (h.dataset.floor) {
        h.style.display = parseInt(h.dataset.floor, 10) === targetFloor ? '' : 'none';
      }
    });
  }

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Animate the camera target Y smoothly upward (or downward) by `deltaY`
   * using model-viewer's own interpolation-decay so it feels physical.
   * The orbit angle and radius stay exactly the same.
   */
  function liftCamera(deltaY) {
    const target = mv.getCameraTarget();
    const orbit = mv.getCameraOrbit();

    // Keep the same theta/phi/radius — only shift Y
    const thetaDeg = (orbit.theta * 180 / Math.PI).toFixed(2);
    const phiDeg = (orbit.phi * 180 / Math.PI).toFixed(2);
    const radius = orbit.radius.toFixed(2);

    const newY = (target.y + deltaY).toFixed(2);

    // Use a slightly slower decay so the lift feels like an elevator, not a snap
    mv.setAttribute('interpolation-decay', '130');
    mv.cameraTarget = `${target.x.toFixed(2)}m ${newY}m ${target.z.toFixed(2)}m`;
    mv.cameraOrbit = `${thetaDeg}deg ${phiDeg}deg ${radius}m`;

    // Restore the standard decay after the animation settles
    setTimeout(() => {
      mv.setAttribute('interpolation-decay', '200');
    }, TRANSITION_MS + 200);
  }

  /**
   * Swap the model-viewer src, fading the overlay in/out around it.
   * Only the model swaps — nothing else in the scene changes.
   */
  async function switchFloor(targetFloor) {
    if (targetFloor === currentFloor) return;
    if (isTransitioning) return transitionPromise;
    isTransitioning = true;

    const goingUp = targetFloor === 2;

    // ① Update button states immediately (feels snappy)
    btn1.classList.toggle('floor-active', targetFloor === 1);
    btn2.classList.toggle('floor-active', targetFloor === 2);

    // ② Fade the overlay in (masks the model swap)
    overlay.classList.add('fading');

    // ③ Mid-fade: swap the model src + start camera lift
    setTimeout(() => {
      const newSrc = targetFloor === 2 ? FLOOR_2_SRC : FLOOR_1_SRC;
      mv.setAttribute('src', newSrc);

      // Start the camera lift at the same moment the model begins loading
      liftCamera(goingUp ? FLOOR_Y_LIFT : -FLOOR_Y_LIFT);

      // Toggle hotspot visibility
      document.querySelectorAll('.Hotspot').forEach(h => {
        if (h.dataset.floor) {
          h.style.display = parseInt(h.dataset.floor) === targetFloor ? '' : 'none';
        }
      });

      currentFloor = targetFloor;
      window.currentFloor = currentFloor; // update global reference
      updateYouAreHereVisibility();
    }, TRANSITION_MS * 0.45); // swap at 45% through the fade = smoothest crossover

    // ④ Fade overlay back out
    setTimeout(() => {
      overlay.classList.remove('fading');
      isTransitioning = false;
    }, TRANSITION_MS);
  }

  // ── Button listeners ─────────────────────────────────────
  async function switchFloorAsync(targetFloor) {
    if (targetFloor === currentFloor) return;
    if (isTransitioning) return transitionPromise;
    isTransitioning = true;

    const goingUp = targetFloor === 2;

    btn1.classList.toggle('floor-active', targetFloor === 1);
    btn2.classList.toggle('floor-active', targetFloor === 2);
    overlay.classList.add('fading');

    transitionPromise = (async () => {
      if (typeof window.onBeforeFloorSwitch === 'function') {
        window.onBeforeFloorSwitch(targetFloor);
      }

      await delay(Math.round(TRANSITION_MS * 0.35));

      const newSrc = targetFloor === 2 ? FLOOR_2_SRC : FLOOR_1_SRC;
      const loadPromise = new Promise(resolve => {
        mv.addEventListener('load', resolve, { once: true });
      });

      mv.setAttribute('src', newSrc);
      liftCamera(goingUp ? FLOOR_Y_LIFT : -FLOOR_Y_LIFT);
      setFloorHotspotVisibility(targetFloor);

      currentFloor = targetFloor;
      window.currentFloor = currentFloor;
      updateYouAreHereVisibility();

      if (typeof window.onAfterFloorSwitch === 'function') {
        window.onAfterFloorSwitch(targetFloor);
      }

      await Promise.all([
        loadPromise,
        delay(Math.round(TRANSITION_MS * 0.45))
      ]);

      overlay.classList.remove('fading');
      await delay(180);
      isTransitioning = false;
    })();

    return transitionPromise;
  }

  window.switchFloor = switchFloorAsync;

  btn1.addEventListener('click', () => {
    if (typeof navigator.vibrate === 'function') navigator.vibrate(30);
    switchFloorAsync(1);
  });

  btn2.addEventListener('click', () => {
    if (typeof navigator.vibrate === 'function') navigator.vibrate(30);
    switchFloorAsync(2);
  });

  // Initialize you-are-here visibility on load
  updateYouAreHereVisibility();

})();

