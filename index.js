window.addEventListener("DOMContentLoaded", init);

function init() {
  const width = 960;
  const height = 540;

  // レンダラーを作成
  // レンダラーを作成
  const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector("#app"),
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);

  // シーンを作成
  const scene = new THREE.Scene();

  // カメラを作成
  const camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
  camera.position.set(0, 0, +1000);

  // 箱を作成
  const geometry = new THREE.BoxGeometry(300, 500, 500);
  const material = new THREE.MeshStandardMaterial({
    color: 0x00aaff,
  });
  const box = new THREE.Mesh(geometry, material);
  scene.add(box);

  // 平行光源
  const directionalLight = new THREE.DirectionalLight(0xffffff);
  directionalLight.position.set(1, 1, 1);
  // シーンに追加
  scene.add(directionalLight);

  // 初回実行
  renderer.render(scene, camera);

  // 初回実行
  tick();

  function tick() {
    requestAnimationFrame(tick);

    // 箱を回転させる
    box.rotation.x += 0.01;
    box.rotation.y += 0.01;

    // レンダリング
    renderer.render(scene, camera);
  }
}
