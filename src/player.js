import * as THREE from "three";
import CANNON from "cannon";

export class Player {
  constructor(canvas, scene, cannonPhysics, gltf) {
    this.group = new THREE.Group();
    // 着地判定
    this.landing = false;
    this.canvas = canvas;
    this.object = gltf.scene;
    this.object.position.y = -1.1;
    this.object.position.x = -0.3;
    this.group.add(this.object);

    //物理設定ボックスのサイズ
    const args = [1.6, 2.3, 2];

    // 物理設定
    var mass = 1;
    var shape = new CANNON.Box(
      new CANNON.Vec3(args[0] / 2, args[1] / 2, args[2] / 2)
    );
    this.phyBox = new CANNON.Body({ mass, shape });
    this.phyBox.fixedRotation = true;
    this.phyBox.name = "player";
    this.initPosition();
    cannonPhysics.world.add(this.phyBox);

    // 物理設定のサイズをボックスで描画
    let cubeGeometry = new THREE.BoxGeometry(args[0], args[1], args[2]);
    let cubeMaterial = new THREE.MeshStandardMaterial({
      color: "green",
      transparent: true,
      opacity: 0.3,
      // コライダーを非表示
      // visible: false,
    });
    let cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    // cube.castShadow = true;
    this.group.add(cube);
    scene.add(this.group);
    this.toTheNextScene = false;

    // 当たり判定
    this.phyBox.addEventListener("collide", (e) => {
      // console.log(e.contact);
      if (e.contact.bi.name === "floor") this.landing = true;
      if (e.contact.bi.name === "enemy" || e.contact.bj.name === "enemy")
        this.toTheNextScene = true;
    });
  }

  initPosition() {
    this.phyBox.position.y = 1.5;
    this.group.position.copy(this.phyBox.position);
    this.group.quaternion.copy(this.phyBox.quaternion);
  }

  tick() {
    if (this.object === undefined) return;
    // 角度とxポジションを固定
    this.phyBox.quaternion = new CANNON.Quaternion(0, 0, 0, 1);
    this.phyBox.position.x = 0;
    this.phyBox.position.z = 0;

    // 物理更新
    this.group.position.copy(this.phyBox.position);
    this.group.quaternion.copy(this.phyBox.quaternion);
  }
}
