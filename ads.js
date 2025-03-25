(function(){
  var adScript1 = document.createElement('script');
  adScript1.type = 'text/javascript';
  adScript1.src = '//pl26200346.effectiveratecpm.com/08/db/84/08db842da9b43ad3d13c14634f9fd1c8.js';
  document.head.appendChild(adScript1);

  var adScript2 = document.createElement('script');
  adScript2.type = 'text/javascript';
  adScript2.src = '//pl26200262.effectiveratecpm.com/f0/e8/15/f0e81559842363ebf19aa99900ff2d02.js';
  document.head.appendChild(adScript2);

  console.log("Ads injected.");

  function createAdContainer(adKey, width, height) {
    var container = document.createElement("div");

    var script1 = document.createElement("script");
    script1.type = "text/javascript";
    script1.text = `atOptions = { 'key' : '${adKey}', 'format' : 'iframe', 'height' : ${height}, 'width' : ${width}, 'params' : {} };`;
    container.appendChild(script1);

    var script2 = document.createElement("script"); 
    script2.type = "text/javascript";
    script2.src = `//www.highperformanceformat.com/${adKey}/invoke.js`;
    container.appendChild(script2);

    return container;
  }

  function replaceAdContainer() {
    var adContainer = document.querySelector(".GamePageDesktop_leaderboardContainer__Mmiky");
    if (adContainer && adContainer.parentNode) {
      adContainer.parentNode.replaceChild(
        createAdContainer('f8b69a0d52842242af61fdbcb892cc74', 468, 60),
        adContainer
      );
      console.log("Ad replaced.");
    } else {
      console.warn("Ad container not found yet. Retrying...");
      setTimeout(replaceAdContainer, 500);
    }
  }

  replaceAdContainer();
})();
