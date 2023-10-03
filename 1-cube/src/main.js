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

  const clock = new THREE.Clock();

  render(); // 아래의 render 함수 호출

  function render() {
    // 큐브 회전 - radian 1도는 3.14 라디안
    // cube.rotation.x = THREE.MathUtils.degToRad(45); // degree to radian
    // cube.rotation.x += 0.01; // 매 프레임마다 0.01 라디안 만큼 회전시킨다
    // 대부분의 브라우저가 60fps를 지원한다고 하지만 컴퓨터나 브라우저 환경에 따라 차이가 있을 수 있음
    // --> 어떤 환경에서 보더라도 동일한 속도로 재생되도록 구성한다

    // cube.rotation.x = Date.now() / 1000;
    cube.rotation.x = clock.getElapsedTime();

    // cube.position.y = Math.sin(cube.rotation.x); // sin은 1과 -1 사이
    // cube.scale.x = Math.cos(cube.rotation.x); // x축 방향으로 큐브 사이즈를 변경

    renderer.render(scene, camera); // 새로 렌더한다
    requestAnimationFrame(render); // 재귀적으로 호출
  }

  function handleResize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    // 렌더러 사이즈에 따라 큐브의 크기도 변하게 된다
    camera.aspect = window.innerWidth / window.innerHeight;
    // 창 크기에 따라 카메라의 종횡비 설정도 업데이트 시켜준다
    camera.updateProjectionMatrix(); // 결과 반영시키기
    renderer.render(scene, camera); // render
  }

  window.addEventListener("resize", handleResize);
}
