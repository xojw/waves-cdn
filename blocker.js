(async function(){
  const adUrls = [
    "https://raw.githubusercontent.com/StevenBlack/hosts/master/hosts",
    "https://s3.amazonaws.com/lists.disconnect.me/simple_tracking.txt",
    "https://s3.amazonaws.com/lists.disconnect.me/simple_ad.txt",
    "https://easylist.to/easylist/easylist.txt",
    "https://easylist.to/easylist/easyprivacy.txt"
  ];
  const pornListUrl = "https://raw.githubusercontent.com/emiliodallatorre/adult-hosts-list/refs/heads/main/list.txt";
  const trackerListUrl = "https://raw.githubusercontent.com/AdguardTeam/AdguardFilters/master/TrackersFilter/trackers.txt";
  const adDomains = new Set(), nonoDomains = new Set(), trackerDomains = new Set();
  const extRegex = /\.(js|css|jpg|png|gif|svg|webp|mp4|m3u8|json|ico|woff2?|ttf|otf|eot|xml|txt)$/i;
  
  const fetchText = async url => {
    try {
      const res = await fetch(url);
      return await res.text();
    } catch(e) { return ""; }
  };
  
  const parseList = (text, set) => {
    text.split("\n").forEach(line => {
      line = line.trim();
      if (!line || line.startsWith("#")) return;
      if (line.includes("#")) line = line.split("#")[0].trim();
      const parts = line.split(/\s+/);
      const domain = parts.length === 1 ? parts[0] : /^(0\.0\.0\.0|127\.0\.0\.1)$/.test(parts[0]) ? parts[1] : parts[0];
      if (domain) set.add(domain);
    });
  };
  
  const parseSimpleList = (text, set) => {
    text.split("\n").forEach(line => {
      line = line.trim();
      if (!line || line.startsWith("#")) return;
      const domain = line.split(/\s+/)[0];
      if (domain) set.add(domain);
    });
  };
  
  const adTexts = await Promise.all(adUrls.map(url => fetchText(url)));
  adTexts.forEach(text => parseList(text, adDomains));
  
  const [pornText, trackerText] = await Promise.all([
    fetchText(pornListUrl),
    fetchText(trackerListUrl)
  ]);
  parseSimpleList(pornText, nonoDomains);
  parseSimpleList(trackerText, trackerDomains);
  
  const isBlocked = (url, set) => {
    try {
      const hostname = new URL(url, location.href).hostname;
      if (set.has(hostname)) return true;
      for (const domain of set)
        if (hostname === domain || hostname.endsWith(`.${domain}`))
          return true;
      return false;
    } catch(e) { return false; }
  };
  
  const isAd = url => isBlocked(url, adDomains);
  const isNono = url => isBlocked(url, nonoDomains);
  const isTracker = url => isBlocked(url, trackerDomains);
  
  const interceptFetch = window.fetch;
  window.fetch = function(resource, init){
    const url = typeof resource === "string" ? resource : resource.url;
    if ((isAd(url) || isTracker(url)) && extRegex.test(url))
      return Promise.resolve(new Response(null, {status: 204, statusText: "Blocked"}));
    return interceptFetch.apply(this, arguments);
  };
  
  const origXHROpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url, async, user, password){
    if ((isAd(url) || isTracker(url)) && extRegex.test(url))
      this.addEventListener("readystatechange", function(){
        if (this.readyState < 4) this.abort();
      });
    return origXHROpen.apply(this, arguments);
  };
  
  const origSetAttribute = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function(name, value){
    if ((name === "src" || name === "href") && (isAd(value) || isTracker(value)) && extRegex.test(value))
      return;
    return origSetAttribute.call(this, name, value);
  };
  
  const origWindowOpen = window.open;
  window.open = function(url, target, features, replace){
    if (isAd(url) || isTracker(url)) return null;
    return origWindowOpen.apply(this, arguments);
  };
  
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node instanceof Element) {
          if (node.tagName === "SCRIPT" || node.tagName === "IFRAME") {
            if ((isAd(node.src) || isTracker(node.src)) && extRegex.test(node.src)) {
              node.remove();
              return;
            }
          }
          const attributes = ["src", "href", "data-src"];
          attributes.forEach(attr => {
            const attrVal = node.getAttribute(attr);
            if (attrVal && (isAd(attrVal) || isTracker(attrVal)) && extRegex.test(attrVal))
              node.remove();
          });
        }
      });
    });
  });
  
  observer.observe(document.documentElement || document.body, {childList: true, subtree: true});
  
  if (isNono(location.href)){
    document.documentElement.innerHTML = `
      <div style="text-align:center; margin-top:23%; color:white; background-color:black; height:100vh; font-family:'Inter',sans-serif;">
        <h1>YOU are NOT wasting my bandwidth watching ts ✌️😹</h1>
      </div>
    `;
    return;
  }
  
  console.log("Waves Blocker Injected.");
})();