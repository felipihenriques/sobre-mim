/* Simplified articulated character, generated locally; works with file://. */
(()=>{
  const stage=document.getElementById('character-stage');if(!stage)return;
  let renderer;try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});}catch{return;}
  const T=THREE,model=createFelipiMascot(T),scene=new T.Scene(),camera=new T.PerspectiveCamera(34,1,.1,50);
  scene.add(model.root,new T.HemisphereLight(0xddeaff,0x4c4150,2));
  for(const[c,power,pos]of [[0xffdfbf,3,[-3,5,5]],[0x72aaff,2,[3,4,-3]]]){const l=new T.DirectionalLight(c,power);l.position.set(...pos);scene.add(l);}
  camera.position.set(0,2.05,8);camera.lookAt(0,1.8,0);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;
  const host=document.createElement('div');host.className='mascot-live';stage.append(host);const canvas=renderer.domElement;host.append(canvas);canvas.tabIndex=0;canvas.setAttribute('role','button');canvas.setAttribute('aria-label','Mascote 3D: mova o cursor, segure para fechar a mão, solte para abrir. Arraste para girar.');
  document.getElementById('character-figure').hidden=true;
  document.getElementById('character-message').textContent='Mova o mouse · segure para fechar a mão';
  const panel=document.createElement('details');panel.className='simple-controls';const summary=document.createElement('summary');summary.textContent='Ajustar interação';panel.append(summary);stage.parentElement.append(panel);
  const state={enabled:true,sensitivity:1,speed:1,toggle:false};
  function control(text,key,type,min,max){const label=document.createElement('label'),input=document.createElement('input');label.append(document.createTextNode(text),input);input.type=type;if(type==='checkbox')input.checked=state[key];else{input.min=min;input.max=max;input.step='.1';input.value=state[key];}input.oninput=()=>{state[key]=type==='checkbox'?input.checked:Number(input.value);start();};panel.append(label);}
  control('Movimentos','enabled','checkbox');control('Sensibilidade','sensitivity','range',.2,2);control('Velocidade','speed','range',.3,2);control('Alternar mão por clique','toggle','checkbox');
  const reset=document.createElement('button');reset.textContent='Restaurar posição';reset.type='button';panel.append(reset);
  let tx=0,ty=0,x=0,y=0,yaw=0,targetYaw=0,hand=0,held=false,latched=false,drag=null,lastInput=0,time=0,last=0,raf=0,wave=-10,visible=true;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  function release(){held=false;drag=null;start();}
  reset.onclick=()=>{tx=ty=targetYaw=0;held=latched=false;wave=-10;start();};
  canvas.addEventListener('pointerdown',e=>{if(e.button!==0||!e.isPrimary)return;held=true;drag={id:e.pointerId,x:e.clientX,y:e.clientY,base:targetYaw,moved:false};canvas.setPointerCapture(e.pointerId);lastInput=time;start();});
  canvas.addEventListener('pointermove',e=>{const r=canvas.getBoundingClientRect();tx=Math.max(-1,Math.min(1,2*(e.clientX-r.left)/r.width-1));ty=Math.max(-1,Math.min(1,2*(e.clientY-r.top)/r.height-1));lastInput=time;if(drag&&drag.id===e.pointerId){drag.moved ||= Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>8;targetYaw=drag.base+(e.clientX-drag.x)*.008;}start();});
  canvas.addEventListener('pointerup',e=>{if(drag?.id!==e.pointerId)return;if(state.toggle&&!drag.moved)latched=!latched;release();});
  canvas.addEventListener('pointercancel',release);canvas.addEventListener('lostpointercapture',release);window.addEventListener('blur',release);canvas.addEventListener('pointerleave',()=>{tx=ty=0;});
  canvas.addEventListener('dblclick',()=>{wave=time;latched=false;start();});
  canvas.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();if(!e.repeat){if(state.toggle)latched=!latched;else held=true;}}if(e.key==='ArrowLeft')targetYaw-=.15;if(e.key==='ArrowRight')targetYaw+=.15;lastInput=time;start();});canvas.addEventListener('keyup',e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();release();}});canvas.addEventListener('blur',release);
  function resize(){const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();start();}
  function frame(now){raf=0;if(document.hidden||!visible)return;const dt=Math.min(.05,(now-last)/1000||.016);last=now;const paused=!state.enabled||reduced.matches||document.body.classList.contains('reduced-motion');if(!paused){time+=dt;const blend=1-Math.exp(-dt*7*state.speed);if(!drag&&time-lastInput>2){tx=ty=0;targetYaw*=1-blend;}x+=(tx*state.sensitivity-x)*blend;y+=(ty*state.sensitivity-y)*blend;yaw+=(targetYaw+Math.max(-.55,Math.min(.55,x*.4))-yaw)*blend;const waving=time-wave<1.5;hand+=((waving?0:Number(state.toggle?latched:held))-hand)*blend;model.pose({time,hand,lookX:x,lookY:y,yaw,idle:true});if(waving)model.bones.wrist_L.rotation.z+=Math.sin((time-wave)*15)*.18;
    }renderer.render(scene,camera);if(!paused)raf=requestAnimationFrame(frame);}
  function start(){if(!raf&&visible&&!document.hidden){last=performance.now();raf=requestAnimationFrame(frame);}}
  new ResizeObserver(resize).observe(stage);new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;start();}).observe(stage);document.addEventListener('visibilitychange',start);reduced.addEventListener('change',start);document.getElementById('motion-button')?.addEventListener('click',start);resize();
})();
