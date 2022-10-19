import * as THREE from "three";
import {
    FBXLoader
} from "three/examples/jsm/loaders/FBXLoader";
import {
    FirstPersonControls
} from 'three/examples/jsm/controls/FirstPersonControls.js';


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
        this.setHouse();
        this.setLight();
        this.setControls();
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
    async setGrass() {
        //创建平面模型
        const geometry = new THREE.PlaneGeometry(10000, 10000);
        const texture = await this.getTexture(`./img/grass.jpg`);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(100, 100);
        const grassMaterial = new THREE.MeshBasicMaterial({
            map: texture
        });
        const grass = new THREE.Mesh(geometry, grassMaterial);
        grass.rotation.x = -0.5 * Math.PI;
        this.scene.add(grass);
        this.render();
    }
    async setHouse() {
        this.house = new THREE.Group();

        // 地板
        const geometry = new THREE.PlaneGeometry(200, 300);
        const texture = await this.getTexture(`./img/wood.jpg`);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(2, 2);
        const material = new THREE.MeshBasicMaterial({
            map: texture
        });
        const floor = new THREE.Mesh(geometry, material);
        floor.rotation.x = -0.5 * Math.PI;
        floor.position.y = 1;
        floor.position.z = 150;
        this.house.add(floor);

        // 墙
        await this.createSideWall();
        const sideWall = await this.createSideWall();
        sideWall.position.z = 300;
        await this.createFrontWall();
        await this.createBackWall();


        // 房顶
        await this.createRoof();
        const roof = await this.createRoof();
        roof.rotation.x = Math.PI / 2;
        roof.rotation.y = Math.PI / 4 * 0.6;
        roof.position.y = 130;
        roof.position.x = -50;
        roof.position.z = 155;

        // 窗
        this.createWindow();
        // 门
        this.createDoor();

        // 床加载模型
        let object = await this.getLoader('obj/bed.fbx')
        object.position.x = 40;
        object.position.z = 80;
        object.position.y = 20;
        this.house.add(object);


        this.scene.add(this.house);
        this.scene.fog = new THREE.Fog(0xffffff, 10, 1500);
    }
    async createSideWall() {
        // 从一个或多个路径形状创建一个单面多边形几何模型
        const shape = new THREE.Shape();
        shape.moveTo(-100, 0);
        shape.lineTo(100, 0);
        shape.lineTo(100, 100);
        shape.lineTo(0, 150);
        shape.lineTo(-100, 100);
        shape.lineTo(-100, 0);
        const extrudeGeometry = new THREE.ExtrudeGeometry(shape);
        const texture = await this.getTexture('./img/wall.jpg');
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(0.01, 0.005);
        var material = new THREE.MeshBasicMaterial({
            map: texture
        });
        const sideWall = new THREE.Mesh(extrudeGeometry, material);
        this.house.add(sideWall);
        return sideWall;
    }
    async createFrontWall() {
        const shape = new THREE.Shape();
        shape.moveTo(-150, 0);
        shape.lineTo(150, 0);
        shape.lineTo(150, 100);
        shape.lineTo(-150, 100);
        shape.lineTo(-150, 0);
        const window = new THREE.Path();
        window.moveTo(30, 30)
        window.lineTo(80, 30)
        window.lineTo(80, 80)
        window.lineTo(30, 80);
        window.lineTo(30, 30);
        shape.holes.push(window);
        const door = new THREE.Path();
        door.moveTo(-30, 0)
        door.lineTo(-30, 80)
        door.lineTo(-80, 80)
        door.lineTo(-80, 0);
        door.lineTo(-30, 0);
        shape.holes.push(door);
        const extrudeGeometry = new THREE.ExtrudeGeometry(shape)
        const texture = await this.getTexture('./img/wall.jpg');
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(0.01, 0.005);
        const material = new THREE.MeshBasicMaterial({
            map: texture
        });
        const frontWall = new THREE.Mesh(extrudeGeometry, material);
        frontWall.position.z = 150;
        frontWall.position.x = 100;
        frontWall.rotation.y = Math.PI * 0.5;
        this.house.add(frontWall);
    }
    async createBackWall() {
        const shape = new THREE.Shape();
        shape.moveTo(-150, 0)
        shape.lineTo(150, 0)
        shape.lineTo(150, 100)
        shape.lineTo(-150, 100);

        const extrudeGeometry = new THREE.ExtrudeGeometry(shape)

        const texture = await this.getTexture('./img/wall.jpg');
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(0.01, 0.005);

        const material = new THREE.MeshBasicMaterial({
            map: texture
        });

        const backWall = new THREE.Mesh(extrudeGeometry, material);

        backWall.position.z = 150;
        backWall.position.x = -100;
        backWall.rotation.y = Math.PI * 0.5;

        this.house.add(backWall);
    }
    async createRoof() {
        const geometry = new THREE.BoxGeometry(120, 320, 10);
        const texture = await this.getTexture('./img/tile.jpg');
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(5, 1);
        texture.rotation = Math.PI / 2;
        const textureMaterial = new THREE.MeshBasicMaterial({
            map: texture
        });
        const colorMaterial = new THREE.MeshBasicMaterial({
            color: 'grey'
        });
        const materials = [
            colorMaterial,
            colorMaterial,
            colorMaterial,
            colorMaterial,
            colorMaterial,
            textureMaterial
        ];
        const roof = new THREE.Mesh(geometry, materials);
        this.house.add(roof);
        roof.rotation.x = Math.PI / 2;
        roof.rotation.y = -Math.PI / 4 * 0.6;
        roof.position.y = 130;
        roof.position.x = 50;
        roof.position.z = 155;
        return roof;
    }
    createWindow() {
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.lineTo(0, 50)
        shape.lineTo(50, 50)
        shape.lineTo(50, 0);
        shape.lineTo(0, 0);

        const hole = new THREE.Path();
        hole.moveTo(5, 5)
        hole.lineTo(5, 45)
        hole.lineTo(45, 45)
        hole.lineTo(45, 5);
        hole.lineTo(5, 5);
        shape.holes.push(hole);

        const extrudeGeometry = new THREE.ExtrudeGeometry(shape);

        var extrudeMaterial = new THREE.MeshBasicMaterial({
            color: 'silver'
        });

        var window = new THREE.Mesh(extrudeGeometry, extrudeMaterial);
        window.rotation.y = Math.PI / 2;
        window.position.y = 30;
        window.position.x = 100;
        window.position.z = 120;

        this.house.add(window);

        return window;
    }
    createDoor() {
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.lineTo(0, 80);
        shape.lineTo(50, 80);
        shape.lineTo(50, 0);
        shape.lineTo(0, 0);

        const hole = new THREE.Path();
        hole.moveTo(5, 5);
        hole.lineTo(5, 75);
        hole.lineTo(45, 75);
        hole.lineTo(45, 5);
        hole.lineTo(5, 5);
        shape.holes.push(hole);

        const extrudeGeometry = new THREE.ExtrudeGeometry(shape);

        const material = new THREE.MeshBasicMaterial({
            color: 'silver'
        });

        const door = new THREE.Mesh(extrudeGeometry, material);

        door.rotation.y = Math.PI / 2;
        door.position.y = 0;
        door.position.x = 100;
        door.position.z = 230;

        this.house.add(door);
    }

    getTexture(url) {
        return new Promise((resolve, reject) => {
            //该步骤是异步的
            new THREE.TextureLoader().load(new URL(url,import.meta.url), texture => {
                resolve && resolve(texture);
            });
        })
    }
    getLoader(url) {
        return new Promise((resolve, reject) => {
            var loader = new FBXLoader();
            loader.load(url, object => {
                resolve && resolve(object);
            });
        })
    }
    setControls() {
        //第一人称控件FirstPersonControls 可以实现使用键盘移动相机，使用鼠标控制视角

        this.firstPersonControls = new FirstPersonControls(this.camera, this.renderer.domElement);
        this.firstPersonControls.lookSpeed = 0.05; //鼠标移动查看的速度
        this.firstPersonControls.movementSpeed = 100; //相机移动速度
        this.firstPersonControls.lookVertical = false;
        // this.firstPersonControls.noFly = true
        // this.firstPersonControls.constrainVertical = true //约束垂直
        // this.firstPersonControls.verticalMin = 1.0
        // this.firstPersonControls.verticalMax = 2.0
        // this.firstPersonControls.lon = -150 //进入初始视角x轴的角度
        // this.firstPersonControls.lat = 120 //初始视角进入后y轴的角度

        // 按键说明
        //移动鼠标	往四周看
        // 方向键	向对应方向移动
        // W	向前移动
        // S	向后移动
        // A	向左移动
        // D	向右移动
        // R	向上移动
        // F	向下移动
        // Q	停止
    }
    render() {
        const delta = this.clock.getDelta() //获取自上次调用的时间差
        this.firstPersonControls.update(delta) //更新第一人称控件
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.render.bind(this))
    }

}