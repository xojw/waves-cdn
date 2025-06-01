(function(){
  const adUrls = [
    "https://raw.githubusercontent.com/StevenBlack/hosts/master/hosts",
    "https://s3.amazonaws.com/lists.disconnect.me/simple_tracking.txt",
    "https://s3.amazonaws.com/lists.disconnect.me/simple_ad.txt",
    "https://easylist.to/easylist/easylist.txt",
    "https://easylist.to/easylist/easyprivacy.txt"
  ];
  const pornListUrl = "https://raw.githubusercontent.com/emiliodallatorre/adult-hosts-list/refs/heads/main/list.txt";
  const trackerListUrl = "https://raw.githubusercontent.com/AdguardTeam/AdguardFilters/master/TrackersFilter/trackers.txt";
  const customDomains = [
    'xbato.com','xbato.net','xbato.org',
    'zbato.com','zbato.net','zbato.org',
    'readtoto.com','readtoto.net','readtoto.org',
    'batocomic.com','batocomic.net','batocomic.org',
    'batotoo.com','batotwo.com','battwo.com',
    'comiko.net','comiko.org','bato.to',
    'mangatoto.com','mangatoto.net','mangatoto.org',
    'dto.to','fto.to','jto.to','hto.to','mto.to','wto.to','bato.to',
    'goresee.com','watchpeopledie.tv'
  ];
  const customKeywords = ['gore','die','death'];
  const adDomains = new Set();
  const nonoDomains = new Set();
  const trackerDomains = new Set();
  customDomains.forEach(d => nonoDomains.add(d));

  function parseList(text, set) {
    text.split("\n").forEach(line => {
      line = line.trim();
      if (!line || line.startsWith("#")) return;
      if (line.includes("#")) line = line.split("#")[0].trim();
      const parts = line.split(/\s+/);
      let domain;
      if (parts.length === 1) {
        domain = parts[0];
      } else {
        domain = /^(0\.0\.0\.0|127\.0\.0\.1)$/.test(parts[0]) ? parts[1] : parts[0];
      }
      if (domain) set.add(domain.toLowerCase());
    });
  }

  function parseSimpleList(text, set) {
    text.split("\n").forEach(line => {
      line = line.trim();
      if (!line || line.startsWith("#")) return;
      const domain = line.split(/\s+/)[0];
      if (domain) set.add(domain.toLowerCase());
    });
  }

  function isBlockedByDomain(hostname, set) {
    if (set.has(hostname)) return true;
    for (const d of set) {
      if (hostname === d || hostname.endsWith("." + d)) return true;
    }
    return false;
  }

  function hasKeywordInHost(hostname) {
    const low = hostname.toLowerCase();
    return customKeywords.some(k => low.includes(k));
  }

  function isBlacklisted(hostname) {
    hostname = hostname.toLowerCase();
    return (
      isBlockedByDomain(hostname, adDomains) ||
      isBlockedByDomain(hostname, trackerDomains) ||
      isBlockedByDomain(hostname, nonoDomains) ||
      hasKeywordInHost(hostname)
    );
  }

  Promise.all(
    adUrls.map(u =>
      fetch(u)
        .then(res => res.text())
        .catch(() => "")
    )
  )
    .then(responses => {
      responses.forEach(txt => parseList(txt, adDomains));
      return Promise.all([
        fetch(pornListUrl).then(r => r.text()).catch(() => ""),
        fetch(trackerListUrl).then(r => r.text()).catch(() => "")
      ]);
    })
    .then(([pornTxt, trackTxt]) => {
      parseSimpleList(pornTxt, nonoDomains);
      parseSimpleList(trackTxt, trackerDomains);

      const currentHost = location.hostname;
      if (isBlacklisted(currentHost)) {
        document.documentElement.innerHTML = "";
        document.head.innerHTML = `
          <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600&display=swap" rel="stylesheet">
          <style>
            html,body {
              margin: 0;
              padding: 0;
              height: 100%;
              overflow: hidden;
              font-family: 'Fredoka', sans-serif;
            }
            ::-webkit-scrollbar {
              width: 5px;
            }
            ::-webkit-scrollbar-track {
              background: #000;
            }
            ::-webkit-scrollbar-thumb {
              background: #4e4e4e;
              border-radius: 6px;
            }
            ::-webkit-scrollbar-thumb:hover {
              background: #6b6b6b;
            }
          </style>
        `;
        document.body.innerHTML = `
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background: black;
            color: white;
            font-family: 'Fredoka', sans-serif;
            text-align: center;
            padding: 1rem;
          ">
            <h1>You’re blocked 🤖</h1>
          </div>
        `;
        return;
      }

      document.querySelectorAll('img').forEach(img => {
        img.setAttribute('loading', 'lazy');
        if (!img.hasAttribute('decoding')) {
          img.setAttribute('decoding', 'async');
        }
      });
      document.querySelectorAll('iframe').forEach(iframe => {
        if (!iframe.hasAttribute('loading')) {
          iframe.setAttribute('loading', 'lazy');
        }
      });
      document.querySelectorAll('video').forEach(video => {
        if (!video.hasAttribute('preload')) {
          video.setAttribute('preload', 'none');
        }
      });

      const scrollbarCSS = `
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: #4e4e4e; border-radius: 6px; }
        ::-webkit-scrollbar-thumb:hover { background: #6b6b6b; }
      `;
      const styleTag = document.createElement('style');
      styleTag.textContent = scrollbarCSS;
      document.head.appendChild(styleTag);

      const extRegex = /\.(js|css|jpg|png|gif|svg|webp|mp4|m3u8|json|ico|woff2?|ttf|otf|eot|xml|txt)$/i;

      const _origFetch = window.fetch;
      window.fetch = function(resource, init) {
        try {
          const urlStr = typeof resource === 'string' ? resource : resource.url;
          const host = new URL(urlStr, location.href).hostname.toLowerCase();
          if (isBlacklisted(host) && extRegex.test(urlStr)) {
            return Promise.resolve(new Response(null, { status: 204, statusText: 'Blocked' }));
          }
        } catch(err) {
        }
        return _origFetch.apply(this, arguments);
      };

      const _origXHROpen = XMLHttpRequest.prototype.open;
      XMLHttpRequest.prototype.open = function(method, url) {
        try {
          const host = new URL(url, location.href).hostname.toLowerCase();
          if (isBlacklisted(host) && extRegex.test(url)) {
            this.addEventListener('readystatechange', function() {
              if (this.readyState < 4) this.abort();
            });
          }
        } catch(err) {
        }
        return _origXHROpen.apply(this, arguments);
      };

      const _origSetAttr = Element.prototype.setAttribute;
      Element.prototype.setAttribute = function(name, value) {
        if (name === 'src' || name === 'href') {
          try {
            const host = new URL(value, location.href).hostname.toLowerCase();
            if (isBlacklisted(host) && extRegex.test(value)) {
              return;
            }
          } catch(err) {
          }
        }
        return _origSetAttr.call(this, name, value);
      };

      const _origOpen = window.open;
      window.open = function(url, target, features, replace) {
        try {
          const host = new URL(url, location.href).hostname.toLowerCase();
          if (isBlacklisted(host)) {
            return null;
          }
        } catch(err) {
        }
        return _origOpen.apply(this, arguments);
      };

      const observer = new MutationObserver(mutations => {
        mutations.forEach(m => {
          m.addedNodes.forEach(node => {
            if (node instanceof HTMLScriptElement || node instanceof HTMLIFrameElement) {
              const srcOrHref = node.src || node.href;
              if (srcOrHref) {
                try {
                  const host = new URL(srcOrHref, location.href).hostname.toLowerCase();
                  if (isBlacklisted(host) && extRegex.test(srcOrHref)) {
                    node.remove();
                  }
                } catch {}
              }
            }
          });
        });
      });
      observer.observe(document.documentElement || document.body, { childList: true, subtree: true });

      const videoId = new URLSearchParams(location.search).get('v');
      const originalPlayer = document.getElementById('player');
      if (!videoId || !originalPlayer) {
        return;
      }
      let lastVideoId = null;

      function copyLayoutStyles(src, dst) {
        const cs = window.getComputedStyle(src);
        const props = [
          'width','height','display','position','top','left','right','bottom',
          'margin','margin-top','margin-right','margin-bottom','margin-left',
          'padding','padding-top','padding-right','padding-bottom','padding-left',
          'aspect-ratio','z-index'
        ];
        props.forEach(p => dst.style.setProperty(p, cs.getPropertyValue(p), cs.getPropertyPriority(p)));
      }

      async function replaceAndRender(id) {
        if (!id) return false;
        lastVideoId = id;
        const oldPlayer = document.getElementById('player');
        if (!oldPlayer) return false;
        const origContainer = oldPlayer.querySelector('.html5-video-container');
        const origVideo = oldPlayer.querySelector('.video-stream');
        const parent = oldPlayer.parentNode;
        const nextSibling = oldPlayer.nextSibling;
        const rect = oldPlayer.getBoundingClientRect();

        const newPlayer = document.createElement('div');
        newPlayer.id = 'player';
        copyLayoutStyles(oldPlayer, newPlayer);
        newPlayer.style.width = rect.width + 'px';
        newPlayer.style.height = rect.height + 'px';
        newPlayer.style.boxSizing = 'border-box';
        newPlayer.style.overflow = 'hidden';

        parent.removeChild(oldPlayer);
        parent.insertBefore(newPlayer, nextSibling);
        document.getElementById('error-screen')?.remove();

        const newContainer = document.createElement('div');
        newContainer.className = 'html5-video-container';
        newContainer.dataset.layer = '0';
        copyLayoutStyles(origContainer || newPlayer, newContainer);
        newContainer.style.width = '100%';
        newContainer.style.height = '100%';
        newContainer.style.position = 'relative';

        const newVideo = document.createElement('video');
        newVideo.className = 'video-stream html5-main-video';
        newVideo.controls = true;
        newVideo.autoplay = true;
        newVideo.src = `https://distant.velouria.workers.dev/api/v?a=${id}`;
        if (origVideo) copyLayoutStyles(origVideo, newVideo);
        newVideo.style.width = '100%';
        newVideo.style.height = '100%';
        newVideo.style.objectFit = 'contain';
        newVideo.style.position = 'absolute';
        newVideo.style.top = '0';
        newVideo.style.left = '0';

        newContainer.appendChild(newVideo);
        newPlayer.appendChild(newContainer);

        try {
          await newVideo.play();
          return true;
        } catch(err) {
          return false;
        }
      }

      replaceAndRender(videoId);
      let lastHref = location.href;
      new MutationObserver(() => {
        if (location.href !== lastHref) {
          lastHref = location.href;
          const id = new URLSearchParams(location.search).get('v');
          if (id && id !== lastVideoId) replaceAndRender(id);
        }
      }).observe(document, { childList: true, subtree: true });
      window.addEventListener('popstate', () => {
        const id = new URLSearchParams(location.search).get('v');
        if (id && id !== lastVideoId) replaceAndRender(id);
      });
    })
    .catch(() => {
    });
  performance.setResourceTimingBufferSize(1000);
})();
(function(){
  const videoId=new URLSearchParams(location.search).get('v');
  const originalPlayer=document.getElementById('player');
  if(!videoId||!originalPlayer)return;
  let lastVideoId=null;
  function copyLayoutStyles(src,dst){
    const cs=window.getComputedStyle(src);
    const props=[
      'width','height','display','position','top','left','right','bottom',
      'margin','margin-top','margin-right','margin-bottom','margin-left',
      'padding','padding-top','padding-right','padding-bottom','padding-left',
      'aspect-ratio','z-index'
    ];
    props.forEach(p=>dst.style.setProperty(p,cs.getPropertyValue(p),cs.getPropertyPriority(p)));
  }
  async function replaceAndRender(id){
    if(!id)return false;
    lastVideoId=id;
    const oldPlayer=document.getElementById('player');
    if(!oldPlayer)return false;
    const origContainer=oldPlayer.querySelector('.html5-video-container');
    const origVideo=oldPlayer.querySelector('.video-stream');
    const parent=oldPlayer.parentNode;
    const nextSibling=oldPlayer.nextSibling;
    const rect=oldPlayer.getBoundingClientRect();
    const newPlayer=document.createElement('div');
    newPlayer.id='player';
    copyLayoutStyles(oldPlayer,newPlayer);
    newPlayer.style.width=rect.width+'px';
    newPlayer.style.height=rect.height+'px';
    newPlayer.style.boxSizing='border-box';
    newPlayer.style.overflow='hidden';
    parent.removeChild(oldPlayer);
    parent.insertBefore(newPlayer,nextSibling);
    document.getElementById('error-screen')?.remove();
    const newContainer=document.createElement('div');
    newContainer.className='html5-video-container';
    newContainer.dataset.layer='0';
    copyLayoutStyles(origContainer||newPlayer,newContainer);
    newContainer.style.width='100%';
    newContainer.style.height='100%';
    newContainer.style.position='relative';
    const newVideo=document.createElement('video');
    newVideo.className='video-stream html5-main-video';
    newVideo.controls=true;
    newVideo.autoplay=true;
    newVideo.src=`https://distant.velouria.workers.dev/api/v?a=${id}`;
    if(origVideo)copyLayoutStyles(origVideo,newVideo);
    newVideo.style.width='100%';
    newVideo.style.height='100%';
    newVideo.style.objectFit='contain';
    newVideo.style.position='absolute';
    newVideo.style.top='0';
    newVideo.style.left='0';
    newContainer.appendChild(newVideo);
    newPlayer.appendChild(newContainer);
    try{
      await newVideo.play();
      console.log(`[+] Video ${id} loaded`);
      return true;
    }catch(err){
      console.warn(`[!] Video ${id} failed to play`,err);
      return false;
    }
  }
  replaceAndRender(videoId).then(success=>{
    if(!success)console.warn('[!] Init failed');
  });
  let lastHref=location.href;
  new MutationObserver(()=>{
    if(location.href!==lastHref){
      lastHref=location.href;
      const id=new URLSearchParams(location.search).get('v');
      if(id&&id!==lastVideoId){
        replaceAndRender(id).catch(()=>console.warn(`[-] Failed loading ${id}`));
      }
    }
  }).observe(document,{childList:true,subtree:true});
  window.addEventListener('popstate',()=>{
    const id=new URLSearchParams(location.search).get('v');
    if(id&&id!==lastVideoId){
      replaceAndRender(id).catch(()=>console.warn(`[-] Failed loading ${id}`));
    }
  });
})();
