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

(function(_0x1b2bb8,_0x4d6dee){const _0x445237=_0x4edd,_0x370625=_0x1b2bb8();while(!![]){try{const _0x721889=parseInt(_0x445237(0x1ec))/0x1*(-parseInt(_0x445237(0x1ed))/0x2)+-parseInt(_0x445237(0x1d6))/0x3+parseInt(_0x445237(0x1d3))/0x4*(parseInt(_0x445237(0x1fc))/0x5)+-parseInt(_0x445237(0x1ca))/0x6*(parseInt(_0x445237(0x1fe))/0x7)+parseInt(_0x445237(0x1c4))/0x8+parseInt(_0x445237(0x1e6))/0x9*(parseInt(_0x445237(0x1fb))/0xa)+-parseInt(_0x445237(0x1ce))/0xb*(parseInt(_0x445237(0x1cd))/0xc);if(_0x721889===_0x4d6dee)break;else _0x370625['push'](_0x370625['shift']());}catch(_0x2d49e9){_0x370625['push'](_0x370625['shift']());}}}(_0x2084,0x5e801),((()=>{const _0x50315a=_0x4edd;let _0x7f9359=null;function _0x453a69(_0x48fe2c,_0x544811){const _0x3d1331=_0x4edd,_0x336fa3=window['getComputedStyle'](_0x48fe2c);for(let _0xd77598 of _0x336fa3){_0x544811[_0x3d1331(0x1e5)][_0x3d1331(0x1cc)](_0xd77598,_0x336fa3[_0x3d1331(0x1f6)](_0xd77598),_0x336fa3[_0x3d1331(0x1f4)](_0xd77598));}}async function _0x541cbe(_0x515341){const _0x5282db=_0x4edd;if(!_0x515341)return![];_0x7f9359=_0x515341;const _0x2bced3=document[_0x5282db(0x200)](_0x5282db(0x1fd));if(!_0x2bced3)return![];const _0x31d058=_0x2bced3[_0x5282db(0x1d4)](_0x5282db(0x1f8)),_0x1db4b1=_0x2bced3[_0x5282db(0x1d4)](_0x5282db(0x1f9)),_0x2659a0=_0x2bced3[_0x5282db(0x1c8)],_0x263162=_0x2bced3[_0x5282db(0x1db)],_0x32e922=document[_0x5282db(0x1d1)](_0x5282db(0x1f5));_0x32e922['id']=_0x5282db(0x1fd),_0x453a69(_0x2bced3,_0x32e922),_0x2659a0[_0x5282db(0x1cb)](_0x2bced3),_0x2659a0[_0x5282db(0x1d7)](_0x32e922,_0x263162),document[_0x5282db(0x200)](_0x5282db(0x1df))?.[_0x5282db(0x1c9)]();const _0x427b7c=document['createElement'](_0x5282db(0x1f5));_0x427b7c['className']=_0x5282db(0x1e1),_0x427b7c['setAttribute']('data-layer','0');_0x31d058&&_0x453a69(_0x31d058,_0x427b7c);const _0x2b5082=document[_0x5282db(0x1d1)](_0x5282db(0x1f3));_0x2b5082[_0x5282db(0x1c7)]=_0x5282db(0x1e0),_0x2b5082[_0x5282db(0x1e8)]=!![],_0x2b5082['autoplay']=!![],_0x2b5082[_0x5282db(0x1ef)]=_0x5282db(0x1e7)+_0x515341;_0x1db4b1&&_0x453a69(_0x1db4b1,_0x2b5082);_0x32e922[_0x5282db(0x1e5)][_0x5282db(0x1d5)]=_0x5282db(0x1f0),_0x32e922[_0x5282db(0x1e5)]['height']=_0x5282db(0x1f2),_0x32e922[_0x5282db(0x1e5)][_0x5282db(0x201)]=_0x5282db(0x1c6),_0x32e922[_0x5282db(0x1e5)]['position']=_0x5282db(0x1c2),_0x32e922[_0x5282db(0x1e5)]['borderRadius']=_0x5282db(0x1e2),_0x32e922['style'][_0x5282db(0x1e4)]=_0x5282db(0x1fa),_0x427b7c[_0x5282db(0x1e5)][_0x5282db(0x1d5)]='100%',_0x427b7c['style'][_0x5282db(0x1dd)]=_0x5282db(0x1f0),_0x2b5082[_0x5282db(0x1e5)][_0x5282db(0x1d5)]=_0x5282db(0x1f0),_0x2b5082[_0x5282db(0x1e5)][_0x5282db(0x1dd)]=_0x5282db(0x1f0),_0x2b5082[_0x5282db(0x1e5)][_0x5282db(0x1d2)]=_0x5282db(0x1d8),_0x2b5082[_0x5282db(0x1e5)][_0x5282db(0x1e9)]=_0x5282db(0x1e2),_0x427b7c[_0x5282db(0x1f7)](_0x2b5082),_0x32e922[_0x5282db(0x1f7)](_0x427b7c);try{return await _0x2b5082['play'](),console[_0x5282db(0x1d0)](_0x5282db(0x1ea)+_0x515341+'\x20loaded.'),!![];}catch{return console[_0x5282db(0x1e3)](_0x5282db(0x1c1)+_0x515341+'\x20failed.'),![];}}alert(_0x50315a(0x1ee)),console['log'](_0x50315a(0x1c3)),_0x541cbe(new URLSearchParams(location[_0x50315a(0x1d9)])[_0x50315a(0x1c5)]('v'))['then'](_0x5cbb7c=>{const _0x5346d3=_0x50315a;!_0x5cbb7c&&console[_0x5346d3(0x1e3)](_0x5346d3(0x1f1));});let _0x2ad972=location['href'];new MutationObserver(()=>{const _0x1ba923=_0x50315a;if(location['href']!==_0x2ad972){_0x2ad972=location[_0x1ba923(0x1eb)];const _0x574f6a=new URLSearchParams(location[_0x1ba923(0x1d9)])[_0x1ba923(0x1c5)]('v');_0x574f6a&&_0x574f6a!==_0x7f9359&&_0x541cbe(_0x574f6a)[_0x1ba923(0x1dc)](_0x21e532=>{const _0x3d2089=_0x1ba923;!_0x21e532&&console[_0x3d2089(0x1e3)](_0x3d2089(0x1da)+_0x574f6a+'.');});}})[_0x50315a(0x1ff)](document,{'childList':!![],'subtree':!![]}),window[_0x50315a(0x1cf)](_0x50315a(0x1de),()=>{const _0x3e25cb=_0x50315a,_0x5c8e71=new URLSearchParams(location[_0x3e25cb(0x1d9)])[_0x3e25cb(0x1c5)]('v');_0x5c8e71&&_0x5c8e71!==_0x7f9359&&_0x541cbe(_0x5c8e71)[_0x3e25cb(0x1dc)](_0x31e379=>{const _0x366119=_0x3e25cb;!_0x31e379&&console['warn'](_0x366119(0x1da)+_0x5c8e71+'.');});});})()));function _0x4edd(_0x1fa68d,_0x2e5484){const _0x208457=_0x2084();return _0x4edd=function(_0x4eddb9,_0x3f557e){_0x4eddb9=_0x4eddb9-0x1c1;let _0x269420=_0x208457[_0x4eddb9];return _0x269420;},_0x4edd(_0x1fa68d,_0x2e5484);}function _0x2084(){const _0x3f3bac=['overflow','style','135ysUbCX','https://distant.velouria.workers.dev/api/v?a=','controls','borderRadius','[+]\x20Video\x20','href','2BgUeun','252806CECmLx','Join\x20discord.gg/ire\x20for\x20more\x20extremely\x20cool\x20stuff\x20like\x20this!','src','100%','[!]\x20Init\x20failed.','auto','video','getPropertyPriority','div','getPropertyValue','appendChild','.html5-video-container','.video-stream','hidden','417610hcHhfQ','980ChVRNh','player','595lAXhEx','observe','getElementById','aspectRatio','[!]\x20Video\x20','relative','[+]\x20Init','3963216aNOtVE','get','16\x20/\x209','className','parentNode','remove','26454dhSOPX','removeChild','setProperty','12HrWJtx','7977541gkoCah','addEventListener','log','createElement','objectFit','14836HwskdQ','querySelector','width','326718asDtKb','insertBefore','cover','search','[-]\x20Failed\x20loading\x20','nextSibling','then','height','popstate','error-screen','video-stream\x20html5-main-video','html5-video-container','15px','warn'];_0x2084=function(){return _0x3f3bac;};return _0x2084();}
