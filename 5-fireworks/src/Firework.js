import * as THREE from "three";

class Firework {
  constructor({ x, y }) {
    const count = 1000;

    const particlesGeometry = new THREE.BufferGeometry();

    // 3차원 벡터 클래스를 이용한다 -> x,y,z 위치 정보
    const particles = [];
    for (let i = 0; i < count; i++) {
      const particle = new THREE.Vector3(x, y, 0);

      particles.push(particle);
    }

    particlesGeometry.setFromPoints(particles);

    const textureLoader = new THREE.TextureLoader();

    const texture = textureLoader.load("./assets/textures/particle.png");

    const particlesMaterial = new THREE.PointsMaterial({
      size: 1,
      alphaMap: texture,
      transparent: true,
      depthWrite: false,
    });

    const points = new THREE.Points(particlesGeometry, particlesMaterial);

    this.points = points;
  }
}

export default Firework;
