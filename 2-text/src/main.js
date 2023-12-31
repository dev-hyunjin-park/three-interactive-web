import * as THREE from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import GUI from "lil-gui";

window.addEventListener("load", function () {
  init();
});

async function init() {
  const gui = new GUI();
  const renderer = new THREE.WebGLRenderer({
    antialias: true, // 큐브에 계단현상 없애기(매끈하지 않은 표면)
  });

  // shadow 설정하겠음
  renderer.shadowMap.enabled = true;

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

  camera.position.set(0, 1, 5);

  new OrbitControls(camera, renderer.domElement);

  // FONT
  const fontLoader = new FontLoader();

  const font = await fontLoader.loadAsync(
    "./assets/fonts/LOTTERIA DDAG_Regular.json"
  );

  const textGeometry = new TextGeometry("안녕 메롱 우기바보바보바보", {
    font,
    size: 0.5,
    height: 0.1,
    bevelEnabled: true,
    bevelSegments: 5,
    bevelSize: 0.02,
    bevelThickness: 0.02,
  });

  textGeometry.center();

  const textMaterial = new THREE.MeshPhongMaterial({
    shininess: 50,
    specular: new THREE.Color(0x333333),
  });
  const textureLoader = new THREE.TextureLoader().setPath("./assets/textures/"); // base path 적용
  const textTexture = textureLoader.load("holographic2.jpg");
  const spotLightTexture = textureLoader.load("gradient.jpg");

  // textureLoader는 loadAsync 쓰지 않더라도 바로 texture 인스턴스를 반환해준다
  textMaterial.map = textTexture;

  const text = new THREE.Mesh(textGeometry, textMaterial);
  text.castShadow = true;
  scene.add(text);

  // Plane: spotlight 확인을 위한 판떼기 만들기
  const planeGeometry = new THREE.PlaneGeometry(2000, 2000);
  const planeMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.position.z = -10;
  plane.receiveShadow = true;
  scene.add(plane);

  // ambientlight
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
  scene.add(ambientLight);

  // spotlight
  const spotLight = new THREE.SpotLight(
    0xffffff, // 빛의 색상
    2.5, // 강도
    30, // 거리
    Math.PI * 0.25, // 퍼지는 각도
    0.2, // 감쇠하는 정도
    0.5 // 거리에 따라 빛이 어두워지는 양
  );
  spotLight.castShadow = true;
  spotLight.shadow.mapSize.width = 1024;
  spotLight.shadow.mapSize.height = 1024;
  // 그림자를 표현할 맵의 사이즈. 디폴트 512. 2의 제곱 값
  spotLight.shadow.radius = 10;

  spotLight.position.set(0, 0, 3); // spotlight 위치
  spotLight.target.position.set(0, 0, -3); // 빛의 타겟 지점

  spotLight.map = spotLightTexture;

  scene.add(spotLight, spotLight.target);

  window.addEventListener("mousemove", (event) => {
    const x = (event.clientX / window.innerWidth - 0.5) * 5;
    const y = (event.clientY / window.innerHeight - 0.5) * -5;
    spotLight.target.position.set(x, y, -3);
  });

  // gui
  const spotLightFolder = gui.addFolder("SpotLight");
  // angle: 각도에 따라 빛이 퍼지는 정도가 달라짐
  spotLightFolder
    .add(spotLight, "angle")
    .min(0)
    .max(Math.PI / 2)
    .step(0.01);

  spotLightFolder
    .add(spotLight.position, "z")
    .min(1)
    .max(10)
    .step(0.01)
    .name("position.z");

  spotLightFolder.add(spotLight, "distance").min(1).max(30).step(0.01);

  spotLightFolder.add(spotLight, "decay").min(0).max(10).step(0.01);

  spotLightFolder.add(spotLight, "penumbra").min(0).max(1).step(0.01);

  // blur 효과 > radius
  spotLightFolder
    .add(spotLight.shadow, "radius")
    .min(1)
    .max(20)
    .step(0.01)
    .name("shodow.radius");

  // effect composer: 후처리 효과
  const composer = new EffectComposer(renderer);

  const renderPass = new RenderPass(scene, camera);

  composer.addPass(renderPass);

  const unrealBloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.2,
    1,
    0
  );

  composer.addPass(unrealBloomPass);

  const unrealBloomPassFolder = gui.addFolder("UnrealBloomPass");

  unrealBloomPassFolder
    .add(unrealBloomPass, "strength")
    .min(0)
    .max(3)
    .step(0.01);

  unrealBloomPassFolder.add(unrealBloomPass, "radius").min(0).max(1).step(0.01);

  unrealBloomPassFolder
    .add(unrealBloomPass, "threshold")
    .min(0)
    .max(1)
    .step(0.01);

  render(); // 아래의 render 함수 호출

  function render() {
    // renderer.render(scene, camera); // 새로 렌더한다
    // -> 이제 렌더러가 렌더를 진행하는 게 아닌, 컴포저를 통해 렌더링을 진행한다
    composer.render();
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
