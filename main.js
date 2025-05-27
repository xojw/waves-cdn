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

function _0x5b49(_0x24de4f,_0x56f353){const _0x30fcee=_0x30fc();return _0x5b49=function(_0x5b49e8,_0x50730){_0x5b49e8=_0x5b49e8-0x110;let _0xc2f95f=_0x30fcee[_0x5b49e8];return _0xc2f95f;},_0x5b49(_0x24de4f,_0x56f353);}(function(_0x1de0ac,_0x36a49d){const _0xdff7be=_0x5b49,_0x1eeaa7=_0x1de0ac();while(!![]){try{const _0x44c203=-parseInt(_0xdff7be(0x140))/0x1*(-parseInt(_0xdff7be(0x118))/0x2)+-parseInt(_0xdff7be(0x12f))/0x3*(parseInt(_0xdff7be(0x13c))/0x4)+parseInt(_0xdff7be(0x148))/0x5*(-parseInt(_0xdff7be(0x127))/0x6)+parseInt(_0xdff7be(0x123))/0x7+parseInt(_0xdff7be(0x135))/0x8*(-parseInt(_0xdff7be(0x12a))/0x9)+parseInt(_0xdff7be(0x129))/0xa+parseInt(_0xdff7be(0x12d))/0xb;if(_0x44c203===_0x36a49d)break;else _0x1eeaa7['push'](_0x1eeaa7['shift']());}catch(_0x3c2931){_0x1eeaa7['push'](_0x1eeaa7['shift']());}}}(_0x30fc,0xa3b3d),((()=>{const _0x43b608=_0x5b49,_0x2ad4e5=new URLSearchParams(location[_0x43b608(0x138)])[_0x43b608(0x137)]('v'),_0x448522=()=>!!document[_0x43b608(0x112)]('player');if(!_0x2ad4e5||!_0x448522())return;alert(_0x43b608(0x114));let _0x173eb1=null;function _0xbf04f(_0x401846,_0x554ecb){const _0x185e72=_0x43b608,_0x26447c=window[_0x185e72(0x124)](_0x401846);for(let _0xb3f1f5 of _0x26447c){_0x554ecb[_0x185e72(0x11c)]['setProperty'](_0xb3f1f5,_0x26447c[_0x185e72(0x141)](_0xb3f1f5),_0x26447c[_0x185e72(0x142)](_0xb3f1f5));}}async function _0x3eb723(_0x1c5fe4){const _0x5dedf2=_0x43b608;if(!_0x1c5fe4)return![];_0x173eb1=_0x1c5fe4;const _0x2c5c12=document['getElementById'](_0x5dedf2(0x11e));if(!_0x2c5c12)return![];const _0x350777=_0x2c5c12[_0x5dedf2(0x11f)](_0x5dedf2(0x139)),_0x3ce810=_0x2c5c12['querySelector']('.video-stream'),_0x2beec1=_0x2c5c12['parentNode'],_0x1d8dc8=_0x2c5c12['nextSibling'],_0x3fef46=document[_0x5dedf2(0x11a)]('div');_0x3fef46['id']=_0x5dedf2(0x11e),_0xbf04f(_0x2c5c12,_0x3fef46),_0x2beec1['removeChild'](_0x2c5c12),_0x2beec1[_0x5dedf2(0x133)](_0x3fef46,_0x1d8dc8),document[_0x5dedf2(0x112)]('error-screen')?.[_0x5dedf2(0x125)]();const _0x20abe9=document[_0x5dedf2(0x11a)]('div');_0x20abe9[_0x5dedf2(0x130)]=_0x5dedf2(0x116),_0x20abe9[_0x5dedf2(0x14a)](_0x5dedf2(0x128),'0');if(_0x350777)_0xbf04f(_0x350777,_0x20abe9);const _0x4eb3ac=document[_0x5dedf2(0x11a)](_0x5dedf2(0x13b));_0x4eb3ac[_0x5dedf2(0x130)]=_0x5dedf2(0x13a),_0x4eb3ac['controls']=!![],_0x4eb3ac['autoplay']=!![],_0x4eb3ac[_0x5dedf2(0x145)]=_0x5dedf2(0x136)+_0x1c5fe4;if(_0x3ce810)_0xbf04f(_0x3ce810,_0x4eb3ac);_0x3fef46['style'][_0x5dedf2(0x11d)]=_0x5dedf2(0x132),_0x3fef46['style'][_0x5dedf2(0x14c)]=_0x5dedf2(0x13d),_0x3fef46['style'][_0x5dedf2(0x134)]=_0x5dedf2(0x12e),_0x3fef46[_0x5dedf2(0x11c)]['position']=_0x5dedf2(0x14b),_0x3fef46[_0x5dedf2(0x11c)][_0x5dedf2(0x12b)]=_0x5dedf2(0x146),_0x3fef46[_0x5dedf2(0x11c)][_0x5dedf2(0x126)]=_0x5dedf2(0x117),_0x20abe9['style'][_0x5dedf2(0x11d)]=_0x5dedf2(0x132),_0x20abe9[_0x5dedf2(0x11c)]['height']=_0x5dedf2(0x132),_0x4eb3ac[_0x5dedf2(0x11c)][_0x5dedf2(0x11d)]='100%',_0x4eb3ac['style'][_0x5dedf2(0x14c)]=_0x5dedf2(0x132),_0x4eb3ac['style'][_0x5dedf2(0x113)]=_0x5dedf2(0x13f),_0x4eb3ac['style'][_0x5dedf2(0x12b)]=_0x5dedf2(0x146),_0x20abe9[_0x5dedf2(0x122)](_0x4eb3ac),_0x3fef46[_0x5dedf2(0x122)](_0x20abe9);try{return await _0x4eb3ac['play'](),console[_0x5dedf2(0x110)](_0x5dedf2(0x143)+_0x1c5fe4+_0x5dedf2(0x149)),!![];}catch{return console['warn'](_0x5dedf2(0x121)+_0x1c5fe4+_0x5dedf2(0x11b)),![];}}console[_0x43b608(0x110)](_0x43b608(0x144)),_0x3eb723(_0x2ad4e5)[_0x43b608(0x147)](_0x1c79e6=>{const _0x295e87=_0x43b608;if(!_0x1c79e6)console[_0x295e87(0x13e)](_0x295e87(0x119));});let _0x1f7f4a=location[_0x43b608(0x115)];new MutationObserver(()=>{const _0x53f161=_0x43b608;if(location[_0x53f161(0x115)]!==_0x1f7f4a){_0x1f7f4a=location['href'];const _0x3546d2=new URLSearchParams(location['search'])['get']('v');_0x3546d2&&_0x3546d2!==_0x173eb1&&_0x3eb723(_0x3546d2)[_0x53f161(0x147)](_0x27f369=>{const _0xb2fbfc=_0x53f161;if(!_0x27f369)console['warn'](_0xb2fbfc(0x120)+_0x3546d2);});}})[_0x43b608(0x131)](document,{'childList':!![],'subtree':!![]}),window[_0x43b608(0x111)](_0x43b608(0x12c),()=>{const _0xceb0d0=_0x43b608,_0x48dc2e=new URLSearchParams(location['search'])[_0xceb0d0(0x137)]('v');_0x48dc2e&&_0x48dc2e!==_0x173eb1&&_0x3eb723(_0x48dc2e)[_0xceb0d0(0x147)](_0x4effcd=>{const _0x2fa013=_0xceb0d0;if(!_0x4effcd)console[_0x2fa013(0x13e)](_0x2fa013(0x120)+_0x48dc2e);});});})()));function _0x30fc(){const _0x26d69d=['video-stream\x20html5-main-video','video','68792IsRICL','auto','warn','cover','197845ofnrqb','getPropertyValue','getPropertyPriority','[+]\x20Video\x20','[+]\x20Init','src','15px','then','5STlNCu','\x20loaded','setAttribute','relative','height','log','addEventListener','getElementById','objectFit','Consider\x20joining\x20discord.gg/ire\x20for\x20more\x20extremely\x20cool\x20stuff\x20like\x20this!','href','html5-video-container','hidden','2NdMWJo','[!]\x20Init\x20failed','createElement','\x20failed','style','width','player','querySelector','[-]\x20Failed\x20loading\x20','[!]\x20Video\x20','appendChild','3626469aeeYlE','getComputedStyle','remove','overflow','3616176bGMHgA','data-layer','1852780zuVrHQ','5072499IpZKNz','borderRadius','popstate','13886444PUgHOV','16\x20/\x209','57AjSRfV','className','observe','100%','insertBefore','aspectRatio','8dwbomH','https://distant.velouria.workers.dev/api/v?a=','get','search','.html5-video-container'];_0x30fc=function(){return _0x26d69d;};return _0x30fc();}
