/* ===== Loader (初回のみ / sessionStorage) ===== */
(function loader(){
  const el = document.getElementById('loading');
  if(!el) return;
  const seen = sessionStorage.getItem('cw_visited');
  if(seen){ el.remove(); return; }
  document.body.style.overflow = 'hidden';
  const hide = () => {
    el.classList.add('is-hidden');
    document.body.style.overflow = '';
    sessionStorage.setItem('cw_visited','1');
    setTimeout(()=>el.remove(), 1000);
  };
  // GSAPがあればラインを演出してからフェードアウト
  if(window.gsap){
    gsap.set('.loading__line',{scaleX:0,scaleY:0,transformOrigin:'center'});
    gsap.set(['.loading__mark','.loading__word'],{opacity:0,y:10});
    const tl = gsap.timeline({onComplete:hide});
    tl.to('.loading__line--v1,.loading__line--v2',{scaleY:1,duration:.9,ease:'power1.out'},.2)
      .to('.loading__line--h1,.loading__line--h2',{scaleX:1,duration:.9,ease:'power1.out'},.5)
      .to(['.loading__mark','.loading__word'],{opacity:1,y:0,duration:.7,ease:'power1.out',stagger:.12},.7)
      .to({},{duration:.9});
  } else {
    setTimeout(hide, 1400);
  }
})();

/* ===== Header scroll state ===== */
const header = document.getElementById('header');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 60);
window.addEventListener('scroll', onScroll, { passive:true });
onScroll();

/* ===== Mobile menu ===== */
const hamburger = document.getElementById('hamburger');
const nav = document.getElementById('nav');
hamburger.addEventListener('click', () => {
  nav.classList.toggle('open');
  hamburger.classList.toggle('active');
});
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  nav.classList.remove('open');
  hamburger.classList.remove('active');
}));

/* ===== Reduced motion 設定の検出 ===== */
const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ===== Lenis smooth scroll（軽め設定 / reduced-motion 時は無効） ===== */
let lenis = null;
if(window.Lenis && !REDUCE){
  lenis = new Lenis({ duration:0.8, lerp:0.12, smoothWheel:true, wheelMultiplier:1 });
  const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);
}

/* ===== Splide hero fade slider（reduced-motion 時は自動再生オフ） ===== */
if(window.Splide && document.getElementById('heroSlider')){
  new Splide('#heroSlider', {
    type:'fade', rewind:true, autoplay:!REDUCE, interval:3000, speed:1200,
    perPage:1, pagination:false, arrows:false, drag:false, pauseOnHover:false
  }).mount();
}

/* ===== 行単位テキスト出現の下準備（<br>ごとに行を span 化） ===== */
document.querySelectorAll('.js-text-anime').forEach(el => {
  const lines = el.innerHTML.split(/<br\s*\/?>/i);
  el.innerHTML = lines.map(l => `<span class="line"><span class="line__inner">${l}</span></span>`).join('');
});

/* ===== GSAP ScrollTrigger animations（reduced-motion 時はアニメ無効で即表示） ===== */
if(window.gsap && window.ScrollTrigger && !REDUCE){
  gsap.registerPlugin(ScrollTrigger);
  if(lenis) lenis.on('scroll', ScrollTrigger.update);

  // 行単位テキスト出現（下から せり上がり、stagger）
  gsap.utils.toArray('.js-text-anime').forEach(el => {
    const inners = el.querySelectorAll('.line__inner');
    gsap.set(inners, { yPercent:110 });
    gsap.to(inners, { yPercent:0, duration:.9, ease:'power3.out', stagger:.12,
      scrollTrigger:{ trigger:el, start:'top 80%', once:true } });
  });

  // fade-in
  gsap.utils.toArray('.js-fade-in').forEach(el => {
    gsap.to(el, { opacity:1, duration:.5, ease:'power1.out',
      scrollTrigger:{ trigger:el, start:'top 75%', once:true } });
  });
  // fade-in-bottom (stagger for grouped items handled per-element)
  gsap.utils.toArray('.js-fade-in-bottom').forEach(el => {
    gsap.to(el, { opacity:1, y:0, duration:.5, ease:'power1.out',
      scrollTrigger:{ trigger:el, start:'top 80%', once:true } });
  });

  // 軽いパララックス装飾
  gsap.utils.toArray('.js-parallax-img').forEach(el => {
    gsap.fromTo(el, { y:-30 }, { y:30, ease:'none',
      scrollTrigger:{ trigger:el, start:'top bottom', end:'bottom top', scrub:1 } });
  });

  // メンバー：写真グリッドのパララックス
  gsap.utils.toArray('.members__col').forEach(col => {
    const dir = col.dataset.speed === 'down' ? 4 : -4;
    gsap.fromTo(col, { yPercent:-dir }, { yPercent:dir, ease:'none',
      scrollTrigger:{ trigger:'.js-members', start:'top bottom', end:'bottom top', scrub:1 } });
  });
} else {
  // フォールバック：ライブラリ未読込時はそのまま表示
  document.querySelectorAll('.js-fade-in,.js-fade-in-bottom').forEach(el => el.classList.add('is-shown'));
}
