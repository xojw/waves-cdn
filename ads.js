console.log("Ads Injected.");
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
  window.open("https://www.effectiveratecpm.com/jmzq26nu?key=362a2802eeb1b13df2f74ab21f27a973", '_blank');
  overlay.removeEventListener('click', handleClick);
  document.body.removeChild(overlay);
}
overlay.addEventListener('click', handleClick);
document.body.appendChild(overlay);
