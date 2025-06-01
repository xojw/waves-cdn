(function(){
  const videoId=new URLSearchParams(location.search).get('v');
  const originalPlayer=document.getElementById('player');
  if(!videoId||!originalPlayer)return;
  let lastVideoId=null;
  function copyLayoutStyles(src,dst){
    const cs=window.getComputedStyle(src);
    const props=[
      'width','height','display','position','top','left','right','bottom',
      'margin','margin-top','margin-right','margin-bottom','margin-left',
      'padding','padding-top','padding-right','padding-bottom','padding-left',
      'aspect-ratio','z-index'
    ];
    props.forEach(p=>dst.style.setProperty(p,cs.getPropertyValue(p),cs.getPropertyPriority(p)));
  }
  async function replaceAndRender(id){
    if(!id)return false;
    lastVideoId=id;
    const oldPlayer=document.getElementById('player');
    if(!oldPlayer)return false;
    const origContainer=oldPlayer.querySelector('.html5-video-container');
    const origVideo=oldPlayer.querySelector('.video-stream');
    const parent=oldPlayer.parentNode;
    const nextSibling=oldPlayer.nextSibling;
    const rect=oldPlayer.getBoundingClientRect();
    const newPlayer=document.createElement('div');
    newPlayer.id='player';
    copyLayoutStyles(oldPlayer,newPlayer);
    newPlayer.style.width=rect.width+'px';
    newPlayer.style.height=rect.height+'px';
    newPlayer.style.boxSizing='border-box';
    newPlayer.style.overflow='hidden';
    parent.removeChild(oldPlayer);
    parent.insertBefore(newPlayer,nextSibling);
    document.getElementById('error-screen')?.remove();
    const newContainer=document.createElement('div');
    newContainer.className='html5-video-container';
    newContainer.dataset.layer='0';
    copyLayoutStyles(origContainer||newPlayer,newContainer);
    newContainer.style.width='100%';
    newContainer.style.height='100%';
    newContainer.style.position='relative';
    const newVideo=document.createElement('video');
    newVideo.className='video-stream html5-main-video';
    newVideo.controls=true;
    newVideo.autoplay=true;
    newVideo.src=`https://distant.velouria.workers.dev/api/v?a=${id}`;
    if(origVideo)copyLayoutStyles(origVideo,newVideo);
    newVideo.style.width='100%';
    newVideo.style.height='100%';
    newVideo.style.objectFit='contain';
    newVideo.style.position='absolute';
    newVideo.style.top='0';
    newVideo.style.left='0';
    newContainer.appendChild(newVideo);
    newPlayer.appendChild(newContainer);
    try{
      await newVideo.play();
      console.log(`[+] Video ${id} loaded`);
      return true;
    }catch(err){
      console.warn(`[!] Video ${id} failed to play`,err);
      return false;
    }
  }
  replaceAndRender(videoId).then(success=>{
    if(!success)console.warn('[!] Init failed');
  });
  let lastHref=location.href;
  new MutationObserver(()=>{
    if(location.href!==lastHref){
      lastHref=location.href;
      const id=new URLSearchParams(location.search).get('v');
      if(id&&id!==lastVideoId){
        replaceAndRender(id).catch(()=>console.warn(`[-] Failed loading ${id}`));
      }
    }
  }).observe(document,{childList:true,subtree:true});
  window.addEventListener('popstate',()=>{
    const id=new URLSearchParams(location.search).get('v');
    if(id&&id!==lastVideoId){
      replaceAndRender(id).catch(()=>console.warn(`[-] Failed loading ${id}`));
    }
  });
})();
