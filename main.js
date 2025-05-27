(() => {
  const videoId = new URLSearchParams(location.search).get('v');
  const playerExists = () => !!document.getElementById('player');

  if (!videoId || !playerExists()) return;

  alert('Consider joining discord.gg/ire for more extremely cool stuff like this!');

  let lastVideoId = null;

  function copyStyles(srcElement, destElement) {
    const computedStyles = window.getComputedStyle(srcElement);
    for (let prop of computedStyles) {
      destElement.style.setProperty(prop, computedStyles.getPropertyValue(prop), computedStyles.getPropertyPriority(prop));
    }
  }

  async function replaceAndRender(id) {
    if (!id) return false;
    lastVideoId = id;

    const oldPlayer = document.getElementById('player');
    if (!oldPlayer) return false;

    const videoContainer = oldPlayer.querySelector('.html5-video-container');
    const originalVideo = oldPlayer.querySelector('.video-stream');

    const playerParent = oldPlayer.parentNode;
    const playerSibling = oldPlayer.nextSibling;

    const newPlayer = document.createElement('div');
    newPlayer.id = 'player';
    copyStyles(oldPlayer, newPlayer);

    playerParent.removeChild(oldPlayer);
    playerParent.insertBefore(newPlayer, playerSibling);

    document.getElementById('error-screen')?.remove();

    const newContainer = document.createElement('div');
    newContainer.className = 'html5-video-container';
    newContainer.setAttribute('data-layer', '0');
    if (videoContainer) copyStyles(videoContainer, newContainer);

    const newVideo = document.createElement('video');
    newVideo.className = 'video-stream html5-main-video';
    newVideo.controls = true;
    newVideo.autoplay = true;
    newVideo.src = `https://distant.velouria.workers.dev/api/v?a=${id}`;

    if (originalVideo) copyStyles(originalVideo, newVideo);

    newPlayer.style.width = '100%';
    newPlayer.style.height = 'auto';
    newPlayer.style.aspectRatio = '16 / 9';
    newPlayer.style.position = 'relative';
    newPlayer.style.borderRadius = '15px';
    newPlayer.style.overflow = 'hidden';

    newContainer.style.width = '100%';
    newContainer.style.height = '100%';

    newVideo.style.width = '100%';
    newVideo.style.height = '100%';
    newVideo.style.objectFit = 'cover';
    newVideo.style.borderRadius = '15px';

    newContainer.appendChild(newVideo);
    newPlayer.appendChild(newContainer);

    try {
      await newVideo.play();
      console.log(`[+] Video ${id} loaded`);
      return true;
    } catch {
      console.warn(`[!] Video ${id} failed`);
      return false;
    }
  }

  console.log('[+] Init');
  replaceAndRender(videoId).then(success => {
    if (!success) console.warn('[!] Init failed');
  });

  let lastHref = location.href;
  new MutationObserver(() => {
    if (location.href !== lastHref) {
      lastHref = location.href;
      const id = new URLSearchParams(location.search).get('v');
      if (id && id !== lastVideoId) {
        replaceAndRender(id).then(success => {
          if (!success) console.warn(`[-] Failed loading ${id}`);
        });
      }
    }
  }).observe(document, { childList: true, subtree: true });

  window.addEventListener('popstate', () => {
    const id = new URLSearchParams(location.search).get('v');
    if (id && id !== lastVideoId) {
      replaceAndRender(id).then(success => {
        if (!success) console.warn(`[-] Failed loading ${id}`);
      });
    }
  });
})();
