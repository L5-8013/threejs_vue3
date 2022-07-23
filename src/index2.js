import * as THREE from "three";

export default class ThreeJs {
  constructor() {
    this.init();
  }

  init() {
    this.scene = new THREE.Scene();
    this.setCamera();
    this.setRenderer();
    this.setCube();
    this.animate();
  }

  setCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 5;
  }

  setRenderer() {
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);
  }

  setLight() {
    if (this.scene) {
      this.ambientLight = new THREE.AmbientLight(0xffffff); // 环境光
      this.scene.add(this.ambientLight);
    }
  }

  setCube() {
    if (this.scene) {
      const geometry = new THREE.BoxGeometry(); 
      const texture = new THREE.TextureLoader().load(
        new URL(`./assets/logo.png`, import.meta.url).href
      ); //首先，获取到纹理
      const material = new THREE.MeshBasicMaterial({ map: texture }); 
      this.mesh = new THREE.Mesh(geometry, material); 
      this.scene.add(this.mesh);
      this.render();
    }
  }

  render() {
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  animate() {
    if (this.mesh) {
      requestAnimationFrame(this.animate.bind(this));
      this.mesh.rotation.x += 0.01;
      this.mesh.rotation.y += 0.01;
      this.render();
    }
  }
}
