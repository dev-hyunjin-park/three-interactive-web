import * as THREE from "three";

window.addEventListener("load", function () {
  init();
});

function init() {
  const renderer = new THREE.WebGLRenderer({
    antialias: true, // 큐브에 계단현상 없애기(매끈하지 않은 표면)
    alpha: true, // renderer 배경을 투명하게 처리한다
  });

  // 캔버스 크기 조정
  renderer.setSize(window.innerWidth, window.innerHeight);
  // renderer.setClearAlpha(0.5); //캔버스 투명도 조절
  renderer.setClearColor(0x00aaff, 0.3); // 배경색, 알파값 지정

  document.body.appendChild(renderer.domElement); // 캔버스 요소(렌더러)를 domElem에 추가해준다

  // 3d 컨텐츠를 담을 씬
  const scene = new THREE.Scene();

  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load(
    "https://images.unsplash.com/photo-1599209248411-5124adbb1da2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8c2t5JTIwdGV4dHVyZXxlbnwwfHwwfHx8MA%3D%3D&w=1000&q=80"
  );

  // scene.background = new THREE.Color(0xffaa00); // scene의 배경색 지정
  scene.background = texture;

  // 원근감을 표현할 수 있는 카메라
  const camera = new THREE.PerspectiveCamera(
    75, // 시야각(field of view)
    window.innerWidth / window.innerHeight, // 카메라 종횡비
    1, // near
    500 // far
  );

  // 위치를 지정하지 않으면 원점?에 놓이게 됨 -> 카메라가 담을 수 없는 상태
  camera.position.z = 5; // z만 따로 설정

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
