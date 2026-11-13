// Keep navigation and content usable even when WebGL is unavailable.
let lab=()=>{};
import('./lab.js').then(module=>{lab=module.drawLab}).catch(()=>{});
const reel=document.querySelector('.reel'), intro=document.querySelector('.intro'), bio=document.querySelector('.biocopy'), helmet=document.querySelector('.helmet'), bench=document.querySelector('.bench'), contact=document.querySelector('.projection'), pet=document.querySelector('.shin3');
const still=matchMedia('(prefers-reduced-motion:reduce), (max-height:540px)');
const clamp=n=>Math.max(0,Math.min(1,n)), smooth=n=>{n=clamp(n);return n*n*(3-2*n)};
let px=0,py=0,gx=0,gy=0,sceneTime=0;
const labCanvas=document.querySelector('#lab');
labCanvas.addEventListener('keydown',event=>{
 const moves={ArrowLeft:[-.15,0],ArrowRight:[.15,0],ArrowUp:[0,-.15],ArrowDown:[0,.15]};
 if(event.key==='Home'){event.preventDefault();px=py=0;return}
 if(!moves[event.key])return;
 event.preventDefault();px=Math.max(-1,Math.min(1,px+moves[event.key][0]));py=Math.max(-1,Math.min(1,py+moves[event.key][1]));
});
window.addEventListener('pointermove',e=>{px=e.clientX/innerWidth*2-1;py=e.clientY/innerHeight*2-1});
function renderer(canvas,fragment){
 const gl=canvas.getContext('webgl',{alpha:true});if(!gl)return ()=>{};
 const program=gl.createProgram();for(const [kind,src] of [[gl.VERTEX_SHADER,'attribute vec2 point;void main(){gl_Position=vec4(point,0.,1.);}'],[gl.FRAGMENT_SHADER,fragment]]){const shader=gl.createShader(kind);gl.shaderSource(shader,src);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(shader));gl.attachShader(program,shader)}
 gl.linkProgram(program);gl.useProgram(program);const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);const a=gl.getAttribLocation(program,'point');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);
 const u=Object.fromEntries(['size','progress','gaze','t'].map(k=>[k,gl.getUniformLocation(program,k)]));
 return (p,x,y,t)=>{let w=Math.min(640,Math.max(2,Math.round(canvas.clientWidth*devicePixelRatio))),h=Math.round(w*canvas.clientHeight/Math.max(1,canvas.clientWidth));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h)}gl.uniform2f(u.size,w,h);gl.uniform2f(u.gaze,x,y);gl.uniform1f(u.progress,p);gl.uniform1f(u.t,t);gl.drawArrays(gl.TRIANGLES,0,3)}
}
const project=renderer(document.querySelector("#projector"),`precision highp float;
 uniform vec2 size,gaze;uniform float progress,t,manual;
 mat2 rot(float a){return mat2(cos(a),-sin(a),sin(a),cos(a));}
 float box(vec3 p,vec3 b,float r){vec3 q=abs(p)-b;return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.)-r;}
 float cyl(vec3 p,float r,float h){vec2 q=vec2(length(p.xy)-r,abs(p.z)-h);return min(max(q.x,q.y),0.)+length(max(q,0.));}
 vec2 best(vec2 a,float d,float m){return d<a.x?vec2(d,m):a;}
 vec2 scene(vec3 p){
 vec3 h=p-vec3(0.,.3,0.);h.xz=rot(-progress*1.42)*h.xz;
 vec2 s=vec2(box(h,vec3(.38,.31,.28),.19),1.);
 s=best(s,box(h-vec3(0.,.44,0.),vec3(.073,.12,.23),.025),1.);
 s=best(s,box(h-vec3(0.,-.03,.32),vec3(.41,.19,.13),.10),2.);
 vec3 nose=h-vec3(0.,.015,.53);s=best(s,cyl(nose,.235,.19),2.);
 s=best(s,cyl(nose-vec3(0.,0.,.19),.213,.02),3.);s=best(s,cyl(nose-vec3(0.,0.,.216),.164,.018),4.);
 vec3 cheek=vec3(abs(h.x)-.335,h.y+.19,h.z-.38);s=best(s,cyl(cheek,.08,.17),1.);
 vec3 ear=vec3(h.z,h.y,abs(h.x)-.49);s=best(s,cyl(ear,.223,.082),3.);s=best(s,cyl(ear-vec3(0.,0.,.084),.17,.02),1.);
 s=best(s,cyl((p+vec3(0.,.38,0.)).xzy,.16,.29),3.);
 s=best(s,box(p+vec3(0.,.94,0.),vec3(.48,.28,.21),.14),1.);
 return s;}
 void main(){vec2 uv=(gl_FragCoord.xy-.5*size)/size.y;vec3 target=vec3(0.,-.06,0.);vec3 ro=vec3(.12,.12,3.0);
 vec3 f=normalize(target-ro),right=normalize(cross(f,vec3(0,1,0))),up=cross(right,f);vec3 rd=normalize(f*1.42+right*uv.x+up*uv.y);float d=0.;vec2 hit;
 for(int i=0;i<88;i++){hit=scene(ro+rd*d);if(hit.x<.0015||d>13.)break;d+=hit.x*.84;}
 if(d>13.||hit.x>.004){gl_FragColor=vec4(0);return;}
 vec3 p=ro+rd*d;vec2 e=vec2(.002,0.);vec3 n=normalize(vec3(scene(p+e.xyy).x-scene(p-e.xyy).x,scene(p+e.yxy).x-scene(p-e.yxy).x,scene(p+e.yyx).x-scene(p-e.yyx).x));vec3 light=normalize(vec3(-.55,.9,.72)),r=reflect(rd,n);
 vec3 base=hit.y<1.5?vec3(.83,.048,.024):hit.y<2.5?vec3(.027,.032,.039):hit.y<3.5?vec3(.21,.22,.24):hit.y<4.5?vec3(.74,.89,1.):vec3(1.,.5,.19);
 if(hit.y>5.5)base=hit.y<6.5?vec3(.82,.48,.32):hit.y<7.5?vec3(.09,.042,.027):vec3(.95,.93,.90);
 if(abs(p.y+1.09)<.12&&p.z>.36&&hit.y==3.&&abs(p.x+.23)<1.93)base=vec3(.26,.14,.074)*(.9+.1*sin(83.*p.z+2.*sin(p.x*3.)));
 if(hit.y>8.5)base=vec3(.94,.87,.80);
 float studio=smoothstep(.67,.91,r.y)*.5+smoothstep(.89,.95,dot(r,normalize(vec3(-.75,.3,.7))))*.75;
 vec3 color=base*(.28+.84*max(dot(n,light),0.))+studio*(hit.y>=6.?.15:1.)*vec3(1.,.92,.85)+pow(1.-max(dot(n,-rd),0.),3.)*vec3(.46,.18,.30);
 if(hit.y>3.5&&hit.y<5.5)color+=base*.35;
 gl_FragColor=vec4(pow(color,vec3(.8)),1.);}`);
const words=['Robotics Engineer','Automation Engineer','Perception Engineer','Software Developer','ML Engineer','Roboticist','AI Engineer','Student','Researcher','Lead'],role=document.querySelector('#role'),article=document.querySelector('#article');
let lastFrame=-100,projectionStarted=null;
function paint(t){if(t-lastFrame<16){requestAnimationFrame(paint);return}lastFrame=t;sceneTime=t/1000;const fixed=still.matches,box=reel.getBoundingClientRect(),p=clamp(-box.top/Math.max(1,box.height-innerHeight)),bi=smooth((p-.64)/.21);gx+=(px-gx)*.07;gy+=(py-gy)*.07;
intro.style.opacity=fixed?1:1-bi;bio.style.opacity=fixed?1:bi;intro.inert=!fixed&&bi>.5;bio.inert=!fixed&&bi<.5;bio.style.pointerEvents=bio.inert?'none':'auto';
if(box.bottom>0&&box.top<innerHeight){lab(fixed?1:p,fixed?0:gx,fixed?0:-gy,fixed?1:sceneTime);const phase=t/1000%6,word=words[Math.floor(t/6000)%words.length];role.textContent=fixed?words[0]:word.slice(0,Math.ceil(word.length*clamp(phase<1.2?phase/1.2:phase>5?6-phase:1)));if(article)article.textContent=/^[AEIOU]/i.test(fixed?words[0]:word)?'An':'A';}
const contactBox=contact.getBoundingClientRect();
const nearBottom=document.documentElement.scrollHeight-innerHeight-scrollY<60;
const focused=contact.contains(document.activeElement);
if(projectionStarted===null&&(contactBox.top<innerHeight*.28||nearBottom||focused))projectionStarted=t;
if(contactBox.top>innerHeight)projectionStarted=null;
const beam=fixed||focused?1:projectionStarted===null?0:smooth((t-projectionStarted)/2000);
if(contactBox.bottom>0&&contactBox.top<innerHeight)project(beam,0,0,0);
contact.style.setProperty('--beam',beam);
contact.style.setProperty('--reveal',fixed||focused?1:smooth((beam-.55)/.45));
contact.style.setProperty('--turn',(22-42*beam)+'deg');requestAnimationFrame(paint)}requestAnimationFrame(paint);
document.querySelector('a[href="#about"]').onclick=e=>{if(!still.matches){e.preventDefault();window.scrollTo({top:scrollY+reel.getBoundingClientRect().top+(reel.offsetHeight-innerHeight)*.91,behavior:'smooth'})}};
