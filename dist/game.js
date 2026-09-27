import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import {createAtmosphere} from './atmosphere.js';
import {createStory} from './story.js';

const $ = id => document.getElementById(id);
const scene = new THREE.Scene();
scene.background = new THREE.Color('#b8dfeb');
scene.fog = new THREE.Fog('#b8dfeb', 100, 290);
const renderer = new THREE.WebGLRenderer({canvas:$('world'), antialias:true, powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
const camera = new THREE.PerspectiveCamera(52,innerWidth/innerHeight,.15,500);
scene.add(new THREE.HemisphereLight('#deefff','#91a67a',.7));
const sun = new THREE.DirectionalLight('#fff0cd',2.6);
sun.position.set(-40,65,25); sun.castShadow=true;
sun.shadow.mapSize.set(2048,2048);
Object.assign(sun.shadow.camera,{left:-35,right:35,top:35,bottom:-35,near:1,far:160});
sun.shadow.normalBias=.05; sun.shadow.bias=-.00015;
scene.add(sun,sun.target);
const atmosphere=createAtmosphere(renderer,scene,camera);
let story;
$('qualityBtn').onclick=()=>{atmosphere.setQuality(!atmosphere.quality);$('qualityBtn').textContent=atmosphere.quality?'细腻':'流畅';};
const clock = new THREE.Clock();
const player = new THREE.Group(); scene.add(player);
let model,mixer,actions={},activeAction,layout,nearby,selected=0,started=false,yaw=0,pitch=.39,distance=11;
let walking=false,ready=false,dragging=false,toastTimer,elapsed=0,audioContext;
const keys=new Set(),collected=new Set(),markers=[],cameraBoxes=[];
const target=new THREE.Vector3(),desiredCamera=new THREE.Vector3(),movement=new THREE.Vector3();
const viewRay=new THREE.Ray(),hit=new THREE.Vector3();
const groundRay=new THREE.Raycaster(),groundMeshes=[];
const mapContext=$('minimap').getContext('2d');
const isPaused=()=>!!document.querySelector('dialog[open]');
$('welcome').addEventListener('cancel',e=>e.preventDefault());
function toast(text){$('toast').textContent=text;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),3300);}
function openDialog(id){keys.clear();const el=$(id);if(!el.open)el.showModal();}
document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>$(b.dataset.close).close()));
$('startBtn').onclick=()=>{started=true;$('welcome').close();toast('靠近同学按 E 交谈，按 J 查看剧情手账。');};
$('mapBtn').onclick=()=>{if(ready){updateJournal();openDialog('mapDialog');}};
$('helpBtn').onclick=()=>openDialog('helpDialog');
$('homeBtn').onclick=()=>{if(ready){player.position.set(layout.spawn.x,.12,layout.spawn.z);yaw=0;pitch=.39;distance=11;updateCamera(1);toast('已回到学校正门。');}};
$('restartBtn').onclick=()=>{collected.clear();selected=0;updateProgress();$('completeDialog').close();toast('新的一页，从校门开始。');};
function interact(){if(story?.near){story.interact();return;}collect();}
$('interactBtn').onclick=interact;
addEventListener('blur',()=>{keys.clear();dragging=false;});
addEventListener('keydown',e=>{
  if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();
  if(e.code==='Escape'&&!isPaused()&&ready){e.preventDefault();openDialog('helpDialog');return;}
  if(e.repeat)return;
  if(e.code==='KeyM'&&ready){if($('mapDialog').open)$('mapDialog').close();else if(!isPaused())$('mapBtn').click();return;}
  if(e.code==='KeyE'&&!isPaused()&&started){interact();return;}
  if(!isPaused())keys.add(e.code);
});
addEventListener('keyup',e=>keys.delete(e.code));
$('world').addEventListener('pointerdown',e=>{if(!isPaused()){dragging=true;$('world').setPointerCapture(e.pointerId);}});
$('world').addEventListener('pointerup',()=>dragging=false);
$('world').addEventListener('pointermove',e=>{if(dragging){yaw-=e.movementX*.005;pitch=THREE.MathUtils.clamp(pitch+e.movementY*.003,.12,1.15);}});
$('world').addEventListener('wheel',e=>{e.preventDefault();distance=THREE.MathUtils.clamp(distance+e.deltaY*.01,5,24);},{passive:false});
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);atmosphere.resize();});

// A circle against static building footprints keeps movement predictable in this outdoor scene.
function blocked(x,z){
  const r=.6,b=layout.bounds;if(x<b.minX+r||x>b.maxX-r||z<b.minZ+r||z>b.maxZ-r)return true;
  return layout.colliders.some(c=>{const dx=Math.max(Math.abs(x-c.x)-c.w/2,0),dz=Math.max(Math.abs(z-c.z)-c.d/2,0);return dx*dx+dz*dz<r*r;});
}
function stepPlayer(dt){
  let x=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0);
  let z=(keys.has('KeyS')||keys.has('ArrowDown')?1:0)-(keys.has('KeyW')||keys.has('ArrowUp')?1:0);
  if(isPaused()||!started)x=z=0;
  const running=keys.has('ShiftLeft')||keys.has('ShiftRight');
  walking=!!(x||z);
  if(walking){
    const oldX=player.position.x,oldZ=player.position.z;
    movement.set(x,0,z).normalize().applyAxisAngle(THREE.Object3D.DEFAULT_UP,yaw);
    const speed=running?12:6.5,dx=movement.x*speed*dt,dz=movement.z*speed*dt;
    // Axis sliding also avoids getting stuck on building corners.
    if(!blocked(player.position.x+dx,player.position.z))player.position.x+=dx;
    if(!blocked(player.position.x,player.position.z+dz))player.position.z+=dz;
    walking=Math.hypot(player.position.x-oldX,player.position.z-oldZ)>.0001;
    const angle=Math.atan2(movement.x,movement.z);
    const diff=Math.atan2(Math.sin(angle-model.rotation.y),Math.cos(angle-model.rotation.y));
    model.rotation.y+=diff*Math.min(dt*13,1);
  }
  const next=walking?actions.walk:actions.idle;
  if(next&&next!==activeAction){next.reset().fadeIn(.2).play();activeAction?.fadeOut(.2);activeAction=next;}
  if(actions.walk)actions.walk.timeScale=running?1.55:1;
  mixer?.update(dt);
  groundRay.set(new THREE.Vector3(player.position.x,3,player.position.z),new THREE.Vector3(0,-1,0));
  groundRay.far=4;
  const groundHit=groundRay.intersectObjects(groundMeshes,false)[0];
  player.position.y=(groundHit?.point.y||0)+.025;
}
function updateCamera(dt){
  if(story?.cameraPose){const p=story.cameraPose;camera.position.lerp(p.camera,1-Math.exp(-dt*7));camera.lookAt(p.target);return;}
  target.copy(player.position).add(new THREE.Vector3(0,2.3,0));
  desiredCamera.set(Math.sin(yaw)*Math.cos(pitch)*distance,Math.sin(pitch)*distance,Math.cos(yaw)*Math.cos(pitch)*distance).add(target);
  viewRay.origin.copy(target);viewRay.direction.copy(desiredCamera).sub(target).normalize();
  let safeDistance=distance;
  for(const b of cameraBoxes){if(viewRay.intersectBox(b,hit)){const d=hit.distanceTo(target);if(d>.7)safeDistance=Math.min(safeDistance,d-.4);}}
  if(safeDistance<distance)desiredCamera.copy(target).addScaledVector(viewRay.direction,Math.max(2,safeDistance));
  camera.position.lerp(desiredCamera,1-Math.exp(-dt*9));camera.lookAt(target);
  sun.position.copy(player.position).add(new THREE.Vector3(-35,60,30));sun.target.position.copy(player.position);
}
function numberSprite(text,color){
  const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d');
  ctx.beginPath();ctx.arc(64,64,51,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();ctx.strokeStyle='#fff9e9';ctx.lineWidth=5;ctx.stroke();ctx.fillStyle='#fff';ctx.font='bold 52px Georgia';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,64,67);
  const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,depthTest:false}));sp.scale.set(2.2,2.2,1);return sp;
}
function makeMarkers(){
  layout.landmarks.forEach((l,i)=>{
    const g=new THREE.Group();g.position.set(l.x,.22,l.z);
    const ring=new THREE.Mesh(new THREE.RingGeometry(1.4,1.65,48),new THREE.MeshBasicMaterial({color:'#eec367',transparent:true,opacity:.9,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;g.add(ring);
    const beacon=new THREE.Mesh(new THREE.CylinderGeometry(.11,.7,4,12,1,true),new THREE.MeshBasicMaterial({color:'#f6d993',transparent:true,opacity:.2,side:THREE.DoubleSide,depthWrite:false}));beacon.position.y=2;g.add(beacon);
    const sprite=numberSprite(String(i+1),'#bc8933');sprite.position.y=4.1;g.add(sprite);
    scene.add(g);markers.push({g,ring,beacon,sprite});
  });
}
function collect(){
  if(!nearby||isPaused()||!started||collected.has(nearby.id))return;
  collected.add(nearby.id);playChime();toast(`已收集「${nearby.name}」印章`);
  selected=layout.landmarks.findIndex(l=>!collected.has(l.id));updateProgress();story?.save();
  if(collected.size===layout.landmarks.length)setTimeout(()=>openDialog('completeDialog'),950);
}
function updateProgress(){
  const n=layout.landmarks.length,p=Math.round(collected.size/n*100);
  $('progressText').textContent=`${collected.size} / ${n} 处地标`;$('progressPercent').textContent=`${p}%`;$('progressBar').style.width=p+'%';
  markers.forEach((m,i)=>{const done=collected.has(layout.landmarks[i].id);m.g.visible=!done;m.beacon.material.opacity=i===selected ? .34 : .14;});
  updateJournal();
}
function updateJournal(){
  $('landmarkList').replaceChildren(...layout.landmarks.map((l,i)=>{
    const row=document.createElement('div');row.className='landmark'+(collected.has(l.id)?' collected':'');
    const stamp=document.createElement('span');stamp.className='stamp';stamp.textContent=collected.has(l.id)?'✓':String(i+1);
    const copy=document.createElement('div');copy.className='landmark-copy';const title=document.createElement('h3');title.textContent=l.name;const desc=document.createElement('p');desc.textContent=l.description;copy.append(title,desc);
    const b=document.createElement('button');b.textContent=collected.has(l.id)?'已打卡':'前往';b.onclick=()=>{selected=i;updateProgress();$('mapDialog').close();toast(`目的地：${l.name}`);};row.append(stamp,copy,b);return row;
  }));
}
function proximity(){
  let best=Infinity;nearby=null;
  for(const l of layout.landmarks){const d=Math.hypot(l.x-player.position.x,l.z-player.position.z);if(d<best){best=d;nearby=l;}}
  $('placeTag').textContent=best<18?nearby.name:'林荫校道 · 自由漫游';
  const sn=story?.near,can=(sn||best<4&&!collected.has(nearby.id))&&started&&!isPaused();$('interaction').hidden=!can;
  if(can){$('interactName').textContent=sn?sn.label:nearby.name;$('interactBtn').innerHTML='<kbd>E</kbd> '+(sn?sn.action:'收集印章');}else nearby=null;
  const dest=layout.landmarks[selected];
  $('nextStop').textContent=dest?`下一站 · ${dest.name}`:'校园印章已全部收集 ✓';
  if(dest){const d=document.createElement('small');d.textContent=`${Math.round(Math.hypot(dest.x-player.position.x,dest.z-player.position.z))} m`;$('nextStop').append(d);}
}
function drawMap(){
  const ctx=mapContext,w=480,h=520;ctx.clearRect(0,0,w,h);ctx.fillStyle='#cce0bd';ctx.fillRect(0,0,w,h);
  const X=x=>(x+104)/208*w,Z=z=>(z+115)/220*h;
  ctx.fillStyle='#8bbccc';ctx.fillRect(0,0,15,h);ctx.fillRect(w-15,0,15,h);ctx.fillRect(0,0,w,12);
  ctx.fillStyle='#f3ecd8';ctx.fillRect(X(-7),Z(-103),X(7)-X(-7),Z(93)-Z(-103));
  for(const z of [-53,0,55,85])ctx.fillRect(X(-85),Z(z-2.7),X(87)-X(-85),13);
  ctx.fillStyle='#ba7864';layout.colliders.filter(c=>!c.id.includes('water')&&!c.id.includes('base')).forEach(c=>{ctx.fillRect(X(c.x-c.w/2),Z(c.z-c.d/2),c.w*w/208,c.d*h/220);ctx.fillStyle='#667569';ctx.fillRect(X(c.x-c.w/2),Z(c.z-c.d/2),c.w*w/208,4);ctx.fillStyle='#ba7864';});
  ctx.strokeStyle='#bd7e65';ctx.lineWidth=11;ctx.beginPath();ctx.ellipse(X(70),Z(-22),35,64,0,0,Math.PI*2);ctx.stroke();
  ctx.fillStyle='#76b4c6';ctx.beginPath();ctx.ellipse(X(35),Z(0),20,23,0,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#aab99b';ctx.lineWidth=5;for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(X(0),Z(0),25+i*8,Math.PI,Math.PI*2);ctx.stroke();}
  for(let i=0;i<layout.landmarks.length;i++){const l=layout.landmarks[i],done=collected.has(l.id);ctx.beginPath();ctx.arc(X(l.x),Z(l.z),11,0,Math.PI*2);ctx.fillStyle=done?'#255647':i===selected?'#d69a34':'#fff9e8';ctx.fill();ctx.strokeStyle='#567758';ctx.lineWidth=1.5;ctx.stroke();ctx.fillStyle=done?'#fff':'#3e573e';ctx.font='bold 15px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(done?'✓':String(i+1),X(l.x),Z(l.z)+1);}
  const dest=story?.target();if(dest){ctx.beginPath();ctx.arc(X(dest.x),Z(dest.z),15,0,Math.PI*2);ctx.strokeStyle='#dd6d77';ctx.lineWidth=4;ctx.stroke();ctx.fillStyle='#b95460';ctx.font='bold 22px sans-serif';ctx.fillText('★',X(dest.x),Z(dest.z));}
  ctx.save();ctx.translate(X(player.position.x),Z(player.position.z));ctx.rotate(-model.rotation.y+Math.PI);ctx.beginPath();ctx.moveTo(0,-12);ctx.lineTo(-7,8);ctx.lineTo(0,4);ctx.lineTo(7,8);ctx.closePath();ctx.fillStyle='#287cba';ctx.strokeStyle='white';ctx.lineWidth=3;ctx.stroke();ctx.fill();ctx.restore();
}
function playChime(){if(!audioContext)return;for(let i=0;i<3;i++){const o=audioContext.createOscillator(),g=audioContext.createGain();o.type='sine';o.frequency.value=[659,824,988][i];o.connect(g);g.connect(audioContext.destination);const t=audioContext.currentTime+i*.1;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.06,t+.02);g.gain.exponentialRampToValueAtTime(.001,t+.55);o.start(t);o.stop(t+.6);}}
$('soundBtn').onclick=async()=>{if(!audioContext){audioContext=new AudioContext();await audioContext.resume();$('soundBtn').setAttribute('aria-label','关闭提示音');$('soundBtn').style.background='#e7c977';playChime();toast('印章提示音已开启。');}else{await audioContext.close();audioContext=null;$('soundBtn').style.background='';$('soundBtn').setAttribute('aria-label','开启提示音');toast('提示音已关闭。');}};
async function load(){
  try{
    const loader=new GLTFLoader();
    const [map,campus,character,sculpture,placements,building,tree,npc,avenueTree,details,detailInfo,architecture]=await Promise.all([fetch('./assets/campus_layout.json').then(r=>{if(!r.ok)throw new Error('校园地图加载失败');return r.json();}),loader.loadAsync('./assets/campus_scene.glb'),loader.loadAsync('./assets/campus_player.glb'),loader.loadAsync('./assets/campus_v3_sculpture_game.glb'),fetch('./assets/campus_v2_environment.json').then(r=>r.json()),loader.loadAsync('./assets/architecture_v3_full.glb'),loader.loadAsync('./assets/campus_v2_tree_game.glb'),loader.loadAsync('./assets/campus_v2_npc_game.glb'),loader.loadAsync('./assets/campus_v3_avenue_tree_game.glb'),loader.loadAsync('./assets/details_scene.glb'),fetch('./assets/details_info.json').then(r=>r.json()),fetch('./assets/architecture_v3_manifest.json').then(r=>r.json())]);
    layout=map;scene.add(campus.scene);
    campus.scene.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;if(['grass','grass2','stone','stone2','paver','road','field','court','track','bank'].includes(o.name))groundMeshes.push(o);}});
    const prefixes=architecture.replaces.map(id=>placements.replaceBuildings.hidePrefixes[id]);
    campus.scene.traverse(o=>{if(prefixes.some(p=>o.name.startsWith(p))||placements.replaceCherryTrees.hideObjectNames.includes(o.name))o.visible=false;});
    building.scene.traverse(o=>{if(o.isMesh){o.castShadow=o.receiveShadow=true;if(o.name.endsWith('__SILLS_PLINTH'))groundMeshes.push(o);}});scene.add(building.scene);
    const walkable=new Set(detailInfo.walkableMeshNames);
    details.scene.traverse(o=>{if(o.isMesh){o.castShadow=o.receiveShadow=true;if(walkable.has(o.name))groundMeshes.push(o);if(['V3_TREE_BRACES','V3_TREE_BRACE_TIES'].includes(o.name))o.visible=false;}});scene.add(details.scene);
    atmosphere.prepareWater(campus.scene);
    campus.scene.traverse(o=>{if(placements.replaceGreenTrees.hideObjectNames.includes(o.name))o.visible=false;});
    // Trees keep their own spring foliage; the two originals share geometry through instancing.
    for(const [type,asset,height] of [['cherry',tree,7.5],['green',avenueTree,10]]){
      const size=new THREE.Box3().setFromObject(asset.scene).getSize(new THREE.Vector3());asset.scene.updateMatrixWorld(true);
      const positions=placements.trees.filter(t=>t.type===type).filter(t=>!(t.x===53&&t.z===-84)).map(t=>t.x===24&&t.z===-12?{...t,x:26,z:-10}:t);
      asset.scene.traverse(o=>{if(!o.isMesh)return;const inst=new THREE.InstancedMesh(o.geometry,o.material,positions.length),dummy=new THREE.Object3D();inst.name=type==='green'?'V3_SPRING_AVENUE_TREES':'V3_CHERRY_TREES';inst.castShadow=inst.receiveShadow=true;
        positions.forEach((p,i)=>{dummy.position.set(p.x,.05,p.z);dummy.scale.setScalar(height*p.scale/size.y);dummy.rotation.y=i*2.399;dummy.updateMatrix();inst.setMatrixAt(i,new THREE.Matrix4().multiplyMatrices(dummy.matrix,o.matrixWorld));});inst.instanceMatrix.needsUpdate=true;scene.add(inst);});
    }
    for(const name of ['LANDMARK_SCULPTURE','LANDMARK_SCULPTURE_BASE_DARK','LANDMARK_SCULPTURE_BASE_LIGHT','LANDMARK_SCULPTURE_BASE_GOLD']){const old=campus.scene.getObjectByName(name);if(old)old.visible=false;}
    sculpture.scene.position.set(0,.03,48);
    sculpture.scene.traverse(o=>{if(o.isMesh){o.castShadow=o.receiveShadow=true;for(const m of(Array.isArray(o.material)?o.material:[o.material])){m.metalness=.12;m.roughness=.46;}}});scene.add(sculpture.scene);
    // Collision boxes are also camera blockers; scenery and trees stay transparent to the camera logic.
    layout.colliders.filter(c=>!c.id.includes('water')&&!c.id.includes('base')).forEach(c=>cameraBoxes.push(new THREE.Box3(new THREE.Vector3(c.x-c.w/2,0,c.z-c.d/2),new THREE.Vector3(c.x+c.w/2,c.h||17,c.z+c.d/2))));
    for(const b of detailInfo.eastUnderpass.cameraOnlyBlockers)cameraBoxes.push(new THREE.Box3(new THREE.Vector3(b.x-b.w/2,b.y-b.h/2,b.z-b.d/2),new THREE.Vector3(b.x+b.w/2,b.y+b.h/2,b.z+b.d/2)));
    cameraBoxes.push(new THREE.Box3(new THREE.Vector3(-11,4.46,92.5),new THREE.Vector3(11,5.7,93.5)));
    model=character.scene;player.add(model);model.rotation.y=Math.PI;
    model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;o.frustumCulled=false;}});
    mixer=new THREE.AnimationMixer(model);
    for(const c of character.animations){if(/walk/i.test(c.name))actions.walk=mixer.clipAction(c);else if(/idle/i.test(c.name))actions.idle=mixer.clipAction(c);}
    activeAction=actions.idle;activeAction?.play();
    player.position.set(layout.spawn.x,.12,layout.spawn.z);makeMarkers();updateProgress();updateCamera(1);
    story=createStory({scene,player,npc,hero:model,toast,openDialog,ground:(x,z)=>{groundRay.set(new THREE.Vector3(x,3,z),new THREE.Vector3(0,-1,0));return (groundRay.intersectObjects(groundMeshes,false)[0]?.point.y||0)+.025;},started:()=>started,snapshot:()=>({position:player.position.toArray(),stamps:[...collected]}),restore:data=>{if(Array.isArray(data.position)&&data.position.length===3&&data.position.every(Number.isFinite)&&!blocked(data.position[0],data.position[2]))player.position.fromArray(data.position);for(const id of data.stamps||[])if(layout.landmarks.some(l=>l.id===id))collected.add(id);updateProgress();},capture:()=>{atmosphere.render();const c=document.createElement('canvas');c.width=1280;c.height=Math.round(1280*innerHeight/innerWidth);c.getContext('2d').drawImage(renderer.domElement,0,0,c.width,c.height);return c.toDataURL('image/jpeg',.84);}});updateCamera(1);
    ready=true;$('loading').remove();openDialog('welcome');
    // Read-only diagnostics allow a reproducible smoke check without adding cheats to gameplay.
    window.campusGame={state:()=>({ready,started,position:player.position.toArray(),collected:[...collected],landmarks:layout.landmarks.length,animations:character.animations.map(c=>c.name),story:story.state(),quality:atmosphere.quality?'high':'smooth'}),blocked};
  }catch(e){console.error(e);$('loadingText').textContent='校园暂时没能加载完成，请重试。';$('retryBtn').hidden=false;document.querySelector('.load-track').hidden=true;}
}
load();
let mapTick=0;
renderer.setAnimationLoop(()=>{
  const dt=Math.min(clock.getDelta(),.045);elapsed+=dt;
  if(ready){stepPlayer(dt);story.update(dt);updateCamera(dt);markers.forEach((m,i)=>{m.sprite.position.y=4.1+Math.sin(elapsed*1.7+i)*.17;m.g.visible=!collected.has(layout.landmarks[i].id)&&!story.photographing;const far=m.g.position.distanceTo(player.position)>6;m.sprite.visible=far;m.beacon.visible=far;});mapTick+=dt;if(mapTick>.12){proximity();drawMap();mapTick=0;}}
  atmosphere.update(dt,elapsed);atmosphere.render();
});
