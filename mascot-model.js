/* Original procedural character. Bone hierarchy is shared by the viewer and GLB export. */
(function (scope) {
  'use strict';
  scope.createFelipiMascot = function (T) {
    const root = new T.Group(); root.name = 'Felipi_3D';
    const bones = {}, fingers = [], eyes = [], materials = {};
    function material(name, color, roughness = .65, metalness = 0) {
      return materials[name] = new T.MeshStandardMaterial({name, color, roughness, metalness});
    }
    const skin=material('Pele',0xe7a16f,.54), blush=material('Orelhas',0xce7e58), hair=material('Cabelo_castanho',0x302018,.85);
    const beard=material('Barba',0x39281e,.9), blue=material('Moletom_azul',0x173967,.88), shirt=material('Camiseta',0x2169d5);
    const pants=material('Calca',0x172d51,.9), white=material('Branco',0xe8eff7,.5), frame=material('Oculos_azuis',0x173b6e,.29,.25);
    const black=material('Pupila',0x121722,.22), iris=material('Iris_castanha',0x704529,.35), laptop=material('Notebook',0x235ab0,.3,.55);
    const screen=material('Tela',0x071b30,.28), mouth=material('Sorriso',0x4b201b), sole=material('Solado',0xc9d5e5);
    const sphere=new T.SphereGeometry(1,32,24);
    function ell(parent,mat,x,y,z,sx,sy,sz,name='') {
      const m=new T.Mesh(sphere,mat);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.name=name;m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
    }
    function box(parent,mat,x,y,z,w,h,d,r=.04) {
      // Rounded cuboid from a bevelled profile, with real thickness.
      const s=new T.Shape(),a=w/2,b=h/2,q=Math.min(r,a,b);
      s.moveTo(-a+q,-b);s.lineTo(a-q,-b);s.quadraticCurveTo(a,-b,a,-b+q);s.lineTo(a,b-q);s.quadraticCurveTo(a,b,a-q,b);s.lineTo(-a+q,b);s.quadraticCurveTo(-a,b,-a,b-q);s.lineTo(-a,-b+q);s.quadraticCurveTo(-a,-b,-a+q,-b);
      const g=new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelSize:q*.22,bevelThickness:q*.22,bevelSegments:3,steps:1,curveSegments:8});g.translate(0,0,-d/2);
      const m=new T.Mesh(g,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
    }
    function curve(parent,mat,points,r=.025) {
      const g=new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),24,r,8,false);
      const m=new T.Mesh(g,mat);parent.add(m);m.castShadow=true;return m;
    }
    function bone(name,parent,x=0,y=0,z=0){const b=new T.Bone();b.name=name;b.position.set(x,y,z);parent.add(b);bones[name]=b;return b;}
    const pelvis=bone('pelvis',root,0,.77,0);
    const torso=bone('spine',pelvis,0,.48,0);
    ell(torso,blue,0,.22,0,.57,.68,.35,'Hoodie');ell(torso,shirt,0,.26,.32,.32,.52,.065);
    ell(torso,blue,0,.71,-.11,.5,.26,.33,'Hood');
    for(const side of [-1,1]){
      curve(torso,white,[[side*.18,.69,.32],[side*.20,.40,.39],[side*.19,.02,.38]],.018);
      box(torso,sole,side*.19,.01,.38,.035,.09,.025,.01);
      curve(torso,frame,[[side*.10,-.15,.34],[side*.31,-.16,.32],[side*.40,-.04,.26]],.012);
    }
    curve(torso,sole,[[0,-.34,.31],[0,.25,.39],[0,.7,.32]],.009);
    const neck=bone('neck',torso,0,.82,0);ell(neck,skin,0,.05,0,.23,.25,.23);
    const head=bone('head',neck,0,.42,.015);
    ell(head,skin,0,.15,0,.66,.76,.55,'Face');ell(head,skin,0,-.24,.11,.50,.44,.47,'Jaw');
    for(const side of [-1,1]){
      ell(head,skin,side*.65,.05,.01,.15,.25,.115);ell(head,blush,side*.69,.055,.09,.075,.15,.035);
      ell(head,beard,side*.39,-.25,.29,.17,.31,.20);ell(head,beard,side*.49,-.05,.11,.09,.31,.16);
    }
    ell(head,beard,0,-.48,.24,.38,.19,.24);
    ell(head,skin,0,-.27,.435,.30,.22,.085);
    ell(head,mouth,0,-.29,.508,.245,.105,.035);
    ell(head,white,0,-.257,.534,.204,.047,.012);
    for(const side of [-1,1]){const m=ell(head,beard,side*.12,-.145,.523,.15,.052,.035);m.rotation.z=side*.14;}
    ell(head,skin,0,-.01,.55,.115,.18,.14,'Nose');ell(head,skin,0,-.08,.61,.15,.085,.10);
    for(const side of [-1,1]){
      const eye=bone(side<0?'eye_L':'eye_R',head,side*.27,.20,.493);eyes.push(eye);
      ell(eye,white,0,0,0,.188,.207,.09);ell(eye,iris,.014,-.004,.075,.092,.116,.032);ell(eye,black,.016,-.004,.101,.047,.074,.014);ell(eye,white,-.008,.039,.115,.025,.03,.008);
      const brow=ell(head,hair,side*.27,.48,.465,.225,.049,.05);brow.rotation.z=side*-.12;
      const outline=[];for(let i=0;i<=64;i++){const a=i/64*Math.PI*2;outline.push([side*.28+.245*Math.sign(Math.cos(a))*Math.pow(Math.abs(Math.cos(a)),.55),.21+.245*Math.sign(Math.sin(a))*Math.pow(Math.abs(Math.sin(a)),.55),.61]);}
      curve(head,frame,outline,.026);
      curve(head,frame,[[side*.52,.28,.60],[side*.65,.30,.26],[side*.67,.15,-.05]],.022);
    }
    curve(head,frame,[[-.045,.23,.62],[0,.26,.64],[.045,.23,.62]],.024);
    // Sculpted cap and swept locks, rather than a flat hair texture.
    ell(head,hair,0,.60,-.08,.67,.48,.53);
    for(let i=0;i<17;i++){
      const x=-.57+i*.071, peak=.89+Math.sin(i*.33)*.10;
      curve(head,hair,[[x,.47,.38],[x-.12,peak,.38],[x+.16,peak+.03,.06],[x+.20,.59,-.39]],.075);
      curve(head,beard,[[x-.018,.53,.435],[x-.10,peak+.054,.385],[x+.16,peak+.085,.06]],.009);
    }
    const arms=[];
    for(const side of [-1,1]){
      const label=side<0?'L':'R', shoulder=bone('shoulder_'+label,torso,side*.48,.56,0);
      ell(shoulder,blue,0,-.23,0,.22,.34,.22);
      const elbow=bone('elbow_'+label,shoulder,0,-.49,0);ell(elbow,blue,0,-.22,0,.18,.29,.18);
      ell(elbow,pants,0,-.43,0,.175,.08,.175);
      const wrist=bone('wrist_'+label,elbow,0,-.47,0);ell(wrist,skin,0,-.10,0,.15,.19,.07);
      for(let f=0;f<5;f++){
        const thumb=f===4, length=thumb?.10:[.12,.15,.145,.115][f];
        const first=bone('finger_'+label+'_'+f+'_0',wrist,thumb?-.145:-.105+f*.069,thumb?-.08:-.24,0);
        if(thumb)first.rotation.z=-.8;
        let current=first;const chain=[];
        for(let j=0;j<3;j++){
          if(j)current=bone('finger_'+label+'_'+f+'_'+j,current,0,-length,0);
          ell(current,skin,0,-length*.5,0,thumb?.045:.035,length*.65,.037);
          if(j===2)ell(current,white,0,-length*.55,-.032,.023,length*.24,.006);
          chain.push(current);
        }fingers.push({side,thumb,chain});
      }
      arms.push({side,shoulder,elbow,wrist});
    }
    for(const side of [-1,1]){
      const hip=bone('hip_'+side,pelvis,side*.24,-.13,0);hip.rotation.z=side*.67;hip.rotation.x=-1.0;
      ell(hip,pants,0,-.29,0,.25,.4,.25);
      const knee=bone('knee_'+side,hip,0,-.55,0);knee.rotation.x=1.9;knee.rotation.z=-side*.7;
      ell(knee,pants,0,-.25,0,.21,.35,.21);
      const ankle=bone('ankle_'+side,knee,0,-.51,0);
      ell(ankle,white,0,-.035,.10,.22,.14,.36);ell(ankle,blue,0,.04,.13,.20,.15,.33);
      ell(ankle,sole,0,-.105,.10,.225,.045,.36);
      for(let j=0;j<4;j++)curve(ankle,white,[[-.12,.15,j*.065],[0,.20,j*.065],[.12,.15,j*.065]],.015);
    }
    const pc=bone('laptop',pelvis,0,-.10,.63);box(pc,laptop,0,0,0,1.1,.045,.72);
    box(pc,frame,0,.03,-.05,.86,.012,.38);
    for(let r=0;r<4;r++)for(let c=0;c<10;c++)box(pc,sole,-.37+c*.082,.044,-.19+r*.079,.057,.006,.045,.008);
    box(pc,blue,0,.029,.23,.31,.008,.16);
    const lid=bone('laptop_lid',pc,0,0,-.34);lid.rotation.x=-.20;
    box(lid,laptop,0,.36,0,1.1,.72,.045);box(lid,screen,0,.36,.028,.99,.60,.009);
    for(let i=0;i<7;i++)box(lid,i%2?shirt:white,-.12+(i%3)*.07,.58-i*.065,.038,.32+(i%3)*.08,.012,.004,.003);
    const baseline={};Object.entries(bones).forEach(([key,b])=>baseline[key]=b.rotation.clone());
    root.userData={description:'Felipi: original procedural cartoon model with articulated bone hierarchy',version:1};
    function pose({time=0,progress=0,hand=0,lookX=0,lookY=0,idle=true,strength=1,yaw=0}={}){
      Object.entries(bones).forEach(([key,b])=>b.rotation.copy(baseline[key]));
      const breath=idle?Math.sin(time*1.65)*.012:0,p=progress*strength;
      root.rotation.y=yaw;torso.rotation.x=.025+p*.10+breath;torso.rotation.z=Math.sin(p*Math.PI)*.045;
      head.rotation.y=lookX*.23+Math.sin(p*Math.PI)*.16;head.rotation.x=lookY*.10-p*.08+(idle?Math.sin(time*.6)*.015:0);
      torso.position.y=.48+breath;
      arms.forEach(a=>{
        a.shoulder.rotation.z=a.side<0?-1.05-p*.14:.32+p*.08;
        a.shoulder.rotation.x=a.side<0?-.08:-.50;
        a.elbow.rotation.z=a.side<0?-1.65:.25;
        a.elbow.rotation.x=a.side<0?-.10+p*.10:-.93;
        a.wrist.rotation.y=a.side<0?-.25:0;a.wrist.rotation.z=(a.side<0?.10:0)+hand*.08;
      });
      fingers.forEach(({side,thumb,chain},i)=>chain.forEach((b,j)=>{
        const curl=side<0?hand:(.24+p*.08);
        b.rotation.x=-curl*(thumb?.75:1.35)*(j===0?.7:1);
        if(thumb&&j===0)b.rotation.z=-.8+curl*.5;
      }));
      const phase=time%4.7,blink=idle&&phase<.16?1-Math.sin(phase/.16*Math.PI)*.94:1;
      eyes.forEach(e=>e.scale.y=blink);
      bones['hip_-1'].rotation.x+=p*.035;bones['hip_1'].rotation.x-=p*.035;
    }
    pose();return {root,bones,fingers,eyes,materials,pose};
  };
})(globalThis);
