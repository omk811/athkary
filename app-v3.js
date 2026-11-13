'use strict';
const categories=[
{id:'morning',name:'أذكار الصباح',icon:'☀',desc:'ابدأ يومك بذكر الله',base:'daily'},
{id:'evening',name:'أذكار المساء',icon:'☾',desc:'أذكار آخر النهار',base:'daily'},
{id:'jawami',name:'جوامع دعاء النبي ﷺ',icon:'✧',desc:'خمسون دعاءً مع الهوامش والتخريج'},
{id:'wake',name:'أذكار الاستيقاظ',icon:'🌤',desc:'عند الاستيقاظ من النوم'},
{id:'clothing',name:'أذكار اللباس',icon:'❀',desc:'عند لبس الثياب'},
{id:'hygiene',name:'أذكار الطهارة',icon:'◈',desc:'الخلاء والوضوء'},
{id:'home',name:'أذكار المنزل',icon:'⌂',desc:'الدخول والخروج من المنزل'},
{id:'mosque',name:'المسجد والأذان',icon:'♧',desc:'الأذان ودخول المسجد والخروج'},
{id:'prayer',name:'أذكار الصلاة',icon:'✦',desc:'من الاستفتاح إلى ما بعد السلام'},
{id:'fasting',name:'أذكار الصيام',icon:'☽',desc:'رمضان والإفطار'},
{id:'food',name:'الطعام والشراب',icon:'❁',desc:'قبل الطعام وبعده'},
{id:'social',name:'المجالس والآداب',icon:'♡',desc:'التهنئة والمجالس والآداب'},
{id:'hajj',name:'الحج والعمرة',icon:'۞',desc:'أذكار المناسك'},
{id:'travel',name:'السفر والركوب',icon:'✈',desc:'الخروج للسفر والعودة'},
{id:'nature',name:'المطر والرياح',icon:'☁',desc:'ما يقال في أحوال الطبيعة'},
{id:'health',name:'المرض والعافية',icon:'✚',desc:'الدعاء للمريض'},
{id:'hardships',name:'الشدائد والهموم',icon:'❥',desc:'دعوات الكرب والهم والمصيبة'}
];
const $=s=>document.querySelector(s);const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&quot;'}[c]));
const norm=s=>String(s||'').replace(/[\u064B-\u065F\u0670ـ]/g,'').replace(/[،؛.\s﴿﴾"'()]/g,'').replace(/[إأآ]/g,'ا').replace(/ى/g,'ي');
let records=[],active=null,query='',size=Number(localStorage.getItem('athkary-text-size-v3'))||1,showGuidance=false;
const today=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};
function storageKey(d){return 'azkary-v3:'+today()+':'+d.id}
function number(d){try{return Math.max(0,Number(localStorage.getItem(storageKey(d)))||0)}catch{return 0}}
function save(d,num){try{localStorage.setItem(storageKey(d),String(Math.max(0,num)))}catch{}renderCards()}
function uniqueEntries(input){
const map=new Map(),out=[];
for(const r of input){
const k=norm(r.body);let p=k.length>25?map.get(k):null;
if(p){for(const c of r.categories){if(!p.categories.includes(c))p.categories.push(c)}
if(r.jawami){p.jawami=r.jawami;p.jawamiPage=r.jawamiPage;}
p.refs=[...new Set([...(p.refs||[]),...(r.refs||[])])];
}else{p={...r,categories:[...r.categories]};out.push(p);if(k.length>25)map.set(k,p)}
}return out
}
function categoryItems(id){return records.filter(d=>d.categories.includes(id))}
function pageData(){return active?categoryItems(active):[]}
function goto(category){window.location.hash=category?'section-'+category:'';route()}
function route(){const h=decodeURIComponent(window.location.hash.slice(1));const id=h.startsWith('section-')?h.slice(8):null;active=categories.some(c=>c.id===id)?id:null;$('#home').hidden=!!active;$('#detail').hidden=!active;query='';$('#filter').value='';if(active){const c=categories.find(x=>x.id===active);$('#category-title').textContent=c.name;$('#category-description').textContent=c.desc;renderCards()}else renderHome();window.scrollTo({top:0,behavior:'instant'})}
function renderHome(){$('#categories').innerHTML=categories.map(c=>{const n=categoryItems(c.id).filter(x=>x.type!=='guidance').length;return '<button type="button" class="category-card" data-category="'+c.id+'"><span class="category-ico" aria-hidden="true">'+c.icon+'</span><span class="category-title">'+esc(c.name)+'</span><span class="category-desc">'+esc(c.desc)+'</span><span class="category-foot"><span>'+n+' '+(n===1?'ذكر':'مادة')+'</span><span>تصفح ←</span></span></button>'}).join('')}
function usefulContext(d){
const raw=String(d.context||'').trim();
if(!raw)return '';
const clean=raw.replace(/^[\s،؛.\-–]+|[\s،؛.\-–]+$/g,'').trim();
if(!clean)return '';
// Mere attribution or repetition count already appears in the citation and counter.
const informational=clean.replace(/(?:صحيح|حسن)(?:\s+بمجموع\s+طرقه)?\s*[؛،]?/g,'').replace(/(?:رواه|روى|رواهما|متفق عليه)\s*(?:البخاري|مسلم|الترمذي|أبو داود|أحمد|النسائي|ابن ماجه|الحاكم|الطبراني|عبد بن حميد)(?:\s*[،و]\s*(?:مسلم|البخاري))?/g,'').replace(/(?:ثلاث|ثلاثًا|ثلاثا|أربع|أربعًا|أربعا|سبع|سبعًا|سبعا|مائة|مئة|ثلاث\s*وثلاثين)\s+مر(?:ة|ات)/g,'').replace(/[\s،؛.\-–:]+/g,'').trim();
return informational.length>=12?clean:'';
}
function renderCards(){
if(!active)return;
const all=pageData();const terms=query.trim();const filtered=all.filter(d=>(showGuidance||d.type!=='guidance')&&(!terms||[d.title,d.body,d.context,d.source,d.jawami?.footnote||''].join(' ').includes(terms)));
const completed=all.filter(d=>d.type!=='guidance'&&number(d)>0).length;
const countable=all.filter(d=>d.type!=='guidance').length;
$('#progress-text').textContent='قرأت اليوم '+completed+' من '+countable+' ذكرًا';
$('#progress-fill').style.width=(countable?Math.round(100*completed/countable):0)+'%';
$('#cards').innerHTML=filtered.map((d,i)=>{
const isInstruction=d.type==='guidance';const n=number(d);
const body=active==='evening'&&d.eveningBody?d.eveningBody:d.body;
const footnote=active==='jawami'&&d.jawami?.footnote?'<div class="footnote"><strong>الهامش من الكتيب</strong><p>'+esc(d.jawami.footnote)+'</p><small>«من جوامع دعاء النبي ﷺ» — ص '+d.jawamiPage+'</small></div>':'';
const src=active!=='jawami'?'<p class="ref"><b>التوثيق:</b> '+esc(d.source||'الأذكار اليومية من صحيح السنة النبوية')+'</p>':'';
const detail=usefulContext(d);
const ctx=detail?'<details class="more"><summary>'+(isInstruction?'تفاصيل الإرشاد':'معلومات إضافية من المصدر')+'</summary><p>'+esc(detail)+'</p></details>':'';
const counter=isInstruction?'':'<div class="count-controls"><span class="num" aria-label="عدد مرات قراءتك اليوم">'+n+'</span><button class="tap-plus" data-op="plus" data-id="'+d.id+'" aria-label="احتساب قراءة">قرأتُ الذكر +</button><button class="tap-reset" data-op="reset" data-id="'+d.id+'" aria-label="إعادة العداد">↺</button>'+(d.repeat>1?'<span class="target">العدد المذكور في المصدر: '+d.repeat+'</span>':'<span class="target">عدد للمتابعة فقط</span>')+'</div>';
return '<article class="prayer-card'+(isInstruction?' guidance-card':'')+'" data-record="'+d.id+'"><div class="card-head"><span class="index">'+(i+1)+'</span><h3>'+esc(d.title)+'</h3><span class="type">'+(isInstruction?'إرشاد':'ذكر مأثور')+'</span></div><p class="prayer-body" style="font-size:calc(var(--prayer-size) * '+size+')" dir="rtl">'+esc(body)+'</p>'+ctx+src+footnote+counter+'</article>'
}).join('')||'<p class="empty">لم أجد نتائج مطابقة. جرّب كلمة أخرى.</p>';
$('#result-count').textContent=filtered.length+' مادة';
}
async function boot(){
try{
const [a,b]=await Promise.all([fetch('data/source.json',{cache:'no-store'}),fetch('data/jawami.json',{cache:'no-store'})]);
if(!a.ok||!b.ok)throw Error('تعذر تحميل بيانات الأذكار');
const sa=(await a.json()).entries;const ja=(await b.json()).entries;
const fromSource=sa.map(x=>({...x,categories:x.section==='daily'?['morning','evening']:(x.section==='morningOnly'?['morning']:[x.section]),refs:[x.source]}));
const fromJawami=ja.map(x=>({id:x.id,body:x.body,title:x.title,type:'dhikr',source:'«من جوامع دعاء النبي ﷺ» ص '+x.page,context:'',repeat:1,categories:['jawami'],jawami:{footnote:x.footnote},jawamiPage:x.page,refs:[x.footnote]}));
records=uniqueEntries(fromSource.concat(fromJawami));
const jawamiCount=records.filter(x=>x.categories.includes('jawami')).length;
if(jawamiCount!==50)throw Error('فهرس جوامع الدعاء غير مكتمل: '+jawamiCount);
const totalNode=$('#total-count');if(totalNode)totalNode.textContent=records.length;
route();
}catch(err){$('#categories').innerHTML='<p class="empty">تعذر تحميل الأذكار. يرجى تحديث الصفحة بعد اكتمال نشر الموقع.</p>';(()=>{const status=$('#loading-text');if(status)status.textContent=err.message||String(err)})()}
}
$('#categories').addEventListener('click',e=>{const b=e.target.closest('[data-category]');if(b)goto(b.dataset.category)});
$('#cards').addEventListener('click',e=>{const b=e.target.closest('[data-op]');if(!b)return;const d=records.find(x=>x.id===b.dataset.id);if(d)save(d,b.dataset.op==='plus'?number(d)+1:0)});
$('#back').addEventListener('click',()=>{history.pushState(null,'',location.pathname+location.search);route()});
$('#filter').addEventListener('input',e=>{query=e.target.value;renderCards()});
$('#font-plus').addEventListener('click',()=>{size=Math.min(1.5,+(size+.1).toFixed(2));localStorage.setItem('athkary-text-size-v3',String(size));renderCards()});
$('#font-minus').addEventListener('click',()=>{size=Math.max(.85,+(size-.1).toFixed(2));localStorage.setItem('athkary-text-size-v3',String(size));renderCards()});
$('#show-guidance').addEventListener('change',e=>{showGuidance=e.target.checked;renderCards()});
window.addEventListener('hashchange',route);window.addEventListener('popstate',route);
boot();