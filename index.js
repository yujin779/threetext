import * as THREE from "three";

class Jumper {
  constructor() {
    this.init = this.init.bind(this);
    this.animate = this.animate.bind(this);
    this.onWindowResize = this.onWindowResize.bind(this);

    this.init();

    // 灯りを設置
    this.defaultLigts();
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
      antialias: true
    });
    this.renderer.shadowMap.enabled = true;
    // this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    document.body.appendChild(this.renderer.domElement);
    window.addEventListener("resize", this.onWindowResize);

    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.render(this.scene, this.camera);
    this.renderer.setAnimationLoop(this.animate);
  }

  /**
   * フレームごとに実行
   */
  animate() {
    // this.controls.update();
    this.renderer.render(this.scene, this.camera);
    // console.log?"a")
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
