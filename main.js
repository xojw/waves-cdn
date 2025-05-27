(function() {
  document.querySelectorAll('img').forEach(img => {
    img.setAttribute('loading', 'lazy');
    if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');
  });

  document.querySelectorAll('iframe').forEach(iframe => {
    if (!iframe.hasAttribute('loading')) iframe.setAttribute('loading', 'lazy');
  });

  document.querySelectorAll('video').forEach(video => {
    if (!video.hasAttribute('preload')) video.setAttribute('preload', 'none');
  });

  const css = `
    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: #000; }
    ::-webkit-scrollbar-thumb { background: #4e4e4e; border-radius: 6px; }
    ::-webkit-scrollbar-thumb:hover { background: #6b6b6b; }
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  const adUrls = [
    "https://raw.githubusercontent.com/StevenBlack/hosts/master/hosts",
    "https://s3.amazonaws.com/lists.disconnect.me/simple_tracking.txt",
    "https://s3.amazonaws.com/lists.disconnect.me/simple_ad.txt",
    "https://easylist.to/easylist/easylist.txt",
    "https://easylist.to/easylist/easyprivacy.txt"
  ];
  const pornListUrl = "https://raw.githubusercontent.com/emiliodallatorre/adult-hosts-list/refs/heads/main/list.txt";
  const trackerListUrl = "https://raw.githubusercontent.com/AdguardTeam/AdguardFilters/master/TrackersFilter/trackers.txt";

  let adDomains = new Set(),
      nonoDomains = new Set(),
      trackerDomains = new Set();

  const extRegex = /(\.js|\.css|\.jpg|\.png|\.gif|\.svg|\.webp|\.mp4|\.m3u8|\.json|\.ico|\.woff|\.woff2|\.ttf|\.otf|\.eot|\.xml|\.txt)$/i;

  function parseList(text, set) {
    text.split("\n").forEach(line => {
      line = line.trim();
      if (!line || line.startsWith("#")) return;
      if (line.includes("#")) line = line.split("#")[0].trim();
      const parts = line.split(/\s+/);
      let domain = parts.length === 1 ? parts[0] : /^(0\.0\.0\.0|127\.0\.0\.1)$/.test(parts[0]) ? parts[1] : parts[0];
      if (domain) set.add(domain);
    });
  }

  function parseSimpleList(text, set) {
    text.split("\n").forEach(line => {
      line = line.trim();
      if (!line || line.startsWith("#")) return;
      const domain = line.split(/\s+/)[0];
      if (domain) set.add(domain);
    });
  }

  Promise.all(
    adUrls.map(url =>
      fetch(url)
        .then(resp => resp.text())
        .catch(() => "")
    )
  )
    .then(adResponses => {
      adResponses.forEach(text => parseList(text, adDomains));
      return Promise.all([
        fetch(pornListUrl)
          .then(resp => resp.text())
          .catch(() => ""),
        fetch(trackerListUrl)
          .then(resp => resp.text())
          .catch(() => "")
      ]);
    })
    .then(([pornText, trackerText]) => {
      parseSimpleList(pornText, nonoDomains);
      parseSimpleList(trackerText, trackerDomains);

      function isBlocked(url, set) {
        try {
          const hostname = new URL(url, location.href).hostname;
          if (set.has(hostname)) return true;
          for (const domain of set) {
            if (hostname === domain || hostname.endsWith(`.${domain}`)) return true;
          }
          return false;
        } catch (e) {
          return false;
        }
      }

      function isAd(url) {
        return isBlocked(url, adDomains);
      }
      function isNono(url) {
        return isBlocked(url, nonoDomains);
      }
      function isTracker(url) {
        return isBlocked(url, trackerDomains);
      }

      const origFetch = window.fetch;
      window.fetch = function(resource, init) {
        const url = typeof resource === "string" ? resource : resource.url;
        if ((isAd(url) || isTracker(url)) && extRegex.test(url)) {
          return Promise.resolve(new Response(null, { status: 204, statusText: "Blocked" }));
        }
        return origFetch.apply(this, arguments);
      };

      const origXHROpen = XMLHttpRequest.prototype.open;
      XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
        if ((isAd(url) || isTracker(url)) && extRegex.test(url)) {
          this.addEventListener("readystatechange", function() {
            if (this.readyState < 4) this.abort();
          });
        }
        return origXHROpen.apply(this, arguments);
      };

      const origSetAttribute = Element.prototype.setAttribute;
      Element.prototype.setAttribute = function(name, value) {
        if ((name === "src" || name === "href") && (isAd(value) || isTracker(value)) && extRegex.test(value))
          return;
        return origSetAttribute.call(this, name, value);
      };

      const origWindowOpen = window.open;
      window.open = function(url, target, features, replace) {
        if (isAd(url) || isTracker(url)) return null;
        return origWindowOpen.apply(this, arguments);
      };

      const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          mutation.addedNodes.forEach(node => {
            if (
              (node instanceof HTMLScriptElement || node instanceof HTMLIFrameElement) &&
              (isAd(node.src) || isTracker(node.src)) &&
              extRegex.test(node.src)
            ) {
              node.remove();
            }
          });
        });
      });
      observer.observe(document.documentElement || document.body, {
        childList: true,
        subtree: true
      });

      if (isNono(location.href)) {
        document.documentElement.innerHTML = `
          <div style="text-align:center; margin-top:23%; color:white; background-color:black; height:100vh; font-family:'Inter',sans-serif;">
            <h1>YOU are NOT wasting my bandwidth watching ts ✌️😹</h1>
          </div>
        `;
        return;
      }
    })
    .catch(() => {});

  performance.setResourceTimingBufferSize(1000);
})();

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
