import * as THREE from "three";
import Firework from "./firework";

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

  camera.position.z = 8000;

  // 폭죽이 생성될 때마다 추가 -> 클릭시 업데이트 메서드 호출 용
  const fireworks = [];
  fireworks.update = function () {
    for (let i = 0; i < this.length; i++) {
      const firework = fireworks[i];

      firework.update();
    }
  };

  const firework = new Firework({ x: 0, y: 0 });
  scene.add(firework.points);
  fireworks.push(firework);

  render(); // 아래의 render 함수 호출

  function render() {
    fireworks.update();
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

  function handleMouseDown() {
    const firework = new Firework({
      x: THREE.MathUtils.randFloatSpread(8000), // -4000 ~ 4000 사이 랜덤
      y: THREE.MathUtils.randFloatSpread(8000),
    });

    scene.add(firework.points);
    fireworks.push(firework);
  }

  window.addEventListener("mousedown", handleMouseDown);
}
