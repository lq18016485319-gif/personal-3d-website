import * as THREE from './vendor/three.module.min.js';

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const C = { cream:0xe9e5d8, white:0xf5f2e8, sage:0x849575, dark:0x4c5943, sand:0xc6ad8d, wood:0xd7c3a4, ink:0x3e4936 };
const mat=(color,opts={})=>new THREE.MeshStandardMaterial({color,roughness:.78,...opts});
const cream=mat(C.cream), white=mat(C.white), sage=mat(C.sage), ink=mat(C.ink), sand=mat(C.sand);

function roundedShape(w,h,r){
  const x=-w/2,y=-h/2,s=new THREE.Shape();
  s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);
  s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);
  s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s;
}
function rounded(w,h,d,r=.04){const bevel=Math.min(d*.12,.018);const geo=new THREE.ExtrudeGeometry(roundedShape(w-bevel*2,h-bevel*2,r),{depth:d-bevel*2,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:bevel,bevelThickness:bevel,curveSegments:6});geo.translate(0,0,-d/2+bevel);return geo;}
function mesh(g,m,parent,x=0,y=0,z=0){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
function box(parent,w,h,d,m,x=0,y=0,z=0,r=0){return mesh(r?rounded(w,h,d,r):new THREE.BoxGeometry(w,h,d),m,parent,x,y,z);}
function cyl(parent,top,bottom,h,m,x=0,y=0,z=0,segments=32){return mesh(new THREE.CylinderGeometry(top,bottom,h,segments),m,parent,x,y,z);}
function sphere(parent,r,m,x,y,z,scale=[1,1,1]){const s=mesh(new THREE.SphereGeometry(r,24,16),m,parent,x,y,z);s.scale.set(...scale);return s;}
function group(parent,x=0,y=0,z=0){const g=new THREE.Group();g.position.set(x,y,z);parent.add(g);return g;}
function line(parent,points,color=0x6d795c,r=.012){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));return mesh(new THREE.TubeGeometry(curve,20,r,6,false),mat(color),parent);}
function texture(draw,w=1024,h=768){const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d');draw(ctx,w,h);const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;}
const flatText = (label,bg='#f0edde',fg='#5d6c50',font='42px Georgia')=>texture((c,w,h)=>{c.fillStyle=bg;c.fillRect(0,0,w,h);c.fillStyle=fg;c.textAlign='center';c.font=font;c.fillText(label,w/2,h/2+16);},512,256);
function plane(parent,w,h,t,x,y,z){const p=mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:t,roughness:.9}),parent,x,y,z);p.castShadow=false;return p;}

export function startStudio(){
  const host=document.querySelector('#studio');
  const scene=new THREE.Scene();
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.8));
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.35;
  host.append(renderer.domElement);
  const camera=new THREE.OrthographicCamera(-5,5,5,-5,.1,60);
  const root=group(scene);root.rotation.y=-.08;
  const hemi=new THREE.HemisphereLight(0xfffaf0,0x8d947c,3.2);scene.add(hemi);
  const sun=new THREE.DirectionalLight(0xfff5db,4.2);sun.position.set(-4,9,6);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-7;sun.shadow.camera.right=7;sun.shadow.camera.top=7;sun.shadow.camera.bottom=-7;sun.shadow.normalBias=.028;sun.shadow.bias=-.0001;sun.shadow.radius=4;scene.add(sun);
  const fill=new THREE.DirectionalLight(0xe5edf0,1.2);fill.position.set(5,4,-1);scene.add(fill);
  const floor=mesh(new THREE.PlaneGeometry(100,100),new THREE.ShadowMaterial({opacity:.13}),root,0,-.015,0);floor.rotation.x=-Math.PI/2;floor.castShadow=false;

  // A freestanding, curved wall makes the desk feel like a little physical set.
  const wall=box(root,7.3,4.4,.14,mat(0xe8e7db),0,2.2,-1.95,.27);wall.castShadow=false;
  box(root,7.18,.045,.045,mat(0xd9d9cc),0,.2,-1.86,.015);
  const windowGroup=group(root,-1.82,2.86,-1.85);
  const arch=roundedShape(1.86,2.55,.86);
  const windowFrame=mesh(new THREE.ExtrudeGeometry(arch,{depth:.08,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.03,bevelThickness:.015,curveSegments:24}),white,windowGroup,0,0,0);
  const sky=texture((c,w,h)=>{const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'#c6d6cc');g.addColorStop(.65,'#e2e8d6');g.addColorStop(1,'#f6ebcc');c.fillStyle=g;c.fillRect(0,0,w,h);c.fillStyle='#a9ba9b';c.beginPath();c.ellipse(w*.15,h*.96,w*.48,h*.36,-.35,0,Math.PI*2);c.fill();c.fillStyle='#bac7a6';c.beginPath();c.ellipse(w*.85,h,w*.6,h*.4,.3,0,Math.PI*2);c.fill();},512,700);
  const skyMaterial=new THREE.MeshBasicMaterial({map:sky});
  const skyMesh=mesh(new THREE.ShapeGeometry(roundedShape(1.64,2.33,.78),32),skyMaterial,windowGroup,0,0,.102);skyMesh.castShadow=false;
  box(windowGroup,.055,2.27,.055,white,0,-.02,.125,.015);
  box(windowGroup,1.6,.055,.055,white,0,-.1,.125,.015);
  box(windowGroup,2.04,.09,.39,white,0,-1.25,.15,.035);
  // A curtain, using narrow strips with slightly different normals.
  const curtain=group(root,-3.14,2.78,-1.64);
  for(let i=0;i<8;i++){const strip=box(curtain,.075,2.75,.045,mat(i%2?0xf0eddf:0xe5e3d3),i*.07,0,Math.sin(i*2)*.035,.012);strip.rotation.z=Math.sin(i*.8)*.012;}
  const rod=cyl(root,.025,.025,2.42,sand,-1.95,4.25,-1.52);rod.rotation.z=Math.PI/2;

  // Wall shelf, pinboard, a little print.
  box(root,2.65,.105,.6,mat(C.wood),1.45,3.42,-1.56,.025);
  box(root,.08,.38,.1,sand,.55,3.19,-1.65,.02);box(root,.08,.38,.1,sand,2.39,3.19,-1.65,.02);
  const shelfBooks=[['#9da58b',.38],['#d9c5a5',.5],['#7a896d',.56],['#e5dfcb',.43]];
  shelfBooks.forEach(([col,h],i)=>{const b=box(root,.115,h,.31,mat(col),.45+i*.13,3.48+h/2,-1.52,.012);if(i===3)b.rotation.z=-.1;box(b,.07,.018,.012,white,0,h*.25,.163);});
  const artTex=texture((c,w,h)=>{c.fillStyle='#f5efe1';c.fillRect(0,0,w,h);c.fillStyle='#9caa85';c.beginPath();c.arc(w/2,h*.43,w*.27,0,Math.PI*2);c.fill();c.fillStyle='#d8c8ab';c.fillRect(w*.24,h*.43,w*.52,h*.26);c.fillStyle='#7c876a';c.font='22px Georgia';c.textAlign='center';c.fillText('a little everyday.',w/2,h*.87);},384,460);
  const print=box(root,.66,.84,.055,mat(0xb6a38c),1.48,3.9,-1.75,.015);plane(print,.57,.75,artTex,0,0,.033);print.rotation.z=-.06;
  makePlant(root,2.34,3.49,-1.5,.53);
  const memo=group(root,.02,2.68,-1.83);box(memo,.6,.66,.018,mat(0xddd4bc),0,0,0,.01);memo.rotation.z=-.05;
  const memoTex=texture((c,w,h)=>{c.fillStyle='#eee9d6';c.fillRect(0,0,w,h);c.fillStyle='#899171';c.font='italic 52px Georgia';c.textAlign='center';c.fillText('make',w/2,100);c.fillText('room',w/2,165);c.fillText('for ideas.',w/2,230);},400,340);
  plane(memo,.53,.58,memoTex,0,0,.016);sphere(memo,.025,sand,0,.285,.045);

  // Rounded desk with warm wood, drawers, and gently tapered legs.
  const woodTex=texture((c,w,h)=>{c.fillStyle='#d7c6aa';c.fillRect(0,0,w,h);for(let i=0;i<95;i++){c.strokeStyle=`rgba(133,108,69,${.022+(i%4)*.008})`;c.lineWidth=1;const y=i*h/95;c.beginPath();c.moveTo(0,y);c.bezierCurveTo(w*.3,y+Math.sin(i)*3,w*.7,y-4,w,y+2);c.stroke();}},1024,512);
  const wood=mat(0xffffff,{map:woodTex,roughness:.77});
  const desk=group(root,0,1.5,.03);
  const top=mesh(rounded(6.5,3.15,.17,.27),wood,desk);top.rotation.x=-Math.PI/2;
  box(desk,6.07,.12,.13,cream,0,-.14,1.24,.03);
  [[-2.76,-1.04],[2.76,-1.04],[-2.76,1.08],[2.76,1.08]].forEach(([x,z])=>{cyl(root,.09,.065,1.39,cream,x,.7,z+.03);cyl(root,.067,.065,.09,sand,x,.045,z+.03);});
  const drawers=group(root,2.26,1.02,.11);box(drawers,1.15,.7,2.25,cream,0,0,0,.07);
  [-.17,.17].forEach(y=>{box(drawers,1.1,.31,.05,white,0,y,1.14,.025);box(drawers,.27,.03,.055,sand,0,y,1.19,.015);});
  const deskY=1.605;
  // Soft sage desk mat.
  const pad=mesh(rounded(3.65,1.95,.018,.13),mat(0xa4ad94),root,-.46,deskY,-.05);pad.rotation.x=-Math.PI/2;

  const clickable=[];
  const register=(g,kind)=>{g.userData.kind=kind;g.traverse(o=>{if(o.isMesh)o.userData.kind=kind;});clickable.push(g);return g;};
  const computer=register(group(root,-.58,deskY,-.68),'work');computer.rotation.y=-.055;
  const standBase=box(computer,.94,.06,.55,cream,0,.03,.07,.13);box(computer,.18,.42,.13,cream,0,.26,0,.035);
  const display=group(computer,0,1.05,-.01);display.rotation.x=-.085;
  box(display,2.18,1.43,.18,white,0,0,0,.14);
  const screenTex=texture((c,w,h)=>{c.fillStyle='#808e72';c.fillRect(0,0,w,h);c.strokeStyle='#b3bfa0';c.lineWidth=1;c.strokeRect(32,32,w-64,h-64);c.fillStyle='#d4dcc6';c.font='20px sans-serif';c.textAlign='left';c.fillText('LU QI / A LITTLE STUDIO',66,86);c.font='100px Georgia';c.fillText('Good things',63,250);c.font='italic 98px Georgia';c.fillText('take shape.',63,353);c.font='17px sans-serif';c.fillText('SELECTED EXPLORATIONS    →',68,463);c.fillStyle='#b0bc9e';c.beginPath();c.arc(w-130,h-110,130,0,Math.PI*2);c.fill();c.fillStyle='#849374';c.beginPath();c.arc(w-130,h-110,86,0,Math.PI*2);c.fill();},1024,640);
  const screen=mesh(new THREE.PlaneGeometry(1.98,1.23),new THREE.MeshBasicMaterial({map:screenTex}),display,0,.035,.096);screen.castShadow=false;
  sphere(display,.014,ink,0,.662,.095);
  const badge=flatText('lq.','#f4f0e6','#b7bba7','italic 42px Georgia');plane(display,.18,.075,badge,0,-.65,.097);
  const keyboard=group(root,-.52,deskY+.047,.47);keyboard.rotation.y=-.055;
  box(keyboard,1.72,.075,.59,cream,0,0,0,.065);
  const keyMaterial=mat(0xf7f3e8);
  for(let row=0;row<4;row++)for(let col=0;col<14;col++){if(row===3&&col>3&&col<9)continue;box(keyboard,.095,.021,.093,keyMaterial,-.735+col*.112,.046,-.2+row*.125,.012);}
  box(keyboard,.56,.021,.094,keyMaterial,-.005,.046,.175,.012);
  const mouse=sphere(root,.14,white,.68,deskY+.05,.53,[.7,.4,1.2]);line(root,[[.68,deskY+.101,.4],[.68,deskY+.106,.53]],0xbfc2b2,.003);

  // A closed linen notebook. The cover is the about entrance.
  const notebook=register(group(root,1.35,deskY+.055,.55),'about');notebook.rotation.y=-.22;
  box(notebook,.86,.09,1.1,mat(0x72836b),0,0,0,.035);
  box(notebook,.79,.045,1.05,mat(0xe9e5d3),.018,-.004,.01,.018);
  box(notebook,.87,.025,1.12,mat(0x859777),0,.051,0,.028);
  const notebookTex=texture((c,w,h)=>{c.fillStyle='#859777';c.fillRect(0,0,w,h);c.strokeStyle='#bec6a9';c.lineWidth=1;c.strokeRect(30,30,w-60,h-60);c.fillStyle='#e3e7ce';c.textAlign='center';c.font='18px sans-serif';c.fillText('A LITTLE BOOK OF',w/2,117);c.font='italic 64px Georgia';c.fillText('ideas.',w/2,202);c.font='16px sans-serif';c.fillText('LU QI',w/2,340);},400,500);
  const cover=plane(notebook,.8,1.02,notebookTex,0,.066,0);cover.rotation.x=-Math.PI/2;
  box(notebook,.018,.016,1.09,mat(0xb9c6a1),.28,.081,0,.005);
  const pencil=group(root,1.97,deskY+.025,.61);pencil.rotation.y=.3;const pen=cyl(pencil,.018,.018,.86,mat(0xbaaa8e));pen.rotation.x=Math.PI/2;const nib=mesh(new THREE.ConeGeometry(.018,.09,8),ink,pencil,0,0,-.477);nib.rotation.x=-Math.PI/2;

  // Camera and a tiny stack of prints: notes and observations.
  const photos=register(group(root,-2.2,deskY+.025,.52),'notes');photos.rotation.y=.2;
  const photoTex=texture((c,w,h)=>{c.fillStyle='#e9deca';c.fillRect(0,0,w,h);c.fillStyle='#b5b895';c.fillRect(40,38,w-80,h-130);c.fillStyle='#e4d4ad';c.beginPath();c.arc(w*.63,h*.3,w*.17,0,Math.PI*2);c.fill();c.fillStyle='#81916b';c.beginPath();c.moveTo(40,h-92);c.lineTo(w*.48,h*.42);c.lineTo(w-40,h-92);c.fill();c.fillStyle='#8d9677';c.font='20px Georgia';c.fillText('little moments.',54,h-40);},400,470);
  const photoCard=box(photos,.74,.023,.9,white,0,0,0,.012);const photoSurface=plane(photos,.72,.86,photoTex,0,.014,0);photoSurface.rotation.x=-Math.PI/2;
  const extra=box(photos,.74,.018,.9,white,-.06,-.016,-.045,.012);extra.rotation.y=-.15;
  const cam=group(photos,0,.255,-.18);cam.rotation.y=-.15;
  box(cam,.7,.41,.3,cream,0,0,0,.055);box(cam,.73,.12,.315,mat(0x89937a),0,.12,0,.035);box(cam,.72,.08,.315,mat(0x89937a),0,-.16,0,.02);
  const lens=cyl(cam,.145,.15,.16,ink,.04,-.015,.2);lens.rotation.x=Math.PI/2;
  const lensRim=cyl(cam,.119,.119,.015,mat(0xb2b8a3,{metalness:.4,roughness:.35}),.04,-.015,.287);lensRim.rotation.x=Math.PI/2;
  const glass=cyl(cam,.09,.09,.017,mat(0x28392f,{metalness:.45,roughness:.12}),.04,-.015,.3);glass.rotation.x=Math.PI/2;
  box(cam,.11,.055,.08,ink,-.2,.226,.015,.01);box(cam,.11,.045,.07,cream,.22,.227,0,.012);box(cam,.11,.07,.015,mat(0xe7e3cd),-.23,.05,.162,.008);

  // Envelope and small seal.
  const envelope=register(group(root,.13,deskY+.02,1.03),'contact');envelope.rotation.y=.08;
  box(envelope,1.05,.025,.58,white,0,0,0,.012);
  const letterTex=texture((c,w,h)=>{c.fillStyle='#eee9da';c.fillRect(0,0,w,h);c.strokeStyle='#c4c5ad';c.lineWidth=2;c.beginPath();c.moveTo(0,0);c.lineTo(w/2,h*.67);c.lineTo(w,0);c.stroke();c.beginPath();c.moveTo(0,h);c.lineTo(w*.35,h*.54);c.moveTo(w,h);c.lineTo(w*.65,h*.54);c.stroke();c.fillStyle='#8d9b79';c.beginPath();c.arc(w/2,h*.64,22,0,Math.PI*2);c.fill();c.fillStyle='#e8ecda';c.font='italic 25px Georgia';c.textAlign='center';c.fillText('lq',w/2,h*.64+8);},600,340);
  const letter=plane(envelope,1.04,.57,letterTex,0,.015,0);letter.rotation.x=-Math.PI/2;

  // Coffee with a little handle and ceramic coaster.
  const coffee=group(root,2.53,deskY,-.07);
  cyl(coffee,.29,.29,.025,mat(0x9eaa8c),0,.015,0);
  cyl(coffee,.212,.176,.32,mat(0xe8dfcd),0,.185,0);
  const rim=mesh(new THREE.TorusGeometry(.2,.018,8,48),white,coffee,0,.35,0);rim.rotation.x=Math.PI/2;
  cyl(coffee,.18,.18,.01,mat(0x786149),0,.332,0);
  const handle=mesh(new THREE.TorusGeometry(.105,.033,8,28),mat(0xe8dfcd),coffee,.236,.2,0);handle.rotation.y=Math.PI/2;
  const latte=mesh(new THREE.TorusGeometry(.07,.006,6,32,Math.PI*1.6),mat(0xc3a581),coffee,0,.339,0);latte.rotation.x=Math.PI/2;

  // Task lamp, warm pool of light, stationery, and a sculptural plant.
  const lamp=group(root,-2.4,deskY,-.8);cyl(lamp,.32,.36,.07,mat(0x8b987a),0,.035,0);
  line(lamp,[[0,.05,0],[0,.83,0],[.32,1.32,0],[.61,1.45,0]],0x7f8b6c,.033);
  const shade=mesh(new THREE.ConeGeometry(.31,.37,40,1,true),mat(0x96a185,{side:THREE.DoubleSide}),lamp,.62,1.29,0);shade.rotation.z=-.2;
  const lampLight=new THREE.PointLight(0xffe5ac,.65,3);lampLight.position.set(.62,1.15,0);lamp.add(lampLight);
  const bulb=sphere(lamp,.07,new THREE.MeshBasicMaterial({color:0xffefc8}),.62,1.15,0);
  makePlant(root,2.74,deskY,-1.07,.95);
  const pencilPot=cyl(root,.12,.1,.32,mat(0xc3ad8d),1.54,deskY+.16,-1.03);
  [[1.49,-1.05,.03],[1.6,-1.01,-.15],[1.53,-1.09,.12]].forEach(([x,z,a],i)=>{const pen=cyl(root,.012,.012,.55,mat([0x6c7d5d,0xe5d5bb,0x8c755b][i]),x,deskY+.39,z,8);pen.rotation.z=a;});

  // A short chair peeks out from under the desk.
  const chair=group(root,-.3,.72,2.1);chair.rotation.y=-.14;
  const chairSeat=mesh(rounded(1.45,1.15,.15,.25),mat(0xb3b99f),chair,0,0,0);chairSeat.rotation.x=-Math.PI/2;
  const back=box(chair,1.43,.65,.1,mat(0xb3b99f),0,.58,.5,.2);back.rotation.x=.14;
  [[-.52,-.35],[.52,-.35],[-.52,.35],[.52,.35]].forEach(([x,z])=>{const leg=cyl(chair,.038,.028,.71,mat(0xa18d71),x,-.4,z);leg.rotation.z=x*.1;});
  const rug=mesh(new THREE.CircleGeometry(3.1,64),mat(0xe9e6d9),root,.1,.002,.7);rug.rotation.x=-Math.PI/2;rug.scale.set(1.3,.82,1);rug.castShadow=false;

  // Floating labels share the exact object anchors, including camera movement.
  const anchors={work:new THREE.Vector3(-.6,2.65,-.6),about:new THREE.Vector3(1.6,1.72,.65),notes:new THREE.Vector3(-2.3,1.9,.7),contact:new THREE.Vector3(.1,1.64,1.2)};
  const labels=Object.fromEntries(Object.keys(anchors).map(key=>[key,document.querySelector(`#spot-${key}`)]));
  let width=1,height=1,visible=true,hover=null,focus=null;
  let pointer=new THREE.Vector2(0,0),targetPointer=new THREE.Vector2(0,0);
  const raycaster=new THREE.Raycaster();
  const baseLook=new THREE.Vector3(0,1.88,.2),currentLook=baseLook.clone(),targetLook=baseLook.clone();
  const cameraBase=new THREE.Vector3(8,6.8,10.5),currentPos=cameraBase.clone();
  const hoverBase=new Map(clickable.map(g=>[g,g.position.y]));
  let introStart=performance.now(),frameId,ready=false;
  function resize(){const rect=host.getBoundingClientRect();width=rect.width;height=rect.height;renderer.setSize(width,height,false);const ratio=width/height;const view=ratio<1.05?8.5:8.2;camera.left=-view*ratio/2;camera.right=view*ratio/2;camera.top=view/2;camera.bottom=-view/2;camera.updateProjectionMatrix();}
  new ResizeObserver(resize).observe(host);resize();
  const viewportObserver=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible&&!frameId)render(performance.now());},{rootMargin:'150px'});viewportObserver.observe(host);
  host.addEventListener('pointermove',e=>{const r=host.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height*2-1));targetPointer.copy(pointer);if(e.pointerType==='touch')return;raycaster.setFromCamera(pointer,camera);const hits=raycaster.intersectObjects(clickable,true);const kind=hits[0]?.object.userData.kind;hover=clickable.find(g=>g.userData.kind===kind)||null;host.style.cursor=hover?'pointer':'';});
  host.addEventListener('pointerleave',()=>{hover=null;targetPointer.set(0,0);host.style.cursor='';});
  let pointerDown;
  host.addEventListener('pointerdown',e=>{pointerDown=[e.clientX,e.clientY];});
  host.addEventListener('pointerup',e=>{if(!pointerDown||Math.hypot(e.clientX-pointerDown[0],e.clientY-pointerDown[1])>9)return;const r=host.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height*2-1));raycaster.setFromCamera(pointer,camera);const hits=raycaster.intersectObjects(clickable,true);const kind=hits[0]?.object.userData.kind;if(kind)window.dispatchEvent(new CustomEvent('studio:open',{detail:kind}));});
  window.addEventListener('studio:focus',e=>{focus=e.detail;});
  window.addEventListener('studio:close',()=>focus=null);
  window.addEventListener('studio:reset',()=>{focus=null;targetPointer.set(0,0);});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!frameId)render(performance.now());});
  let lastTime=performance.now();
  function render(now){frameId=null;if(!visible||document.hidden)return;const dt=Math.min((now-lastTime)/16.667,2);lastTime=now;
    const t=reduced?1:Math.min(1,(now-introStart)/1400);const ease=1-Math.pow(1-t,3);
    root.position.y=(1-ease)*-.18;root.rotation.y=-.08+(1-ease)*.1;
    pointer.lerp(targetPointer,.025*dt);
    targetLook.copy(baseLook);if(focus&&anchors[focus])targetLook.lerp(anchors[focus],.12);
    currentLook.lerp(targetLook,.045*dt);
    const desired=cameraBase.clone();if(!reduced){desired.x+=pointer.x*.18;desired.y+=pointer.y*.08;}
    currentPos.lerp(desired,.035*dt);camera.position.copy(currentPos);camera.lookAt(currentLook);
    clickable.forEach(g=>{const goal=hover===g&&!reduced?.06:0;g.position.y=THREE.MathUtils.lerp(g.position.y,hoverBase.get(g)+goal,.12*dt);});
    renderer.render(scene,camera);
    for(const [key,pos] of Object.entries(anchors)){const v=root.localToWorld(pos.clone()).project(camera);labels[key].style.left=`${(v.x*.5+.5)*width}px`;labels[key].style.top=`${(-v.y*.5+.5)*height}px`;}
    if(!ready&&t>.8){ready=true;document.querySelector('#loading').classList.add('gone');document.querySelector('#hotspots').classList.add('ready');}
    frameId=requestAnimationFrame(render);
  }
  render(performance.now());
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(frameId);document.querySelector('#hotspots').classList.add('ready');document.querySelector('#loading').classList.add('gone');});
}

function makePlant(parent,x,y,z,scale=1){
  const g=group(parent,x,y,z);g.scale.setScalar(scale);
  cyl(g,.23,.175,.42,mat(0xd2c0a3),0,.21,0);
  cyl(g,.213,.213,.018,mat(0x6f644c),0,.413,0);
  line(g,[[0,.42,0],[.025,.86,0],[.08,1.35,.01]],0x758060,.014);
  const leafMat=mat(0x8a9d73,{side:THREE.DoubleSide});
  [[.02,.58,-.03,-.6,.2],[.025,.8,0,.65,-.3],[.05,1.02,0,-.7,.2],[.07,1.2,0,.55,-.2]].forEach(([px,py,pz,a,b],i)=>{const leaf=sphere(g,.18,i%2?leafMat:mat(0x9eae82),px+Math.sin(a)*.14,py+.09,pz,[.6,1.35,.16]);leaf.rotation.z=-a;leaf.rotation.y=b;});
  return g;
}
