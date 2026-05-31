document.addEventListener('DOMContentLoaded', () => {
  const modelViewer = document.querySelector('model-viewer');

  const onProgress = (event) => {
    const progressBar = modelViewer.querySelector('.progress-bar');
    const updateBar = modelViewer.querySelector('.update-bar');

    const progress = event.detail.totalProgress;
    updateBar.style.width = `${progress * 100}%`;

    if (progress === 1) {
      progressBar.classList.add('hide');
      modelViewer.removeEventListener('progress', onProgress);
    } else {
      progressBar.classList.remove('hide');
    }
  };

  modelViewer.addEventListener('progress', onProgress);
});
