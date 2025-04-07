(function(){
  const css = `
    ::-webkit-scrollbar {
      width: 5px;
    }
    
    ::-webkit-scrollbar-track {
      background: #000000;
    }
    
    ::-webkit-scrollbar-thumb {
      background: #4e4e4e;
      border-radius: 6px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
      background: #6b6b6b;
    }
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  const adUrls=[
    "https://raw.githubusercontent.com/StevenBlack/hosts/master/hosts",
    "https://s3.amazonaws.com/lists.disconnect.me/simple_tracking.txt",
    "https://s3.amazonaws.com/lists.disconnect.me/simple_ad.txt",
    "https://easylist.to/easylist/easylist.txt",
    "https://easylist.to/easylist/easyprivacy.txt"
  ];
  const pornListUrl="https://raw.githubusercontent.com/emiliodallatorre/adult-hosts-list/refs/heads/main/list.txt";
  const trackerListUrl="https://raw.githubusercontent.com/AdguardTeam/AdguardFilters/master/TrackersFilter/trackers.txt";
  let adDomains=new Set(), nonoDomains=new Set(), trackerDomains=new Set();
  const extRegex=/(\.js|\.css|\.jpg|\.png|\.gif|\.svg|\.webp|\.mp4|\.m3u8|\.json|\.ico|\.woff|\.woff2|\.ttf|\.otf|\.eot|\.xml|\.txt)$/i;
  
  function parseList(text,set){
    text.split("\n").forEach(line=>{
      line=line.trim();
      if(!line||line.startsWith("#"))return;
      if(line.includes("#"))line=line.split("#")[0].trim();
      const parts=line.split(/\s+/);
      let domain=parts.length===1?parts[0]:/^(0\.0\.0\.0|127\.0\.0\.1)$/.test(parts[0])?parts[1]:parts[0];
      if(domain)set.add(domain);
    });
  }
  
  function parseSimpleList(text,set){
    text.split("\n").forEach(line=>{
      line=line.trim();
      if(!line||line.startsWith("#"))return;
      const domain=line.split(/\s+/)[0];
      if(domain)set.add(domain);
    });
  }
  
  Promise.all(adUrls.map(url=>fetch(url).then(resp=>resp.text()).catch(()=> "")))
  .then(adResponses=>{
    adResponses.forEach(text=>parseList(text,adDomains));
    return Promise.all([
      fetch(pornListUrl).then(resp=>resp.text()).catch(()=> ""),
      fetch(trackerListUrl).then(resp=>resp.text()).catch(()=> "")
    ]);
  }).then(([pornText,trackerText])=>{
    parseSimpleList(pornText,nonoDomains);
    parseSimpleList(trackerText,trackerDomains);
    
    function isBlocked(url,set){
      try{
        const hostname=new URL(url,location.href).hostname;
        if(set.has(hostname))return true;
        for(const domain of set){
          if(hostname===domain||hostname.endsWith(`.${domain}`))return true;
        }
        return false;
      }catch(e){return false;}
    }
    
    function isAd(url){return isBlocked(url,adDomains);}
    function isNono(url){return isBlocked(url,nonoDomains);}
    function isTracker(url){return isBlocked(url,trackerDomains);}
    
    const origFetch=window.fetch;
    window.fetch=function(resource,init){
      const url=typeof resource==="string"?resource:resource.url;
      if((isAd(url)||isTracker(url))&&extRegex.test(url)){
        return Promise.resolve(new Response(null,{status:204,statusText:"Blocked"}));
      }
      return origFetch.apply(this,arguments);
    };
    
    const origXHROpen=XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open=function(method,url,async,user,password){
      if((isAd(url)||isTracker(url))&&extRegex.test(url)){
        this.addEventListener("readystatechange",function(){
          if(this.readyState<4)this.abort();
        });
      }
      return origXHROpen.apply(this,arguments);
    };
    
    const origSetAttribute=Element.prototype.setAttribute;
    Element.prototype.setAttribute=function(name,value){
      if((name==="src"||name==="href")&&(isAd(value)||isTracker(value))&&extRegex.test(value))return;
      return origSetAttribute.call(this,name,value);
    };
    
    const origWindowOpen=window.open;
    window.open=function(url,target,features,replace){
      if(isAd(url)||isTracker(url)){
        return null;
      }
      return origWindowOpen.apply(this,arguments);
    };
    
    const observer=new MutationObserver(mutations=>{
      mutations.forEach(mutation=>{
        mutation.addedNodes.forEach(node=>{
          if((node instanceof HTMLScriptElement||node instanceof HTMLIFrameElement)&&(isAd(node.src)||isTracker(node.src))&&extRegex.test(node.src)){
            node.remove();
          }
        });
      });
    });
    
    observer.observe(document.documentElement||document.body,{childList:true,subtree:true});
    
    if(isNono(location.href)){
      document.documentElement.innerHTML=`
        <div style="text-align:center; margin-top:23%; color:white; background-color:black; height:100vh; font-family:'Inter',sans-serif;">
          <h1>YOU are NOT wasting my bandwidth watching ts ✌️😹</h1>
        </div>
      `;
      return;
    }
    
    console.log("Waves Blocker Injected.");
  }).catch(()=>{});
})();
