import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


// initialize the scene
const scene = new THREE.Scene()
const bgCanvas = document.createElement('canvas')
bgCanvas.width = 2
bgCanvas.height = 512
const bgCtx = bgCanvas.getContext('2d')
const gradient = bgCtx.createLinearGradient(0, 0, 0, 512)
gradient.addColorStop(0,    '#A4A7DA')
gradient.addColorStop(0.25, '#BCA4DA')
gradient.addColorStop(0.5,  '#D7A4DA')
gradient.addColorStop(0.75, '#DAD7A4')
gradient.addColorStop(1,    '#A7DAA4')
bgCtx.fillStyle = gradient
bgCtx.fillRect(0, 0, 2, 512)
scene.background = new THREE.CanvasTexture(bgCanvas)

const colors = {
  right:  0xC0392B,  // deep crimson red
  left:   0xD35400,  // burnt orange
  top:    0xECF0F1,  // soft off-white
  bottom: 0xD4AC0D,  // deep gold
  front: "#192EA8",  // deep navy blue
  back:   0x1E8449,  // deep forest green
  inner:  0x1A1A1A   // near black
}

const cubies=[]

for (let x = -1; x <= 1; x++) {
  for (let y = -1; y <= 1; y++) {
    for (let z = -1; z <= 1; z++) {

      const geometry = new THREE.BoxGeometry(0.95, 0.95, 0.95)

      const materials = [
        new THREE.MeshBasicMaterial({
          color: x === 1 ? colors.right : colors.inner
        }),
        new THREE.MeshBasicMaterial({
          color: x === -1 ? colors.left : colors.inner
        }),
        new THREE.MeshBasicMaterial({
          color: y === 1 ? colors.top : colors.inner
        }),
        new THREE.MeshBasicMaterial({
          color: y === -1 ? colors.bottom : colors.inner
        }),
        new THREE.MeshBasicMaterial({
          color: z === 1 ? colors.front : colors.inner
        }),
        new THREE.MeshBasicMaterial({
          color: z === -1 ? colors.back : colors.inner
        })
      ]

      const cube = new THREE.Mesh(geometry, materials)
      cube.userData={x,y,z}
      cube.position.set(x, y, z)
      console.log(x,y,z)
      cubies.push(cube)
      scene.add(cube)
    }
  }
}




// initialize the camera
const camera = new THREE.PerspectiveCamera(
 75, 
  window.innerWidth / window.innerHeight,
  0.1,
  30)
  //const aspectratio=window.innerWidth/window.innerHeight
  //const camera=new THREE.OrthographicCamera(1*aspectratio,-1*aspectratio,1,-1,0.1,200)
camera.position.z = 5

// initialize the renderer
const canvas = document.querySelector('canvas.threejs')
const renderer = new THREE.WebGLRenderer({
  canvas: canvas
})
const controls=new OrbitControls(camera,canvas)
controls.enableDamping=true
controls.autoRotate=false
 window.addEventListener("resize",()=>{
  renderer.setSize(window.innerWidth, window.innerHeight)
  camera.aspect=window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
 })
 const highlightGeometry = new THREE.BoxGeometry(1.02, 1.02, 1.02);

const highlightMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: true
});

const highlight = new THREE.Mesh(
    highlightGeometry,
    highlightMaterial
);

scene.add(highlight);


renderer.setSize(window.innerWidth, window.innerHeight)
const renderloop =()=>{

  controls.update()


renderer.render(scene,camera)
window.requestAnimationFrame(renderloop)
}

renderloop()
const selectionBox = new THREE.Raycaster()
const mouse=new THREE.Vector2()
let selectedobject = null

window.addEventListener('pointerdown', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  selectionBox.setFromCamera(mouse, camera);

  const intersects = selectionBox.intersectObjects(scene.children, false);
  if (intersects.length > 0) {
    selectedobject = intersects[0].object
    highlight.position.copy(selectedobject.position)
    console.log('selected', selectedobject.userData)
  } else {
    selectedobject = null
     highlight.position.copy(255,255,255)
  }
})
function rotatecube(axis, direction) {
  if (!selectedobject) return;

  const sliceVal = Math.round(selectedobject.userData[axis]);
  const sliceCubies = cubies.filter(c => Math.round(c.userData[axis]) === sliceVal);


  const group = new THREE.Group();
  scene.add(group);
  sliceCubies.forEach(c => group.add(c));  

  const angle = (Math.PI / 2) * direction;
  if (axis === 'x') group.rotation.x = angle;
  else if (axis === 'y') group.rotation.y = angle;
  else if (axis === 'z') group.rotation.z = angle;

  group.updateMatrixWorld();
  const pos = new THREE.Vector3();
  const quat = new THREE.Quaternion();

  sliceCubies.forEach(c => {
    c.getWorldPosition(pos);
    c.getWorldQuaternion(quat);
    scene.add(c);            
    c.position.copy(pos).round();
    c.setRotationFromQuaternion(quat);

    c.userData.x = c.position.x;
    c.userData.y = c.position.y;
    c.userData.z = c.position.z;
  });

  

  scene.remove(group);
}

window.addEventListener("keydown", (event) => {
  switch (event.key.toLowerCase()) {
    case "w": rotatecube('x',  1); break;  // vertical forward
    case "s": rotatecube('x', -1); break;  // vertical backward
    case "a": rotatecube('y', -1); break;  // horizontal left
    case "d": rotatecube('y',  1); break;  // horizontal right
    case "f": rotatecube('z',  1); break;  // z-axis clockwise
    case "g": rotatecube('z', -1); break;  // z-axis counter-clockwise
  }
});

console.log("selected Objects",selectionBox)
