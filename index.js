import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import CANNON from "cannon";
import Stats from "stats.js";
import { Player } from "./src/player";
import { Enemies } from "./src/enemies";
import { Floor } from "./src/floor";
import { CannonPhysics } from "./src/cannonPhysics";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Opening } from "./src/opening";
import { GameOver } from "./src/gameover";

import dino from "./assets/gltf/dino.glb";

export const SCENE = {
  Opening: 0,
  Playing: 1,
  GameOver: 2,
};

class Jumper {
  constructor() {
    this.init = this.init.bind(this);
    this.animate = this.animate.bind(this);
    this.onWindowResize = this.onWindowResize.bind(this);
    this.gameScene = SCENE.Opening;

    this.init();
    this.scoreText = document.getElementById("score");
    this.score = 0;
    this.count = 0;
    this.runningSpeed = 0.15;
    // 灯りを設置
    this.defaultLigts();
    //物理計算
    this.cannonPhysics = new CannonPhysics(-30);
    this.jumpPower = 25;
    //床のオブジェクト
    this.floor = new Floor(
      this.scene,
      this.cannonPhysics,
      [500, 0.5, 50],
      [0, 0, 0]
    );
    //glTFの読み込み
    this.loader = new GLTFLoader();
    //Openingシーン
    this.opening = new Opening(this.scene, this.camera);
    //Gameoverシーン
    this.gameOver = new GameOver(this.scene, this.camera);
    this.setPlayerObjects();
    this.enemies = new Enemies(this.scene, this.cannonPhysics);
    this.score = 0;
    this.scoreText = document.getElementById("score");
    this.count = 0;
    this.runningSpeed = 0.15;

    console.log("player", this.player);
    // クリック挙動設定
    this.click = () => {
      switch (this.gameScene) {
        case SCENE.Opening:
          this.opening.toTheNextScene = true;
          this.opening.background.material.opacity = 0;
          break;
        case SCENE.Playing:
          if (this.player.landing) {
            this.player.phyBox.applyImpulse(
              new CANNON.Vec3(0, this.jumpPower, 0),
              new CANNON.Vec3(0, 0, 0)
            );
            this.player.landing = false;
          }
          break;
        case SCENE.GameOver:
          // console.log("gameover");
          this.resetData();
          this.player.toTheNextScene = false;
          this.gameOver.sceneRemove();
          this.gameScene = SCENE.Playing;
          break;
        default:
          console.log("scene is default");
      }
    };
    // クリック
    this.canvas.addEventListener("click", this.click);
  }

  resetData() {
    this.score = 0;
    this.count = 0;
    this.runningSpeed = 0.2;
    this.player.initPosition();
    this.enemies.reset();
  }

  /**
   * GLTFLoader
   */
  gltfLoad(url) {
    return new Promise((resolve) => {
      this.loader.load(url, (data) => {
        data.scene.traverse(function (node) {
          if (node.isMesh) {
            node.castShadow = true;
          }
        });
        resolve(data);
      });
    });
  }

  /**
   * プレイヤーを設置
   */
  setPlayerObjects() {
    // プレイヤー
    this.gltfLoad(dino)
      .then((value) => {
        this.player = new Player(
          this.canvas,
          this.scene,
          this.cannonPhysics,
          value
        );
      })
      .catch((error) => {
        console.error(error);
      });
  }

  /**
   * 灯り
   */
  defaultLigts() {
    const light = new THREE.DirectionalLight(0xffffff, 0.75);
    light.intensity = 1; // 光の強さ
    light.position.set(1.5, 3, 2.5);
    this.scene.add(light);
    const hemiLight = new THREE.HemisphereLight(0x888888, 0x000000, 1);
    this.scene.add(hemiLight);
    const pointLight = new THREE.SpotLight(
      0xaaaaaa,
      0.5,
      0,
      Math.PI / 4,
      10,
      0.5
    );
    pointLight.position.set(10, 150, -10);
    pointLight.castShadow = true;
    pointLight.shadow.mapSize.width = 2048;
    pointLight.shadow.mapSize.height = 2048;
    this.scene.add(pointLight);
    //座標軸を表示 x=red y=green z=blue
    // var axis = new THREE.AxesHelper(1000);
    // this.scene.add(axis);
  }

  /**
   * 初期設定
   */
  init() {
    this.aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(50, this.aspect, 1, 130);
    this.camera.position.set(-15, 12, 30);
    // this.camera.position.set(-15, 60, 60);
    // this.camera.position.set(0, 30, 0);
    this.camera.lookAt(new THREE.Vector3(10, 0, 0));

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color("#191919");
    this.canvas = document.querySelector("#app");
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      // powerPreference: "high-performance",
      antialias: true,
    });
    this.renderer.shadowMap.enabled = true;
    // this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    document.body.appendChild(this.renderer.domElement);
    window.addEventListener("resize", this.onWindowResize);

    this.stats = new Stats();
    document.body.appendChild(this.stats.dom);

    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.render(this.scene, this.camera);
    this.renderer.setAnimationLoop(this.animate);
  }

  /**
   * フレームごとに実行
   */
  animate() {
    this.stats.begin();

    switch (this.gameScene) {
      case SCENE.Opening:
        this.opening.tick();
        if (this.opening.mesh === null) break;
        if (this.opening.mesh.material.opacity < 0.05) {
          this.opening.mesh.material.opacity = 0;
          this.gameScene = SCENE.Playing;
          this.opening = null;
        }
        break;
      case SCENE.Playing:
        // console.log("playingnext", this.player.toTheNextScene);
        if (this.player && this.enemies) {
          this.cannonPhysics.world.step(1 / (9 / this.runningSpeed));
          this.count++;
          if (this.count % 300 === 0) this.runningSpeed += 0.01;
          this.player.tick();
          this.score += this.runningSpeed;
          this.scoreText.innerHTML = "SCORE " + Math.floor(this.score);
          this.enemies.tick(this.runningSpeed);
          if (this.player.toTheNextScene) {
            this.gameScene = SCENE.GameOver;
            this.gameOver.sceneAdd();
          }
        }

        break;
      case SCENE.GameOver:
        break;
      default:
    }

    // this.controls.update();
    this.renderer.render(this.scene, this.camera);

    this.stats.end();
  }

  /**
   * ウィンドウサイズ変更時にcanvasサイズ変更
   */
  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

new Jumper();
