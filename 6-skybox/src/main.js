import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

window.addEventListener("load", function () {
  init();
});

function init() {
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
    10000 // far
  );

  // 위치를 지정하지 않으면 원점?에 놓이게 됨 -> 카메라가 담을 수 없는 상태
  camera.position.z = 5;

  /**  큐브맵 텍스쳐를 이용한 3차원 공간 표현 1 */
  // const controls = new OrbitControls(camera, renderer.domElement);
  // controls.minDistance = 5;
  // controls.maxDistance = 100;

  // const textureLoader = new THREE.TextureLoader().setPath(
  //   "assets/textures/Yokohama/"
  // );
  // const images = [
  //   "posx.jpg",
  //   "negx.jpg",
  //   "posy.jpg",
  //   "negy.jpg",
  //   "posz.jpg",
  //   "negz.jpg",
  // ];

  // const geometery = new THREE.BoxGeometry(5000, 5000, 5000);
  // const materials = images.map(
  //   (image) =>
  //     new THREE.MeshBasicMaterial({
  //       map: textureLoader.load(image),
  //       side: THREE.BackSide,
  //     })
  // );

  // const skybox = new THREE.Mesh(geometery, materials);
  // scene.add(skybox);

  /**  큐브맵 텍스쳐를 이용한 3차원 공간 표현 2 */
  new OrbitControls(camera, renderer.domElement);

  const cubeTextureLoader = new THREE.CubeTextureLoader().setPath(
    "assets/textures/Yokohama/"
  );

  const images = [
    "posx.jpg",
    "negx.jpg",
    "posy.jpg",
    "negy.jpg",
    "posz.jpg",
    "negz.jpg",
  ];

  const cubeTexture = cubeTextureLoader.load(images);
  scene.background = cubeTexture;

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
