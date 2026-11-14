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


// STEP 01/10 — roadside world dressing (lightweight, procedural, offline).
// The scenery uses built-in Babylon primitives so it adds no network dependency.
const bark=mat("treeBark","#55402e"), foliageA=mat("foliageDeep","#315b38"), foliageB=mat("foliageLight","#477b43");
const railMat=mat("guardrailMetal","#aab5b8",0.65), railPostMat=mat("guardrailPost","#68757a",0.45);
const lampPoleMat=mat("lampPole","#414b50",0.55), signBoardMat=mat("signBoard","#174d39");
const hillMat=mat("distantHill","#71866d"), hillFarMat=mat("farHill","#879783");
function sceneryCylinder(name,diameter,height,x,y,z,material,tessellation=8){
  const mesh=BABYLON.MeshBuilder.CreateCylinder(name,{diameter,height,tessellation},scene);
  mesh.position.set(x,y,z); mesh.material=material; return mesh;
}
function scenerySphere(name,diameter,x,y,z,scale,material,segments=8){
  const mesh=BABYLON.MeshBuilder.CreateSphere(name,{diameter,segments},scene);
  mesh.position.set(x,y,z); mesh.scaling.copyFromFloats(scale[0],scale[1],scale[2]); mesh.material=material; return mesh;
}
// Distant low-poly hills soften the horizon without expensive terrain textures.
for(let i=0;i<9;i++){
  const z=-55+i*78;
  scenerySphere("distantRollingHill",34+(i%3)*7,-34,1.2,z,[1.25,0.42,1.9],hillFarMat,6);
  scenerySphere("nearRollingHill",25+(i%4)*4,34,1.0,z+26,[1.1,0.38,1.65],hillMat,6);
}
// Tree rows, kept well outside the truck's safe driving corridor.
for(let z=-42;z<620;z+=54){
  for(const side of [-1,1]){
    const x=side*(15+(Math.floor((z+42)/54)%3)*2);
    sceneryCylinder("roadsideTreeTrunk",0.48,3.0,x,1.5,z,bark,7);
    scenerySphere("roadsideTreeCanopy",5.0,x,4.1,z,[0.78,0.9,0.78],(Math.floor(z/54)%2===0?foliageA:foliageB),7);
  }
}
// Guardrails use short repeating sections for a continuous highway edge.
for(let z=-50;z<620;z+=18){
  for(const side of [-1,1]){
    box(null,"guardrailBeam",0.16,0.34,17.8,side*7.25,0.92,z+8.9,railMat);
    for(const pz of [z+1,z+9,z+17]){
      box(null,"guardrailSupport",0.12,0.9,0.12,side*7.25,0.48,pz,railPostMat);
    }
  }
}
// Occasional high-mast roadside lights and green direction boards.
for(let z=18;z<620;z+=126){
  for(const side of [-1,1]){
    const x=side*9.1;
    sceneryCylinder("highwayLightPole",0.16,7.5,x,3.75,z,lampPoleMat,8);
    box(null,"lightArm",1.25,0.12,0.12,x-side*0.55,7.35,z, lampPoleMat);
    scenerySphere("lightHousing",0.42,x-side*1.08,7.25,z,[1.5,0.35,0.6],lamp,8);
    box(null,"directionSign",2.2,1.05,0.12,side*10.1,4.3,z+24,signBoardMat);
    box(null,"signPost",0.12,2.8,0.12,side*10.1,2.0,z+24,railPostMat);
    box(null,"signArrowStem",0.82,0.07,0.035,side*10.1,4.35,z+23.98,paint);
    box(null,"signArrowHead",0.18,0.07,0.035,side*10.48,4.35,z+23.98,paint);
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

// Detailed truck-only finish: layered body panels, cab interior, trim and lighting.
function detailBox(name,w,h,d,x,y,z,material,bevel=0){
  const m=BABYLON.MeshBuilder.CreateBox(name,{width:w,height:h,depth:d},scene);
  m.position.set(x,y,z); m.material=material; m.parent=truck;
  return m;
}
const cabBlack=mat("cabSeal","#171d21"), darkGlass=mat("deepCabGlass","#243d49",0.15,0.18,0.9);
const satin=mat("satinMetal","#737f84",0.72), seatMat=mat("seatLeather","#20272b"), dashMat=mat("dashboard","#11191e");
const redHighlight=mat("cabHighlight","#df5145",0.22), treadMat=mat("stepTread","#252b2e",0.35);
const frontZ=2.105;
// A layered, deep front fascia gives the cab a formed, manufactured appearance.
detailBox("upperFrontFascia",2.02,0.2,0.12,0,2.36,frontZ,redHighlight);
detailBox("lowerFrontFascia",2.08,0.13,0.12,0,1.78,frontZ,redDark);
detailBox("grilleInnerShadow",1.04,0.69,0.045,0,1.94,2.075,black);
for(let i=0;i<7;i++){
  const y=1.64+i*0.095;
  detailBox("precisionGrilleBar",0.96,0.026,0.035,0,y,2.112,satin);
}
for(const x of [-0.52,0.52]){
  detailBox("grilleVerticalDivider",0.035,0.65,0.04,x,1.96,2.115,chrome);
}
detailBox("bumperTopLip",2.22,0.07,0.39,0,1.39,2.04,chrome);
detailBox("bumperLowerValance",1.92,0.12,0.22,0,1.19,2.08,black);
for(const x of [-0.91,0.91]){
  detailBox("fogLampBezel",0.31,0.2,0.08,x,1.34,2.19,black);
  detailBox("fogLampLens",0.22,0.11,0.035,x,1.35,2.24,lamp);
  detailBox("bumperCorner",0.17,0.18,0.2,x*1.14,1.36,1.99,redHighlight);
  detailBox("headlampOuterBezel",0.47,0.34,0.09,x*1.78,1.66,2.025,black);
  detailBox("headlampUpperLED",0.34,0.055,0.035,x*1.78,1.76,2.085,lamp);
  detailBox("headlampLowerLED",0.34,0.055,0.035,x*1.78,1.57,2.085,lamp);
  detailBox("headlampIndicator",0.11,0.22,0.035,x*1.78+(x>0?-0.16:0.16),1.66,2.09,amber);
}
// Distinctive three-point star badge, built from light-weight metal geometry.
const starCenter=new BABYLON.Vector3(0,2.48,2.16);
for(let i=0;i<3;i++){
  const a=-Math.PI/2+i*2*Math.PI/3;
  const b=a+Math.PI;
  const p1=starCenter.add(new BABYLON.Vector3(Math.cos(a)*0.105,Math.sin(a)*0.105,0));
  const p2=starCenter.add(new BABYLON.Vector3(Math.cos(b)*0.105,Math.sin(b)*0.105,0));
  const line=BABYLON.MeshBuilder.CreateTube("emblemStarArm",{path:[p1,p2],radius:0.018,tessellation:6},scene);
  line.material=chrome; line.parent=truck;
}
const emblemRing=BABYLON.MeshBuilder.CreateTorus("emblemRing",{diameter:0.31,thickness:0.025,tessellation:24},scene);
emblemRing.position.copyFrom(starCenter); emblemRing.parent=truck; emblemRing.material=chrome;
// Windshield seals, split glass, wipers and a readable cabin interior.
detailBox("windshieldSeal",1.98,0.91,0.035,0,2.79,1.89,cabBlack);
detailBox("windshieldGlassInner",1.82,0.75,0.025,0,2.8,1.918,darkGlass);
detailBox("windshieldCenterDivider",0.035,0.74,0.03,0,2.8,1.94,black);
for(const x of [-0.58,0.58]){
  const wiper=detailBox("windscreenWiper",0.72,0.025,0.025,x,2.38,1.96,black);
  wiper.rotation.z=x<0?-0.13:0.13;
  detailBox("wiperPivot",0.07,0.07,0.04,x*0.48,2.4,1.97,satin);
}
detailBox("dashboardTop",1.78,0.15,0.56,0,2.37,0.78,dashMat);
detailBox("dashboardFace",1.68,0.32,0.12,0,2.2,1.03,black);
for(const x of [-0.48,-0.16,0.16,0.48]){
  const gauge=BABYLON.MeshBuilder.CreateCylinder("instrumentGauge",{diameter:0.13,height:0.025,tessellation:16},scene);
  gauge.rotation.x=Math.PI/2; gauge.position.set(x,2.23,1.105); gauge.parent=truck; gauge.material=chrome;
}
for(const x of [-0.53,0.53]){
  detailBox("seatBase",0.58,0.18,0.56,x,1.95,0.1,black);
  detailBox("seatCushion",0.55,0.18,0.5,x,2.08,0.12,seatMat);
  detailBox("seatBack",0.55,0.76,0.18,x,2.48,-0.08,seatMat);
  detailBox("seatHeadrest",0.38,0.22,0.2,x,2.98,-0.09,seatMat);
}
const steeringWheelMesh=BABYLON.MeshBuilder.CreateTorus("steeringWheel",{diameter:0.43,thickness:0.035,tessellation:24},scene);
steeringWheelMesh.position.set(-0.48,2.42,0.98); steeringWheelMesh.rotation.x=Math.PI/2; steeringWheelMesh.parent=truck; steeringWheelMesh.material=black;
detailBox("steeringColumn",0.08,0.08,0.35,-0.48,2.3,0.8,black);
// Door skins, glazing seals, hinges, handles, mirrors and side safety details.
for(const side of [-1,1]){
  const x=side*1.105;
  detailBox("doorLowerInset",0.035,0.72,0.9,x,1.95,0.94,redDark);
  detailBox("doorUpperBeltline",0.045,0.06,1.2,x*1.01,2.25,0.93,redHighlight);
  detailBox("doorWindowSeal",0.035,0.83,0.82,x*1.01,2.76,0.98,cabBlack);
  detailBox("doorWindowGlass",0.025,0.72,0.7,x*1.025,2.77,0.99,darkGlass);
  detailBox("windowDivider",0.045,0.72,0.035,x*1.04,2.77,0.99,black);
  detailBox("doorHandleRecess",0.045,0.09,0.26,x*1.035,2.05,1.45,black);
  detailBox("doorHandleChrome",0.055,0.035,0.18,x*1.06,2.07,1.45,chrome);
  for(const z of [0.38,1.2]){
    detailBox("doorHinge",0.055,0.16,0.09,x*1.04,2.24,z,satin);
  }
  detailBox("sideRepeater",0.05,0.11,0.22,x*1.05,1.77,1.55,amber);
  detailBox("sideSkirt",0.12,0.2,1.42,side*1.14,0.91,-0.58,redDark);
  detailBox("stepUpper",0.62,0.1,0.48,side*1.34,1.02,0.48,satin);
  detailBox("stepLower",0.62,0.1,0.48,side*1.34,0.76,0.48,black);
  for(let j=0;j<5;j++) detailBox("stepGrip",0.48,0.025,0.035,side*1.34,1.078,0.3+j*0.085,treadMat);
  detailBox("fuelTankBand",0.56,0.055,0.06,side*1.19,1.03,-0.35,black);
  detailBox("fuelTankCap",0.11,0.11,0.06,side*1.2,1.22,-0.82,chrome);
  detailBox("mirrorLongArm",0.07,0.07,0.62,side*1.2,2.73,1.49,black);
  detailBox("mirrorHousing",0.34,0.52,0.19,side*1.23,2.83,1.79,black);
  detailBox("mirrorReflectiveFace",0.27,0.42,0.025,side*1.24,2.83,1.895,chrome);
  detailBox("mirrorIndicator",0.07,0.12,0.035,side*1.24,2.58,1.9,amber);
}
// Roof fairing, marker lamps, antenna and exhaust stack.
detailBox("roofFairingFront",2.12,0.16,0.32,0,3.38,1.28,redHighlight);
detailBox("roofFairingRear",1.95,0.12,0.42,0,3.38,0.02,redDark);
for(let i=0;i<5;i++){
  const x=-0.8+i*0.4;
  detailBox("roofLED",0.13,0.07,0.09,x,3.46,1.46,i===2?lamp:amber);
}
for(const side of [-1,1]){
  const stack= BABYLON.MeshBuilder.CreateCylinder("exhaustStack",{diameter:0.15,height:1.15,tessellation:16},scene);
  stack.position.set(side*1.12,2.05,-1.65); stack.parent=truck; stack.material=satin;
  const cap=BABYLON.MeshBuilder.CreateCylinder("exhaustTip",{diameter:0.19,height:0.09,tessellation:16},scene);
  cap.position.set(side*1.12,2.64,-1.65); cap.parent=truck; cap.material=black;
}
// Wheel hubs gain lug nuts and sidewall rings; add rear mud flaps.
for(const side of [-1,1]){
  for(const z of [-1.72,-0.72,1.0]){
    const ring=BABYLON.MeshBuilder.CreateTorus("wheelSidewallRing",{diameter:0.78,thickness:0.018,tessellation:24},scene);
    ring.rotation.y=Math.PI/2; ring.position.set(side*1.39,0.58,z); ring.parent=truck; ring.material=satin;
  }
  detailBox("rearMudflap",0.42,0.55,0.07,side*1.18,0.38,-2.05,black);
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
let speed=0,steerValue=0,odometer=0;


// STEP 03/10 — moving highway traffic with reusable low-poly cars and lorries.
const trafficBlue=mat("trafficBlue","#315d87",0.18), trafficSilver=mat("trafficSilver","#aeb8bd",0.35);
const trafficYellow=mat("trafficYellow","#d4a72c",0.12), trafficWindow=mat("trafficWindow","#294653",0.1,0.2,0.86);
const trafficTyre=mat("trafficTyre","#151719"), trafficLamp=mat("trafficLamp","#fff0c8");
const trafficUnits=[];
function buildTrafficVehicle(index,kind,color,x,z,direction,cruise){
  const root=new BABYLON.TransformNode("trafficVehicle_"+index,scene);
  root.position.set(x,0,z);
  const bodyMat=color;
  const length=kind==="lorry"?5.4:3.7;
  const width=kind==="lorry"?2.25:1.82;
  box(root,"trafficChassis",width,0.42,length,0,0.72,0,black);
  box(root,"trafficBody",width,kind==="lorry"?2.25:0.9,length*0.72,0,kind==="lorry"?2.0:1.25,0,bodyMat);
  if(kind==="lorry"){
    box(root,"trafficCab",width,1.65,1.45,0,2.0,length*0.29,trafficBlue);
    box(root,"trafficCabGlass",width*0.78,0.65,0.05,0,2.25,length*0.29+0.75,trafficWindow);
  }else{
    box(root,"trafficWindshield",width*0.76,0.48,0.05,0,1.55,length*0.18,trafficWindow);
    box(root,"trafficRearGlass",width*0.72,0.4,0.05,0,1.52,-length*0.3,trafficWindow);
  }
  for(const side of [-1,1]){
    for(const wz of (kind==="lorry"?[-2.0,-0.8,1.65]:[-1.15,1.15])){
      const tire=cyl(root,"trafficWheel",kind==="lorry"?0.82:0.68,0.24,side*(width/2),0.48,wz,trafficTyre);
      tire.rotation.x=Math.PI/2;
    }
    box(root,"trafficHeadlamp",0.28,0.16,0.06,side*width*0.34,1.0,length*0.37,trafficLamp);
    box(root,"trafficTailLamp",0.22,0.22,0.06,side*width*0.36,0.98,-length*0.37,tail);
  }
  trafficUnits.push({root,direction,cruise,halfWidth:width/2,kind});
}
const trafficColors=[trafficBlue,trafficSilver,trafficYellow,red,white];
for(let i=0;i<10;i++){
  const oncoming=i%2===0;
  const lane=oncoming?-3.05:3.05;
  const z=truck.position.z+55+i*34;
  const kind=i===5||i===9?"lorry":"car";
  buildTrafficVehicle(i,kind,trafficColors[i%trafficColors.length],lane,z,oncoming?-1:1,oncoming?10+(i%3)*1.5:12+(i%3)*1.2);
}
let lastTrafficNotice=0;
function updateTraffic(dt,now){
  for(const unit of trafficUnits){
    unit.root.position.z+=unit.direction*unit.cruise*dt;
    const relative=unit.root.position.z-truck.position.z;
    if(relative>210)unit.root.position.z=truck.position.z-190-(Math.random()*35);
    if(relative< -210)unit.root.position.z=truck.position.z+190+(Math.random()*35);
    const lateral=Math.abs(unit.root.position.x-truck.position.x);
    const longitudinal=Math.abs(relative);
    if(lateral<2.05&&longitudinal<4.1&&speed>1.5){
      speed=Math.max(0,speed-12*dt);
      if(now-lastTrafficNotice>2200){
        showToast("TRAFFIC CONTACT • SLOW DOWN");
        lastTrafficNotice=now;
      }
    }
  }
}

// STEP 02/10 — delivery missions, live dashboard and persistent earnings.
const saveKey="euroHaulCareerV1";
let career={cash:0,deliveries:0};
try{
  const stored=JSON.parse(localStorage.getItem(saveKey)||"null");
  if(stored&&Number.isFinite(stored.cash)&&Number.isFinite(stored.deliveries)){
    career.cash=Math.max(0,Math.floor(stored.cash));
    career.deliveries=Math.max(0,Math.floor(stored.deliveries));
  }
}catch(_){ /* Storage may be unavailable in a restricted WebView. */ }

const hudStyle=document.createElement("style");
hudStyle.textContent=`
#careerHud{position:absolute;z-index:5;top:82px;right:12px;min-width:154px;padding:10px 12px;border:1px solid #ffffff55;border-radius:12px;background:#08131ddd;color:#fff;font:700 12px Arial,sans-serif;box-shadow:0 4px 16px #0007;pointer-events:none}
#careerHud .hudTitle{font-size:9px;letter-spacing:1.5px;color:#a9c5d2;margin-bottom:7px}
#careerHud .hudRow{display:flex;justify-content:space-between;gap:16px;margin:5px 0}
#careerHud .hudValue{color:#f5d77a;font-variant-numeric:tabular-nums}
#careerHud #missionText{max-width:210px;margin-top:7px;padding-top:7px;border-top:1px solid #ffffff33;color:#dce9ed;font-size:10px;line-height:1.35}
#careerToast{position:absolute;z-index:6;top:47%;left:50%;transform:translate(-50%,-50%);padding:12px 18px;border-radius:10px;background:#07131eee;color:#fff;font:bold 14px Arial,sans-serif;text-align:center;display:none;pointer-events:none}
`;
document.head.appendChild(hudStyle);
const hud=document.createElement("div");
hud.id="careerHud";
hud.innerHTML='<div class="hudTitle">EURO HAUL • DRIVER</div><div class="hudRow"><span>SPEED</span><span class="hudValue" id="hudSpeed">0 km/h</span></div><div class="hudRow"><span>TRIP</span><span class="hudValue" id="hudTrip">0.0 km</span></div><div class="hudRow"><span>BALANCE</span><span class="hudValue" id="hudCash">€0</span></div><div class="hudRow"><span>DELIVERIES</span><span class="hudValue" id="hudJobs">0</span></div><div id="missionText">Loading delivery route…</div>';
document.body.appendChild(hud);
const toast=document.createElement("div");toast.id="careerToast";document.body.appendChild(toast);
const hudSpeed=document.getElementById("hudSpeed"),hudTrip=document.getElementById("hudTrip");
const hudCash=document.getElementById("hudCash"),hudJobs=document.getElementById("hudJobs");
const missionText=document.getElementById("missionText");
const destination=new BABYLON.TransformNode("deliveryDestination",scene);
function missionBox(name,w,h,d,x,y,z,material){
  const mesh=BABYLON.MeshBuilder.CreateBox(name,{width:w,height:h,depth:d},scene);
  mesh.position.set(x,y,z);mesh.parent=destination;mesh.material=material;return mesh;
}
const markerMat=mat("deliveryMarkerGreen","#22c879",0.25);
const markerGlow=mat("deliveryMarkerGlow","#b8ffda",0.1,0.2);
missionBox("deliveryLeftPost",0.18,4.8,0.18,-5.4,2.4,0,markerMat);
missionBox("deliveryRightPost",0.18,4.8,0.18,5.4,2.4,0,markerMat);
missionBox("deliveryHeader",11,0.22,0.22,0,4.75,0,markerMat);
missionBox("deliverySign",3.6,0.9,0.2,0,4.1,0.15,black);
missionBox("deliverySignStripe",2.9,0.08,0.04,0,4.1,0.27,markerGlow);
const markerLamp=BABYLON.MeshBuilder.CreateSphere("deliveryBeacon",{diameter:0.8,segments:10},scene);
markerLamp.parent=destination;markerLamp.position.set(0,5.45,0);markerLamp.material=markerGlow;
let destinationZ=180,lastHudUpdate=0,toastUntil=0;
destination.position.z=destinationZ;
function saveCareer(){
  try{localStorage.setItem(saveKey,JSON.stringify(career));}catch(_){ /* Continue the current session without storage. */ }
}
function showToast(message){
  toast.textContent=message;toast.style.display="block";toastUntil=performance.now()+2600;
}
function updateCareerHud(now){
  if(now-lastHudUpdate<150)return;
  lastHudUpdate=now;
  hudSpeed.textContent=Math.round(speed*3.6)+" km/h";
  hudTrip.textContent=(odometer/1000).toFixed(1)+" km";
  hudCash.textContent="€"+career.cash.toLocaleString();
  hudJobs.textContent=String(career.deliveries);
  const remaining=Math.max(0,destinationZ-truck.position.z);
  missionText.textContent=remaining>5
    ? "DELIVERY "+(career.deliveries+1)+" • "+Math.ceil(remaining)+" m ahead. Slow down and stop inside the green gate."
    : "DELIVERY GATE • Brake to below 10 km/h to complete the drop.";
  if(toastUntil&&now>toastUntil){toast.style.display="none";toastUntil=0;}
}
scene.onBeforeRenderObservable.add(()=>{
 const dt=Math.min(engine.getDeltaTime()/1000,0.05);
 if(input.gas)speed=Math.min(speed+4.6*dt,19);
 else speed=Math.max(speed-0.85*dt,0);
 if(input.brake)speed=Math.max(speed-10*dt,0);
 const steerTarget=input.left?-0.5:input.right?0.5:0;
 steerValue+=(steerTarget-steerValue)*Math.min(5*dt,1);
 truck.rotation.y+=steerValue*speed*0.014*dt;
 truck.position.x+=Math.sin(truck.rotation.y)*speed*dt;
 truck.position.z+=Math.cos(truck.rotation.y)*speed*dt;
 truck.position.x=BABYLON.Scalar.Clamp(truck.position.x,-4.2,4.2);
 wheels.forEach(w=>w.rotation.x+=speed*dt*2.1);
 odometer+=speed*dt;
 const remaining=destinationZ-truck.position.z;
 if(remaining<=5&&remaining>=-5&&speed<2.8){
   career.deliveries+=1;career.cash+=750;saveCareer();
   destinationZ+=260;destination.position.z=destinationZ;
   showToast("DELIVERY COMPLETE  +€750");
 }
 updateCareerHud(performance.now());
 updateTraffic(dt,performance.now());
});

/* STAGES 04–10: weather, cockpit, vehicle systems, depot world, garage and career. */
const depotMat=mat("depotConcrete","#777d7c"), depotRoof=mat("depotRoof","#713f32"), depotGlass=mat("depotGlass","#344b57",0.1,0.25,0.9);
for(let i=0;i<8;i++)for(const side of [-1,1]){
 const x=side*(24+(i%3)*3),z=35+i*72;
 box(null,"EuropeanFreightDepot",12,6.5,18,x,3.25,z,depotMat);
 box(null,"DepotRoof",12.5,0.35,18.5,x,6.65,z,depotRoof);
 for(let w=-1;w<=1;w++)box(null,"DepotWindow",0.12,1.35,2.1,x-side*6.05,3.9,z+w*5,depotGlass);
 box(null,"DepotLoadingBay",0.16,3.2,3.3,x-side*6.12,1.9,z+3,black);
}
let timeOfDay=0.38,weatherMode="clear",weatherClock=0;
const rainMat=mat("rainStreak","#b8d5e8",0,0.15,0.48),snowMat=mat("snowParticle","#edf5ff",0,0.2,0.8);
const rainDrops=[],snowDrops=[];
for(let i=0;i<65;i++){
 const p=BABYLON.MeshBuilder.CreateBox("rainDrop",{width:0.018,height:0.55,depth:0.018},scene);p.material=rainMat;p.isVisible=false;rainDrops.push(p);
}
for(let i=0;i<40;i++){
 const p=BABYLON.MeshBuilder.CreateSphere("snowFlake",{diameter:0.075,segments:5},scene);p.material=snowMat;p.isVisible=false;snowDrops.push(p);
}
function setWeather(mode){
 weatherMode=mode;rainDrops.forEach(p=>p.isVisible=mode==="rain");snowDrops.forEach(p=>p.isVisible=mode==="snow");
 scene.fogDensity=mode==="fog"?0.009:mode==="rain"?0.003:0.0018;showToast("WEATHER: "+mode.toUpperCase());
}
function updateWorld(dt){
 timeOfDay=(timeOfDay+dt/360)%1;
 const daylight=Math.max(0.12,Math.sin(timeOfDay*Math.PI*2-Math.PI/2)*0.5+0.5);
 sun.intensity=0.18+daylight*0.92;fill.intensity=0.08+daylight*0.42;
 const sky=new BABYLON.Color3(0.035+0.48*daylight,0.055+0.64*daylight,0.11+0.72*daylight);
 scene.clearColor=new BABYLON.Color4(sky.r,sky.g,sky.b,1);scene.fogColor=sky;weatherClock+=dt;
 if(weatherMode==="rain"||weatherMode==="snow"){
  for(const p of (weatherMode==="rain"?rainDrops:snowDrops)){
   if(!p.isVisible||p.position.y<0.2)p.position.set(truck.position.x+(Math.random()-.5)*24,7+Math.random()*7,truck.position.z+(Math.random()-.5)*35);
   else{p.position.y-=dt*(weatherMode==="rain"?17:3.2);p.position.z-=dt*(weatherMode==="rain"?speed+5:1.5);}
  }
 }
}
const cockpitCamera=new BABYLON.UniversalCamera("cockpitCamera",new BABYLON.Vector3(0,3.02,0.48),scene);
cockpitCamera.parent=truck;cockpitCamera.fov=0.92;cockpitCamera.minZ=0.08;cockpitCamera.inputs.clear();
let cockpitMode=false,headlightsOn=false,gear=1,fuel=100,engineRpm=750,vehicleDamage=0,selectedPaint=0;
const cabPaints=["#b92720","#245b91","#d5d7d5","#d1a52d"].map((v,i)=>mat("cabPaint"+i,v,0.25));
function repaintTruck(){
 selectedPaint=(selectedPaint+1)%cabPaints.length;
 for(const n of ["cabMain","cabRoof","roofVisor","roofFairingFront"]){
  const mesh=truck.getChildMeshes(false).find(x=>x.name===n);if(mesh)mesh.material=cabPaints[selectedPaint];
 }
 showToast("TRUCK PAINT UPDATED");
}
let distanceBonus=0,systemsRefreshAt=0;
const panel=document.createElement("div");panel.id="haulPanel";
panel.innerHTML='<div class="panelHead">EURO HAUL • DRIVER CENTRE</div><div class="panelGrid"><button id="viewToggle">COCKPIT VIEW</button><button id="weatherToggle">WEATHER: CLEAR</button><button id="gearToggle">GEAR: 1</button><button id="lampToggle">LIGHTS: OFF</button><button id="paintToggle">CHANGE PAINT</button><button id="serviceToggle">SERVICE €250</button><button id="fuelToggle">REFUEL €100</button><button id="closePanel">CLOSE</button></div><div id="systemReadout"></div>';
document.body.appendChild(panel);
const openPanel=document.createElement("button");openPanel.id="panelOpen";openPanel.textContent="GARAGE / OPTIONS";document.body.appendChild(openPanel);
const readout=document.getElementById("systemReadout");
function refreshSystems(){
 readout.textContent="ENGINE "+Math.round(engineRpm)+" RPM • FUEL "+Math.round(fuel)+"% • DAMAGE "+Math.round(vehicleDamage)+"% • GEAR "+gear;
 document.getElementById("gearToggle").textContent="GEAR: "+gear;
 document.getElementById("lampToggle").textContent="LIGHTS: "+(headlightsOn?"ON":"OFF");
 document.getElementById("weatherToggle").textContent="WEATHER: "+weatherMode.toUpperCase();
}
openPanel.addEventListener("click",()=>{panel.style.display="block";refreshSystems();});
document.getElementById("closePanel").addEventListener("click",()=>panel.style.display="none");
document.getElementById("viewToggle").addEventListener("click",()=>{
 cockpitMode=!cockpitMode;scene.activeCamera=cockpitMode?cockpitCamera:camera;
 document.getElementById("viewToggle").textContent=cockpitMode?"CHASE VIEW":"COCKPIT VIEW";
});
document.getElementById("weatherToggle").addEventListener("click",()=>{
 const modes=["clear","rain","snow","fog"];setWeather(modes[(modes.indexOf(weatherMode)+1)%modes.length]);refreshSystems();
});
document.getElementById("gearToggle").addEventListener("click",()=>{gear=gear>=6?1:gear+1;refreshSystems();});
document.getElementById("lampToggle").addEventListener("click",()=>{
 headlightsOn=!headlightsOn;
 truck.getChildMeshes(false).filter(m=>["headlamp","headlampUpperLED","headlampLowerLED"].includes(m.name)).forEach(m=>m.material=headlightsOn?lamp:black);
 refreshSystems();
});
document.getElementById("paintToggle").addEventListener("click",repaintTruck);
document.getElementById("serviceToggle").addEventListener("click",()=>{
 if(career.cash<250){showToast("NOT ENOUGH MONEY");return;}
 career.cash-=250;vehicleDamage=0;saveCareer();refreshSystems();showToast("TRUCK SERVICED");
});
document.getElementById("fuelToggle").addEventListener("click",()=>{
 if(career.cash<100){showToast("NOT ENOUGH MONEY");return;}
 career.cash-=100;fuel=Math.min(100,fuel+35);saveCareer();refreshSystems();showToast("FUEL ADDED");
});
const panelStyle=document.createElement("style");
panelStyle.textContent=`
#haulPanel{display:none;position:absolute;z-index:20;left:50%;top:50%;transform:translate(-50%,-50%);width:min(92vw,390px);padding:15px;border:1px solid #ffffff55;border-radius:16px;background:#08131df2;color:white;box-shadow:0 12px 36px #000b;font:12px Arial,sans-serif}
.panelHead{font-weight:900;letter-spacing:1.4px;margin-bottom:12px;color:#f1d27a}
.panelGrid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
#haulPanel button{min-height:42px;padding:7px 5px;font-size:10px;border-radius:9px}
#systemReadout{margin-top:12px;color:#c6d7df;font-size:10px;line-height:1.5}
#panelOpen{position:absolute;z-index:8;top:62px;right:12px;padding:9px 11px;font-size:9px;border-radius:9px;background:#101820dd}
`;
document.head.appendChild(panelStyle);
function updateVehicleSystems(dt){
 if(input.gas&&fuel>0&&vehicleDamage<95){
  const maxSpeed=[5,8,11,14,17,19][gear-1];speed=Math.min(speed,maxSpeed);
  fuel=Math.max(0,fuel-dt*(0.018+speed*0.0015));
 }
 engineRpm=750+speed*145+(input.gas?650:0);
 if(fuel<=0)speed=Math.max(0,speed-dt*2.8);
 if(vehicleDamage>0)speed=Math.min(speed,Math.max(4,19-vehicleDamage*0.13));
 if(odometer-distanceBonus>=50000){distanceBonus+=50000;career.cash+=1200;saveCareer();showToast("LONG-HAUL BONUS +€1,200");}
 const now=performance.now();if(now-systemsRefreshAt>900){systemsRefreshAt=now;refreshSystems();}
}
scene.onBeforeRenderObservable.add(()=>{
 const dt=Math.min(engine.getDeltaTime()/1000,0.05);updateWorld(dt);updateVehicleSystems(dt);
});

engine.runRenderLoop(()=>scene.render());
window.addEventListener("resize",()=>engine.resize());
if(loading)loading.style.display="none";
