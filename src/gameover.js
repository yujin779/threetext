import * as THREE from "three";
import { VOXLoader } from "three/examples/jsm/loaders/VOXLoader";
import titleVox from "../assets/vox/gameover.vox";

/**
 * gameoverシーン
 */
export class GameOver {
  constructor(scene, camera) {
    this.group = new THREE.Group();
    // groupをカメラの正面に向ける
    this.group.quaternion.copy(camera.quaternion);
    this.scene = scene;

    // リストを作成
    this.voxGroup = new THREE.Group();
    this.voxLoad(titleVox);
    this.voxGroup.position.x = 8;
    this.voxGroup.position.y = 1;
    const quaternion = new THREE.Quaternion();
    quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);

    const vector = new THREE.Vector3(1, 0, 0);
    this.voxGroup.applyQuaternion(quaternion);
    this.voxGroup.position.z = 20;
    this.group.add(this.voxGroup);

    // 物理設定のサイズをボックスで描画
    let cubeGeometry = new THREE.BoxGeometry(30, 20, 10);
    let cubeMaterial = new THREE.MeshStandardMaterial({
      color: "black",
      transparent: true,
      opacity: 0.7,
    });
    this.background = new THREE.Mesh(cubeGeometry, cubeMaterial);
    this.background.position.set(7.5, 2, 14);
    this.group.add(this.background);
    this.toTheNextScene = false;
  }

  sceneAdd() {
    this.scene.add(this.group);
  }

  sceneRemove() {
    this.scene.remove(this.group);
  }

  tick() {
    if (this.toTheNextScene) this.nextScene();
  }

  nextScene() {
    for (var i = 0; i < this.diractionList.length; i++) {
      const speed = 0.8;
      this.diractionList[i].px += this.diractionList[i].dx * speed;
      this.diractionList[i].py += this.diractionList[i].dy * speed;
      this.diractionList[i].pz += this.diractionList[i].dz * speed;
      this.dummy.position.set(
        this.diractionList[i].px,
        this.diractionList[i].py,
        this.diractionList[i].pz
      );
      this.dummy.updateMatrix();
      this.mesh.setMatrixAt(i, this.dummy.matrix);
      this.mesh.instanceMatrix.needsUpdate = true;
      this.mesh.material.opacity *= 0.99995;
    }
  }

  voxLoad(url) {
    this.diractionList = [];
    this.mesh = null;
    this.dummy = new THREE.Object3D();

    // ローダーを作成
    const loader = new VOXLoader();
    //大きさ
    const scale = 0.05;
    loader.load(url, (chunks) => {
      this.mesh = new THREE.InstancedMesh(
        new THREE.BoxBufferGeometry(scale, scale, scale),
        new THREE.MeshStandardMaterial({
          //color: color.setRGB(r, g, b),
          transparent: true,
        }),
        chunks[0].data.length / 4
      );
      this.voxGroup.add(this.mesh);
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const size = chunk.size;
        const data = chunk.data;
        let di = 0;
        for (let j = 0, k = 0; j < data.length; j += 4, k++) {
          let x = 0;
          if (data[j] >= 0) {
            x = data[j + 0] - size.x / 2;
          } else {
            x = data[j + 0] + 256 - size.x / 2;
          }
          const y = data[j + 1] - size.y / 2;
          const z = data[j + 2] - size.z / 2;
          this.dummy.position.set(x * scale, z * scale, -y * scale);
          this.dummy.updateMatrix();
          this.mesh.setMatrixAt(di++, this.dummy.matrix);
          this.diractionList.push({
            px: x * scale,
            dx: Math.random() - 0.5,
            py: z * scale,
            dy: Math.random() - 0.5,
            pz: -y * scale,
            dz: Math.random() - 0.5,
          });
        }
        this.mesh.instanceMatrix.needsUpdate = true;
      }
    });
  }
}
