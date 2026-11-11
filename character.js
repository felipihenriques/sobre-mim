/* Interactions for three original illustrations; no simulated skeletal animation. */
(()=>{
  const stage=document.getElementById('character-stage'),surface=document.querySelector('.hero-visual');if(!stage||!surface)return;
  const imgs=[...stage.querySelectorAll('[data-character-image]')],views=['front','profile','back'],names=['Frente','Lado','Costas'];
  let sensitivity=1,presenting=false,presentationTimer=0,onScreen=true,messageIndex=0;
  let view=0,locked=false,zoom=1,drag=null,frame=0,rx=0,ry=0,tx=0,ty=0;
  const paused=()=>document.body.classList.contains('reduced-motion');
  stage.tabIndex=0;stage.setAttribute('role','group');stage.setAttribute('aria-label','Mascote: setas trocam o ângulo, mais e menos ajustam o zoom, Home restaura.');
  const panel=document.createElement('details');panel.className='mascot-options';const summary=document.createElement('summary');summary.textContent='Explorar mascote';panel.append(summary);
  const buttons=document.createElement('div');buttons.className='mascot-option-buttons';panel.append(buttons);const angleButtons=[];
  function button(text,action,label=text){const b=document.createElement('button');b.type='button';b.textContent=text;b.setAttribute('aria-label',label);b.onclick=action;buttons.append(b);return b;}
  function select(i){view=(i+3)%3;imgs.forEach(img=>img.hidden=img.dataset.characterImage!==views[view]);angleButtons.forEach((b,k)=>b.setAttribute('aria-pressed',String(k===view)));}
  names.forEach((name,i)=>angleButtons.push(button(name,()=>{locked=true;lock.checked=true;select(i);})));button('−',()=>scale(-.1),'Diminuir mascote');button('+',()=>scale(.1),'Ampliar mascote');button('Restaurar',reset);
  const label=document.createElement('label'),lock=document.createElement('input');lock.type='checkbox';label.append(lock,document.createTextNode('Fixar ângulo escolhido'));panel.append(label);lock.onchange=()=>{locked=lock.checked;};
  const hint=document.createElement('small');hint.textContent='Arraste para trocar o ângulo. Use + e − para ampliar.';panel.append(hint);surface.append(panel);
  function scale(delta){zoom=Math.max(.8,Math.min(1.3,Math.round((zoom+delta)*10)/10));stage.style.setProperty('--mascot-zoom',zoom);}
  function paint(){frame=0;rx+=(tx-rx)*.18;ry+=(ty-ry)*.18;stage.style.setProperty('--rx',rx+'deg');stage.style.setProperty('--ry',ry+'deg');if(Math.abs(tx-rx)+Math.abs(ty-ry)>.02)frame=requestAnimationFrame(paint);}
  function schedule(){if(!frame)frame=requestAnimationFrame(paint);}
  function neutral(){tx=ty=0;schedule();}
  function reset(){presenting=false;syncPresentation();sensitivity=1;sensitivityInput.value=1;locked=false;lock.checked=false;zoom=1;scale(0);select(0);neutral();}
  stage.addEventListener('pointerdown',e=>{if(e.button!==0||!e.isPrimary)return;drag={x:e.clientX,y:e.clientY,id:e.pointerId};if(e.pointerType==='mouse')stage.setPointerCapture(e.pointerId);});
  stage.addEventListener('pointermove',e=>{if(paused()||presenting||drag||locked||e.pointerType==='touch')return;const r=stage.getBoundingClientRect(),x=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),y=Math.max(0,Math.min(1,(e.clientY-r.top)/r.height));ty=(x-.5)*8*sensitivity;tx=(.5-y)*6*sensitivity;if(x<.25)select(1);else if(x>.78)select(2);else if(x>.32&&x<.71)select(0);schedule();});
  stage.addEventListener('pointerup',e=>{if(drag?.id!==e.pointerId)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.abs(dx)>35&&Math.abs(dx)>Math.abs(dy)){select(view+(dx>0?1:-1));locked=true;lock.checked=true;}if(Math.hypot(dx,dy)<8)speak();drag=null;});
  stage.addEventListener('pointercancel',()=>drag=null);stage.addEventListener('lostpointercapture',()=>drag=null);stage.addEventListener('pointerleave',()=>{neutral();if(!locked&&!drag&&!presenting)select(0);});
  stage.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();speak();return;}if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();select(view+(e.key==='ArrowRight'?1:-1));locked=true;lock.checked=true;}else if(['+','=','-'].includes(e.key)){e.preventDefault();scale(e.key==='-'?-.1:.1);}else if(e.key==='Home'||e.key==='Escape'){e.preventDefault();reset();}});
  new MutationObserver(()=>{if(paused()){cancelAnimationFrame(frame);frame=0;rx=ry=tx=ty=0;stage.style.setProperty('--rx','0deg');stage.style.setProperty('--ry','0deg');}}).observe(document.body,{attributes:true,attributeFilter:['class']});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;drag=null;}});select(0);scale(0);

  const message=document.getElementById('character-message');
  const phrases=['Olá! Eu sou o Felipi.','Estudo Engenharia de Software.','Gosto de transformar ideias em projetos.','Explore meus projetos logo abaixo!'];
  if(message){message.setAttribute('role','status');message.setAttribute('aria-live','polite');}
  function speak(){if(message)message.textContent=phrases[messageIndex++%phrases.length];}
  button('Conversar',speak,'Mostrar mensagem do mascote');
  const presentationButton=button('Apresentar ângulos',()=>{presenting=!presenting;syncPresentation();});
  presentationButton.setAttribute('aria-pressed','false');
  function syncPresentation(){clearInterval(presentationTimer);presentationTimer=0;presentationButton.textContent=presenting?'Parar apresentação':'Apresentar ângulos';presentationButton.setAttribute('aria-pressed',String(presenting));if(presenting&&!paused()&&!document.hidden&&onScreen)presentationTimer=setInterval(()=>select(view+1),3000);}
  const sensitivityLabel=document.createElement('label'),sensitivityInput=document.createElement('input');sensitivityInput.type='range';sensitivityInput.min='.2';sensitivityInput.max='2';sensitivityInput.step='.1';sensitivityInput.value=1;sensitivityLabel.append(document.createTextNode('Sensibilidade'),sensitivityInput);panel.append(sensitivityLabel);sensitivityInput.oninput=()=>sensitivity=Number(sensitivityInput.value);
  button('Salvar preferências',()=>{try{localStorage.setItem('felipi-illustration-settings',JSON.stringify({view,locked,zoom,sensitivity}));message.textContent='Preferências salvas neste navegador.';}catch{message.textContent='Este navegador não permitiu salvar as preferências.';}});
  const projects=document.createElement('a');projects.href='#projetos';projects.textContent='Conhecer os projetos ↓';projects.className='mascot-projects-link';panel.append(projects);
  document.addEventListener('visibilitychange',syncPresentation);
  new MutationObserver(syncPresentation).observe(document.body,{attributes:true,attributeFilter:['class']});
  new IntersectionObserver(entries=>{onScreen=entries[0].isIntersecting;syncPresentation();}).observe(surface);
  window.addEventListener('pagehide',()=>{clearInterval(presentationTimer);presentationTimer=0;});window.addEventListener('pageshow',syncPresentation);
  try{const saved=JSON.parse(localStorage.getItem('felipi-illustration-settings')||'null');if(saved){if(Number.isFinite(saved.zoom))zoom=Math.max(.8,Math.min(1.3,saved.zoom));if(Number.isFinite(saved.sensitivity))sensitivity=Math.max(.2,Math.min(2,saved.sensitivity));locked=saved.locked===true;lock.checked=locked;sensitivityInput.value=sensitivity;if(Number.isInteger(saved.view)&&saved.view>=0&&saved.view<3)select(saved.view);scale(0);}}catch{}

})();
