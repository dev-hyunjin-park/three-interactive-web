import * as THREE from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import GUI from "lil-gui";

window.addEventListener("load", function () {
  init();
});

async function init() {
  const gui = new GUI();
  const renderer = new THREE.WebGLRenderer({
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

  // 위치를 지정하지 않으면 원점?에 놓이게 됨 -> 카메라가 담을 수 없는 상태
  camera.position.z = 5; // z만 따로 설정

  new OrbitControls(camera, renderer.domElement);

  // FONT
  const fontLoader = new FontLoader();

  const font = await fontLoader.loadAsync(
    "./assets/fonts/LOTTERIA DDAG_Regular.json"
  );

  const textGeometry = new TextGeometry("안녕 메롱 우기", {
    font,
    size: 0.5,
    height: 0.1,
  });
  const textMaterial = new THREE.MeshPhongMaterial({ color: 0x00c896 });

  const text = new THREE.Mesh(textGeometry, textMaterial);
  scene.add(text);

  // mashphoneMaterial은 빛이 없으면 보이지 않는다. ambientLight 추가
  const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  // scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0xffffff, 1);
  const pointLightHelper = new THREE.PointLightHelper(pointLight, 1);

  pointLight.position.set(3, 0, 2);
  scene.add(pointLight, pointLightHelper);

  gui.add(pointLight.position, "x").min(-3).max(3).step(0.1);

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
