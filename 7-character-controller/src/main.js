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
  controls.maxPolarAngle = Math.PI / 2;

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

  spotlight.castShadow = true;
  spotlight.shadow.mapSize.width = 1024;
  spotlight.shadow.mapSize.height = 1024;
  spotlight.shadow.radius = 8;

  scene.add(spotlight);

  // 애니메이션 재생을 위한 믹서
  const mixer = new THREE.AnimationMixer(model);

  const buttons = document.querySelector(".actions");
  let currentAction;

  const combatAnimations = gltf.animations.slice(0, 4);
  const dancingAnimations = gltf.animations.slice(4);

  combatAnimations.forEach((animation) => {
    const button = document.createElement("button");
    button.innerText = animation.name;
    buttons.appendChild(button);
    button.addEventListener("click", () => {
      const previousAction = currentAction;

      currentAction = mixer.clipAction(animation);
      // 해당 애니메이션을 제어하기 위한 THREE.AnimationAction 객체를 반환

      if (previousAction !== currentAction) {
        previousAction.fadeOut(0.5); // 0.5초에 걸쳐 중지시킨다
        currentAction.reset().fadeIn(0.5).play(); // 새로운 애니메이션을 fade-in 재생
      }
    });
  });

  const hasAnimation = gltf.animations.length !== 0;

  if (hasAnimation) {
    currentAction = mixer.clipAction(gltf.animations[0]);
    currentAction.play();
  }

  const raycaster = new THREE.Raycaster();
  // 클릭 지점 (2차원 -> Vector2)
  const pointer = new THREE.Vector2();

  const clock = new THREE.Clock();

  render(); // 아래의 render 함수 호출

  function render() {
    const delta = clock.getDelta();
    mixer.update(delta);
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

  function handlePointerDown(event) {
    // pointer는 상대적 좌표 (-1 ~ 1 사이)
    pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
    pointer.y = -(event.clientY / window.innerHeight - 0.5) * 2;

    // 클릭한 지점과 카메라의 위치를 이어서 광선을 쏜다
    raycaster.setFromCamera(pointer, camera);

    // 광선이 가닿는 모든 물체를 반환한다
    const intersects = raycaster.intersectObjects(scene.children); // 교차점 정보 얻기

    // 제일 처음 광선에 맞은 물체를 가져온다
    const object = intersects[0].object;

    if (object?.name === "Ch14") {
      const previousAction = currentAction;

      const index = Math.round(Math.random() * (dancingAnimations.length - 1));

      currentAction = mixer.clipAction(dancingAnimations[index]);
      // 한 번만 재생한다
      currentAction.loop = THREE.LoopOnce;
      // 마지막 프레임에서 멈춘다
      currentAction.clampWhenFinished = true;

      // 다시 idle 상태로 돌아간다
      function handleFinished() {
        const previouseAction = currentAction;
        currentAction = mixer.clipAction(combatAnimations[0]);
        previouseAction.fadeOut(0.5);
        currentAction.reset().fadeIn(0.5).play();
      }

      mixer.addEventListener("finished", handleFinished);

      if (previousAction !== currentAction) {
        previousAction.fadeOut(0.5); // 0.5초에 걸쳐 중지시킨다
        currentAction.reset().fadeIn(0.5).play(); // 새로운 애니메이션을 fade-in 재생
      }
    }
  }

  window.addEventListener("resize", handleResize);
  window.addEventListener("pointerdown", handlePointerDown);
}
