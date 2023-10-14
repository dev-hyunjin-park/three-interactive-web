import * as THREE from "three";

class Firework {
  constructor({ x, y }) {
    const count = 1000;
    const velocity = 10 + Math.random() * 10; // 10-20 사이 랜덤

    const particlesGeometry = new THREE.BufferGeometry();

    // 3차원 벡터 클래스를 이용한다 -> x,y,z 위치 정보
    this.particles = []; // update 함수에서도 particles 배열 값을 사용할 수 있도록 this.particles로 바꿔준다
    for (let i = 0; i < count; i++) {
      const particle = new THREE.Vector3(x, y, 0);

      particle.deltaX = THREE.MathUtils.randFloatSpread(velocity);
      // velocity가 10이라면 -5와 5 사이의 랜덤 값을 가지게 된다
      particle.deltaY = THREE.MathUtils.randFloatSpread(velocity);
      particle.deltaZ = THREE.MathUtils.randFloatSpread(velocity);

      this.particles.push(particle);
    }

    particlesGeometry.setFromPoints(this.particles);

    const textureLoader = new THREE.TextureLoader();

    const texture = textureLoader.load("./assets/textures/particle.png");

    const particlesMaterial = new THREE.PointsMaterial({
      size: 1,
      alphaMap: texture,
      transparent: true,
      depthWrite: false,
      color: new THREE.Color(Math.random(), Math.random(), Math.random()),
    });

    const points = new THREE.Points(particlesGeometry, particlesMaterial);

    this.points = points;
  }

  update() {
    const position = this.points.geometry.attributes.position;
    for (let i = 0; i < this.particles.length; i++) {
      const x = position.getX(i);
      const y = position.getY(i);
      const z = position.getZ(i);

      position.setX(i, x + this.particles[i].deltaX);
      // i번째 x좌표를 매 프레임마다 좌표 + deltaX 값으로 이동시킨다
      position.setY(i, y + this.particles[i].deltaY);
      position.setZ(i, z + this.particles[i].deltaZ);
    }

    position.needsUpdate = true;
  }
}

export default Firework;
