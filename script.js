// Scene, Camera, Renderer 초기화
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x2c3e50);

const camera = new THREE.PerspectiveCamera(
    75,
    1, // 1:1 aspect ratio for 300x300
    0.1,
    1000
);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(300, 300);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('canvas-container').appendChild(renderer.domElement);

// 박스 그룹 생성
const boxGroup = new THREE.Group();
scene.add(boxGroup);

// 박스 본체 생성 (뚜껑 없는 박스)
let boxGeometry = new THREE.BoxGeometry(2, 1.8, 2);
const boxMaterial = new THREE.MeshPhongMaterial({
    color: 0x3498db,
    specular: 0x111111,
    shininess: 100
});
let boxBody = new THREE.Mesh(boxGeometry, boxMaterial);
boxBody.position.y = -0.1; // 약간 아래로 이동 (뚜껑 공간 확보)
boxBody.castShadow = true;
boxBody.receiveShadow = true;
boxGroup.add(boxBody);

// 뚜껑 생성
let lidGeometry = new THREE.BoxGeometry(2.1, 0.1, 2.1); // 약간 더 크게
const lidMaterial = new THREE.MeshPhongMaterial({
    color: 0x2980b9, // 약간 다른 색상
    specular: 0x111111,
    shininess: 100
});
let lid = new THREE.Mesh(lidGeometry, lidMaterial);
lid.castShadow = true;
lid.receiveShadow = true;

// 뚜껑 피벗 그룹 (회전 축 설정)
const lidPivot = new THREE.Group();
lidPivot.position.y = 0.85; // 박스 상단
lidPivot.position.z = -1; // 뒤쪽 가장자리
lid.position.z = 1; // 피벗에서 앞쪽으로 이동
lidPivot.add(lid);
boxGroup.add(lidPivot);

// 전역 변수로 뚜껑 각도 저장
let targetLidAngle = 0;

// 조명 추가
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 5);
directionalLight.castShadow = true;
directionalLight.shadow.camera.near = 0.1;
directionalLight.shadow.camera.far = 50;
directionalLight.shadow.camera.left = -10;
directionalLight.shadow.camera.right = 10;
directionalLight.shadow.camera.top = 10;
directionalLight.shadow.camera.bottom = -10;
scene.add(directionalLight);

const pointLight = new THREE.PointLight(0xe74c3c, 0.5, 100);
pointLight.position.set(-5, 5, 5);
scene.add(pointLight);

// 바닥 평면 추가
const planeGeometry = new THREE.PlaneGeometry(20, 20);
const planeMaterial = new THREE.MeshPhongMaterial({ 
    color: 0x1a1a1a,
    side: THREE.DoubleSide 
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
plane.position.y = -3;
plane.receiveShadow = true;
scene.add(plane);

// 마우스 컨트롤
let mouseX = 0;
let mouseY = 0;
let targetRotationX = 0;
let targetRotationY = 0;
let mouseDown = false;

document.addEventListener('mousedown', (e) => {
    mouseDown = true;
    mouseX = e.clientX;
    mouseY = e.clientY;
});

document.addEventListener('mouseup', () => {
    mouseDown = false;
});

document.addEventListener('mousemove', (e) => {
    if (!mouseDown) return;
    
    const deltaX = e.clientX - mouseX;
    const deltaY = e.clientY - mouseY;
    
    targetRotationY += deltaX * 0.01;
    targetRotationX += deltaY * 0.01;
    
    mouseX = e.clientX;
    mouseY = e.clientY;
});

// 터치 컨트롤 (모바일)
document.addEventListener('touchstart', (e) => {
    mouseDown = true;
    mouseX = e.touches[0].clientX;
    mouseY = e.touches[0].clientY;
});

document.addEventListener('touchend', () => {
    mouseDown = false;
});

document.addEventListener('touchmove', (e) => {
    if (!mouseDown) return;
    
    const deltaX = e.touches[0].clientX - mouseX;
    const deltaY = e.touches[0].clientY - mouseY;
    
    targetRotationY += deltaX * 0.01;
    targetRotationX += deltaY * 0.01;
    
    mouseX = e.touches[0].clientX;
    mouseY = e.touches[0].clientY;
});

// 마우스 휠로 줌
document.addEventListener('wheel', (e) => {
    camera.position.z += e.deltaY * 0.01;
    camera.position.z = Math.max(2, Math.min(10, camera.position.z));
});

// 폼 컨트롤 이벤트 리스너
const widthControl = document.getElementById('width');
const heightControl = document.getElementById('height');
const depthControl = document.getElementById('depth');
const lidControl = document.getElementById('lid');

const widthValue = document.getElementById('width-value');
const heightValue = document.getElementById('height-value');
const depthValue = document.getElementById('depth-value');
const lidValue = document.getElementById('lid-value');

function updateBox() {
    const width = parseFloat(widthControl.value);
    const height = parseFloat(heightControl.value);
    const depth = parseFloat(depthControl.value);
    
    // 기존 지오메트리 제거
    boxGeometry.dispose();
    lidGeometry.dispose();
    
    // 새로운 박스 본체 생성
    boxGeometry = new THREE.BoxGeometry(width, height * 0.9, depth);
    boxGroup.remove(boxBody);
    boxBody = new THREE.Mesh(boxGeometry, boxMaterial);
    boxBody.position.y = -height * 0.05;
    boxBody.castShadow = true;
    boxBody.receiveShadow = true;
    boxGroup.add(boxBody);
    
    // 새로운 뚜껑 생성
    lidGeometry = new THREE.BoxGeometry(width * 1.05, height * 0.05, depth * 1.05);
    lidPivot.remove(lid);
    lid = new THREE.Mesh(lidGeometry, lidMaterial);
    lid.castShadow = true;
    lid.receiveShadow = true;
    lid.position.z = depth / 2;
    lidPivot.add(lid);
    
    // 뚜껑 피벗 위치 조정
    lidPivot.position.y = height * 0.425;
    lidPivot.position.z = -depth / 2;
    
    // 값 표시 업데이트
    widthValue.textContent = width.toFixed(1);
    heightValue.textContent = height.toFixed(1);
    depthValue.textContent = depth.toFixed(1);
}

function updateLid() {
    const angle = parseFloat(lidControl.value);
    targetLidAngle = -angle * Math.PI / 180; // 음수로 변환 (위로 열림)
    lidValue.textContent = angle + '°';
}

widthControl.addEventListener('input', updateBox);
heightControl.addEventListener('input', updateBox);
depthControl.addEventListener('input', updateBox);
lidControl.addEventListener('input', updateLid);

// 애니메이션 루프
function animate() {
    requestAnimationFrame(animate);
    
    // 부드러운 회전 (박스 그룹 전체)
    boxGroup.rotation.x += (targetRotationX - boxGroup.rotation.x) * 0.05;
    boxGroup.rotation.y += (targetRotationY - boxGroup.rotation.y) * 0.05;
    
    // 자동 회전 (마우스 조작이 없을 때)
    if (!mouseDown) {
        targetRotationY += 0.005;
    }
    
    // 뚜껑 애니메이션
    lidPivot.rotation.x += (targetLidAngle - lidPivot.rotation.x) * 0.1;
    
    // 박스 색상 애니메이션
    const time = Date.now() * 0.001;
    const hue = (Math.sin(time) + 1) * 0.5;
    boxMaterial.color.setHSL(hue, 0.7, 0.5);
    lidMaterial.color.setHSL(hue, 0.6, 0.4);
    
    renderer.render(scene, camera);
}

animate();