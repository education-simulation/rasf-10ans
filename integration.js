// RASF 10 ans — page intégrée dans presentation.html (dans un cadre).
// Remplace l'en-tête de la page par celui de la présentation : « RASF / 10 ANS », puis le fil d'Ariane
// « Accueil › Sommaire › n · Partie » (mêmes tailles et couleurs que dans presentation.html).
// Prévient la présentation par postMessage (ce qui marche aussi en file://) quand on sort de la page :
// clic sur Accueil ou Sommaire, Échap, → au dernier écran, ← au premier.
// Sans cadre (page ouverte seule), ce script ne fait rien.
(function(){
  if(window.parent===window)return;
  const dire=a=>window.parent.postMessage({rasf:a},"*");
  let nom=(document.title.split("·")[1]||"").trim();
  function entete(){
    const h=document.querySelector(".entete, .frise");
    if(!h||document.getElementById("ariane-rasf"))return;
    const st=document.createElement("style");
    st.textContent=
      "#ariane-rasf{display:flex;align-items:baseline;gap:14px;border-left:2px solid rgba(242,180,31,.5);padding-left:28px;margin-left:28px;font:600 20px 'Source Sans 3',sans-serif;color:#c9d2ea;white-space:nowrap}"+
      "#ariane-rasf a{cursor:pointer;color:#c9d2ea;text-decoration:none;border-bottom:1px dashed rgba(201,210,234,.4)}#ariane-rasf a:hover{color:#F2B41F;border-bottom-color:#F2B41F}"+
      "#ariane-rasf i{font-style:normal;color:#F2B41F;opacity:.7}#ariane-rasf b{font:700 22px 'Playfair Display',serif;color:#fff}#ariane-rasf b.sous{color:#E3C47E}#ariane-rasf a.nom-lien{border-bottom:1px dashed rgba(255,255,255,.4)}#ariane-rasf a.nom-lien:hover b{color:#F2B41F}"+
      ".entete .rubrique,.entete .num{display:none!important}"+
      ".entete .logo,.frise .logo{font-size:30px!important;margin-right:0!important}"+
      ".entete .logo small,.frise .logo small{display:block!important;font:600 12px 'Source Sans 3',sans-serif!important;letter-spacing:3px!important;color:#c9d2ea!important;margin-top:4px!important}"+
      ".frise{padding:0 48px!important}.entete{gap:0!important}";
    document.head.appendChild(st);
    const lg0=h.querySelector(".logo"),sm=h.querySelector(".logo small");if(lg0){const t=[...lg0.childNodes].find(n=>n.nodeType===3&&n.textContent.trim());if(t)t.textContent="Bilan RASF";lg0.style.setProperty("font-size","26px","important");lg0.style.whiteSpace="nowrap"}if(sm)sm.textContent="10 ANS";
    const nav=document.createElement("nav");nav.id="ariane-rasf";nav.setAttribute("aria-label","Fil d'Ariane");
    const logo=h.querySelector(".logo");logo?logo.after(nav):h.prepend(nav);
    /* Le logo « RASF 10 ANS » ramène à la page de couverture de la présentation */
    if(logo){logo.style.cursor="pointer";logo.title="Retour à la page de couverture";logo.setAttribute("data-clic","");
      logo.addEventListener("click",ev=>{ev.preventDefault();ev.stopPropagation();dire("accueil")},true)}
    nav.addEventListener("click",ev=>{const a=ev.target.closest("[data-cible]");if(!a)return;ev.preventDefault();ev.stopPropagation();dire(a.dataset.cible)},true);
    ecrire();
  }
  function ecrire(){const nav=document.getElementById("ariane-rasf");if(!nav)return;
    nav.innerHTML='<a data-clic data-cible="sommaire" title="Revenir à l\'accueil (Échap)">Accueil</a>'+(nom?(window.rasfSous?'<i>›</i><a data-clic class="nom-lien" title="Revenir à la première année"><b></b></a>':'<i>›</i><b></b>'):'')+(window.rasfSous?'<i>›</i><b class="sous"></b>':'');
    const b=nav.querySelector("b");if(b)b.textContent=nom;
    const nl=nav.querySelector(".nom-lien");if(nl)nl.addEventListener("click",ev=>{ev.preventDefault();ev.stopPropagation();document.dispatchEvent(new CustomEvent("rasf-debut"))});const so=nav.querySelector(".sous");if(so)so.textContent=window.rasfSous}
  document.addEventListener("rasf-sous",ecrire);
  const n=()=>document.querySelectorAll(".ecran").length;
  let avant=-1;
  const fixer=()=>{avant=window.RASF?window.RASF.courant:-1};
  addEventListener("keydown",ev=>{if(ev.key==="Escape"&&!document.querySelector(".pdf-voile.ouvert"))dire("sommaire")},true);
  addEventListener("keydown",fixer,true);
  addEventListener("keydown",ev=>{if(!window.RASF)return;
    if(["ArrowRight"," ","PageDown"].includes(ev.key)&&avant===n()-1)dire("suivant");
    if(["ArrowLeft","PageUp"].includes(ev.key)&&avant===0)dire("precedent")});
  document.addEventListener("click",fixer,true);
  document.addEventListener("click",ev=>{if(!window.RASF||ev.target.closest("a,button,input,select,.pied,[data-clic],nav"))return;
    const st=document.getElementById("stage");if(!st)return;const r=st.getBoundingClientRect(),droite=ev.clientX>r.left+r.width/2;
    if(droite&&avant===n()-1)dire("suivant");if(!droite&&avant===0)dire("precedent")});
  // Messages de la présentation : premier ou dernier écran, nom de la partie pour le fil d'Ariane
  addEventListener("message",ev=>{const m=ev.data||{};
    if(m.rasf==="nom"&&m.nom){nom=m.nom;ecrire()}
    if(!window.RASF)return;
    if(m.rasf==="debut")window.RASF.montrer(0);
    if(m.rasf==="fin")window.RASF.montrer(n()-1)});
  /* Bas de page : deux boutons fins (écran précédent / suivant, nommés), à la place des points et de « ← → pour avancer » */
  let voisins={prec:"Accueil",suiv:"Partie suivante"};
  const titre=el=>{if(!el)return"";if(el.dataset.label)return el.dataset.label;const h=el.querySelector("h2,h1");let t=h?h.textContent.replace(/\s+/g," ").trim():"";return t.length>42?t.slice(0,40).trim()+"…":t};
  function navBas(){
    if(!window.RASF||document.getElementById("nav-rasf"))return;
    const pied=document.querySelector(".pied");if(!pied)return;
    const st=document.createElement("style");
    st.textContent=".pied .points,.pied .aide{display:none!important}"+
      "#nav-rasf{display:flex;gap:12px;flex:1;justify-content:space-between}.pied .source:empty{display:none}"+
      "#nav-rasf button{all:unset;cursor:pointer;display:inline-flex;align-items:baseline;gap:8px;line-height:1;font:400 13px 'Source Sans 3',sans-serif;letter-spacing:2px;text-transform:uppercase;color:#c9d2ea;background:#0B1F4D;border:1px solid #0B1F4D;border-radius:20px;padding:7px 16px 6px;transition:background .25s ease,color .25s ease,transform .25s ease}"+
      "#nav-rasf button b{font:600 16px 'Playfair Display',serif;letter-spacing:0;text-transform:none;color:#fff;transition:color .25s ease}"+
      "#nav-rasf button:hover{background:#fff;color:#0B1F4D;transform:translateY(-1px)}#nav-rasf button:hover b{color:#0B1F4D}"+
      "#nav-rasf button[hidden]{display:none}";
    document.head.appendChild(st);
    const nav=document.createElement("div");nav.id="nav-rasf";nav.setAttribute("data-clic","");
    nav.innerHTML='<button type="button" data-clic class="prec"></button><button type="button" data-clic class="suiv"></button>';
    pied.appendChild(nav);
    const ecr=()=>[...document.querySelectorAll(".contenu > .ecran")];
    nav.querySelector(".prec").addEventListener("click",ev=>{ev.stopPropagation();const i=RASF.courant;if(i>0)RASF.montrer(i-1);else dire("precedent")});
    nav.querySelector(".suiv").addEventListener("click",ev=>{ev.stopPropagation();const i=RASF.courant,n=ecr().length;if(i<n-1)RASF.montrer(i+1);else dire("suivant")});
    majBas();document.addEventListener("ecran",()=>setTimeout(majBas,0));
  }
  function majBas(){const nav=document.getElementById("nav-rasf");if(!nav||!window.RASF)return;
    const e=[...document.querySelectorAll(".contenu > .ecran")],i=RASF.courant;
    const pr=i>0?titre(e[i-1]):voisins.prec,su=i<e.length-1?titre(e[i+1]):voisins.suiv;
    const bp=nav.querySelector(".prec"),bs=nav.querySelector(".suiv");
    bp.innerHTML="← <b></b>";bp.querySelector("b").textContent=pr;bp.hidden=!pr;
    bs.innerHTML="<b></b> →";bs.querySelector("b").textContent=su;bs.hidden=!su}
  addEventListener("message",ev=>{const m=ev.data||{};if(m.rasf==="voisins"){voisins={prec:m.prec||"",suiv:m.suiv||""};majBas()}});
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>{entete();navBas()});else{entete();navBas()}
})();
