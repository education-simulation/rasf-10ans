// RASF 10 ans — moteur commun des pages animées.
// Écrans : <section class="ecran"> dans .contenu ; navigation ← → espace, clic sur les points.
// Animations : [data-anim] reçoit .vu à l'affichage de l'écran (délai via style="--d:.3s"
// ou automatique avec data-cascade sur un parent : enfants espacés de 0,12 s).
// Compteurs : <span data-compte="120" data-suffixe=" €" data-sep="1"></span>.
(function(){
  const stage=document.getElementById("stage");
  const ecrans=[...document.querySelectorAll(".ecran")];
  const cle="rasf.maquette."+(document.body.dataset.page||location.pathname)+".ecran";
  let cur=0;
  try{const v=+localStorage.getItem(cle);if(v>=0&&v<ecrans.length)cur=v}catch(e){}
  const pts=document.querySelector(".pied .points");
  if(pts)pts.innerHTML=ecrans.map((_,i)=>`<i data-i="${i}"></i>`).join("");
  const apercu=new URLSearchParams(location.search).has("apercu");
  if(apercu)document.documentElement.classList.add("apercu");
  const reduit=apercu||matchMedia("(prefers-reduced-motion: reduce)").matches;
  function fmt(n,sep){const s=Math.round(n).toString();return sep?s.replace(/\B(?=(\d{3})+(?!\d))/g," "):s}
  // Règle de Marco (19/11/2026) : un chiffre affiché en grand est une valeur indicative facile à retenir
  // (arrondie vers le bas, suivie de « + »). La valeur exacte reste en petit dessous.
  // Exceptions : data-exact="1", un préfixe déjà posé (≈…), les pourcentages et les fractions.
  function arrondi(n){if(n<100)return n;const p=n<500?10:n<1000?50:n<10000?500:1000;return Math.floor(n/p)*p}
  document.querySelectorAll("[data-compte]").forEach(el=>{
    const n=parseFloat(el.dataset.compte),suf=el.dataset.suffixe||"";
    if(el.dataset.exact==="1"||el.dataset.prefixe||/%|^\//.test(suf.trim()))return;
    const r=arrondi(n);if(r>=n)return;
    el.dataset.compte=r;el.dataset.plus="1";el.title=fmt(n,el.dataset.sep==="1")+suf+" exactement";
    const x=document.createElement("div");x.className="exact";x.textContent=fmt(n,el.dataset.sep==="1")+suf+" exactement";
    el.insertAdjacentElement("afterend",x);
  });
  function compter(el){
    const fin=parseFloat(el.dataset.compte),suf=el.dataset.suffixe||"",pre=el.dataset.prefixe||"",sep=el.dataset.sep==="1";
    const plus=el.dataset.plus==="1"?'<span class="plus">+</span>':"";
    const ecrire=v=>{el.innerHTML=pre+fmt(v,sep)+plus+suf};
    if(reduit){ecrire(fin);return}
    const t0=performance.now(),dur=+(el.dataset.duree||1600),d=parseFloat(el.dataset.delai||0)*1000;
    ecrire(0);
    function pas(t){const x=Math.min(1,Math.max(0,(t-t0-d)/dur)),e=1-Math.pow(1-x,3);ecrire(fin*e);if(x<1)requestAnimationFrame(pas)}
    requestAnimationFrame(pas);
  }
  function montrer(i){
    cur=Math.max(0,Math.min(ecrans.length-1,i));
    ecrans.forEach((e,k)=>{e.classList.toggle("actif",k===cur);if(k!==cur)e.querySelectorAll(".vu").forEach(x=>x.classList.remove("vu"))});
    const e=ecrans[cur];
    e.querySelectorAll("[data-cascade]").forEach(p=>{[...p.children].forEach((c,k)=>{if(!c.hasAttribute("data-anim"))c.setAttribute("data-anim",p.dataset.cascade||"haut");c.style.setProperty("--d",(parseFloat(p.dataset.base||0)+k*0.12)+"s")})});
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      e.querySelectorAll("[data-anim],.barre").forEach(x=>x.classList.add("vu"));
      e.classList.add("vu");
      e.querySelectorAll("[data-compte]").forEach(compter);
    }));
    if(pts)[...pts.children].forEach((p,k)=>p.classList.toggle("on",k===cur));
    if(!apercu)try{localStorage.setItem(cle,cur)}catch(err){}
    document.dispatchEvent(new CustomEvent("ecran",{detail:{index:cur,el:e}}));
  }
  addEventListener("keydown",ev=>{if(["ArrowRight"," ","PageDown"].includes(ev.key)){ev.preventDefault();montrer(cur+1)}if(["ArrowLeft","PageUp"].includes(ev.key))montrer(cur-1)});
  if(pts)pts.addEventListener("click",ev=>{const p=ev.target.closest("i");if(p)montrer(+p.dataset.i)});
  stage.addEventListener("click",ev=>{if(ev.target.closest("a,button,input,select,.pied,[data-clic]"))return;const r=stage.getBoundingClientRect();montrer(ev.clientX>r.left+r.width/2?cur+1:cur-1)});
  function ajuster(){const s=Math.min(innerWidth/1600,innerHeight/900);stage.style.transform=`translate(-50%,-50%) scale(${s})`}
  addEventListener("resize",ajuster);ajuster();
  const q=new URLSearchParams(location.search).get("ecran");if(q!==null)cur=+q;
  montrer(cur);
  window.RASF={montrer,get courant(){return cur}};
})();
