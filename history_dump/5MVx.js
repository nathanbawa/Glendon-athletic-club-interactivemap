const viewer = document.querySelector('#gym-map');

viewer.querySelectorAll('.Hotspot').forEach(hotspot => {
  hotspot.addEventListener('click', () => {
    const orbit = hotspot.dataset.orbit;
    const target = hotspot.dataset.target;

    viewer.cameraOrbit = orbit;
    viewer.cameraTarget = target;
    viewer.fieldOfView = '30deg';
  });
});
