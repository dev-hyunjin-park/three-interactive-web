import * as THREE from "three";
import Card from "./Card";

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

  camera.position.z = 25;

  const card = new Card({
    width: 10,
    height: 15.8,
    color: "#0077ff",
  });

  scene.add(card.mesh); // 생성된 mesh를 장면에 추가해준다

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  ambientLight.position.set(-5, -5, -5);
  scene.add(ambientLight);

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