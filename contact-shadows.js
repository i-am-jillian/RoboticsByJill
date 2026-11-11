// Trace finite rays from each receiving surface to a disk of directions around
// the key light. Oriented boxes and ellipsoids bound the nearby solid parts.
import * as T from './vendor/three.module.js';

export function contactShadows(material, shapes, reach) {
  const inverses=shapes.map(()=>new T.Matrix4());
  const types=shapes.map(shape=>shape.type==='box'?1:0);
  const scale=new T.Matrix4();
  function update(){
    shapes.forEach(({object,radii},i)=>{
      object.updateWorldMatrix(true,false);
      scale.makeScale(...radii);
      inverses[i].copy(object.matrixWorld).multiply(scale).invert();
    })
  }
  update();
  material.onBeforeCompile=shader=>{
    shader.uniforms.contactTransforms={value:inverses};
    shader.uniforms.contactTypes={value:types};
    shader.vertexShader='varying vec3 contactPosition;\n'+shader.vertexShader.replace(
      '#include <project_vertex>','#include <project_vertex>\ncontactPosition=(modelMatrix*vec4(transformed,1.0)).xyz;');
    shader.fragmentShader=`
      varying vec3 contactPosition;
      uniform mat4 contactTransforms[${shapes.length}];
      uniform int contactTypes[${shapes.length}];
      float contactVisibility(vec3 origin){
        float visibility=0.;
        for(int i=0;i<8;i++){
          float phi=float(i)*2.399963;
          vec3 direction=normalize(vec3(-.48,.85,.54)+sqrt((float(i)+.5)/8.)*.56*
            (cos(phi)*vec3(.747,0.,.664)+sin(phi)*vec3(-.51,-.64,.57)));
          float attenuation=1.;
          for(int j=0;j<${shapes.length};j++){
            vec3 o=(contactTransforms[j]*vec4(origin,1.)).xyz;
            vec3 d=(contactTransforms[j]*vec4(direction,0.)).xyz;
            float entry,exitDistance;
            if(contactTypes[j]==1){
              vec3 inv=sign(d+vec3(1.e-9))/max(abs(d),vec3(1.e-7));
              vec3 lo=(-1.-o)*inv,hi=(1.-o)*inv,a=min(lo,hi),b=max(lo,hi);
              entry=max(a.x,max(a.y,a.z));exitDistance=min(b.x,min(b.y,b.z));
            }else{
              float dd=dot(d,d),od=dot(o,d),disc=od*od-dd*(dot(o,o)-1.);
              if(disc<0.)continue;
              entry=(-od-sqrt(disc))/dd;exitDistance=(-od+sqrt(disc))/dd;
            }
            if(exitDistance>max(entry,.001)){
              attenuation=min(attenuation,smoothstep(0.,${reach.toFixed(3)},max(0.,entry)));
            }
          }
          visibility+=attenuation;
        }
        return visibility/8.;
      }
    `+shader.fragmentShader.replace('#include <lights_fragment_end>',`
      #include <lights_fragment_end>
      float contact=contactVisibility(contactPosition+vec3(0.,.002,0.));
      reflectedLight.directDiffuse*=mix(.12,1.,contact);
      reflectedLight.indirectDiffuse*=mix(.42,1.,contact);
      reflectedLight.directSpecular*=mix(.16,1.,contact);
      reflectedLight.indirectSpecular*=mix(.55,1.,contact);
    `)
  };
  material.customProgramCacheKey=()=>'contact-'+shapes.length+'-'+reach;
  material.needsUpdate=true;
  return update;
}
