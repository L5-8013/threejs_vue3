import * as THREE from "three";
import {
    FontLoader
} from "three/examples/jsm/loaders/FontLoader";
import {
    TextGeometry
} from "three/examples/jsm/geometries/TextGeometry";


export default class ThreeJs {
    constructor(item) {
        this.init(item);
    }

    init(item) {
        this.scene = new THREE.Scene();
        this.clock = new THREE.Clock();
        this.setCamera();
        this.setRenderer(item);
        this.setGrass();
        this.setLight();
        this.render();
    }
    // 新建透视相机
    setCamera() {
        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        // this.camera.position.z = 10;
        this.camera.position.set(500, 60, 0)
        this.camera.lookAt(this.scene.position);
    }
    setRenderer(item) {
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0xcce0ff, 1);
        item.appendChild(this.renderer.domElement);
    }
    setLight() {
        this.ambientLight = new THREE.AmbientLight(0xCCCCCC);
        this.scene.add(this.ambientLight);
    }
    setGrass() {
        // const geometry = new THREE.BoxGeometry(); 
        //创建平面模型
        const geometry = new THREE.PlaneGeometry( 10000, 10000);
        new THREE.TextureLoader().load(new URL(`./img/grass.jpg`, import.meta.url).href,(texture)=>{
            //要在回调里使用
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set( 100, 100 );
            const grassMaterial = new THREE.MeshBasicMaterial({map: texture});
            const grass = new THREE.Mesh( geometry, grassMaterial );
            grass.rotation.x = -0.5 * Math.PI;
            this.scene.add(grass);
            this.render();
        });
        
    }
    setHouse(){
        const house = new THREE.Group();
    }
    render() {
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

}