// easteregg.js
import { els } from "./ui.js";

export function setupEasterEgg(triggerBtn){
  const LONG_PRESS_MS = 1600;
  let lpTimer = null;

  const ctxConf = els.confettiCanvas.getContext("2d");

  function resizeConfetti(){
    els.confettiCanvas.width = window.innerWidth;
    els.confettiCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeConfetti);
  resizeConfetti();

  function showRibbon(ms=2400){
    els.ribbonEl.classList.remove("hide");
    void els.ribbonEl.offsetWidth;
    els.ribbonEl.classList.add("show");
    setTimeout(()=>{
      els.ribbonEl.classList.remove("show");
      setTimeout(()=> els.ribbonEl.classList.add("hide"), 300);
    }, ms);
  }

  function heartConfettiBurst(durationMs = 1600, count = 54){
    els.confettiCanvas.classList.remove("hide");
    const W = els.confettiCanvas.width, H = els.confettiCanvas.height;
    const hearts = Array.from({length:count}).map(()=>({
      x: Math.random()*W, y: -20 - Math.random()*H*0.2, s: 8 + Math.random()*10,
      vx: (Math.random()-0.5)*0.6, vy: 1.2 + Math.random()*1.8,
      rot: Math.random()*Math.PI*2, vr: (Math.random()-0.5)*0.1, a: 0.8 + Math.random()*0.2
    }));

    let start = null, raf;
    function drawHeart(x, y, s, rot, color){
      ctxConf.save();
      ctxConf.translate(x,y); ctxConf.rotate(rot); ctxConf.scale(s/16, s/16);
      ctxConf.beginPath();
      for(let t=0; t<Math.PI*2; t+=0.1){
        const px = 16 * Math.pow(Math.sin(t),3);
        const py = 13*Math.cos(t) - 5*Math.cos(2*t) - 2*Math.cos(3*t) - Math.cos(4*t);
        if(t===0) ctxConf.moveTo(px, -py); else ctxConf.lineTo(px, -py);
      }
      ctxConf.closePath();
      ctxConf.fillStyle = color; ctxConf.fill(); ctxConf.restore();
    }
    function frame(ts){
      if(!start) start = ts;
      const elapsed = ts - start;
      ctxConf.clearRect(0,0,W,H);
      const c = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#e66';
      hearts.forEach(h=>{
        h.x += h.vx; h.y += h.vy; h.rot += h.vr;
        ctxConf.globalAlpha = Math.max(0, h.a * (1 - elapsed/durationMs));
        drawHeart(h.x, h.y, h.s, h.rot, c);
      });
      ctxConf.globalAlpha = 1;
      if(elapsed < durationMs) raf = requestAnimationFrame(frame);
      else {
        ctxConf.clearRect(0,0,W,H);
        els.confettiCanvas.classList.add("hide");
        cancelAnimationFrame(raf);
      }
    }
    requestAnimationFrame(frame);
  }

  function triggerEasterEgg(){
    showRibbon();
    heartConfettiBurst();
  }

  triggerBtn.addEventListener("pointerdown", ()=>{
    clearTimeout(lpTimer);
    lpTimer = setTimeout(()=>{ triggerEasterEgg(); }, LONG_PRESS_MS);
  });
  ["pointerup","pointercancel","pointerleave"].forEach(ev=>{
    triggerBtn.addEventListener(ev, ()=> clearTimeout(lpTimer));
  });
  triggerBtn.addEventListener("contextmenu", e=> e.preventDefault());
}
