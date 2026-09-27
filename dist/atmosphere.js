import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {SSAOPass} from 'three/addons/postprocessing/SSAOPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';

export function createAtmosphere(renderer,scene,camera){
 scene.background=null;scene.fog=new THREE.FogExp2('#bedfe7',.0018);
 const skyMaterial=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,uniforms:{time:{value:0},zenith:{value:new THREE.Color('#3f96d2')},horizon:{value:new THREE.Color('#85c7e7')}},vertexShader:`varying vec3 direction;void main(){direction=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`
  uniform float time;uniform vec3 zenith,horizon;varying vec3 direction;
  float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}
  float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
  float clouds(vec2 p){float n=0.,a=.5;for(int i=0;i<5;i++){n+=a*noise(p);p=p*2.04+17.3;a*=.5;}return n;}
  void main(){vec3 d=normalize(direction);float h=smoothstep(-.1,.8,d.y);vec3 c=mix(horizon,zenith,h);vec2 p=d.xz/max(.17,d.y+.18)*2.2+vec2(time*.006,0.);float n=clouds(p);float cloud=smoothstep(.48,.72,n)*smoothstep(.03,.28,d.y);c=mix(c,vec3(.96,.97,.96),cloud*.87);float sun=max(dot(d,normalize(vec3(-.42,.74,.5))),0.);c+=vec3(.28,.24,.17)*pow(sun,110.);gl_FragColor=vec4(c,1.);}
 `});const sky=new THREE.Mesh(new THREE.SphereGeometry(440,40,24),skyMaterial);sky.name='Blue spring sky';scene.add(sky);
 const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();scene.environment=pmrem.fromScene(room,.04).texture;scene.environmentIntensity=.35;room.dispose();pmrem.dispose();
 const target=new THREE.WebGLRenderTarget(innerWidth,innerHeight,{type:THREE.HalfFloatType,samples:4});
 const composer=new EffectComposer(renderer,target);composer.addPass(new RenderPass(scene,camera));
 const ao=new SSAOPass(scene,camera,innerWidth,innerHeight,12);ao.kernelRadius=.65;ao.minDistance=.001;ao.maxDistance=.055;composer.addPass(ao);composer.addPass(new OutputPass());
 function resize(){composer.setSize(innerWidth,innerHeight);ao.setSize(Math.ceil(innerWidth*.65),Math.ceil(innerHeight*.65));}resize();
 const pmat=new THREE.MeshStandardMaterial({color:'#ffd1de',roughness:.85,side:THREE.DoubleSide});
 const petals=new THREE.InstancedMesh(new THREE.SphereGeometry(.065,6,3),pmat,96);petals.name='Drifting petals';petals.frustumCulled=false;
 const dummy=new THREE.Object3D(),data=[];
 for(let i=0;i<96;i++){const angle=i*2.399963;data.push({x:Math.cos(angle)*(9+i%12),z:Math.sin(angle)*(9+i%18),y:1+(i*.73)%11,speed:.28+(i%7)*.05});}scene.add(petals);
 let quality=true;
 const waterTime={value:0};
 return {
  prepareWater(root){root.traverse(o=>{if(!o.isMesh||!['pond','water','V4_POND_WATER','V4_RIVER'].includes(o.name))return;const m=new THREE.MeshStandardMaterial({color:o.name.includes('POND')||o.name.includes('POND')||o.name.includes('POND')||o.name.includes('POND')||o.name.includes('POND')||o.name==='pond'?'#72856e':'#528e9a',roughness:.2,metalness:.35});m.onBeforeCompile=shader=>{shader.uniforms.waterTime=waterTime;shader.vertexShader='varying vec3 waterWorld;\n'+shader.vertexShader.replace('#include <worldpos_vertex>','#include <worldpos_vertex>\n waterWorld=(modelMatrix*vec4(transformed,1.)).xyz;');shader.fragmentShader='uniform float waterTime;varying vec3 waterWorld;\n'+shader.fragmentShader.replace('#include <normal_fragment_begin>','#include <normal_fragment_begin>\n normal=normalize(normal+vec3(sin(waterWorld.x*3.1+waterWorld.z*1.7+waterTime)*.08,0.,cos(waterWorld.z*3.9-waterTime*.7)*.065));');};o.material=m;o.castShadow=false;o.receiveShadow=true;});},
  resize,
  setQuality(high){quality=high;ao.enabled=high;renderer.setPixelRatio(Math.min(devicePixelRatio,high?1.5:1));composer.setPixelRatio(renderer.getPixelRatio());resize();},
  update(dt,time){waterTime.value=time;skyMaterial.uniforms.time.value=time;for(let i=0;i<data.length;i++){const p=data[i];const y=12-((time*p.speed+p.y)%12);dummy.position.set(p.x+Math.sin(time*.3+i)*2,y,p.z+Math.cos(time*.22+i));dummy.rotation.set(time*.7+i,time*.31+i,Math.sin(time+i));dummy.scale.set(1,.16,.62);dummy.updateMatrix();petals.setMatrixAt(i,dummy.matrix);}petals.instanceMatrix.needsUpdate=true;},
  render(){composer.render();},
  get quality(){return quality;}
 };
}
