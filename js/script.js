/* ===== Edit these details ===== */
const CONFIG = {
  eventISO: '2026-10-31T11:00:00+05:30',
  mapsQuery: 'The Orchid Banquet Hall, Jayanagar, Bengaluru',
  phone: '+919876543210',
  wishes: [
    {name:'Adithya', text:'Congratulations on your engagement! May this lovely chapter be filled with love, laughter, unforgettable moments and beautiful dreams.'},
    {name:'Meghana', text:'Two wonderful people, one beautiful beginning. Wishing you both a lifetime of happiness and togetherness.'},
    {name:'Karthik & family', text:'So happy for you both. May your journey ahead be as joyful as this day.'}
  ]
};

const $ = (s, r=document) => r.querySelector(s), $$ = (s, r=document) => [...r.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* links */
$$('[data-maps]').forEach(a => a.href = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(CONFIG.mapsQuery));
$('#call').href = 'tel:' + CONFIG.phone;

/* intro curtain */
const intro = $('#intro');
function openIntro(){
  if(!intro || intro.classList.contains('open')) return;
  intro.classList.add('open'); document.body.classList.remove('locked');
  $('#home').classList.add('in'); $$('#home [data-reveal]').forEach(e => e.classList.add('in'));
  setTimeout(() => intro.remove(), 1700);
}
if(reduced){ intro.remove(); } else {
  document.body.classList.add('locked');
  intro.addEventListener('click', openIntro);
  intro.addEventListener('keydown', e => { if(e.key === 'Enter' || e.key === ' ') openIntro(); });
  setTimeout(openIntro, 2600);
}

/* scroll reveal */
if(!reduced && 'IntersectionObserver' in window){
  document.documentElement.classList.add('anim');
  const io = new IntersectionObserver(es => es.forEach(e => { if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }),
    {threshold:.18, rootMargin:'0px 0px -6% 0px'});
  $$('[data-reveal],[data-watch]').forEach(el => { if(!el.closest('#home') && el.id !== 'home') io.observe(el); });
}

/* nav */
const links = $$('.nav a');
links.forEach(a => a.addEventListener('click', e => { e.preventDefault(); $(a.getAttribute('href')).scrollIntoView({behavior: reduced ? 'auto' : 'smooth'}); }));
if('IntersectionObserver' in window){
  const map = {home:0, countdown:0, about:1, wishes:1, send:1, schedule:2, location:3};
  const nio = new IntersectionObserver(es => es.forEach(e => { if(e.isIntersecting){ links.forEach((l,i) => l.classList.toggle('on', i === map[e.target.id])); } }), {threshold:.4});
  Object.keys(map).forEach(id => nio.observe(document.getElementById(id)));
}

/* countdown with flip */
const target = new Date(CONFIG.eventISO).getTime();
const cd = {d:$('#cd-d'), h:$('#cd-h'), m:$('#cd-m'), s:$('#cd-s')};
function setNum(el, v){
  const t = String(v).padStart(2,'0');
  if(el.textContent === t) return;
  el.textContent = t;
  if(!reduced){ el.classList.remove('flip'); void el.offsetWidth; el.classList.add('flip'); }
}
function tick(){
  let s = Math.max(0, Math.floor((target - Date.now())/1000));
  setNum(cd.d, Math.floor(s/86400)); s %= 86400;
  setNum(cd.h, Math.floor(s/3600)); s %= 3600;
  setNum(cd.m, Math.floor(s/60)); setNum(cd.s, s%60);
}
tick(); setInterval(tick, 1000);

/* wishes carousel */
const KEY = 'ds-wishes';
let wishes = CONFIG.wishes.slice(), idx = 0, timer;
try { wishes = wishes.concat(JSON.parse(localStorage.getItem(KEY) || '[]')); } catch(e){}
const track = $('#track'), pos = $('#pos');
function renderWishes(){
  track.textContent = '';
  wishes.forEach(w => {
    const s = document.createElement('div'); s.className = 'slide';
    const p = document.createElement('p'); p.textContent = w.text;
    const c = document.createElement('cite'); c.textContent = '— ' + w.name;
    s.append(p, c); track.append(s);
  });
  go(idx);
}
function go(i){ idx = (i + wishes.length) % wishes.length; track.style.transform = 'translateX(' + (-idx*100) + '%)'; pos.textContent = (idx+1) + '/' + wishes.length; }
function auto(){ clearInterval(timer); if(!reduced) timer = setInterval(() => go(idx+1), 5200); }
$('#prev').onclick = () => { go(idx-1); auto(); };
$('#next').onclick = () => { go(idx+1); auto(); };
let sx = null; const vp = $('#viewport');
vp.addEventListener('pointerdown', e => sx = e.clientX);
vp.addEventListener('pointerup', e => { if(sx !== null && Math.abs(e.clientX - sx) > 40){ go(idx + (e.clientX < sx ? 1 : -1)); auto(); } sx = null; });
renderWishes(); auto();

/* send wishes (kept on this device) */
$('#wish-form').addEventListener('submit', e => {
  e.preventDefault();
  const name = $('#wish-name').value.trim(), text = $('#wish-text').value.trim();
  if(!name || !text) return;
  wishes.push({name, text});
  try { localStorage.setItem(KEY, JSON.stringify(wishes.slice(CONFIG.wishes.length))); } catch(err){}
  idx = wishes.length - 1; renderWishes(); auto(); e.target.reset();
  $('#wish-note').textContent = 'Thank you, ' + name + '. Your wish has been added above.';
  const r = e.target.querySelector('button').getBoundingClientRect(); burst(r.left + r.width/2, r.top);
});
function burst(x, y){
  if(reduced) return;
  for(let i=0;i<18;i++){
    const b = document.createElement('span'); b.className = 'burst'; b.textContent = i%3 ? '♥' : '❦';
    const a = Math.random()*Math.PI*2, d = 70 + Math.random()*130;
    b.style.cssText = `left:${x}px;top:${y}px;--dx:${Math.cos(a)*d}px;--dy:${Math.sin(a)*d - 60}px;--rot:${Math.random()*360}deg;color:${i%2?'#C9A24B':'#1F7A5C'}`;
    document.body.append(b); setTimeout(() => b.remove(), 1400);
  }
}

/* parallax on corner florals */
if(!reduced){
  const pars = $$('[data-par]'); let mx = 0, my = 0, raf;
  const apply = () => { raf = null; const sy = scrollY; pars.forEach(p => { const k = +p.dataset.par; p.style.setProperty('--px', (mx*k).toFixed(1)); p.style.setProperty('--py', (my*k + sy*k*.012).toFixed(1)); }); };
  const req = () => { if(!raf) raf = requestAnimationFrame(apply); };
  addEventListener('pointermove', e => { mx = e.clientX/innerWidth - .5; my = e.clientY/innerHeight - .5; req(); }, {passive:true});
  addEventListener('scroll', req, {passive:true});
}

/* drifting leaves */
if(!reduced){
  const c = $('#leaves'), x = c.getContext('2d'); let W, H, dpr, L = [];
  const cols = ['#0F5B46','#1F7A5C','#9DBA9A','#C9A24B','#EBD9A0'];
  const size = () => { dpr = Math.min(devicePixelRatio||1, 2); W = c.width = innerWidth*dpr; H = c.height = innerHeight*dpr; };
  const mk = top => ({x:Math.random()*W, y: top ? -30*dpr : Math.random()*H, s:(7+Math.random()*10)*dpr, vy:(.35+Math.random()*.7)*dpr, a:Math.random()*6.3,
    va:(Math.random()-.5)*.03, ph:Math.random()*6.3, col:cols[Math.random()*cols.length|0], o:.35+Math.random()*.4});
  size(); addEventListener('resize', size);
  for(let i=0;i<Math.min(30, Math.round(innerWidth/40)+8);i++) L.push(mk(false));
  (function frame(t){
    if(!document.hidden){
      x.clearRect(0,0,W,H);
      L.forEach((l,i) => {
        l.y += l.vy; l.x += Math.sin(t/1400 + l.ph)*.6*dpr; l.a += l.va;
        if(l.y > H + 40) L[i] = mk(true);
        x.save(); x.translate(l.x,l.y); x.rotate(l.a); x.scale(1, .55 + .45*Math.sin(t/900 + l.ph)); x.globalAlpha = l.o; x.fillStyle = l.col;
        x.beginPath(); x.moveTo(-l.s,0); x.bezierCurveTo(-l.s*.4,-l.s*.6, l.s*.4,-l.s*.6, l.s,0); x.bezierCurveTo(l.s*.4,l.s*.6,-l.s*.4,l.s*.6,-l.s,0); x.fill(); x.restore();
      });
    }
    requestAnimationFrame(frame);
  })(0);
}

/* soft generated music (no audio file) */
let ac, musicTimer, master;
const scale = [261.63, 293.66, 329.63, 392, 440, 523.25, 587.33, 659.25], pattern = [0,2,4,5,4,2,3,1, 0,2,4,7,5,4,2,1];
function note(f, when, len){
  const o = ac.createOscillator(), g = ac.createGain(); o.type = 'sine'; o.frequency.value = f;
  g.gain.setValueAtTime(0, when); g.gain.linearRampToValueAtTime(.22, when+.03); g.gain.exponentialRampToValueAtTime(.001, when+len);
  o.connect(g); g.connect(master); o.start(when); o.stop(when+len+.05);
}
$('#music').addEventListener('click', function(){
  const on = this.getAttribute('aria-pressed') !== 'true';
  this.setAttribute('aria-pressed', on); this.classList.toggle('playing', on); this.setAttribute('aria-label', on ? 'Pause music' : 'Play music');
  if(on){
    ac = ac || new (window.AudioContext || window.webkitAudioContext)(); ac.resume();
    if(!master){ master = ac.createGain(); master.gain.value = .5; const d = ac.createDelay(); d.delayTime.value = .38; const fb = ac.createGain(); fb.gain.value = .35;
      master.connect(ac.destination); master.connect(d); d.connect(fb); fb.connect(d); d.connect(ac.destination); }
    let step = 0;
    musicTimer = setInterval(() => { const t = ac.currentTime + .05; note(scale[pattern[step%16]], t, 1.6); if(step%4 === 0) note(scale[pattern[step%16]]/2, t, 2.4); step++; }, 480);
  } else { clearInterval(musicTimer); }
});
