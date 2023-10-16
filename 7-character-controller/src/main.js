import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GUI } from "lil-gui";

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
  renderer.shadowMap.enabled = true;

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
  camera.position.set(0, 5, 20);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.minDistance = 15;
  controls.maxDistance = 25;
  controls.minPolarAngle = Math.PI / 4;
  controls.maxPolarAngle = Math.PI / 3;

  const progressBar = document.querySelector("#progress-bar");
  const progressBarContainer = document.querySelector(
    "#progress-bar-container"
  );

  const loadingManager = new THREE.LoadingManager();

  loadingManager.onProgress = (url, loaded, total) => {
    progressBar.value = (loaded / total) * 100;
  };
  loadingManager.onLoad = () => {
    progressBarContainer.style.display = "none";
  };

  const gltfLoader = new GLTFLoader(loadingManager);

  const gltf = await gltfLoader.loadAsync("models/character.gltf");
  const model = gltf.scene;

  model.scale.set(0.1, 0.1, 0.1);
  model.traverse((object) => {
    if (object.isMesh) {
      object.castShadow = true;
    }
  });
  scene.add(model);
  camera.lookAt(model.position);

  // 바닥 표현
  const planeGeometry = new THREE.PlaneGeometry(10000, 10000, 10000);
  const planeMaterial = new THREE.MeshPhongMaterial({
    color: 0x000,
  });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = -7.5;
  plane.receiveShadow = true;
  scene.add(plane);

  const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x333333);
  hemisphereLight.position.set(0, 20, 10);
  scene.add(hemisphereLight);

  const spotlight = new THREE.SpotLight(
    0xffffff,
    28,
    175,
    Math.PI * 0.13,
    0.5,
    0.5
  );

  spotlight.position.set(0, 20, 0);

  scene.add(spotlight);

  spotlight.castShadow = true;
  spotlight.shadow.mapSize.width = 1024;
  spotlight.shadow.mapSize.height = 1024;
  spotlight.shadow.radius = 8;

  const spotlightFolder = gui.addFolder("Spotlight Settings");

  // Spotlight 빛의 세기 설정
  const intensityController = spotlightFolder
    .add(spotlight, "intensity", 0, 200)
    .name("Intensity");

  // Spotlight 빛의 범위 설정
  const distanceController = spotlightFolder
    .add(spotlight, "distance", 0, 200)
    .name("Distance");

  // Spotlight 빛의 각도 설정
  const angleController = spotlightFolder
    .add(spotlight, "angle", 0, Math.PI)
    .name("Angle");

  intensityController.onChange(function (value) {
    spotlight.intensity = value;
  });

  distanceController.onChange(function (value) {
    spotlight.distance = value;
  });

  angleController.onChange(function (value) {
    spotlight.angle = value;
  });

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
}
