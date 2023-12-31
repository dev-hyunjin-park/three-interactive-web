import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GUI } from "lil-gui";

window.addEventListener("load", function () {
  init();
});

async function init() {
  gsap.registerPlugin(ScrollTrigger);

  const params = {
    waveColor: "#00ffff",
    backgroundColor: "#ffffff",
    fogColor: "#f0f0f0",
  };

  const gui = new GUI();
  gui.hide();

  const canvas = document.querySelector("canvas");

  const renderer = new THREE.WebGLRenderer({
    antialias: true, // 큐브에 계단현상 없애기(매끈하지 않은 표면)
    alpha: true,
    canvas,
  });

  renderer.shadowMap.enabled = true;

  // 캔버스 크기 조정
  renderer.setSize(window.innerWidth, window.innerHeight);

  // 3d 컨텐츠를 담을 씬
  const scene = new THREE.Scene();

  // 안개 효과
  scene.fog = new THREE.Fog(0xf0f0f0, 0.1, 500);

  // scene.fog = new THREE.FogExp2(0xf0f0f0, 0.005);
  // 카메라에서부터 멀어질 수록 기하급수적으로 짙어짐 >> 현실적인 느낌의 안개

  // gui.add(scene.fog, "near").min(0).max(100).step(0.01);
  // gui.add(scene.fog, "far").min(100).max(500).step(0.1);

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
    // wireframe: true,
    color: params.waveColor,
  });

  const waveHeight = 2.5;
  const initialZPositions = [];

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
    initialZPositions.push(z);
  }
  const wave = new THREE.Mesh(waveGeometry, waveMaterial);

  wave.rotation.x = -Math.PI / 2;
  wave.receiveShadow = true;

  wave.update = function () {
    const elapsedTime = clock.getElapsedTime();

    for (let i = 0; i < waveGeometry.attributes.position.count; i++) {
      const z =
        initialZPositions[i] + Math.sin(elapsedTime * 3 + i ** 2) * waveHeight;
      waveGeometry.attributes.position.setZ(i, z);
      // 각 정점마다 시간이 흐르는 속도를 모두 다르게 해주면 파도의 높낮이가 서로 다르게 표현된다
      // 불규칙성을 위해 i의 거듭제곱의 형태로 곱해준다
    }
    waveGeometry.attributes.position.needsUpdate = true; // update 좌표를 알려준다
  };

  scene.add(wave);

  const gltfLoader = new GLTFLoader();

  const gltf = await gltfLoader.loadAsync("./models/ship/scene.gltf");
  const ship = gltf.scene;

  ship.castShadow = true;
  ship.traverse((object) => {
    if (object.isMesh) {
      object.castShadow = true;
    }
  });

  ship.rotation.y = Math.PI;
  ship.scale.set(40, 40, 40); // 40배

  // ship에도 애니메이션을 선언해준다
  ship.update = function () {
    const elapsedTime = clock.getElapsedTime();
    ship.position.y = Math.sin(elapsedTime * 3);
  };
  scene.add(ship);

  const pointLight = new THREE.PointLight(0xffffff, 1);

  pointLight.castShadow = true;
  pointLight.shadow.mapSize.width = 1024; // 그림자 맵의 해상도
  pointLight.shadow.mapSize.height = 1024; // 그림자 맵의 높이
  pointLight.shadow.radius = 10; // blur

  pointLight.position.set(15, 15, 15);
  scene.add(pointLight);

  const directionLight = new THREE.DirectionalLight(0xffffff, 0.8);

  directionLight.castShadow = true;
  directionLight.shadow.mapSize.width = 1024;
  directionLight.shadow.mapSize.height = 1024;
  directionLight.shadow.radius = 10;

  directionLight.position.set(-15, 15, 15);
  scene.add(directionLight);

  const clock = new THREE.Clock();

  render(); // 아래의 render 함수 호출

  function render() {
    wave.update();
    ship.update();

    camera.lookAt(ship.position); // 카메라가 항상 배의 위치를 바라보도록 고정시킨다

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

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: ".wrapper",
      start: "top top",
      end: "bottom bottom", // 애니메이션이 끝나는 시점
      markers: true, // 브라우저 상단에서 트리거 요소 확인
      scrub: true,
    },
  });

  tl.to(params, {
    waveColor: "#4268ff",
    onUpdate: () => {
      waveMaterial.color = new THREE.Color(params.waveColor);
    },
    duration: 1.5,
  })
    .to(
      params,
      {
        backgroundColor: "#2a2a2a",
        onUpdate: () => {
          scene.background = new THREE.Color(params.backgroundColor);
        },
        duration: 1.5,
      },
      "<"
    )
    .to(
      params,
      {
        fogColor: "#2f2f2f",
        onUpdate: () => {
          scene.fog.color = new THREE.Color(params.fogColor);
        },
        duration: 2.5,
      },
      "<" // 이전 애니메이션이 시작되는 시점에 안개 색상도 함께 변경시키겠다
    )
    .to(camera.position, {
      x: 100,
      z: -50,
      duration: 2,
    })
    .to(ship.position, {
      z: 150,
      duration: 2,
    })
    .to(camera.position, {
      x: 0,
      y: 50,
      z: 300,
      duration: 2,
    });

  gsap.to(".title", {
    opacity: 0,
    scrollTrigger: {
      trigger: ".wrapper",
      scrub: true,
      pin: true, // 위치 고정
      end: "+=1000", // 현재 스크롤 위치에서 1000 단위만큼 떨어진 위치까지 스크롤해야 트리거가 종료
    },
  });
}
