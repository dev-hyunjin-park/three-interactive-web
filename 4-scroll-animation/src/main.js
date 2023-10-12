import * as THREE from "three";

window.addEventListener("load", function () {
  init();
});

function init() {
  const canvas = document.querySelector("canvas");

  const renderer = new THREE.WebGLRenderer({
    antialias: true, // 큐브에 계단현상 없애기(매끈하지 않은 표면)
    alpha: true,
    canvas,
  });

  // 캔버스 크기 조정
  renderer.setSize(window.innerWidth, window.innerHeight);

  // 3d 컨텐츠를 담을 씬
  const scene = new THREE.Scene();
  // 원근감을 표현할 수 있는 카메라
  const camera = new THREE.PerspectiveCamera(
    75, // 시야각(field of view)
    window.innerWidth / window.innerHeight, // 카메라 종횡비
    1, // near
    500 // far
  );

  // 위치를 지정하지 않으면 원점?에 놓이게 됨 -> 카메라가 담을 수 없는 상태
  camera.position.set(0, 25, 150);

  const waveGeometry = new THREE.PlaneGeometry(1500, 1500, 150, 150);
  const waveMaterial = new THREE.MeshStandardMaterial({
    wireframe: true,
    color: "#00ffff",
  });

  const waveHeight = 2.5;

  // z 좌표 값을 직접 변경하는 방법
  // for (let i = 0; i < waveGeometry.attributes.position.array.length; i += 3) {
  //   waveGeometry.attributes.position.array[i + 2] +=
  //     (Math.random() - 0.5) * waveHeight;
  // }
  // setZ method 사용하는 방법
  for (let i = 0; i < waveGeometry.attributes.position.count; i++) {
    const z =
      waveGeometry.attributes.position.getZ(i) +
      (Math.random() - 0.5) * waveHeight;
    waveGeometry.attributes.position.setZ(i, z);
  }
  const wave = new THREE.Mesh(waveGeometry, waveMaterial);

  wave.rotation.x = -Math.PI / 2;

  scene.add(wave);

  const pointLight = new THREE.PointLight(0xffffff, 1);
  pointLight.position.set(15, 15, 15);
  scene.add(pointLight);

  render(); // 아래의 render 함수 호출

  function render() {
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
