(()=>{
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const KEY='jeearc_v1';
const DEF_TT=[["03:30","Wake up + water + get ready"],["03:45","JEE Deep Work — hardest subject"],["05:15","Quick revision / questions"],["05:45","Workout + get ready"],["06:30","School van"],["09:15","Breakfast"],["13:00","Home + lunch + rest"],["15:00","School revision / pending work"],["16:00","Online class"],["18:00","Class break + banana shake"],["20:15","Classes finish + dinner"],["20:45","Today's goals + light revision"],["21:30","Wind down / sleep"]];
const DEF_N=[["06:30","Wake up + water + get ready"],["07:00","JEE Deep Work — hardest subject"],["09:00","Breakfast"],["09:30","Questions / problem practice"],["11:30","Break + light activity"],["12:00","Second subject study"],["13:30","Lunch + rest"],["15:00","Revision / mistake notebook"],["16:30","Workout / outdoor time"],["17:30","Third subject / practice"],["19:30","Dinner"],["20:15","Today's goals + light revision"],["22:00","Wind down / sleep"]];
const defNormal=()=>DEF_N.map((x,i)=>({id:'n'+i+Date.now(),t:x[0],a:x[1]}));
const defTT=()=>DEF_TT.map((x,i)=>({id:'d'+i+Date.now(),t:x[0],a:x[1]}));
const day=(d=new Date())=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const CATS={Physics:'#38bdf8',Chemistry:'#f472b6',Mathematics:'#fbbf24',School:'#a78bfa',Revision:'#34d399',Health:'#fb923c',Personal:'#94a3b8'};
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
let S;
function fresh(){return{goals:[],tts:{school:defTT(),normal:defNormal()},mode:'school',sd:[1,2,3,4,5],auto:true,autoDate:'',fm:25,bm:5,hist:{},focus:{},sound:true,vol:60,acc:60,dark:true,remind:false,date:day(),mDate:'',notified:''}}
function load(){try{S=Object.assign(fresh(),JSON.parse(localStorage.getItem(KEY))||{})}catch(e){S=fresh()}
 if(Array.isArray(S.tt)){S.tts.school=S.tt}delete S.tt;if(S.mode!=='normal')S.mode='school';if(!S.tts.school)S.tts.school=defTT();if(!S.tts.normal)S.tts.normal=defNormal()}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
load();

/* ---------- audio ---------- */
let AC;
function unlock(){if(!AC){try{AC=new(window.AudioContext||window.webkitAudioContext)()}catch(e){}}if(AC&&AC.state==='suspended')AC.resume()}
['pointerdown','keydown','touchstart'].forEach(e=>addEventListener(e,unlock,{passive:true}));
const SND={remind:[[880,0,.2],[1318,.17,.4]],done:[[660,0,.1],[990,.09,.22]],focus:[[523,0,.2],[659,.18,.2],[784,.36,.45]],brk:[[784,0,.2],[523,.2,.45]],mission:[[523,0,.15],[659,.13,.15],[784,.26,.15],[1046,.39,.25],[1318,.55,.7]]};
function play(k){if(!S.sound||S.vol<=0)return;unlock();if(!AC)return;const n=AC.currentTime;SND[k].forEach(([f,t,d])=>{const o=AC.createOscillator(),g=AC.createGain();o.type=k==='mission'?'triangle':'sine';o.frequency.value=f;const v=S.vol/100*.45;g.gain.setValueAtTime(0.0001,n+t);g.gain.linearRampToValueAtTime(v,n+t+.02);g.gain.exponentialRampToValueAtTime(.0001,n+t+d);o.connect(g);g.connect(AC.destination);o.start(n+t);o.stop(n+t+d+.05)})}

/* ---------- toast + notify ---------- */
function toast(m,ms=3200){const t=document.createElement('div');t.className='toast';t.textContent=m;$('toasts').appendChild(t);setTimeout(()=>{t.classList.add('out');setTimeout(()=>t.remove(),320)},ms)}
function notify(body,snd='remind',title='JEE ARC 🔔'){
 play(snd);toast(title+' — '+body,4500);
 if('Notification' in window&&Notification.permission==='granted'){try{new Notification(title,{body})}catch(e){}}
}

/* ---------- content ---------- */
const QUOTES=["Consistency beats intensity.","You don't need motivation. Start the first 10 minutes.","Stop measuring yourself by hours. Measure completed goals.","One question at a time. One chapter at a time.","Your rank is built on ordinary days.","Finish today's questions before worrying about tomorrow's syllabus.","Concept → Questions → Mistakes → Revision.","Don't compare your chapter count. Improve your problem-solving.","A mistake you understand is a mark you'll earn later.","Small wins, stacked daily, become big results.","Rest is part of the plan, not a break from it.","Be proud of showing up today."];
const TIPS=["Start with the hardest subject while your mind is fresh.","Keep a mistake notebook and revisit it weekly.","Write 3 goals, not 10. Finish them fully.","After 25 minutes of focus, step away for 5 — truly away.","Solve first, check later. Struggle builds skill.","Sleep protects everything you learned today."];
let qi=-1;
function push(){let n;do{n=Math.floor(Math.random()*QUOTES.length)}while(n===qi);qi=n;const q=$('quote');q.style.opacity=0;setTimeout(()=>{q.textContent='“'+QUOTES[n]+'”';$('tip').textContent='💡 '+TIPS[Math.floor(Math.random()*TIPS.length)];q.style.opacity=1},200)}

/* ---------- progress / streak ---------- */
const pct=()=>{const t=S.goals.length;return t?Math.round(S.goals.filter(g=>g.done).length/t*100):0};
function streak(){const d=new Date();if((S.hist[day(d)]||0)<100)d.setDate(d.getDate()-1);let n=0;while((S.hist[day(d)]||0)>=100){n++;d.setDate(d.getDate()-1)}return n}
function renderProgress(){
 const p=pct(),done=S.goals.filter(g=>g.done).length,tot=S.goals.length;
 S.hist[S.date]=p;save();
 $('hfill').style.width=p+'%';$('hpct').textContent=p+'%';
 const m=!tot?"Add your first goal and give it 10 focused minutes.":p===0?"Pick one goal and start with just 10 minutes.":p<50?"Good start — keep the momentum going.":p<100?"More than halfway there. Finish strong.":"Today's mission complete. You earned your rest.";
 $('hmsg').textContent=m;
 const win=tot>0&&p===100;$('mission').style.display=win?'block':'none';$('hero').classList.toggle('win',win);
 const best=Math.max(0,...Object.values(S.hist));
 const items=[[done,'COMPLETED'],[tot,'TOTAL GOALS'],[p+'%','COMPLETION'],['🔥 '+streak(),'DAY STREAK'],[best+'%','BEST DAY'],[S.focus[S.date]||0,'FOCUS SESSIONS']];
 $('stats').innerHTML=items.map(i=>`<div class="card stat"><b>${i[0]}</b><small>${i[1]}</small></div>`).join('');
}

/* ---------- goals ---------- */
function renderGoals(){
 $('goals').innerHTML=S.goals.length?S.goals.map(g=>{const c=CATS[g.c];return`<li class="row ${g.done?'done':''}" data-id="${g.id}"><button class="cb" data-a="tog" aria-label="Toggle goal">${g.done?'✓':''}</button><span class="gt">${esc(g.t)}</span>${g.r?'<span title="Repeats daily" style="color:var(--mu)">↻</span>':''}${c?`<span class="badge" style="color:${c};border-color:${c}55;background:${c}18">${g.c.toUpperCase()}</span>`:''}<button class="x" data-a="del" aria-label="Delete goal">✕</button></li>`}).join(''):'<li class="empty">No goals yet. Add one above — start small.</li>';
 renderProgress();
}
function addGoal(){const v=$('gIn').value.trim();if(!v){toast('Type a goal first');return}
 S.goals.push({id:uid(),t:v,c:$('gCat').value,r:$('gRec').checked,done:false});$('gIn').value='';save();renderGoals();toast('Goal added ✓')}
$('gAdd').onclick=addGoal;$('gIn').onkeydown=e=>{if(e.key==='Enter')addGoal()};
$('goals').onclick=e=>{const b=e.target.closest('[data-a]');if(!b)return;const id=b.closest('li').dataset.id,g=S.goals.find(x=>x.id===id);if(!g)return;
 if(b.dataset.a==='del'){S.goals=S.goals.filter(x=>x.id!==id);save();renderGoals();toast('Goal deleted');return}
 g.done=!g.done;save();renderGoals();
 if(g.done){const all=pct()===100;if(all&&S.mDate!==S.date){S.mDate=S.date;save();play('mission');toast('Mission complete 🔥',4500)}else if(all){play('done')}else{play('done');toast('Goal completed ✓')}}
};

/* ---------- timetable ---------- */
let editId=null;
const mins=t=>{const[h,m]=t.split(':').map(Number);return h*60+m};
const f12=t=>{let[h,m]=t.split(':').map(Number);const ap=h>=12?'PM':'AM';h=h%12||12;return h+':'+String(m).padStart(2,'0')+' '+ap};
function autoMode(force){
 S.sd=Array.isArray(S.sd)?[...new Set(S.sd.filter(n=>Number.isInteger(n)&&n>=0&&n<=6))]:[1,2,3,4,5];
 if(!S.auto||(!force&&S.autoDate===day()))return;
 S.autoDate=day();S.mode=S.sd.includes(new Date().getDay())?'school':'normal';save();
}
function renderWk(){
 const N=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],D=[1,2,3,4,5,6,0];
 $('wk').innerHTML=D.map((d,i)=>{const sc=S.sd.includes(d);return`<button data-d="${d}" class="${sc?'s':''}" aria-label="${N[i]}: ${sc?'School day':'Normal day'}"><small>${N[i]}</small><span>${sc?'🏫':'🏠'}</span></button>`}).join('');
 $('wkAuto').checked=!!S.auto;
 const td=S.sd.includes(new Date().getDay());
 $('wkInfo').textContent='Today is a '+(td?'School Day':'Normal Day')+'. Tap a day to switch it between School 🏫 and Normal 🏠.'+(S.auto&&(td?'school':'normal')!==S.mode?' (You switched manually for today.)':'');
}
$('wk').onclick=e=>{const b=e.target.closest('[data-d]');if(!b)return;const d=+b.dataset.d;
 S.sd=S.sd.includes(d)?S.sd.filter(x=>x!==d):[...S.sd,d];autoMode(true);save();editId=null;renderTT();
 toast(['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][d]+' is now a '+(S.sd.includes(d)?'School Day 🏫':'Normal Day 🏠'))};
$('wkAuto').onchange=e=>{S.auto=e.target.checked;if(S.auto)autoMode(true);save();editId=null;renderTT();toast(S.auto?'Auto-switch on ✓':'Auto-switch off')};
const TT=()=>S.tts[S.mode];
const sorted=()=>[...TT()].sort((a,b)=>mins(a.t)-mins(b.t));
function currentId(){const l=sorted();if(!l.length)return null;const n=new Date(),now=n.getHours()*60+n.getMinutes();let c=null;l.forEach(x=>{if(mins(x.t)<=now)c=x});return(c||l[l.length-1]).id}
function renderTT(){
 renderWk();
 [...$('tabs').children].forEach(b=>b.classList.toggle('on',b.dataset.m===S.mode));
 const l=sorted(),cur=currentId();let seen=false;
 $('tt').innerHTML=l.length?l.map(x=>{
  const isNow=x.id===cur;if(isNow)seen=true;const past=!seen;
  if(editId===x.id)return`<li class="row tt" data-id="${x.id}"><input type="time" value="${x.t}" data-f="t"><input type="text" value="${esc(x.a)}" maxlength="80" data-f="a"><button class="btn sm" data-a="save">Save</button><button class="btn ghost sm" data-a="cancel">✕</button></li>`;
  return`<li class="row tt ${isNow?'now':''} ${past?'past':''}" data-id="${x.id}"><span class="tm">${f12(x.t)}</span><span class="gt">${esc(x.a)}</span><span class="tag">${isNow?'NOW':past?'DONE':'UPCOMING'}</span><button class="x" data-a="edit" aria-label="Edit">✎</button><button class="x" data-a="del" aria-label="Delete">✕</button></li>`}).join(''):'<li class="empty">Timetable is empty. Add an activity or restore the default.</li>';
}
$('tAdd').onclick=()=>{const t=$('tTime').value,a=$('tIn').value.trim();if(!t||!a){toast('Pick a time and enter an activity');return}
 TT().push({id:uid(),t,a});$('tIn').value='';save();renderTT();toast('Timetable updated ✓')};
$('tIn').onkeydown=e=>{if(e.key==='Enter')$('tAdd').click()};
$('tt').onclick=e=>{const b=e.target.closest('[data-a]');if(!b)return;const li=b.closest('li'),id=li.dataset.id;
 if(b.dataset.a==='del'){S.tts[S.mode]=TT().filter(x=>x.id!==id);save();renderTT();toast('Timetable updated ✓')}
 else if(b.dataset.a==='edit'){editId=id;renderTT()}
 else if(b.dataset.a==='cancel'){editId=null;renderTT()}
 else if(b.dataset.a==='save'){const t=li.querySelector('[data-f=t]').value,a=li.querySelector('[data-f=a]').value.trim();if(!t||!a){toast('Time and activity are required');return}
  const x=TT().find(z=>z.id===id);x.t=t;x.a=a;editId=null;save();renderTT();toast('Timetable updated ✓')}};
const restoreTT=()=>{const n=S.mode==='school'?'School Day':'Normal Day';if(confirm('Restore the default '+n+' timetable? Your custom version will be replaced.')){S.tts[S.mode]=S.mode==='school'?defTT():defNormal();editId=null;save();renderTT();toast('Default '+n+' timetable restored ✓')}};
$('tabs').onclick=e=>{const b=e.target.closest('[data-m]');if(!b||b.dataset.m===S.mode)return;S.mode=b.dataset.m;editId=null;save();renderTT();toast((S.mode==='school'?'School Day':'Normal Day')+' timetable active ✓')};
$('tRes').onclick=restoreTT;

/* ---------- reminders ---------- */
function remCheck(){
 if(!S.remind)return;const n=new Date(),k=day(n),hm=String(n.getHours()).padStart(2,'0')+':'+String(n.getMinutes()).padStart(2,'0');
 TT().filter(x=>x.t===hm).forEach(x=>{const key=k+x.id+hm;if(S.notified!==key){S.notified=key;save();notify(/class/i.test(x.a)?x.a+' starts now.':'Time for '+x.a+'.')}});
}
function remUI(){$('bRem').textContent=S.remind?'🔔 Reminders ON':'🔔 Enable Reminders';$('sRem').textContent=S.remind?'ON':'OFF'}
async function toggleRem(){
 if(S.remind){S.remind=false;save();remUI();toast('Reminders turned off');return}
 if('Notification' in window&&Notification.permission==='default'){try{await Notification.requestPermission()}catch(e){}}
 S.remind=true;save();remUI();unlock();play('done');
 const ok='Notification' in window&&Notification.permission==='granted';
 toast(ok?'Reminder enabled 🔔':'Reminders on (in-page only) — browser notifications are blocked',4200);
}
$('bRem').onclick=toggleRem;$('sRem').onclick=toggleRem;
const test=()=>{unlock();notify('This is a test reminder.')};
$('bTest').onclick=test;$('sTest').onclick=test;

/* ---------- timer ---------- */
const FULL={focus:1500,brk:300};
let T={mode:'focus',left:1500,run:false,end:0};
function applyDur(){const c=(v,a,b,d)=>{v=Math.round(+v);return isFinite(v)?Math.min(Math.max(v,a),b):d};S.fm=c(S.fm,1,180,25);S.bm=c(S.bm,1,60,5);$('dF').value=S.fm;$('dB').value=S.bm;FULL.focus=S.fm*60;FULL.brk=S.bm*60;$('fBreak').textContent='Break '+S.bm+'m';if(!T.run)T.left=FULL[T.mode];renderTimer()}
$('dF').onchange=e=>{S.fm=e.target.value;applyDur();save();toast('Focus length set to '+S.fm+' min ✓')};
$('dB').onchange=e=>{S.bm=e.target.value;applyDur();save();toast('Break length set to '+S.bm+' min ✓')};
const mmss=s=>String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
function renderTimer(){
 $('tmr').textContent=mmss(T.left);$('tlab').textContent=T.mode==='focus'?'DEEP WORK':'SHORT BREAK';
 $('pg').style.strokeDashoffset=339.29*(1-T.left/FULL[T.mode]);
 $('ring').classList.toggle('low',T.run&&T.left<=60);
 $('fPause').disabled=!T.run;$('fResume').disabled=T.run||T.left>=FULL[T.mode]||T.left===0;
 document.title=T.run?mmss(T.left)+' · JEE ARC':'JEE ARC — Command Center';
}
const go=()=>{T.run=true;T.end=Date.now()+T.left*1000;renderTimer()};
$('fStart').onclick=()=>{unlock();T.mode='focus';T.left=FULL.focus;go();toast('Focus started — one goal, full attention 🎯')};
$('fPause').onclick=()=>{T.left=Math.max(0,Math.ceil((T.end-Date.now())/1000));T.run=false;renderTimer()};
$('fResume').onclick=()=>{unlock();go()};
$('fReset').onclick=()=>{T.run=false;T.left=FULL[T.mode];renderTimer()};
$('fBreak').onclick=()=>{unlock();T.mode='brk';T.left=FULL.brk;go();toast('Break time — breathe and stretch ☕')};
function finish(){
 T.run=false;
 if(T.mode==='focus'){S.focus[S.date]=(S.focus[S.date]||0)+1;save();renderProgress();notify('🎯 Focus session complete. Take a short break, then return to your next goal.','focus','JEE ARC 🎯');T.left=FULL.focus}
 else{notify('Break finished. Ready for the next round?','brk','JEE ARC ☕');T.mode='focus';T.left=FULL.focus}
 renderTimer();
}
setInterval(()=>{if(!T.run)return;T.left=Math.max(0,Math.ceil((T.end-Date.now())/1000));if(T.left===0)finish();else renderTimer()},250);

/* ---------- daily rollover ---------- */
function rollover(){
 const today=day();if(S.date===today)return;
 S.hist[S.date]=S.hist[S.date]||0;
 S.goals=S.goals.filter(g=>g.r||!g.done).map(g=>g.r?{...g,done:false}:g);
 S.date=today;save();renderAll();toast('New day, fresh start ☀️ Your streak and timetable are safe.',4500);
}

/* ---------- settings ---------- */
function setUI(){
 $('sSnd').textContent=S.sound?'ON':'OFF';$('sDark').textContent=S.dark?'ON':'OFF';
 $('sVol').value=S.vol;$('vVal').textContent=S.vol+'%';$('sAcc').value=S.acc;
 document.body.classList.toggle('light',!S.dark);document.body.style.setProperty('--glow',S.acc/100);remUI();
}
const modal=$('modal');
$('bSet').onclick=()=>modal.classList.add('on');$('mClose').onclick=()=>modal.classList.remove('on');
modal.onclick=e=>{if(e.target===modal)modal.classList.remove('on')};
addEventListener('keydown',e=>{if(e.key==='Escape')modal.classList.remove('on')});
$('sSnd').onclick=()=>{S.sound=!S.sound;save();setUI();if(S.sound)play('done')};
$('sVol').oninput=e=>{S.vol=+e.target.value;$('vVal').textContent=S.vol+'%'};
$('sVol').onchange=()=>{save();play('done')};
$('sDark').onclick=()=>{S.dark=!S.dark;save();setUI()};
$('sAcc').oninput=e=>{S.acc=+e.target.value;save();setUI()};
$('dExp').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(S,null,2)],{type:'application/json'}));a.download='jee-arc-backup-'+day()+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);toast('Data exported ✓')};
$('dImp').onclick=()=>$('file').click();
$('file').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);if(!Array.isArray(d.goals)||!(d.tts||Array.isArray(d.tt)))throw 0;if(!d.tts){d.tts={school:d.tt};delete d.tt}
 S=Object.assign(fresh(),d);S.goals=S.goals.map(g=>({id:g.id||uid(),t:String(g.t||''),c:CATS[g.c]?g.c:'',r:!!g.r,done:!!g.done}));const cl=a=>Array.isArray(a)?a.filter(x=>x&&/^\d\d:\d\d$/.test(x.t)).map(x=>({id:x.id||uid(),t:x.t,a:String(x.a||'')})):null;S.tts={school:cl(d.tts.school)||defTT(),normal:cl(d.tts.normal)||defNormal()};S.mode=d.mode==='normal'?'normal':'school';
 save();renderAll();toast('Data imported ✓')}catch(err){toast('That file is not a valid JEE ARC backup')}e.target.value=''};r.readAsText(f)};
$('dRst').onclick=()=>{if(confirm("Reset today's goals (mark all as not done)?")){S.goals.forEach(g=>g.done=false);S.mDate='';save();renderGoals();toast("Today's goals reset")}};
$('dTT').onclick=restoreTT;
$('dClr').onclick=()=>{if(confirm('Clear ALL data (goals, timetable, streak, settings)? This cannot be undone.')){localStorage.removeItem(KEY);S=fresh();save();renderAll();toast('All data cleared')}};

/* ---------- init ---------- */
function renderAll(){autoMode();$('date').textContent=new Date().toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'long',year:'numeric'});setUI();renderGoals();renderTT();applyDur()}
$('push').onclick=push;
renderAll();push();rollover();
if(S.remind&&!('Notification' in window&&Notification.permission==='granted'))S.remind=S.remind; // in-page reminders still work
setInterval(()=>{rollover();$('date').textContent=new Date().toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'long',year:'numeric'});if(editId===null)renderTT();remCheck()},30000);
setInterval(push,25000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden){rollover();renderTT();remCheck()}});
})();
