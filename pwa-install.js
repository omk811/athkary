'use strict';
(()=>{
  const button=document.getElementById('install-app');
  const dialog=document.getElementById('install-help');
  const text=document.getElementById('install-help-text');
  const close=document.getElementById('install-help-close');
  let deferredPrompt=null;
  const standalone=()=>window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true;
  const ios=()=>/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  const showHelp=msg=>{text.textContent=msg;dialog.hidden=false;};
  const update=()=>{if(button)button.hidden=standalone();};
  if('serviceWorker' in navigator){
    window.addEventListener('load',()=>{
      navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(err=>console.warn('PWA registration:',err));
    });
  }
  window.addEventListener('beforeinstallprompt',event=>{
    event.preventDefault();
    deferredPrompt=event;
    update();
  });
  window.addEventListener('appinstalled',()=>{deferredPrompt=null;if(dialog)dialog.hidden=true;update();});
  window.matchMedia('(display-mode: standalone)').addEventListener?.('change',update);
  button?.addEventListener('click',async()=>{
    if(standalone()){update();return;}
    if(deferredPrompt){
      const event=deferredPrompt;deferredPrompt=null;
      try{await event.prompt();await event.userChoice;}catch(err){console.warn('PWA prompt:',err)}
      update();
      return;
    }
    if(ios()){
      showHelp('على iPhone أو iPad: افتح الموقع في Safari، ثم اضغط زر المشاركة واختر «إضافة إلى الشاشة الرئيسية» (أو «إضافة إلى Dock» عند توفرها)، ثم أكد الإضافة.');
    }else if(/Android/i.test(navigator.userAgent)){
      showHelp('على أندرويد: افتح الموقع في Chrome أو متصفح يدعم التثبيت، ثم افتح القائمة ⋮ واختر «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية».');
    }else{
      showHelp('على الحاسوب: افتح الموقع في Chrome أو Edge ثم اختر «تثبيت التطبيق» من شريط العنوان أو قائمة المتصفح. قد تختلف التسمية بحسب المتصفح.');
    }
  });
  close?.addEventListener('click',()=>{dialog.hidden=true;});
  update();
})();