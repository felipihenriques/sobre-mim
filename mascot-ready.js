/* GLB integration boundary: requires a skinned character and 15 raised-hand joints. */
(() => {
  'use strict';
  const defaults={enabled:true,sensitivity:1,speed:1,toggleHand:false,scroll:false,strength:.7,duration:2.4,idle:true,light:1.2,quality:'auto',yaw:0};
  let settings={...defaults};try{const saved=JSON.parse(localStorage.getItem('felipi-studio-v2')||'{}');for(const k in defaults)if(typeof saved[k]===typeof defaults[k])settings[k]=saved[k];}catch{}
  for(const[k,min,max]of [['sensitivity',.2,2],['speed',.3,2],['strength',0,1.5],['duration',1,5],['light',.5,2],['yaw',-180,180]])settings[k]=Math.max(min,Math.min(max,settings[k]));
  const save=()=>{try{localStorage.setItem('felipi-studio-v2',JSON.stringify(settings));}catch{}};
  function inspect(gltf,asset){
    const T=THREE,root=gltf.scene,bones=new Map();let skinned=0;root.traverse(n=>{if(n.isBone)bones.set(n.name,n);if(n.isSkinnedMesh)skinned++;});
    if(!skinned)throw Error('O arquivo não contém uma malha com skinning. Importe um personagem ligado a um esqueleto.');
    const mapping=asset.bones||{},find=(key,aliases)=>bones.get(mapping[key])||aliases.map(n=>bones.get(n)).find(Boolean);
    const required={head:['Head','head','mixamorigHead'],chest:['Spine2','chest','spine','mixamorigSpine2'],pelvis:['Hips','pelvis','mixamorigHips'],upperArm:['LeftArm','upper_arm.L','mixamorigLeftArm'],forearm:['LeftForeArm','forearm.L','mixamorigLeftForeArm'],hand:['LeftHand','hand.L','mixamorigLeftHand'],leftThigh:['LeftUpLeg','thigh.L','mixamorigLeftUpLeg'],rightThigh:['RightUpLeg','thigh.R','mixamorigRightUpLeg'],leftShin:['LeftLeg','shin.L','mixamorigLeftLeg'],rightShin:['RightLeg','shin.R','mixamorigRightLeg']};
    const rig={},missing=[];for(const[key,aliases]of Object.entries(required)){rig[key]=find(key,aliases);if(!rig[key])missing.push(key);}
    for(const finger of ['Thumb','Index','Middle','Ring','Pinky'])for(let i=1;i<=3;i++){const key=finger.toLowerCase()+i;rig[key]=find(key,[`LeftHand${finger}${i}`,`mixamorigLeftHand${finger}${i}`,`${finger.toLowerCase()}_${i}.L`]);if(!rig[key])missing.push(key);}
    if(missing.length)throw Error('Articulações ausentes ou sem mapeamento: '+missing.join(', ')+'. Consulte o contrato do modelo.');
    const baseline=new Map(Object.values(rig).map(b=>[b,{q:b.quaternion.clone(),p:b.position.clone()}]));
    const bounds=new T.Box3().setFromObject(root),size=bounds.getSize(new T.Vector3());if(!Number.isFinite(size.y)||size.y<=0)throw Error('Modelo sem dimensões válidas.');
    const scale=3.4/size.y;root.scale.multiplyScalar(scale);bounds.setFromObject(root);const center=bounds.getCenter(new T.Vector3());root.position.x-=center.x;root.position.z-=center.z;root.position.y-=bounds.min.y;
    const morphs=[];root.traverse(n=>{if(n.morphTargetDictionary&&asset.blinkMorph in n.morphTargetDictionary)morphs.push({mesh:n,index:n.morphTargetDictionary[asset.blinkMorph]});});
    root.traverse(n=>{if(n.isMesh){n.castShadow=true;n.receiveShadow=true;}});
    return {root,rig,baseline,morphs,clips:gltf.animations};
  }
  async function loadModel(source,asset){
    let buffer;if(source instanceof File)buffer=await source.arrayBuffer();else {const response=await fetch(source);if(!response.ok)throw Error('Não foi possível carregar o GLB.');buffer=await response.arrayBuffer();}
    const data=new DataView(buffer);if(buffer.byteLength<20||data.getUint32(0,true)!==0x46546c67)throw Error('Selecione um arquivo GLB 2.0 autocontido.');
    const json=JSON.parse(new TextDecoder().decode(new Uint8Array(buffer,20,data.getUint32(12,true))));
    if([...(json.buffers||[]),...(json.images||[])].some(item=>item.uri&&!item.uri.startsWith('data:')))throw Error('Use um GLB com texturas e buffers incorporados, sem arquivos externos.');
    if(json.extensionsRequired?.some(x=>['KHR_draco_mesh_compression','EXT_meshopt_compression','KHR_texture_basisu'].includes(x)))throw Error('Exporte o GLB sem compressão Draco, Meshopt ou KTX2 para este visualizador.');
    const gltf=await new Promise((resolve,reject)=>new FelipiGLTFLoader().parse(buffer,'',resolve,reject));return inspect(gltf,asset);
  }
  async function mount(container,source,asset,status){
    const model=await loadModel(source,asset),T=THREE,renderer=new T.WebGLRenderer({antialias:true,alpha:true});
    renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
    const scene=new T.Scene(),camera=new T.PerspectiveCamera(34,1,.1,100);camera.position.set(0,1.8,8);camera.lookAt(0,1.7,0);scene.add(model.root,new T.HemisphereLight(0xd3e5ff,0x434254,2));
    const light=new T.DirectionalLight(0xffebd7,4);light.position.set(-3,6,5);light.castShadow=true;light.shadow.mapSize.set(1024,1024);scene.add(light);const rim=new T.DirectionalLight(0x8ab9ff,2);rim.position.set(3,4,-4);scene.add(rim);
    const ground=new T.Mesh(new T.CircleGeometry(2,48),new T.ShadowMaterial({opacity:.2}));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
    const host=document.createElement('div');host.className='mascot-live';container.append(host);host.append(renderer.domElement);const canvas=renderer.domElement;canvas.tabIndex=0;canvas.setAttribute('role','button');canvas.setAttribute('aria-label','Mascote 3D: clique ou pressione Enter para animar a mão. Arraste para girar.');
    const reference=container.querySelector('img');if(reference)reference.hidden=true;
    let visible=true,raf=0,last=0,time=0,handStart=-100,progress=0,manual=null,drag=null,yaw=0,look=0,lookY=0,targetX=0,targetY=0,bodyYaw=0,curl=0,held=false,latched=false,lastInput=0,waveStart=-100;
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    function resize(){const w=container.clientWidth,h=container.clientHeight;if(!w||!h)return;renderer.setPixelRatio(settings.quality==='4k'?Math.min(3840/w,2160/h):Math.min(devicePixelRatio||1,settings.quality==='high'?2:1.5));renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();}
    function hand(){if(reduced.matches||document.body.classList.contains('reduced-motion'))return;handStart=time;start();}
    function release(){held=false;drag=null;start();}
    function reset(){release();latched=false;yaw=0;targetX=0;targetY=0;manual=0;settings.yaw=0;handStart=-100;waveStart=-100;save();start();}
    canvas.setAttribute('aria-label','Mascote 3D: mova para acompanhar o cursor. Segure para fechar a mão, solte para abrir. Arraste para girar.');
    canvas.addEventListener('pointerdown',e=>{if(e.button!==0||!e.isPrimary)return;held=true;drag={id:e.pointerId,x:e.clientX,y:e.clientY,yaw,moved:false};canvas.setPointerCapture(e.pointerId);lastInput=time;start();});
    canvas.addEventListener('pointermove',e=>{const r=canvas.getBoundingClientRect();targetX=Math.max(-1,Math.min(1,(e.clientX-r.left)/r.width*2-1));targetY=Math.max(-1,Math.min(1,(e.clientY-r.top)/r.height*2-1));lastInput=time;if(drag&&drag.id===e.pointerId){if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>8)drag.moved=true;yaw=Math.max(-Math.PI,Math.min(Math.PI,drag.yaw+(e.clientX-drag.x)*.008));}start();});
    canvas.addEventListener('pointerup',e=>{if(!drag||drag.id!==e.pointerId)return;if(settings.toggleHand&&!drag.moved)latched=!latched;release();});
    canvas.addEventListener('pointercancel',release);canvas.addEventListener('lostpointercapture',release);window.addEventListener('blur',release);
    canvas.addEventListener('pointerleave',()=>{targetX=0;targetY=0;});
    canvas.addEventListener('dblclick',()=>{latched=false;waveStart=time;start();});
    canvas.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();if(!e.repeat){if(settings.toggleHand)latched=!latched;else held=true;}}if(e.key==='ArrowLeft')yaw-=.15;if(e.key==='ArrowRight')yaw+=.15;if(e.key==='Escape')reset();lastInput=time;start();});
    canvas.addEventListener('keyup',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();held=false;start();}});canvas.addEventListener('blur',release);
    function rotate(b,axis,angle){b.quaternion.multiply(new T.Quaternion().setFromAxisAngle(axis,angle));}
    const x=new T.Vector3(1,0,0),y=new T.Vector3(0,1,0),z=new T.Vector3(0,0,1);
    function frame(now){raf=0;if(document.hidden||!visible)return;const dt=Math.min(.05,(now-last)/1000||.016);last=now;const paused=!settings.enabled||reduced.matches||document.body.classList.contains('reduced-motion');if(!paused){time+=dt;const blend=1-Math.exp(-dt*8*settings.speed);if(!drag&&time-lastInput>2){targetX=0;targetY=0;yaw*=1-blend;}look+=(targetX*settings.sensitivity-look)*blend;lookY+=(targetY*settings.sensitivity-lookY)*blend;bodyYaw+=(yaw+Math.max(-.65,Math.min(.65,look*.4))-bodyYaw)*blend;const target=settings.scroll?(manual??window.scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight)):0;progress+=(Math.max(0,Math.min(1,target))-progress)*(1-Math.exp(-dt*8));
      for(const[b,base]of model.baseline){b.quaternion.copy(base.q);b.position.copy(base.p);}
      const p=progress*settings.strength,idle=settings.idle?Math.sin(time*1.6)*.012:0;model.root.rotation.y=bodyYaw+settings.yaw*Math.PI/180+progress*Math.PI*2;
      rotate(model.rig.chest,x,idle+p*.08);rotate(model.rig.head,y,look*.15+Math.sin(p*Math.PI)*.12);rotate(model.rig.head,x,Math.max(-.16,Math.min(.16,lookY*.12))-p*.06);rotate(model.rig.upperArm,z,p*.07);rotate(model.rig.forearm,x,p*.06);rotate(model.rig.leftThigh,x,p*.025);rotate(model.rig.rightThigh,x,-p*.025);
      const t=(time-handStart)/settings.duration,demo=t>=0&&t<1?Math.sin(t*Math.PI)**2:0;
      const waveTime=time-waveStart,waving=waveTime>=0&&waveTime<1.5;
      const targetCurl=waving?0:Math.max(settings.toggleHand?Number(latched):Number(held),demo);
      curl+=(targetCurl-curl)*(1-Math.exp(-dt*7*settings.speed));
      for(const finger of ['index','middle','ring','pinky'])for(let i=1;i<=3;i++)rotate(model.rig[finger+i],x,curl*(i===1?.85:1.25));
      // Thumb opposition requires calibration to the final model's local axes.
      const thumbCurl=Math.max(0,(curl-.18)/.82);rotate(model.rig.thumb1,z,-thumbCurl*.55);rotate(model.rig.thumb1,x,thumbCurl*.35);rotate(model.rig.thumb2,x,thumbCurl*.8);rotate(model.rig.thumb3,x,thumbCurl*.6);
      if(waving)rotate(model.rig.hand,z,Math.sin(waveTime*15)*Math.sin(waveTime/1.5*Math.PI)*.2);
      for(const name of ['LeftEye','RightEye','mixamorigLeftEye','mixamorigRightEye']){const eye=model.root.getObjectByName(name);if(eye?.isBone){if(!eye.userData.restLook)eye.userData.restLook=eye.quaternion.clone();eye.quaternion.copy(eye.userData.restLook);rotate(eye,y,Math.max(-.1,Math.min(.1,look*.07)));rotate(eye,x,Math.max(-.08,Math.min(.08,lookY*.06)));}}
      const blink=time%4.7,amount=settings.idle&&blink<.17?Math.sin(blink/.17*Math.PI):0;model.morphs.forEach(m=>m.mesh.morphTargetInfluences[m.index]=amount);
    }renderer.toneMappingExposure=settings.light;renderer.render(scene,camera);if(!paused)raf=requestAnimationFrame(frame);}
    function start(){if(!raf&&!document.hidden&&visible){last=performance.now();raf=requestAnimationFrame(frame);}}
    const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;start();});observer.observe(container);new ResizeObserver(resize).observe(container);document.addEventListener('visibilitychange',start);canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(raf);raf=0;status('A GPU interrompeu a renderização. Recarregue a página para retomar.');});resize();start();status('Modelo articulado carregado. Scroll e mão disponíveis.'+(model.morphs.length?' Piscadas disponíveis.':' O modelo não contém o morph de piscada configurado.'));
    reduced.addEventListener('change',start);document.getElementById('motion-button')?.addEventListener('click',start);
    return {hand,resize,reset,refresh:start,setProgress:p=>{manual=p;start();}};
  }
  globalThis.FelipiMascot={mount,inspect,settings,save};
  const asset=globalThis.FELIPI_MASCOT_ASSET,stage=document.getElementById('character-stage');
  if(stage&&asset?.approved&&asset.url)mount(stage,asset.url,asset,message=>console.info(message)).catch(error=>console.warn('Mascote: referência estática mantida.',error.message));
})();
