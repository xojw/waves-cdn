(function(){
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
    var adContainer = document.querySelector(".GameInfo_secondMpuContainer__xiGbJ");
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
