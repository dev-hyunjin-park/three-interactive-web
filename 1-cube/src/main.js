import * as THREE from "three";

window.addEventListener("load", function () {
  init();
});

function init() {
  const renderer = new THREE.WebGLRenderer({
    // alpha: true, // 기본 배경화면 없애기
    antialias: true, // 큐브에 계단현상 없애기(매끈하지 않은 표면)
  });

  // 캔버스 크기 조정
  renderer.setSize(window.innerWidth, window.innerHeight);

  document.body.appendChild(renderer.domElement); // 캔버스 요소(렌더러)를 domElem에 추가해준다
  // 3d 컨텐츠를 담을 씬
  const scene = new THREE.Scene();
  // 원근감을 표현할 수 있는 카메라
  const camera = new THREE.PerspectiveCamera(
    75, // 시야각(field of view)
    window.innerWidth / window.innerHeight, // 카메라 종횡비
    1, // near
    500 // far
  );

  const geometry = new THREE.BoxGeometry(2, 2, 2); // 크기
  // const material = new THREE.MeshBasicMaterial({ color: 0xcc99ff });
  // MeshBasicMaterial은 조명에 영향을 받지 않는다
  const material = new THREE.MeshStandardMaterial({ color: 0xcc99ff });

  const cube = new THREE.Mesh(geometry, material);

  scene.add(cube);
  // 위치를 지정하지 않으면 원점?에 놓이게 됨 -> 카메라가 담을 수 없는 상태
  // camera.position.z = 5; // z만 따로 설정
  camera.position.set(3, 4, 5); // x, y, z

  camera.lookAt(cube.position); // 카메라가 위치에 상관없이 항상 큐브의 위치를 바라보도록 설정한다

  // 특정 방향으로 직사광선, 그림자 음영 표현
  const directionalLight = new THREE.DirectionalLight(0xf0f0f0, 1);
  directionalLight.position.set(-1, 2, 3);
  scene.add(directionalLight);

  // 그림자 밝기 조정
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
  ambientLight.position.set(3, 2, 1);
  scene.add(ambientLight);

  renderer.render(scene, camera);
}
