(function() {
  const urls = [
    "https://raw.githubusercontent.com/StevenBlack/hosts/master/hosts",
    "https://s3.amazonaws.com/lists.disconnect.me/simple_tracking.txt",
    "https://s3.amazonaws.com/lists.disconnect.me/simple_ad.txt",
    "https://easylist.to/easylist/easylist.txt",
    "https://easylist.to/easylist/easyprivacy.txt",
  ];

  Promise.all(urls.map(url =>
    fetch(url)
      .then(resp => resp.text())
      .catch(() => "")
  )).then(responses => {
    const blockedDomains = new Set();
    responses.forEach(text => {
      text.split('\n').forEach(line => {
        line = line.trim();
        if (!line || line.startsWith('#')) return;
        if (line.indexOf('#') !== -1) {
          line = line.split('#')[0].trim();
        }
        const parts = line.split(/\s+/);
        let domain;
        if (parts.length === 1) {
          domain = parts[0];
        } else {
          domain = /^(0\.0\.0\.0|127\.0\.0\.1)$/.test(parts[0]) ? parts[1] : parts[0];
        }
        if (domain) blockedDomains.add(domain);
      });
    });

    function isAdServer(url) {
      try {
        const hostname = new URL(url, location.href).hostname;
        if (blockedDomains.has(hostname)) return true;
        for (const domain of blockedDomains) {
          if (hostname === domain || hostname.endsWith(`.${domain}`)) {
            return true;
          }
        }
        return false;
      } catch (e) {
        return false;
      }
    }

    const originalFetch = window.fetch;
    window.fetch = function(resource, init) {
      const url = typeof resource === 'string' ? resource : resource.url;
      if (isAdServer(url)) {
        return Promise.resolve(new Response(null, {
          status: 204,
          statusText: 'Blocked'
        }));
      }
      return originalFetch.apply(this, arguments);
    };

    const originalXHROpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
      if (isAdServer(url)) {
        this.addEventListener('readystatechange', function() {
          if (this.readyState < 4) {
            this.abort();
          }
        });
      }
      return originalXHROpen.apply(this, arguments);
    };

    const originalSetAttribute = Element.prototype.setAttribute;
    Element.prototype.setAttribute = function(name, value) {
      if ((name === 'src' || name === 'href') && isAdServer(value)) {
        return;
      }
      return originalSetAttribute.call(this, name, value);
    };

    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if ((node instanceof HTMLScriptElement || node instanceof HTMLIFrameElement) && isAdServer(node.src)) {
            node.remove();
          }
        });
      });
    });
    observer.observe(document.documentElement || document.body, {
      childList: true,
      subtree: true
    });

    console.log("Ads Blocker injected.");
  }).catch(() => {});
})();