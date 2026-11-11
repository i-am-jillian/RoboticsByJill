import * as T from './vendor/three.module.js';
import {contactShadows} from './contact-shadows.js';
const canvas=document.querySelector('#lab');
const renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false});
renderer.setClearColor(0);
renderer.setPixelRatio(Math.min(devicePixelRatio,1.65));
renderer.toneMapping=T.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.12;
const scene=new T.Scene(), camera=new T.PerspectiveCamera(30,1,.05,65);
const v=(x,y,z)=>new T.Vector3(x,y,z);
const group=(parent,x=0,y=0,z=0)=>{const g=new T.Group();parent.add(g);g.position.set(x,y,z);return g};
function material(color,roughness=.59,metalness=0,extra={}){return new T.MeshStandardMaterial({color,roughness,metalness,...extra})}
const skin=material(0xffc6a9,.63),brown=material(0x2a211f),lash=material(0x261416),lip=material(0xb96960),white=material(0xf7f4ed,.86),cuff=material(0xd8d8d4),red=material(0xbd1827,.31,.48),graph=material(0x252632,.34,.46),steel=material(0x9399a4,.32,.69),dark=material(0x171720),rim=material(0x383435,.45,.20),ice=material(0x9aeaff,.18,.21,{emissive:0x1a708a}),gold=material(0xb98755,.38,.55);
const sphere=new T.SphereGeometry(1,44,32),cube=new T.BoxGeometry(1,1,1),cylinder=new T.CylinderGeometry(1,1,1,48);
function mesh(parent,geo,mat,x=0,y=0,z=0){const o=new T.Mesh(geo,mat);o.position.set(x,y,z);parent.add(o);return o}
function oval(p,m,x,y,z,a,b,c){const o=mesh(p,sphere,m,x,y,z);o.scale.set(a,b,c);return o}
function box(p,m,x,y,z,a,b,c){const o=mesh(p,cube,m,x,y,z);o.scale.set(a,b,c);return o}
function cyl(p,m,x,y,z,r,h){const o=mesh(p,cylinder,m,x,y,z);o.scale.set(r,h,r);return o}
function rod(p,m,a,b,r){const d=b.clone().sub(a),o=cyl(p,m,0,0,0,r,d.length());o.position.copy(a).lerp(b,.5);o.quaternion.setFromUnitVectors(v(0,1,0),d.normalize());return o}
const curve=points=>new T.CatmullRomCurve3(points.map(a=>Array.isArray(a)?v(...a):a));
function line(p,m,points,r,steps=32){return mesh(p,new T.TubeGeometry(curve(points),steps,r,8,false),m)}
function patch(p,m,fn,n=64,k=48){
 const pos=[],uv=[],idx=[];for(let j=0;j<=k;j++)for(let i=0;i<=n;i++){pos.push(...fn(i/n,j/k));uv.push(i/n,j/k);if(i<n&&j<k){let a=j*(n+1)+i;idx.push(a,a+1,a+n+1,a+1,a+n+2,a+n+1)}}
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();return mesh(p,geo,m)
}
const head=group(scene,0,2.39,0),pi=Math.PI,tau=2*pi;
const gauss=(x,s)=>Math.exp(-(x*x)/(s*s));
function width(y){return .946+.068*Math.tanh(3*(y+.38))}
function facialDepth(x,y){const w=width(y),base=.82*Math.sqrt(Math.max(0,1-(y/1.09)**2-(x/w)**2));
 return base+.105*gauss(x,.14)*gauss(y-.015,.31)+.208*gauss(x,.145)*gauss(y+.154,.117)+.055*gauss(Math.abs(x)-.128,.073)*gauss(y+.176,.063)+.049*gauss(Math.abs(x)-.47,.26)*gauss(y+.18,.21)+.041*gauss(x,.29)*gauss(y+.405,.19)-.048*gauss(Math.abs(x)-.39,.27)*gauss(y-.18,.16)}
function skinPoint(u,w){const a=(u-.5)*tau,lat=(w-.5)*pi,y=1.09*Math.sin(lat),x=Math.sin(a)*width(y)*Math.cos(lat),z=Math.cos(a)*.82*Math.cos(lat);return [x,y,z+(Math.cos(a)>0?(facialDepth(x,y)-Math.abs(z))*Math.min(1,Math.cos(a)*6):0)]}
const face=patch(head,skin,skinPoint,152,112);
const colors=[];const sc=new T.Color(0xffc5a0),bl=new T.Color(0xe59681);for(let i=0;i<face.geometry.attributes.position.count;i++){let p=face.geometry.attributes.position;let x=p.getX(i),y=p.getY(i),z=p.getZ(i);colors.push(...sc.clone().lerp(bl,z>0?.62*gauss(Math.abs(x)-.55,.22)*gauss(y+.15,.13)+.24*gauss(x,.14)*gauss(y+.15,.11):0).toArray())}face.material=material(0xffffff,.61,0,{vertexColors:true});face.geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));
const eyeGroups=[],eyeMaps=[];
for(const sign of [-1,1]){
 oval(head,skin,sign*.90,-.12,-.01,.18,.265,.142);
 oval(head,lip,sign*.991,-.12,.09,.063,.137,.039);
 mesh(head,new T.TorusGeometry(.082,.020,10,36),steel,sign*.975,-.339,.095).rotation.y=sign*.40;
 const eye=group(head);eyeGroups.push(eye);
 // The almond opening and its lid share a boundary on a curved eye surface.
 function eyePoint(u,h){const t=2*u-1,x=sign*(.423+.275*t),arch=Math.pow(Math.max(0,1-t*t),.72),y=.162+.037*t+arch*(-.135+.318*h);return [x,y,facialDepth(x,y)+.022+.076*arch*Math.sin(pi*h)]}
 const irisCanvas=document.createElement('canvas');irisCanvas.width=512;irisCanvas.height=320;
 const ctx=irisCanvas.getContext('2d'),cx=254,cy=146,radius=141;
 const sclera=ctx.createLinearGradient(0,0,0,320);sclera.addColorStop(0,'#d3bab4');sclera.addColorStop(.47,'#ffefde');sclera.addColorStop(1,'#efddd3');ctx.fillStyle=sclera;ctx.fillRect(0,0,512,320);
 const iris=ctx.createRadialGradient(cx,cy,4,cx,cy,radius);iris.addColorStop(0,'#241718');iris.addColorStop(.45,'#392521');iris.addColorStop(.72,'#654b3a');iris.addColorStop(.88,'#674331');iris.addColorStop(.96,'#3e2927');iris.addColorStop(1,'#281c20');
 function spot(x,y,r,style){ctx.fillStyle=style;ctx.beginPath();ctx.arc(x,y,r,0,tau);ctx.fill()}
 spot(cx,cy,radius,iris);
 for(let i=0;i<120;i++){let a=i*tau/120;ctx.strokeStyle='rgba(230,166,108,.13)';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*72,cy+Math.sin(a)*72);ctx.lineTo(cx+Math.cos(a+.02)*(98+12*Math.sin(i*29)),cy+Math.sin(a+.02)*(98+12*Math.sin(i*29)));ctx.stroke()}
 spot(cx,cy,81,'#251a1c');spot(cx-34*sign,cy-42,19,'#fff8ec');spot(cx+38*sign,cy+36,7,'#e8c9b9');
 const map=new T.CanvasTexture(irisCanvas);map.colorSpace=T.SRGBColorSpace;eyeMaps.push(map);
 const eyeball=patch(eye,material(0xffffff,.39,0,{map,side:T.DoubleSide}),eyePoint,56,32);
 const coords=eyeball.geometry.attributes.uv,positions=eyeball.geometry.attributes.position;
 for(let i=0;i<coords.count;i++)coords.setXY(i,(sign*positions.getX(i)-.148)/.550,(positions.getY(i)-.007)/.349);
 for(const top of [true,false]){let pts=[];for(let i=0;i<=24;i++)pts.push(eyePoint(i/24,top?1:0));line(eye,top?lash:material(0xd49b88),pts,top?.013:.007)}
 // Taper each lash along its own swept curve.
 for(let i=0;i<11;i++){
   const u=.18+.078*i,[x,y,z]=eyePoint(u,1),fan=(u-.36)*.085;
   const height=.048+.066*Math.sin(pi*u);
   patch(eye,lash,(t,w)=>{
     const radius=.0135*(1-t)+.0005;
     return [x+sign*(fan*t*t+radius*Math.cos(w*tau)),y+height*(.72*t+.28*t*t),z+.039*Math.sin(t*pi/2)+radius*Math.sin(w*tau)]
   },9,7).material.side=T.DoubleSide;
 }
 patch(head,brown,(u,w)=>{
   const x=sign*(.198+.526*u),y=.491+.094*Math.sin(pi*u)-.015*u;
   const radius=(.049+.012*Math.sin(pi*u))*(.08+.92*Math.min(1,Math.sqrt(u*9),Math.sqrt((1-u)*3)));
   return [x,y+radius*Math.cos(tau*w),facialDepth(x,y)+.026+radius*.56*Math.sin(tau*w)]
 },40,14).material.side=T.DoubleSide;
 const nx=sign*.088,ny=-.206;oval(head,material(0xa76a58),nx,ny,facialDepth(nx,ny)+.002,.032,.012,.005).rotation.z=sign*.23;
}
// A single curved opening holds the tooth band behind the vermilion border.
function smile(u){
 const t=2*u-1, fullness=Math.max(0,1-t*t),x=.389*t;
 const upper=-.437+.092*t*t+.017*t;
 return {x,upper,lower:upper-.144*fullness**.83,fullness}
}
function mouthSurface(mat,edges,offset){
 patch(head,mat,(u,w)=>{const shape=smile(u),[a,b]=edges(shape),y=a+(b-a)*w;
 return [shape.x,y,facialDepth(shape.x,y)+offset+.007*Math.sin(pi*w)*shape.fullness]
 },68,12)
}
const mouthMaterial=color=>material(color,.58,0,{side:T.DoubleSide});
mouthSurface(mouthMaterial(0x582a32),s=>[s.lower,s.upper],.009);
mouthSurface(mouthMaterial(0xffeee0),s=>[s.upper-.064*s.fullness,s.upper],.015);
mouthSurface(mouthMaterial(0xae655e),s=>[s.upper,s.upper+.020*s.fullness],.019);
mouthSurface(mouthMaterial(0xda8c79),s=>[s.lower-.049*s.fullness,s.lower],.018);
const glasses=group(head);
for(const sign of [-1,1]){
 const pts=[];for(let i=0;i<=96;i++){const a=tau*i/96,x=.447+.367*Math.sign(Math.cos(a))*Math.abs(Math.cos(a))**.90,y=.155+.316*Math.sign(Math.sin(a))*Math.abs(Math.sin(a))**.91+.026*Math.cos(a);pts.push([sign*x,y,.985-.265*x*x])}line(glasses,rim,pts,.026,96);
 line(glasses,rim,[[sign*.804,.228,.817],[sign*.892,.227,.60],[sign*.994,.165,.16],[sign*.995,.075,-.062]],.021);
 oval(glasses,gold,sign*.801,.224,.824,.029,.019,.018);
 line(glasses,gold,[[sign*.108,.121,.966],[sign*.109,.061,.919],[sign*.101,.04,facialDepth(.101,.04)+.009]],.017)
}
line(glasses,rim,[[-.085,.164,.982],[-.034,.172,.948],[0,.179,facialDepth(0,.179)+.018],[.034,.172,.948],[.085,.164,.982]],.021);
// Swept locks start at an off-centre part and spiral towards the shoulders.
let seed=29;function random(){seed=(1664525*seed+1013904223)>>>0;return seed/4294967296}
const hairs=[0x171418,0x251d20,0x292123,0x2e2525,0x211b1d].map(c=>material(c,.56));
const hairGroup=group(head);
function lock(points,r,mat){const path=curve(points),geometry=new T.TubeGeometry(path,44,r,10,false),pos=geometry.attributes.position;
 for(let j=0;j<=44;j++){let u=j/44,center=path.getPointAt(u),scale=(.55+.45*Math.min(1,u*8))*(.13+.87*Math.min(1,(1-u)*7));for(let k=0;k<=10;k++){let i=j*11+k;const q=v(pos.getX(i),pos.getY(i),pos.getZ(i)).sub(center).multiplyScalar(scale).add(center);pos.setXYZ(i,q.x,q.y,q.z)}}
 geometry.computeVertexNormals();mesh(hairGroup,geometry,mat)}
oval(hairGroup,hairs[0],0,.26,-.32,1.04,1.02,.78);
for(const s of [-1,1])for(let i=0;i<29;i++){
 const a=(i/28)*2.57-.29,fx=s*Math.cos(a),fz=-Math.sin(a),len=1.1+.45*random(),phase=random()*tau,rad=.099+.071*random(),freq=2.15+1.1*random(),pts=[];
 for(let j=0;j<=36;j++){let u=j/36,sweep=Math.sin(Math.min(1,u/.44)*pi/2),wave=phase+tau*freq*u;
 let x=-.145*(1-sweep)+fx*(.18+.88*sweep)+s*rad*Math.sin(wave)*sweep;
 let z=-.07+fz*(.28+.58*sweep)+rad*Math.cos(wave)*sweep;
 let y=1.22+.12*Math.sin(pi*Math.min(1,u/.33))-u*(1.17+len)+.051*Math.cos(wave);
 pts.push([x,y,z])}lock(pts,.123+.064*random(),hairs[i%5])}
for(let i=0;i<12;i++){
 const s=i<5?-1:1,k=i<5?i/4:(i-5)/6,pts=[],end=.30+.69*k,depth=.86-.34*k;
 for(let j=0;j<=36;j++){let u=j/36,a=pi*u/2,phase=tau*(1.05*u+k*.53);pts.push([-.15+s*(end+.15*s)*Math.sin(a)+s*.097*Math.sin(phase)*u,1.19+.13*Math.sin(pi*u)-(.42+.52*k)*u*u+.073*Math.cos(phase)*u,.08+depth*Math.sin(a)+.087*Math.cos(phase)*u])}
 lock(pts,.10+.038*random(),hairs[i%5])}
for(const [x,y,z,sg,len,r] of [[-.30,1.06,.58,-1,.59,.088],[.04,1.12,.49,1,.54,.078],[.75,.83,.38,1,.63,.104],[-.82,.74,.4,-1,.68,.092]]){
 let pts=[];for(let i=0;i<=42;i++){const u=i/42,a=u*tau*1.24;pts.push([x+sg*(.068*Math.sin(a)+.12*u),y-len*u+.033*Math.sin(a),z+.24*u+.068*Math.cos(a)])}lock(pts,r,hairs[1])}
const pivot=group(head,0,.12,-.095),plate=group(pivot,0,-.12,.095);
const lacquer=material(0xe33920,.34,.32);
const deepRed=material(0x912219,.41,.38);
const chassis=material(0x282a2f,.48,.55);
const gunmetal=material(0x51565e,.32,.67);
const emitter=material(0xffba6d,.24,.12,{emissive:0xff7428,emissiveIntensity:.92});
function frontDisc(p,m,x,y,z,r,h){const o=cyl(p,m,x,y,z,r,h);o.rotation.x=pi/2;return o}

// Chamfered housings have a narrow front lip and a full-depth return to the chassis.
function housing(parent,mat,outline,back,front,bevel=.025){
 const section=new T.Shape(outline.map(([x,y])=>new T.Vector2(x,y)));
 const geometry=new T.ExtrudeGeometry(section,{depth:front-back,bevelEnabled:true,
   bevelThickness:bevel,bevelSize:bevel,bevelSegments:3,curveSegments:1});
 return mesh(parent,geometry,mat,0,0,back)
}
function bolt(parent,x,y,z,r=.032){
 frontDisc(parent,gunmetal,x,y,z,r,.018);
 box(parent,chassis,x,y,z+.010,r*1.15,.007,.004).rotation.z=.64
}
// The optical carriage travels with the crown. The side bearings stay on Jill.
housing(plate,chassis,[[-.41,-1.01],[.41,-1.01],[.85,-.75],[1.05,-.33],
 [1.05,.44],[.77,.86],[-.77,.86],[-1.05,.44],[-1.05,-.33],[-.85,-.75]],-.10,.81,.055);
// Each side of the forehead steps back towards its temple. The main ridge
// is a tall sagittal fin whose sloping rear face clears the curl volume.
for(const side of [-1,1]){
 const wing=group(plate);
 wing.rotation.y=side*.36;
 wing.scale.x=side;
 wing.position.set(side*.52,0,.97);
 housing(wing,lacquer,[[-.52,.35],[.52,.35],[.52,.59],[.37,.88],[.22,1.10],
   [-.18,1.26],[-.48,1.21]],-.93,.09,.035);
 bolt(wing,.415,.443,.124,.022);
 bolt(wing,-.328,1.088,.124,.018);
 const rail=group(plate,side*.91,-.27,.79);
 rail.rotation.y=side*.45;
 housing(rail,gunmetal,[[-.17,-.31],[.15,-.31],[.21,-.22],[.21,.17],[.12,.27],[-.15,.27],[-.21,.15]],-.32,.16);
 frontDisc(rail,chassis,0,-.02,.18,.14,.07);
 bolt(rail,0,-.02,.228,.065);
}
const fin=group(plate);fin.rotation.y=-pi/2;
// In fin-local coordinates x runs along the fore-aft axis.
housing(fin,lacquer,[[-.29,.78],[1.16,.53],[1.16,1.24],[.94,1.57],[.14,1.60],[-.26,1.31]],-.132,.132,.027);
housing(plate,deepRed,[[-.19,.34],[.19,.34],[.178,1.15],[-.178,1.15]],.99,1.135,.017);
const antenna=group(plate,.98,.59,-.02);
cyl(antenna,chassis,0,.04,0,.066,.24);
rod(antenna,steel,v(0,.12,0),v(.02,.88,-.045),.018);
oval(antenna,deepRed,.02,.88,-.045,.024,.032,.024);

// One camera in a machined carrier, flanked by two smaller range sensors.
housing(plate,gunmetal,[[-.91,.12],[-.81,-.14],[-.44,-.24],[.44,-.24],
 [.81,-.14],[.91,.12],[.77,.32],[.39,.34],[-.39,.34],[-.77,.32]],.85,1.11,.045);
const cameraPod=group(plate,0,.105,1.13);
for(const [m,z,r,h] of [[chassis,.03,.411,.18],[gunmetal,.136,.362,.043],
 [chassis,.168,.321,.035],[steel,.188,.278,.018],[chassis,.205,.251,.028]]){
 frontDisc(cameraPod,m,0,0,z,r,h)
}
const lens=material(0x743f50,.18,.38,{emissive:0x42101b});
oval(cameraPod,lens,0,0,.222,.232,.232,.062);
oval(cameraPod,material(0xf9c2b9,.22,.14,{emissive:0xa85355}),0,0,.265,.145,.145,.027);
oval(cameraPod,white,-.054,.065,.288,.035,.017,.006);
for(let i=0;i<12;i++){const a=tau*i/12;box(cameraPod,chassis,.337*Math.cos(a),.337*Math.sin(a),.16,.011,.027,.008).rotation.z=a-pi/2}
for(const side of [-1,1]){
 frontDisc(plate,chassis,side*.634,.10,1.145,.137,.087);
 frontDisc(plate,steel,side*.634,.10,1.201,.096,.016);
 oval(plate,emitter,side*.634,.10,1.218,.071,.071,.032);
 // Paired linear actuators terminate in separate vented jaw pods.
 const cheek=group(plate,side*.53,-.55,.94);
 cheek.rotation.y=side*.23;
 housing(cheek,chassis,[[-.265,-.13],[.265,-.13],[.29,.01],[.202,.152],[-.199,.152],[-.29,.01]],-.18,.15,.026);
 housing(cheek,lacquer,[[-.29,.035],[.29,.035],[.244,.148],[.163,.186],[-.21,.162]],-.14,.171,.021);
 for(let i=0;i<3;i++)box(cheek,gunmetal,0,-.008-i*.042,.19,.456-i*.034,.018,.025);
 rod(plate,gunmetal,v(side*.37,-.59,1.01),v(side*.34,-.92,.93),.084);
 rod(plate,steel,v(side*.34,-.89,.94),v(side*.32,-1.02,.88),.049);
 bolt(plate,side*.785,.21,1.138);
}
housing(plate,lacquer,[[-.151,-.77],[.151,-.77],[.188,-.66],[.14,-.25],[-.14,-.25],[-.188,-.66]],.95,1.224,.022);
box(plate,gunmetal,0,-.825,1.04,.29,.10,.16);
for(const side of [-1,1]){
 const hinge=group(head,side*1.09,.12,-.095);hinge.rotation.z=-side*pi/2;
 for(const [m,y,r,h] of [[chassis,0,.405,.31],[steel,.167,.349,.042],[deepRed,.204,.302,.046],[chassis,.24,.219,.043],[gunmetal,.27,.115,.025]])cyl(hinge,m,0,y,0,r,h);
 for(let i=0;i<6;i++)cyl(hinge,chassis,.317*Math.sin(tau*i/6),.195,.317*Math.cos(tau*i/6),.023,.017)
}
oval(scene,skin,0,1.29,-.03,.32,.42,.32);
oval(scene,white,0,.417,-.09,.83,.97,.55);
oval(scene,cuff,0,1.15,-.11,.66,.25,.51);
for(const s of [-1,1]){
 line(scene,white,[[s*.55,1.23,-.27],[s*.49,1.18,.13],[s*.27,1.09,.38],[s*.035,1.06,.36]],.105);
 line(scene,cuff,[[s*.235,1.12,.4],[s*.218,.87,.463],[s*.255,.67,.493]],.018);
 cyl(scene,steel,s*.255,.646,.493,.018,.064);
}
const desk=group(scene,0,0,0),black=material(0x22232a,.48,.24),rubber=material(0x1a1b20,.81);
const tabletop=box(desk,black.clone(),-.15,-.10,1.45,5.98,.16,2.13);
const tableLegs=[];
for(const x of [-2.94,2.64])for(const z of [.53,2.38])tableLegs.push(box(desk,graph,x,-1.14,z,.095,2.01,.095));
oval(scene,graph,0,-.62,-.15,.90,.20,.64);oval(scene,dark,0,.22,-.64,.81,.99,.17);
cyl(scene,steel,0,-1.43,-.22,.105,1.30);for(let i=0;i<5;i++){let a=tau*i/5;rod(scene,graph,v(0,-1.97,-.22),v(.65*Math.cos(a),-2.09,-.22+.65*Math.sin(a)),.06)}
for(const s of [-1,1]){rod(scene,dark,v(s*.35,-.49,-.07),v(s*.48,-.61,.7),.24);rod(scene,dark,v(s*.48,-.61,.7),v(s*.46,-1.87,.58),.17);oval(scene,cuff,s*.46,-1.96,.76,.207,.135,.34)}
const laptop=group(desk,.04,-.005,1.48);
box(laptop,steel,0,.041,0,1.78,.076,1.13);
const keys=[];for(let row=0;row<5;row++){keys[row]=[];for(let col=0;col<14;col++){keys[row][col]=box(laptop,graph,(col-6.5)*.113,.091,-.026+(row-2)*.115,.099,.025,.091)}}
box(laptop,black,0,.083,-.401,.50,.006,.22);
const lid=group(laptop,0,.10,.51);lid.rotation.x=.19;
box(lid,graph,0,.54,0,1.78,1.08,.063);
const glow=material(0x68272e,.41,.1,{emissive:0x4b151d});
box(lid,glow,0,.54,-.036,1.66,.94,.01);
frontDisc(lid,steel,0,.55,.04,.103,.012);
for(let i=0;i<13;i++){const len=.18+random()*.75;box(lid,i%4?ice:gold,-.71+len/2,.91-i*.059,-.045,len,.013,.006)}
const arms=[];
function limb(m,r){return oval(scene,m,0,0,0,r,r,r)}
function placeLimb(o,a,b,r){const d=b.clone().sub(a);o.position.copy(a).lerp(b,.5);o.scale.set(r,d.length()/2+r*.45,r);o.quaternion.setFromUnitVectors(v(0,1,0),d.normalize())}
for(const s of [-1,1]){
 const hand=group(scene),fingers=[];
 oval(hand,skin,0,0,-.012,.165,.075,.159);
 for(let i=0;i<4;i++){
 const f=group(hand,(i-1.5)*.077,.002,.079),len=[.146,.177,.167,.126][s===1?i:3-i];
 const joint=group(f,0,-.013,len);placeLimb(oval(f,skin,0,0,0,1,1,1),v(0,0,0),v(0,-.013,len),.043);
 placeLimb(oval(joint,skin,0,0,0,1,1,1),v(0,0,0),v(0,-.047,.083),.037);
 fingers.push({f,joint,len})}
 placeLimb(oval(hand,skin,0,0,0,1,1,1),v(-s*.11,0,-.035),v(-s*.215,-.04,.093),.054);
 arms.push({s,hand,fingers,upper:limb(white,.245),lower:limb(white,.21),wrist:limb(cuff,.137)})
}
const toy=group(desk,-1.19,.012,2.16);toy.rotation.y=.53;toy.scale.setScalar(1.17);const yellow=material(0xffc237),tee=material(0xe53632),ink=material(0x171318,.27),toySkin=material(0xffc39c);
for(const s of [-1,1]){oval(toy,yellow,s*.099,.058,.041,.093,.06,.129);oval(toy,toySkin,s*.095,.155,0,.044,.105,.055);oval(toy,yellow,s*.093,.251,0,.117,.106,.107);placeLimb(oval(toy,tee,0,0,0,1,1,1),v(s*.146,.41,0),v(s*.244,.32,.028),.073);oval(toy,toySkin,s*.259,.303,.03,.061,.069,.058)}
oval(toy,tee,0,.403,0,.216,.183,.148);
patch(toy,toySkin,(u,w)=>{let a=(u-.5)*tau,b=(w-.5)*pi,y=Math.sin(b),cheek=1+.22*gauss(y+.38,.38);return [.312*Math.cos(b)*Math.sin(a)*cheek-.035*(1-y*y),.766+.275*y,.242*Math.cos(b)*Math.cos(a)*cheek]},56,40);
patch(toy,ink,(u,w)=>{let a=(u-.5)*tau,b=.1+.63*Math.cos(a)+w*(pi/2-.1-.63*Math.cos(a));return [.319*Math.cos(b)*Math.sin(a)-.024,.771+.282*Math.sin(b),.248*Math.cos(b)*Math.cos(a)]});
for(const s of [-1,1]){oval(toy,toySkin,s*.299,.73,-.009,.068,.079,.048);oval(toy,ink,s*.119,.811,.209,.070,.082,.044);oval(toy,white,s*.119-.019,.84,.248,.017,.019,.009);line(toy,ink,[[s*.05,.909,.204],[s*.124,.959,.164],[s*.215,.906,.139]],.027)}
oval(toy,lip,-.035,.653,.25,.035,.024,.009);
const puzzle=group(desk,1.66,.263,1.74);puzzle.rotation.y=.27;
const tiles=[0xd52e26,0xf98523,0xf5cd32,0xe9e6d6,0x247ad2,0x199965].map(c=>material(c,.42));
box(puzzle,graph,0,0,0,.49,.49,.49);
for(let side=0;side<6;side++){const plane=group(puzzle);if(side<4)plane.rotation.y=side*pi/2;else plane.rotation.x=(side===4?-1:1)*pi/2;
 for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++)box(plane,tiles[(side+(i===j&&j!==0?2:0))%6],i*.159,j*.159,.249,.144,.144,.009)}
const armBase=group(desk,-2.33,0,.98);cyl(armBase,black,0,.073,0,.292,.14);cyl(armBase,steel,0,.162,0,.208,.075);
const joints=[v(0,.20,0),v(-.18,.91,0),v(.44,1.24,.085),v(.61,.98,.149)];
for(let i=0;i<3;i++){rod(armBase,i===2?steel:red,joints[i],joints[i+1],.115-i*.024);const {x,y,z}=joints[i];frontDisc(armBase,graph,x,y,z,.151-i*.013,.25-i*.038);frontDisc(armBase,steel,x,y,z+.13-i*.019,.092-i*.011,.022)}
for(const s of [-1,1])line(armBase,graph,[[.61,.98,.15],[.61+s*.084,.925,.15],[.61+s*.049,.84,.15]],.019);
const tools=group(desk,-2.30,0,1.93);tools.rotation.y=.22;
box(tools,rubber,0,.024,0,.90,.048,.38);
for(let i=0;i<3;i++){let z=(i-1)*.109;rod(tools,steel,v(-.045,.072,z),v(.377,.072,z),.018);rod(tools,i===1?red:graph,v(-.36,.078,z),v(-.041,.078,z),.047);for(let j=0;j<4;j++)rod(tools,steel,v(-.32+j*.055,.078,z),v(-.312+j*.055,.078,z),.048)}
const rover=group(scene,3.59,-2.14,1.28);rover.rotation.y=-.33;
box(rover,graph,0,.43,0,.985,.40,1.54);box(rover,material(0xdd9b42,.43,.28),0,.66,0,1.10,.135,1.56);
for(const s of [-1,1]){
 const track=group(rover,s*.574,.269,0);
 const shape=new T.Shape();shape.moveTo(-.57,-.242);shape.lineTo(.57,-.242);shape.absarc(.57,0,.242,-pi/2,pi/2,false);shape.lineTo(-.57,.242);shape.absarc(-.57,0,.242,pi/2,3*pi/2,false);
 const geo=new T.ExtrudeGeometry(shape,{depth:.206,bevelEnabled:false,curveSegments:20});const belt=mesh(track,geo,rubber,-.103,0,0);belt.rotation.y=pi/2;
 for(let i=0;i<5;i++){const z=(i-2)*.28;for(const [m,x,r,h] of [[steel,.112,.196,.029],[graph,.136,.140,.033],[gold,.159,.051,.02]]){let hub=cyl(track,m,s*x,0,z,r,h);hub.rotation.z=pi/2}}
 for(let i=0;i<13;i++){for(const y of [-.242,.242])box(track,dark,0,y,(i-6)*.095,.237,.037,.033)}
}
cyl(rover,graph,0,.775,.21,.23,.105);cyl(rover,steel,0,.89,.21,.181,.132);cyl(rover,glow,0,.967,.21,.185,.041);cyl(rover,graph,0,1.012,.21,.198,.052);
for(const s of [-1,1])frontDisc(rover,ice,s*.31,.499,.781,.061,.028);
const floor=box(scene,material(0x191920,.75),.43,-2.22,.68,8.84,.11,4.69);
const shadowBox=object=>({object,type:'box',radii:[.5,.5,.5]});
const shadowOval=object=>({object,type:'ellipsoid',radii:[1,1,1]});
contactShadows(tabletop.material,[
 shadowBox(laptop.children[0]),shadowBox(puzzle.children[0]),shadowBox(tools.children[0]),
 shadowOval(toy.children[0]),shadowOval(toy.children[5]),shadowOval(toy.children[10]),
 {object:armBase.children[0],type:'ellipsoid',radii:[1,.68,1]}
],1.24);
contactShadows(floor.material,[
 ...tableLegs.map(shadowBox),shadowBox(tabletop),shadowBox(rover.children[0]),
 ...[-1,1].map(sign=>({object:group(rover,sign*.574,.269,0),type:'box',radii:[.108,.238,.76]}))
],3.5);
const keyMaterial=graph.clone();for(const row of keys)for(const key of row)key.material=keyMaterial;
const handShadows=contactShadows(keyMaterial,arms.flatMap(({hand,fingers})=>[
 shadowOval(hand.children[0]),...fingers.map(({joint})=>shadowOval(joint.children[0]))
]),.39);
// Neutral studio cards give brushed metal a broad reflection between the rim lights.
const studioCanvas=document.createElement('canvas');studioCanvas.width=512;studioCanvas.height=256;
const studio=studioCanvas.getContext('2d');studio.fillStyle='#282530';studio.fillRect(0,0,512,256);
for(const [x,y,w,h,c] of [[38,45,95,80,'#eee3d8'],[320,54,92,64,'#c6d4df'],[205,8,120,23,'#fbf4ef']]){studio.fillStyle=c;studio.fillRect(x,y,w,h)}
const environment=new T.CanvasTexture(studioCanvas);environment.mapping=T.EquirectangularReflectionMapping;environment.colorSpace=T.SRGBColorSpace;scene.environment=environment;scene.environmentIntensity=.54;
scene.add(new T.HemisphereLight(0xfff0e6,0x8d7c82,.76));
function light(color,intensity,x,y,z){const l=new T.DirectionalLight(color,intensity);l.position.set(x,y,z);scene.add(l)}
light(0xffeada,2.14,-3,5,5);light(0xcfe5ff,.72,3,.7,4);light(0xff3327,4.1,-3,1.4,-2.2);light(0xff1330,4.3,3,1.8,-2.6);
// Diffuse-only spill from two samples across the luminous laptop panel.
for(const fabricOrSkin of [skin,white,cuff]){
 fabricOrSkin.onBeforeCompile=shader=>{
   shader.vertexShader='varying vec3 spillPosition;\n'+shader.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\nspillPosition=(modelMatrix*vec4(transformed,1.)).xyz;');
   shader.fragmentShader='varying vec3 spillPosition;\n'+shader.fragmentShader.replace('#include <lights_fragment_end>',`
    #include <lights_fragment_end>
    vec3 worldNormal=inverseTransformDirection(normal,viewMatrix);
    for(int k=0;k<2;k++){
      vec3 toward=vec3(-.41+.9*float(k),.64,1.91)-spillPosition;
      float falloff=max(dot(worldNormal,normalize(toward)),0.)/(.75+dot(toward,toward));
      reflectedLight.indirectDiffuse+=diffuseColor.rgb*vec3(.23,.072,.055)*falloff;
    }
   `)
 };
}
function ease(a,b,x){x=Math.max(0,Math.min(1,(x-a)/(b-a)));return x*x*(3-2*x)}
let lastW=0,lastH=0;
export function drawLab(p,gx,gy,time){
 const w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h)return;
 if(w!==lastW||h!==lastH){renderer.setSize(w,h,false);lastW=w;lastH=h}
 const open=ease(.185,.405,p),wide=ease(.62,.967,p),touch=ease(.035,.175,p)*(1-ease(.235,.49,p));
 head.rotation.set(-.032*gy+.085*wide,.13*gx-.11*ease(.32,.55,p)-.10*wide,.023*Math.sin(time*.67));
 hairGroup.scale.set(.91+.09*open,.85+.15*open,.87+.13*open);hairGroup.position.y=-.09*(1-open);pivot.rotation.x=-2.29*open;pivot.position.z=-.095-.64*open;pivot.position.y=.12+.19*open;
 head.updateWorldMatrix(true,false);
 const blink=1-.92*Math.pow(Math.max(0,Math.cos(time*1.52+2)),140);
 for(let i=0;i<2;i++){eyeGroups[i].position.y=.166*(1-blink);eyeGroups[i].scale.y=blink;eyeMaps[i].offset.set((i?1:-1)*-.036*gx,-.018*gy);}
 for(const row of keys)for(const key of row)key.position.y=.091;
 for(const {s,hand,fingers,upper,lower,wrist} of arms){
 const reach=s===1?touch:0,home=v(.04+s*.322,.251,1.20);
 const target=head.localToWorld(v(1.341,-.186,-.17));hand.position.copy(home.lerp(target,reach));hand.rotation.set(-1.39*reach,.06*s*(1-reach),.015*reach);
 const shoulder=v(s*.62,.88,-.02),elbow=v(s*(.95+.27*reach),.20+.88*reach,.39-.14*reach),end=hand.localToWorld(v(0,0,-.107));
 placeLimb(upper,shoulder,elbow,.225);placeLimb(lower,elbow,end,.187);placeLimb(wrist,end.clone().lerp(elbow,.18),end,.143);
 fingers.forEach(({f,joint,len},i)=>{let tap=(1+Math.sin(time*(5.4+i*.22)+i*2.2+s))/2;joint.rotation.x=.12+.15*tap;f.rotation.x=.045+.28*tap*(1-reach);
 const tip=joint.localToWorld(v(0,-.047,.083));
 // Stop the fingertip pad on the depressed key surface.
 if(reach<.02 && tip.y<.121){
   const extension=len+.083;
   f.rotation.x-=Math.asin(Math.min(1,(.121-tip.y)/extension));
   joint.localToWorld(tip.set(0,-.047,.083));
 }
 if(tip.y<.137&&reach<.02){const row=Math.max(0,Math.min(4,Math.round((tip.z-1.454)/.115)+2)),col=Math.max(0,Math.min(13,Math.round((tip.x-.04)/.113+6.5)));keys[row][col].position.y=.082}})
 }
 const target=v(0,2.64-.102*open,.15).lerp(v(.62,-.03,.73),wide);
 const yaw=.23+.30*ease(.41,.58,p)+.2554*wide+.052*gx, elev=.055+.56048*wide+.015*gy;
 const dist=7.07-.36*open+15.4*wide;
 camera.fov=31-4*wide;camera.aspect=w/h;
 camera.position.copy(target).add(v(Math.sin(yaw)*Math.cos(elev),Math.sin(elev),Math.cos(yaw)*Math.cos(elev)).multiplyScalar(dist/Math.min(1,w/h)));camera.lookAt(target);camera.updateProjectionMatrix();
 // Blend homogeneous projection rows at the focus distance for a continuous
 // transition to a true parallel, equal-axis isometric projection.
 if(wide>0){const projection=camera.projectionMatrix.elements,d=camera.position.distanceTo(target);
 const half=d*Math.tan(camera.fov*pi/360),ortho=new T.Matrix4().makeOrthographic(-half*camera.aspect,half*camera.aspect,half,-half,.05,65).elements;
 for(let i=0;i<16;i++)projection[i]=(1-wide)*projection[i]+wide*d*ortho[i];
 camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert()}
 handShadows();renderer.render(scene,camera)
}
