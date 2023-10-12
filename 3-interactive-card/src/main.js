import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GUI } from "lil-gui";
import Card from "./Card";

window.addEventListener("load", function () {
  init();
});

function init() {
  const gui = new GUI();

  const COLORS = ["#ff6e6e", "#31e0c1", "#006fff", "#ffd732"];

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

  const controls = new OrbitControls(camera, renderer.domElement);

  controls.autoRotate = true;
  controls.autoRotateSpeed = 2.5;
  controls.rotateSpeed = 0.75; // default 1
  controls.enableDamping = true; // 커서를 뗐을 때 회전력 유지하려는 관성
  controls.enableZoom = false;
  controls.minPolarAngle = Math.PI / 2 - Math.PI / 3; // 수직 방향
  controls.maxPolarAngle = Math.PI / 2 + Math.PI / 3;

  const card = new Card({
    width: 10,
    height: 15.8,
    radius: 0.5,
    color: COLORS[0],
  });

  card.mesh.rotation.z = Math.PI * 0.1; // 카드 기울기 적용

  scene.add(card.mesh); // 생성된 mesh를 장면에 추가해준다

  const cardFolder = gui.addFolder("Card");

  cardFolder
    .add(card.mesh.material, "roughness")
    .min(0)
    .max(1)
    .step(0.01)
    .name("material.roughness");

  cardFolder
    .add(card.mesh.material, "metalness")
    .min(0)
    .max(1)
    .step(0.01)
    .name("material.metalness");

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  ambientLight.position.set(-5, -5, -5);
  scene.add(ambientLight);

  const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.6);
  const directionalLight2 = directionalLight1.clone();

  directionalLight1.position.set(1, 1, 3);
  directionalLight2.position.set(1, 1, -3);

  scene.add(directionalLight1, directionalLight2);

  render(); // 아래의 render 함수 호출

  function render() {
    controls.update();
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

  const container = document.querySelector(".container");
  COLORS.forEach((color) => {
    const button = document.createElement("button");
    button.style.backgroundColor = color;
    button.addEventListener("click", () => {
      card.mesh.material.color = new THREE.Color(color);
    });
    container.appendChild(button);
  });
}
