'use strict';
const groups=[
['day','☀','الصباح والمساء','أذكار أول النهار وآخره'],['sleep','☾','النوم والاستيقاظ','الذكر قبل النوم والوتر والاستيقاظ'],['daily','⌂','الحياة اليومية','المنزل والوضوء والطعام واللباس'],['prayer','✦','الصلاة وأذكارها','أذكار الصلاة وما بعدها'],['worship','۞','العبادات والقرآن','القرآن والجمعة والدعاء'],['nature','☁','المطر والرياح','أذكار أحوال الطبيعة'],['manners','❖','الآداب والمعاملات','السلام وآداب المسلم'],['hardship','♡','الشدائد والمرض','الكرب والهم والمرض والرقية'],['bereavement','❧','المصائب والتعزية','الجنائز والعزاء وزيارة المقابر'],['travel','✈','السفر والعودة','الركوب والسفر والرجوع'],['hajj','۞','الحج والعمرة','أذكار المناسك والأعياد'],['general','✿','الأذكار والفضائل','المقدمة وفضائل الذكر والدعاء']
];
let catalog=[],group='',topic=null,page=1;
const $=x=>document.querySelector(x),safe=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function go(hash){location.hash=hash;route()}
function view(v){['home','list','reader'].forEach(x=>$('#'+x).hidden=x!==v)}
function home(){view('home');$('#section-cards').innerHTML=groups.map(g=>{const n=catalog.filter(d=>d.category===g[0]).length;return '<button class="section-card" data-group="'+g[0]+'"><span class="symbol">'+g[1]+'</span><strong>'+g[2]+'</strong><small>'+g[3]+'</small><span class="bottom">'+n+' بابًا ←</span></button>'}).join('')}
function list(g){const meta=groups.find(x=>x[0]===g);if(!meta){home();return}group=g;view('list');$('#group-name').textContent=meta[2];$('#group-description').textContent=meta[3];$('#query').value='';topics()}
function topics(){let q=$('#query').value.trim();let list=catalog.filter(x=>x.category===group && (!q||x.title.includes(q)||String(x.id)===q));$('#list-count').textContent=list.length+' بابًا';$('#topic-cards').innerHTML=list.map(x=>'<button class="topic-card" data-id="'+x.id+'"><span class="number">'+(x.id||'م')+'</span><span class="detail"><strong>'+safe(x.title)+'</strong><small>ص '+x.page+(x.end>x.page?'–'+x.end:'')+'</small></span><span class="arrow">←</span></button>').join('')||'<div class="empty">لم نجد بابًا يطابق البحث.</div>'}
function key(){let number=Math.max(1,parseInt($('#dhikr-number').value,10)||1);return 'athkary-full-v1:'+topic.id+':'+number}
function count(){try{return Math.max(0,Number(localStorage.getItem(key()))||0)}catch{return 0}}
function setCount(n){n=Math.max(0,n);try{localStorage.setItem(key(),String(n))}catch{}$('#current-count').textContent=n}
function read(id){topic=catalog.find(x=>x.id===id);if(!topic){home();return}page=topic.page;view('reader');$('#topic-name').textContent=topic.title;$('#topic-page').textContent='جامع صحيح الأذكار، ص '+topic.page+(topic.end>topic.page?'–'+topic.end:'');$('#dhikr-number').value=1;$('#current-count').textContent=count();showPage()}
function showPage(){if(!topic)return;$('#page-count').textContent=page+' / '+topic.end;$('#previous').disabled=page===topic.page;$('#next').disabled=page===topic.end;$('#page-card').innerHTML='<div class="page-caption"><strong>ص '+page+'</strong><span>النص من صفحة الكتاب الأصلية</span></div><img src="pages/'+String(page).padStart(3,'0')+'.webp" loading="eager" decoding="async" alt="صفحة '+page+' من جامع صحيح الأذكار">'}
function route(){if(!catalog.length)return;const h=decodeURIComponent(location.hash.slice(1));if(h.startsWith('topic-'))read(Number(h.slice(6)));else if(h.startsWith('group-'))list(h.slice(6));else home();window.scrollTo({top:0,behavior:'instant'})}
$('#section-cards').addEventListener('click',e=>{const b=e.target.closest('[data-group]');if(b)go('group-'+b.dataset.group)});
$('#topic-cards').addEventListener('click',e=>{const b=e.target.closest('[data-id]');if(b)go('topic-'+b.dataset.id)});
$('#go-home').addEventListener('click',()=>{history.pushState(null,'',location.pathname+location.search);route()});
$('#go-back').addEventListener('click',()=>go('group-'+topic.category));
$('#query').addEventListener('input',topics);
$('#dhikr-number').addEventListener('change',()=>{$('#dhikr-number').value=Math.max(1,parseInt($('#dhikr-number').value,10)||1);$('#current-count').textContent=count()});
$('#plus').addEventListener('click',()=>setCount(count()+1));$('#minus').addEventListener('click',()=>setCount(count()-1));$('#zero').addEventListener('click',()=>setCount(0));
$('#previous').addEventListener('click',()=>{page=Math.max(topic.page,page-1);showPage()});$('#next').addEventListener('click',()=>{page=Math.min(topic.end,page+1);showPage()});
window.addEventListener('hashchange',route);window.addEventListener('popstate',route);
fetch('catalog.json').then(r=>{if(!r.ok)throw Error('Index unavailable');return r.json()}).then(x=>{catalog=x;route()}).catch(()=>{$('#section-cards').innerHTML='<div class="empty">لم يتم نشر فهرس الكتاب بعد. حدّث الصفحة بعد اكتمال نشر ملفات المصدر.</div>'});
