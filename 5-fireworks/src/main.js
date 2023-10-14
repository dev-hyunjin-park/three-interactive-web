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
    500 // far
  );

  camera.position.z = 5;

  new OrbitControls(camera, renderer.domElement);

  const geometry = new THREE.BufferGeometry();

  const count = 10000; // 정점의 갯수

  const positions = new Float32Array(count * 3); // 정점의 위치를 담을 배열
  // 32비트 부동 소수점 숫자 배열. 각 정점의 x,y,z 좌표를 갖는 하나의 배열로 표현됨
  // 배열의 크기는 count * 3

  // 무작위로 정점의 위치를 설정
  for (let i = 0; i < count; i++) {
    // positions[i * 3] = Math.random() - 0.5; // -0.5~0.5 사이의 임의의 실수 값
    // positions[i * 3 + 1]= Math.random() - 0.5;
    // positions[i * 3 + 2]= Math.random() - 0.5;
    positions[i * 3] = THREE.MathUtils.randFloatSpread(10); // 위와 같은 값을 Three.js 내장 함수를 사용해서 구할 수 있음
    positions[i * 3 + 1] = THREE.MathUtils.randFloatSpread(10);
    positions[i * 3 + 2] = THREE.MathUtils.randFloatSpread(10);
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  // 정점 위치 데이터를 BufferGeometry의 position 속성에 할당한다
  // bufferAttribute: Three.js의 내장 클래스로, 정점 데이터를 버퍼에 저장하고 해당 버퍼를 geometry에 연결해준다
  // position 속성은 정점의 위치 정보를 나타내며, 각 정점은 3개의 값(x,y,z)를 가지고 있음을 나타낸다

  const material = new THREE.PointsMaterial({
    color: 0xccaaff,
    size: 0.01,
    // sizeAttenuation: false, // 원근에 따른 점의 크기 차이를 두지 않겠다
  });

  const points = new THREE.Points(geometry, material);

  scene.add(points);

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
