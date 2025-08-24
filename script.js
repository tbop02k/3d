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
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// 반응형 캔버스 크기 설정
function updateRendererSize() {
    const container = document.getElementById('canvas-container');
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

document.getElementById('canvas-container').appendChild(renderer.domElement);
updateRendererSize();

// 박스 그룹 생성
const boxGroup = new THREE.Group();
scene.add(boxGroup);

// 박스 본체를 5개의 면으로 생성 (위가 열린 상자)
const boxParts = new THREE.Group();

// 재질 설정
const boxMaterial = new THREE.MeshPhongMaterial({
    color: 0x3498db,
    specular: 0x111111,
    shininess: 100,
    side: THREE.DoubleSide
});

// 박스 크기
let boxWidth = 2;
let boxHeight = 1.8;
let boxDepth = 2;
const thickness = 0.05;

// 바닥
let floorGeometry = new THREE.BoxGeometry(boxWidth, thickness, boxDepth);
let floor = new THREE.Mesh(floorGeometry, boxMaterial);
floor.position.y = -boxHeight/2;
floor.castShadow = true;
floor.receiveShadow = true;
boxParts.add(floor);

// 앞면
let frontGeometry = new THREE.BoxGeometry(boxWidth, boxHeight, thickness);
let front = new THREE.Mesh(frontGeometry, boxMaterial);
front.position.z = boxDepth/2;
front.castShadow = true;
front.receiveShadow = true;
boxParts.add(front);

// 뒷면
let backGeometry = new THREE.BoxGeometry(boxWidth, boxHeight, thickness);
let back = new THREE.Mesh(backGeometry, boxMaterial);
back.position.z = -boxDepth/2;
back.castShadow = true;
back.receiveShadow = true;
boxParts.add(back);

// 왼쪽면
let leftGeometry = new THREE.BoxGeometry(thickness, boxHeight, boxDepth);
let left = new THREE.Mesh(leftGeometry, boxMaterial);
left.position.x = -boxWidth/2;
left.castShadow = true;
left.receiveShadow = true;
boxParts.add(left);

// 오른쪽면
let rightGeometry = new THREE.BoxGeometry(thickness, boxHeight, boxDepth);
let right = new THREE.Mesh(rightGeometry, boxMaterial);
right.position.x = boxWidth/2;
right.castShadow = true;
right.receiveShadow = true;
boxParts.add(right);

boxParts.position.y = -0.1;
boxGroup.add(boxParts);

// 날개(플랩) 생성
const flapMaterial = new THREE.MeshPhongMaterial({
    color: 0x5dade2,
    specular: 0x111111,
    shininess: 100,
    side: THREE.DoubleSide,
    opacity: 0.9,
    transparent: true
});

// 날개 각도 고정 (45도)
let targetFlapAngle = -45 * Math.PI / 180;

// 날개 크기 (좌우만)
let flapWidth = boxDepth / 2; // 박스 깊이의 절반
let flapHeight = boxHeight * 0.3;

// 왼쪽 날개
let leftFlapGeometry = new THREE.BoxGeometry(flapWidth, thickness, boxDepth);
let leftFlap = new THREE.Mesh(leftFlapGeometry, flapMaterial);
const leftFlapPivot = new THREE.Group();
leftFlapPivot.position.set(-boxWidth/2, boxHeight/2, 0);
leftFlap.position.x = -flapWidth/2;
leftFlapPivot.add(leftFlap);
boxParts.add(leftFlapPivot);

// 오른쪽 날개
let rightFlapGeometry = new THREE.BoxGeometry(flapWidth, thickness, boxDepth);
let rightFlap = new THREE.Mesh(rightFlapGeometry, flapMaterial);
const rightFlapPivot = new THREE.Group();
rightFlapPivot.position.set(boxWidth/2, boxHeight/2, 0);
rightFlap.position.x = flapWidth/2;
rightFlapPivot.add(rightFlap);
boxParts.add(rightFlapPivot);

// 초기 날개 각도 설정 (45도)
leftFlapPivot.rotation.z = targetFlapAngle;
rightFlapPivot.rotation.z = -targetFlapAngle;

boxParts.position.y = -0.1;
boxGroup.add(boxParts);

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
// 뚜껑을 열린 상태로 고정 (70도)
lidPivot.rotation.x = -70 * Math.PI / 180;
boxGroup.add(lidPivot);

// 전역 변수로 뚜껑 각도 저장 (고정값)
let targetLidAngle = -70 * Math.PI / 180;

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

const widthValue = document.getElementById('width-value');
const heightValue = document.getElementById('height-value');
const depthValue = document.getElementById('depth-value');

function updateBox() {
    const width = parseFloat(widthControl.value);
    const height = parseFloat(heightControl.value);
    const depth = parseFloat(depthControl.value);
    
    // 기존 박스 파츠들 제거
    floorGeometry.dispose();
    frontGeometry.dispose();
    backGeometry.dispose();
    leftGeometry.dispose();
    rightGeometry.dispose();
    leftFlapGeometry.dispose();
    rightFlapGeometry.dispose();
    lidGeometry.dispose();
    
    boxGroup.remove(boxParts);
    boxParts.clear();
    
    // 새로운 크기 설정
    boxWidth = width;
    boxHeight = height * 0.9;
    boxDepth = depth;
    
    // 바닥 재생성
    floorGeometry = new THREE.BoxGeometry(boxWidth, thickness, boxDepth);
    floor = new THREE.Mesh(floorGeometry, boxMaterial);
    floor.position.y = -boxHeight/2;
    floor.castShadow = true;
    floor.receiveShadow = true;
    boxParts.add(floor);
    
    // 앞면 재생성
    frontGeometry = new THREE.BoxGeometry(boxWidth, boxHeight, thickness);
    front = new THREE.Mesh(frontGeometry, boxMaterial);
    front.position.z = boxDepth/2;
    front.castShadow = true;
    front.receiveShadow = true;
    boxParts.add(front);
    
    // 뒷면 재생성
    backGeometry = new THREE.BoxGeometry(boxWidth, boxHeight, thickness);
    back = new THREE.Mesh(backGeometry, boxMaterial);
    back.position.z = -boxDepth/2;
    back.castShadow = true;
    back.receiveShadow = true;
    boxParts.add(back);
    
    // 왼쪽면 재생성
    leftGeometry = new THREE.BoxGeometry(thickness, boxHeight, boxDepth);
    left = new THREE.Mesh(leftGeometry, boxMaterial);
    left.position.x = -boxWidth/2;
    left.castShadow = true;
    left.receiveShadow = true;
    boxParts.add(left);
    
    // 오른쪽면 재생성
    rightGeometry = new THREE.BoxGeometry(thickness, boxHeight, boxDepth);
    right = new THREE.Mesh(rightGeometry, boxMaterial);
    right.position.x = boxWidth/2;
    right.castShadow = true;
    right.receiveShadow = true;
    boxParts.add(right);
    
    // 새로운 날개들 재생성 (좌우만)
    flapWidth = boxDepth / 2; // 박스 깊이의 절반
    flapHeight = boxHeight * 0.3;
    
    // 왼쪽 날개 재생성
    leftFlapGeometry = new THREE.BoxGeometry(flapWidth, thickness, boxDepth);
    leftFlap = new THREE.Mesh(leftFlapGeometry, flapMaterial);
    leftFlapPivot.clear();
    leftFlap.position.x = -flapWidth/2;
    leftFlapPivot.add(leftFlap);
    leftFlapPivot.position.set(-boxWidth/2, boxHeight/2, 0);
    boxParts.add(leftFlapPivot);
    
    // 오른쪽 날개 재생성
    rightFlapGeometry = new THREE.BoxGeometry(flapWidth, thickness, boxDepth);
    rightFlap = new THREE.Mesh(rightFlapGeometry, flapMaterial);
    rightFlapPivot.clear();
    rightFlap.position.x = flapWidth/2;
    rightFlapPivot.add(rightFlap);
    rightFlapPivot.position.set(boxWidth/2, boxHeight/2, 0);
    boxParts.add(rightFlapPivot);
    
    // 날개 각도 초기 설정 (45도)
    leftFlapPivot.rotation.z = targetFlapAngle;
    rightFlapPivot.rotation.z = -targetFlapAngle;
    
    boxParts.position.y = -height * 0.05;
    boxGroup.add(boxParts);
    
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
    // 뚜껑을 열린 상태로 유지
    lidPivot.rotation.x = -70 * Math.PI / 180;
    
    // 값 표시 업데이트
    widthValue.textContent = width.toFixed(1);
    heightValue.textContent = height.toFixed(1);
    depthValue.textContent = depth.toFixed(1);
    
    // 전개도 업데이트
    drawUnfoldedBox();
}

widthControl.addEventListener('input', updateBox);
heightControl.addEventListener('input', updateBox);
depthControl.addEventListener('input', updateBox);

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
    
    // 뚜껑은 고정된 각도로 유지 (애니메이션 제거)
    
    // 날개는 고정된 각도로 유지 (애니메이션 제거)
    
    // 박스 색상 애니메이션
    const time = Date.now() * 0.001;
    const hue = (Math.sin(time) + 1) * 0.5;
    boxMaterial.color.setHSL(hue, 0.7, 0.5);
    lidMaterial.color.setHSL(hue, 0.6, 0.4);
    
    renderer.render(scene, camera);
}

animate();

// 전개도 그리기 함수
const unfoldCanvas = document.getElementById('unfold-canvas');
const unfoldCtx = unfoldCanvas.getContext('2d');

function drawUnfoldedBox() {
    // 캔버스 초기화
    unfoldCtx.clearRect(0, 0, unfoldCanvas.width, unfoldCanvas.height);
    
    // 현재 박스 크기 가져오기
    const width = parseFloat(document.getElementById('width').value);
    const height = parseFloat(document.getElementById('height').value);
    const depth = parseFloat(document.getElementById('depth').value);
    
    // 스케일 계산 (화면에 맞게)
    const scale = 40;
    const w = width * scale;
    const h = height * scale;
    const d = depth * scale;
    
    // 중앙 위치 계산
    const centerX = unfoldCanvas.width / 2;
    const centerY = unfoldCanvas.height / 2;
    
    // 전개도 그리기 스타일 설정
    unfoldCtx.strokeStyle = '#333';
    unfoldCtx.lineWidth = 2;
    unfoldCtx.font = '12px Arial';
    unfoldCtx.textAlign = 'center';
    unfoldCtx.textBaseline = 'middle';
    
    // 박스 본체 전개도 (십자가 모양)
    // 바닥
    unfoldCtx.fillStyle = '#e3f2fd';
    unfoldCtx.fillRect(centerX - w/2, centerY - h/2, w, h * 0.9);
    unfoldCtx.strokeRect(centerX - w/2, centerY - h/2, w, h * 0.9);
    unfoldCtx.fillStyle = '#333';
    unfoldCtx.fillText('바닥', centerX, centerY);
    
    // 앞면
    unfoldCtx.fillStyle = '#bbdefb';
    unfoldCtx.fillRect(centerX - w/2, centerY + h * 0.4, w, d);
    unfoldCtx.strokeRect(centerX - w/2, centerY + h * 0.4, w, d);
    unfoldCtx.fillStyle = '#333';
    unfoldCtx.fillText('앞', centerX, centerY + h * 0.4 + d/2);
    
    // 뒷면
    unfoldCtx.fillStyle = '#bbdefb';
    unfoldCtx.fillRect(centerX - w/2, centerY - h/2 - d, w, d);
    unfoldCtx.strokeRect(centerX - w/2, centerY - h/2 - d, w, d);
    unfoldCtx.fillStyle = '#333';
    unfoldCtx.fillText('뒤', centerX, centerY - h/2 - d/2);
    
    // 왼쪽면
    unfoldCtx.fillStyle = '#90caf9';
    unfoldCtx.fillRect(centerX - w/2 - d, centerY - h/2, d, h * 0.9);
    unfoldCtx.strokeRect(centerX - w/2 - d, centerY - h/2, d, h * 0.9);
    unfoldCtx.save();
    unfoldCtx.translate(centerX - w/2 - d/2, centerY);
    unfoldCtx.rotate(-Math.PI/2);
    unfoldCtx.fillStyle = '#333';
    unfoldCtx.fillText('왼쪽', 0, 0);
    unfoldCtx.restore();
    
    // 오른쪽면
    unfoldCtx.fillStyle = '#90caf9';
    unfoldCtx.fillRect(centerX + w/2, centerY - h/2, d, h * 0.9);
    unfoldCtx.strokeRect(centerX + w/2, centerY - h/2, d, h * 0.9);
    unfoldCtx.save();
    unfoldCtx.translate(centerX + w/2 + d/2, centerY);
    unfoldCtx.rotate(Math.PI/2);
    unfoldCtx.fillStyle = '#333';
    unfoldCtx.fillText('오른쪽', 0, 0);
    unfoldCtx.restore();
    
    // 뚜껑 그리기 (고정 위치)
    unfoldCtx.fillStyle = 'rgba(41, 128, 185, 0.6)';
    unfoldCtx.fillRect(centerX - w * 1.05 / 2, centerY - h/2 - d - d * 1.05, w * 1.05, d * 1.05);
    unfoldCtx.strokeStyle = '#2980b9';
    unfoldCtx.lineWidth = 2;
    unfoldCtx.strokeRect(centerX - w * 1.05 / 2, centerY - h/2 - d - d * 1.05, w * 1.05, d * 1.05);
    unfoldCtx.fillStyle = '#fff';
    unfoldCtx.fillText('뚜껑', centerX, centerY - h/2 - d - d * 1.05 / 2);
    
    // 날개(플랩) 그리기 (좌우만)
    const flapW = d / 2; // 박스 깊이의 절반
    const flapH = h * 0.3;
    
    unfoldCtx.fillStyle = 'rgba(93, 173, 226, 0.7)';
    unfoldCtx.strokeStyle = '#5dade2';
    unfoldCtx.lineWidth = 1;
    unfoldCtx.setLineDash([3, 3]);
    
    // 왼쪽면 날개
    unfoldCtx.fillRect(centerX - w/2 - d - flapW, centerY - h/2, flapW, h * 0.9);
    unfoldCtx.strokeRect(centerX - w/2 - d - flapW, centerY - h/2, flapW, h * 0.9);
    unfoldCtx.save();
    unfoldCtx.translate(centerX - w/2 - d - flapW/2, centerY);
    unfoldCtx.rotate(-Math.PI/2);
    unfoldCtx.fillStyle = '#fff';
    unfoldCtx.fillText('왼쪽 날개', 0, 0);
    unfoldCtx.restore();
    
    // 오른쪽면 날개
    unfoldCtx.fillStyle = 'rgba(93, 173, 226, 0.7)';
    unfoldCtx.fillRect(centerX + w/2 + d, centerY - h/2, flapW, h * 0.9);
    unfoldCtx.strokeRect(centerX + w/2 + d, centerY - h/2, flapW, h * 0.9);
    unfoldCtx.save();
    unfoldCtx.translate(centerX + w/2 + d + flapW/2, centerY);
    unfoldCtx.rotate(Math.PI/2);
    unfoldCtx.fillStyle = '#fff';
    unfoldCtx.fillText('오른쪽 날개', 0, 0);
    unfoldCtx.restore();
    
    unfoldCtx.setLineDash([]);
    
    // 치수 표시
    unfoldCtx.strokeStyle = '#999';
    unfoldCtx.lineWidth = 1;
    unfoldCtx.setLineDash([5, 5]);
    
    // Width 표시
    unfoldCtx.beginPath();
    unfoldCtx.moveTo(centerX - w/2, centerY + h * 0.4 + d + 10);
    unfoldCtx.lineTo(centerX + w/2, centerY + h * 0.4 + d + 10);
    unfoldCtx.stroke();
    unfoldCtx.setLineDash([]);
    unfoldCtx.fillStyle = '#666';
    unfoldCtx.fillText(`W: ${width.toFixed(1)}`, centerX, centerY + h * 0.4 + d + 20);
    
    // Height 표시
    unfoldCtx.setLineDash([5, 5]);
    unfoldCtx.beginPath();
    unfoldCtx.moveTo(centerX + w/2 + d + 10, centerY - h/2);
    unfoldCtx.lineTo(centerX + w/2 + d + 10, centerY + h * 0.4);
    unfoldCtx.stroke();
    unfoldCtx.setLineDash([]);
    unfoldCtx.save();
    unfoldCtx.translate(centerX + w/2 + d + 20, centerY);
    unfoldCtx.rotate(Math.PI/2);
    unfoldCtx.fillText(`H: ${height.toFixed(1)}`, 0, 0);
    unfoldCtx.restore();
    
    // Depth 표시
    unfoldCtx.setLineDash([5, 5]);
    unfoldCtx.beginPath();
    unfoldCtx.moveTo(centerX - w/2 - d - 10, centerY - h/2);
    unfoldCtx.lineTo(centerX - w/2 - 10, centerY - h/2);
    unfoldCtx.stroke();
    unfoldCtx.setLineDash([]);
    unfoldCtx.fillText(`D: ${depth.toFixed(1)}`, centerX - w/2 - d/2, centerY - h/2 - 15);
}

// 반응형 캔버스 업데이트
function updateCanvasSize() {
    const container = document.getElementById('unfold-container');
    const canvas = document.getElementById('unfold-canvas');
    
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    canvas.width = width;
    canvas.height = height;
    
    drawUnfoldedBox();
}

// 윈도우 리사이즈 이벤트 리스너
window.addEventListener('resize', () => {
    updateRendererSize();
    updateCanvasSize();
});

// 초기 설정
updateCanvasSize();