import * as THREE from "three";
import {
    FontLoader
} from "three/examples/jsm/loaders/FontLoader";
import {
    TextGeometry
} from "three/examples/jsm/geometries/TextGeometry";


export default class ThreeJs {
    constructor() {
        this.init();
    }

    init() {
        this.scene = new THREE.Scene();
        
        this.setCamera();
        this.setRenderer();
        this.setCube();
        this.setLight();
        this.render();
    }
    // 新建透视相机
    setCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.z = 10;
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
        const loader = new FontLoader();
        // new URL(`./fonts/helvetiker_bold.typeface.json`, import.meta.url).href
        loader.load(`/fonts/helvetiker_regular.typeface.json`, (res) => {
            if (this.scene) {
                const font = new TextGeometry("L5 hello", {
                    font: res,
                    size: 0.8,
                    height: 0.1,
                    curveSegments: 12,
                    bevelEnabled: true,
                    bevelThickness: 0.1,
                    bevelSize: 0.05,
                    bevelSegments: 3,
                });
                font.center();
                const material = new THREE.MeshNormalMaterial({
                    flatShading: true,
                    transparent: true,
                    opacity: 0.9,
                });
                this.mesh = new THREE.Mesh(font, material);
                this.mesh.position.set(0, 0, 0);
                this.scene.add(this.mesh);
            }
        });
    }
    render() {
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

}