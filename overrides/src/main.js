import * as BABYLON from "babylonjs";

const canvas = document.getElementById("renderCanvas");
const loading = document.getElementById("loading");
const engine = new BABYLON.Engine(canvas, true, {
  preserveDrawingBuffer: false, stencil: false, antialias: false,
  powerPreference: "low-power", adaptToDeviceRatio: true
});
engine.setHardwareScalingLevel(Math.min(1.5, Math.max(1, window.devicePixelRatio || 1)));
const scene = new BABYLON.Scene(engine);
scene.clearColor = new BABYLON.Color4(0.55, 0.72, 0.82, 1);
scene.collisionsEnabled = false;
scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
scene.fogDensity = 0.0018;
scene.fogColor = new BABYLON.Color3(0.55, 0.72, 0.82);

const camera = new BABYLON.FollowCamera("followCamera", new BABYLON.Vector3(0, 5, -12), scene);
camera.radius = 13; camera.heightOffset = 4.5; camera.rotationOffset = 180;
camera.cameraAcceleration = 0.045; camera.maxCameraSpeed = 8;
camera.lowerRadiusLimit = 10; camera.upperRadiusLimit = 16;
scene.activeCamera = camera;
const sun = new BABYLON.HemisphericLight("skyLight", new BABYLON.Vector3(0, 1, 0), scene);
sun.intensity = 0.92;
const fill = new BABYLON.DirectionalLight("sunFill", new BABYLON.Vector3(-0.4, -1, 0.3), scene);
fill.position = new BABYLON.Vector3(-20, 35, -15); fill.intensity = 0.45;

function mat(name, color, metallic=0, roughness=0.65, alpha=1) {
  const m = new BABYLON.StandardMaterial(name, scene);
  m.diffuseColor = BABYLON.Color3.FromHexString(color);
  m.specularColor = new BABYLON.Color3(metallic ? 0.65 : 0.18, metallic ? 0.65 : 0.18, metallic ? 0.65 : 0.18);
  m.specularPower = metallic ? 96 : 32; m.alpha = alpha; return m;
}
const asphalt=mat("asphalt","#30363b"), verge=mat("verge","#527447"), paint=mat("roadPaint","#f2e6bd");
const red=mat("cabRed","#b92720",0.25), redDark=mat("lowerRed","#791b18",0.2);
const rubber=mat("tyreRubber","#17191b"), rim=mat("alloy","#aeb8bd",0.8), chrome=mat("chrome","#d7e0e2",0.9);
const black=mat("trim","#101619"), glass=mat("blueGlass","#416675",0.1,0.2,0.78);
const white=mat("trailerWhite","#d9dedc",0.15), lamp=mat("lampWhite","#fff1d2"), amber=mat("indicatorAmber","#ff9b20"), tail=mat("tailRed","#e32219");
function box(parent,name,w,h,d,x,y,z,material) {
  const m=BABYLON.MeshBuilder.CreateBox(name,{width:w,height:h,depth:d},scene);
  m.position.set(x,y,z); m.material=material; if(parent)m.parent=parent; return m;
}
function cyl(parent,name,diam,height,x,y,z,material) {
  const m=BABYLON.MeshBuilder.CreateCylinder(name,{diameter:diam,height,tessellation:20},scene);
  m.rotation.z=Math.PI/2; m.position.set(x,y,z); m.material=material; if(parent)m.parent=parent; return m;
}
const ground=BABYLON.MeshBuilder.CreateGround("land",{width:180,height:700},scene);
ground.position.z=260; ground.material=verge;
const road=box(null,"road",13,0.16,700,0,0.04,260,asphalt);
for(let z=-80;z<620;z+=16){
  box(null,"centerLine",0.16,0.025,6,0,0.14,z,paint);
  box(null,"edgeLine",0.12,0.025,700,-6.1,0.14,260,paint);
  box(null,"edgeLine",0.12,0.025,700,6.1,0.14,260,paint);
}
const postMat=mat("roadPost","#ece9d9");
for(let z=-60;z<620;z+=28){
  for(const x of [-7.2,7.2]){
    const p=box(null,"roadsidePost",0.16,1.05,0.16,x,0.55,z,postMat);
    box(null,"postReflector",0.18,0.2,0.18,x,0.7,z,amber);
  }
}
const truck=new BABYLON.TransformNode("tractor",scene);
box(truck,"ladderChassis",2.15,0.48,5.25,0,1.05,-0.05,black);
box(truck,"fuelTank",0.52,0.55,1.5,1.18,0.92,-0.35,rim);
box(truck,"cabLower",2.22,1.0,2.05,0,1.72,0.9,redDark);
box(truck,"cabMain",2.18,1.58,1.82,0,2.48,0.92,red);
box(truck,"cabRoof",2.25,0.18,1.92,0,3.34,0.9,red);
box(truck,"windshield",1.88,0.83,0.045,0,2.78,1.85,glass);
box(truck,"windshieldTopTrim",2.0,0.08,0.07,0,3.22,1.86,black);
box(truck,"frontGrilleFrame",1.18,0.8,0.08,0,1.93,1.98,black);
for(let y=1.64;y<=2.22;y+=0.14) box(truck,"grilleSlat",1.02,0.035,0.035,0,y,2.035,chrome);
box(truck,"frontBadge",0.24,0.22,0.06,0,2.48,2.02,chrome);
box(truck,"frontBumper",2.28,0.22,0.32,0,1.28,1.98,chrome);
for(const x of [-0.83,0.83]){
  box(truck,"headlamp",0.38,0.28,0.09,x,1.64,2.0,lamp);
  box(truck,"turnSignal",0.2,0.13,0.09,x*1.18,1.48,2.0,amber);
  box(truck,"lowerLamp",0.25,0.12,0.1,x,1.34,2.13,tail);
  box(truck,"doorWindow",0.72,0.75,0.05,x*0.69,2.73,0.99,glass);
  box(truck,"doorHandle",0.22,0.055,0.06,x*1.01,2.0,1.86,chrome);
  box(truck,"mirrorArm",0.08,0.08,0.52,x*1.1,2.65,1.55,black);
  box(truck,"sideMirror",0.28,0.42,0.16,x*1.15,2.72,1.78,black);
  box(truck,"mirrorGlass",0.22,0.31,0.025,x*1.15,2.72,1.87,chrome);
  box(truck,"step",0.52,0.12,0.62,x*1.7,1.05,0.7,rim);
  box(truck,"wheelArch",0.2,0.12,1.15,x*1.05,1.03,0.85,black);
}
box(truck,"roofVisor",2.25,0.12,0.24,0,3.28,1.87,redDark);
for(let x=-0.8;x<=0.81;x+=0.4) box(truck,"roofMarker",0.12,0.08,0.1,x,3.43,1.45,amber);
const wheels=[];
for(const x of [-1.18,1.18]){
  for(const z of [-1.72,-0.72,1.0]){
    const wheel=cyl(truck,"truckTyre",0.96,0.38,x,0.58,z,rubber); wheels.push(wheel);
    cyl(truck,"wheelRim",0.59,0.405,x,0.58,z,rim);
    cyl(truck,"wheelHub",0.25,0.42,x,0.58,z,chrome);
    for(let a=0;a<8;a++){
      const ang=a*Math.PI/4;
      const bolt=BABYLON.MeshBuilder.CreateSphere("wheelBolt",{diameter:0.065,segments:6},scene);
      bolt.position.set(x*1.01,0.58+Math.sin(ang)*0.2,z+Math.cos(ang)*0.2); bolt.material=black; bolt.parent=truck;
    }
  }
}
const trailer=new BABYLON.TransformNode("trailer",scene); trailer.parent=truck; trailer.position.set(0,0,-5.2);
box(trailer,"trailerFloor",2.55,0.22,7.0,0,1.58,0,black);
box(trailer,"trailerBody",2.5,2.65,6.9,0,3.0,0,white);
box(trailer,"trailerRoof",2.56,0.14,7.0,0,4.38,0,chrome);
for(const x of [-1.27,1.27]){
  for(let z=-3.1;z<=3.11;z+=0.48) box(trailer,"sideRib",0.045,2.55,0.055,x,3.0,z,chrome);
  box(trailer,"sideGuard",0.12,0.16,6.7,x*1.04,1.75,0,chrome);
}
box(trailer,"rearDoorLeft",1.22,2.5,0.07,-0.62,3.0,-3.5,white);
box(trailer,"rearDoorRight",1.22,2.5,0.07,0.62,3.0,-3.5,white);
for(const x of [-0.62,0.62]){
  box(trailer,"doorBar",0.07,2.3,0.09,x,3.0,-3.57,chrome);
  box(trailer,"doorLatch",0.15,0.12,0.12,x,3.0,-3.65,black);
  box(trailer,"rearTailLamp",0.34,0.48,0.12,x*1.9,1.85,-3.58,tail);
  box(trailer,"rearIndicator",0.3,0.18,0.12,x*1.9,2.2,-3.58,amber);
}
for(const x of [-0.85,0.85]){
  const tw=cyl(trailer,"trailerTyre",0.9,0.34,x,0.58,-2.15,rubber);
  cyl(trailer,"trailerRim",0.53,0.36,x,0.58,-2.15,rim);
  const tw2=cyl(trailer,"trailerTyre",0.9,0.34,x,0.58,-2.9,rubber);
  cyl(trailer,"trailerRim",0.53,0.36,x,0.58,-2.9,rim);
}
camera.lockedTarget=truck;

const input={left:false,right:false,gas:false,brake:false};
function bindButton(id,key){
 const el=document.getElementById(id); if(!el)return;
 const down=e=>{e.preventDefault();input[key]=true;};
 const up=e=>{e.preventDefault();input[key]=false;};
 el.addEventListener("pointerdown",down);
 ["pointerup","pointercancel","pointerleave","lostpointercapture"].forEach(ev=>el.addEventListener(ev,up));
}
bindButton("left","left"); bindButton("right","right");
bindButton("accelerate","gas"); bindButton("brake","brake");
let speed=0,steering=0,odometer=0;
scene.onBeforeRenderObservable.add(()=>{
 const dt=Math.min(engine.getDeltaTime()/1000,0.05);
 if(input.gas)speed=Math.min(speed+4.6*dt,19);
 else speed=Math.max(speed-0.85*dt,0);
 if(input.brake)speed=Math.max(speed-10*dt,0);
 const steerTarget=input.left?-0.5:input.right?0.5:0;
 steering+=(steerTarget-steering)*Math.min(5*dt,1);
 truck.rotation.y+=steering*speed*0.014*dt;
 truck.position.x+=Math.sin(truck.rotation.y)*speed*dt;
 truck.position.z+=Math.cos(truck.rotation.y)*speed*dt;
 truck.position.x=BABYLON.Scalar.Clamp(truck.position.x,-4.2,4.2);
 wheels.forEach(w=>w.rotation.x+=speed*dt*2.1);
 odometer+=speed*dt;
});
engine.runRenderLoop(()=>scene.render());
window.addEventListener("resize",()=>engine.resize());
if(loading)loading.style.display="none";
