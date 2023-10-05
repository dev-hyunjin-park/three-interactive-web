import * as THREE from "three";
// const card = new Card({ width: 2, height: 3, color: '#0077ff'... }); // 이런식으로 인스턴스 생성해서 사용한다

class Card {
  constructor({ width, height, radius, color }) {
    const x = width / 2 - radius;
    const y = height / 2 - radius;
    const shape = new THREE.Shape();

    shape
      .absarc(x, y, radius, Math.PI / 2, 0, true) // absolute arc
      .lineTo(x + radius, -y)
      .absarc(x, -y, radius, 0, -Math.PI / 2, true)
      .lineTo(-x, -(y + radius))
      .absarc(-x, -y, radius, -Math.PI / 2, Math.PI, true)
      .lineTo(-(x + radius), y, radius, Math.PI, Math.PI / 2, true)
      .absarc(-x, y, radius, Math.PI, Math.PI / 2, true);

    // 둥근 모서리를 만들어주기위해 ShapeGeometry로 변경한다
    const geometry = new THREE.ShapeGeometry(shape);

    // 평면의 색상(표면: 빛과 상호작용하여 물체의 색상, 광택, 투명도 등)을 정의한다
    const material = new THREE.MeshStandardMaterial({
      color,
      side: THREE.DoubleSide, // material은 성능상 이유로 기본적으로 한 면만 렌더링하도록 되어있다
      roughness: 0.3,
      metalness: 0.5,
    });

    // 3d mesh 객체를 생성한다 (geometry, material을 결합해서 실제 3d 객체를 생성)
    const mesh = new THREE.Mesh(geometry, material);

    this.mesh = mesh;
  }
}

export default Card;
