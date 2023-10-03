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

  const cubeGeometry = new THREE.IcosahedronGeometry(1); // 크기
  const cubeMaterial = new THREE.MeshLambertMaterial({
    color: 0x00ffff,
    emissive: 0x111111, // 자체적으로 내뿜는 색을 설정
  });
  // 빛의 영향을 받는 material 중에 성능적으로 뛰어남
  const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);

  const skeletonGeometray = new THREE.IcosahedronGeometry(2);
  const skeletonMaterial = new THREE.MeshBasicMaterial({
    wireframe: true,
    transparent: true,
    opacity: 0.2,
    color: 0xaaaaaa,
  });

  const skeleton = new THREE.Mesh(skeletonGeometray, skeletonMaterial);

  scene.add(cube, skeleton);

  // 위치를 지정하지 않으면 원점?에 놓이게 됨 -> 카메라가 담을 수 없는 상태
  camera.position.z = 5; // z만 따로 설정

  // camera.lookAt(cube.position); // 카메라가 위치에 상관없이 항상 큐브의 위치를 바라보도록 설정한다

  // 특정 방향으로 직사광선, 그림자 음영 표현
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  scene.add(directionalLight);

  const clock = new THREE.Clock();

  render(); // 아래의 render 함수 호출

  function render() {
    const elapsedTime = clock.getElapsedTime();
    cube.rotation.x = elapsedTime;
    cube.rotation.y = elapsedTime;

    skeleton.rotation.x = elapsedTime * 1.5;
    skeleton.rotation.y = elapsedTime * 1.5;

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
