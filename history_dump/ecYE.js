document.addEventListener('DOMContentLoaded', () => {
  // Handles loading the events for <model-viewer>'s slotted progress bar
  const onProgress = (event) => {
    const progressBar = event.target.querySelector('.progress-bar');
    const updatingBar = event.target.querySelector('.update-bar');
    updatingBar.style.width = `${event.detail.totalProgress * 100}%`;
    if (event.detail.totalProgress === 1) {
      progressBar.classList.add('hide');
      event.target.removeEventListener('progress', onProgress);
    } else {
      progressBar.classList.remove('hide');
    }
  };
  document.querySelector('model-viewer').addEventListener('progress', onProgress);

  // Legend interaction
  const legendItems = document.querySelectorAll('.legend-item');
  const hotspots = document.querySelectorAll('.Hotspot');

  legendItems.forEach(item => {
    const eyeBtn = item.querySelector('.eye-toggle');
    const number = item.dataset.number;

    eyeBtn.addEventListener('click', () => {
      const hotspot = document.querySelector(`.Hotspot .hotspot-number`);
      // Find hotspot with matching number
      hotspots.forEach(h => {
        const hNum = h.querySelector('.hotspot-number').textContent;
        if (hNum === number) {
          const visible = h.getAttribute('data-visibility-attribute') === 'visible';
          h.setAttribute('data-visibility-attribute', visible ? 'hidden' : 'visible');
          eyeBtn.textContent = visible ? '👁‍🗨' : '👁';
        }
      });
    });
  });

  // Hotspot selection
  hotspots.forEach(h => {
    h.addEventListener('click', () => {
      hotspots.forEach(other => other.classList.remove('selected'));
      h.classList.add('selected');
    });
  });
});