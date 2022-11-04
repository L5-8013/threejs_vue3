import * as THREE from "three";
import {
    FBXLoader
} from "three/examples/jsm/loaders/FBXLoader";
import {
    TextGeometry
} from "three/examples/jsm/geometries/TextGeometry";
import {
    FirstPersonControls
} from 'three/examples/jsm/controls/FirstPersonControls.js';
import {
    GLTFLoader
} from 'three/examples/jsm/loaders/GLTFLoader.js'
//加载glb模型
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";

// 界面控制器
import TouchControls from "@/tool/controls/TouchControls.js";

export default class ThreeJs {
    constructor(item) {
        this.init(item);
    }

    init(item) {
        this.geometrys = [];
        this.stateList ={};
        this.previousAction = null; // 当前动作
        this.currentAction = null;// 传入动作
        this.direction={};
        this.moveSpeed=1;
        this.cameraSpeed=0.01;
        this.author=null;
        this.controls=null;




        this.scene = new THREE.Scene();
        this.clock = new THREE.Clock();
        this.raycaster = new THREE.Raycaster();
        this.setCamera();
        this.setRenderer(item);
        this.setGrass();
        this.setHouse();
        this.setLight();
        this.setOther();
        // this.initControl(item);
        this.setControls();
        
        this.setClick(item);
        this.setText();
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
        // this.camera.position.set(500, 60, 0)
        this.camera.position.set(0, 50, 200)
        // this.camera.lookAt(this.scene.position);
    }
    setRenderer(item) {
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0xcce0ff, 1);
        item.appendChild(this.renderer.domElement);
    }
    setLight() {
        // 环境光
        this.ambientLight = new THREE.AmbientLight(0xCCCCCC);
        this.scene.add(this.ambientLight);

        //设置点光源位置，改变光源的位置
        let point = new THREE.PointLight(0xffffff,5,0);
        point.position.set(-50, 100, 100);
        this.scene.add(point);
        //点光源辅助器
        var sphereSize = 5;
        let pointLightHelper = new THREE.PointLightHelper( point, sphereSize );
        this.scene.add(pointLightHelper);
        

    }
    setHelper(){
        // 法线  旧版叫 THREE.AxesHelper  新版叫THREE.AxisHelper()
        var axisHelper = new THREE.AxesHelper( 500 );
        this.scene.add( axisHelper );
        // 网格线
        let size = 20000;
        let step = 10;

        let gridHelper = new THREE.GridHelper( size, step );
        this.scene.add( gridHelper );

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
        object.name = '完美'
        // this.geometrys.push(object)

        this.house.add(object);

        this.scene.add(this.house);
        this.scene.fog = new THREE.Fog(0xffffff, 10, 1500);
    }
    async setOther() {
        const loader = new GLTFLoader()
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath("./draco/"); // 设置public下的解码路径，注意最后面的/
        dracoLoader.setDecoderConfig({ type: "js" });
        dracoLoader.preload();
        loader.setDRACOLoader(dracoLoader);
        loader.load(`obj/ironman/scene.gltf`, model => {
            console.log('ironman',model)
            model.scene.children[0].scale.set(50, 50, 50)
            model.scene.children[0].position.z = 10
            model.scene.children[0].position.x = -30
            // this.geometrys.push(model.scene.children[0])
            this.scene.add(model.scene.children[0])
        });
        loader.load('obj/man.glb',gltf =>{
            console.log("man", gltf);
            const model = gltf.scene;
            this.mixer = new THREE.AnimationMixer(model);
            
            this.stateList.Standing = this.mixer.clipAction(gltf.animations[0]); // idle
            this.stateList.Walking = this.mixer.clipAction(gltf.animations[15]); // walk
            this.stateList.Jumping = this.mixer.clipAction(gltf.animations[3]); // run
            this.stateList.TurnLeft = this.mixer.clipAction(gltf.animations[22]); // left
            this.stateList.TurnRight = this.mixer.clipAction(gltf.animations[23]); // right


            this.stateList.Standing.play()

            this.currentAction = this.stateList.Standing;

            model.name = "man";
            // model.position.set(300, 0, 0);
            model.scale.set(20, 20, 20);

            this.author=model;
            model.re
            this.scene.add(model);
            console.log(this.scene)
        })
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
            new THREE.TextureLoader().load(new URL(url,
                import.meta.url), texture => {
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
        // //第一人称控件FirstPersonControls 可以实现使用键盘移动相机，使用鼠标控制视角
        // this.firstPersonControls = new FirstPersonControls(this.camera, this.renderer.domElement);
        // this.firstPersonControls.lookSpeed = 0.1; //鼠标移动查看的速度
        // this.firstPersonControls.movementSpeed = 200; //相机移动速度
        // this.firstPersonControls.lookVertical = false;
        // // this.firstPersonControls.noFly = true
        // // this.firstPersonControls.constrainVertical = true //约束垂直
        // // this.firstPersonControls.verticalMin = 1.0
        // // this.firstPersonControls.verticalMax = 2.0
        // // this.firstPersonControls.lon = -150 //进入初始视角x轴的角度
        // // this.firstPersonControls.lat = 120 //初始视角进入后y轴的角度

        // // 按键说明
        // //移动鼠标	往四周看
        // // 方向键	向对应方向移动
        // // W	向前移动
        // // S	向后移动
        // // A	向左移动
        // // D	向右移动
        // // R	向上移动
        // // F	向下移动
        // // Q	停止

        // 自定义按键
        const keyFun = (key,bool)=>{
            switch(key){
                case 87:
                this.direction.top = bool
                break
                case 65:
                this.direction.left = bool
                break
                case 83:
                this.direction.down = bool
                break
                case 68:
                this.direction.right = bool
                break
                case 69:
                this.direction.cright = bool
                break
                case 81:
                this.direction.cleft = bool
                break
            }
        }
        document.addEventListener("keydown", (event)=>{
            keyFun(event.keyCode,true)
        }, false);
        document.addEventListener("keyup", (event)=>{
            keyFun(event.keyCode,false)
        }, false);
    }
    initControl(item){
        //   第一人称锁定控制
        // Controls
        let options = {
            delta: 0.75, // coefficient of movement
            moveSpeed: 0.2, // speed of movement
            rotationSpeed: 0.005, // coefficient of rotation
            maxPitch: 0, // max camera pitch angle
            hitTest: true, // stop on hitting objects
            hitTestDistance: 5, // distance to test for hit
        };
        this.controls = new TouchControls(
            item.parentNode,
            this.camera,
            options,
            this.author
        );
        this.controls.setPosition(0, 3, 0);
        this.controls.addToScene(this.scene);
    }
    setClick(item) {
        let _this = this;
        let intersects = []; //几何体合集
        const pointer = new THREE.Vector2();
        let raycaster = new THREE.Raycaster();
        let getBoundingClientRect = item.getBoundingClientRect()
        // console.log('相机',this.camera.matrixWorld)
        document.addEventListener('click', function (event) {

            pointer.x = ((event.clientX - getBoundingClientRect.left) / item.offsetWidth) * 2 - 1;
            pointer.y = -((event.clientY - getBoundingClientRect.top) / item.offsetHeight) * 2 + 1;
            // 这种情况是对全屏来计算的
            // pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
            // pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(pointer, _this.camera);
            //geometrys为需要监听的Mesh合集，可以通过这个集合来过滤掉不需要监听的元素例如地面天空
            //true为不拾取子对象
            intersects = raycaster.intersectObjects(_this.geometrys, true);
            //被射线穿过的几何体为一个集合，越排在前面说明其位置离端点越近，所以直接取[0]
            if (intersects.length > 0) {
                //alert(intersects[0].object.name);
                console.log(intersects[0].object);
                for ( var i = 0; i < intersects.length; i++ ) {

                    intersects[i].object.material.color.set(0xff0000);
                
                }

            } else {
                //若没有几何体被监听到，可以做一些取消操作
            }
            
        }, false);
        // this.checkRaycaster()
    }
    setText() {

        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');
        ctx.fillStyle = "rgb(255,0,0)";
        ctx.font = "bolder 16px Arial ";

        ctx.fillText("小杜的房间", 0, 16);
        ctx.globalAlpha = 1;

        /// canvas画布对象作为CanvasTexture的参数重建一个纹理对象
        // canvas画布可以理解为一张图片
        let texture = new THREE.CanvasTexture(canvas);
        let spriteMaterial = new THREE.SpriteMaterial({
            map: texture, //设置精灵纹理贴图
            transparent:true,//开启透明(纹理图片png有透明信息)
        });

        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(100, 100, 1); 
        this.geometrys.push(sprite)
        sprite.position.x = 200;
        sprite.position.y = 30;
        this.scene.add(sprite);
    }
    checkRaycaster(){
        const raycaster=new THREE.Raycaster()
        //射线原点
        const rayOrigin =this.camera.position.clone();
        console.log(rayOrigin)
        //射线方向
        const rayDirection =new THREE.Vector3(0,100,300)
        // //将该向量的方向设置为和原向量相同，但是其长度
        var direction = rayDirection.sub(rayOrigin).normalize()
        console.log(direction)
        raycaster.set(rayOrigin, direction)
        raycaster.far=210;
        const intersect=raycaster.intersectObject(this.scene.children,true)
        // console.log(intersect)
    }
    updateCamera(){
        // 键盘上下左右键控制相机向前后左右运动

        if (this.direction.top) {
            this.camera.translateZ(-this.moveSpeed)
            this.animation('Walking')
        }
        if (this.direction.down) {
            this.camera.translateZ(this.moveSpeed)
            this.animation('Jumping')
        }
        if (this.direction.left) {
            this.camera.translateX(-this.moveSpeed)
            this.animation('TurnLeft')
        }
        if (this.direction.right) {
            this.camera.translateX(this.moveSpeed);
            this.animation('TurnRight')
        }
        // 相机左右旋转
        if (this.direction.cleft) {
            this.camera.rotateY(this.cameraSpeed);
        }
        if (this.direction.cright) {
            this.camera.rotateY(-this.cameraSpeed);
        }


        if(!this.direction.top && !this.direction.down && !this.direction.left && !this.direction.left && !this.direction.right){
            this.animation('Standing')
        }

    }
    animation(name){
        this.previousAction = this.currentAction;
        // 传入动作
        this.currentAction = this.stateList[name];
        //
        if (this.previousAction !== this.currentAction) {
            this.previousAction.fadeOut(0.5);
            this.currentAction
            .reset()
            .setEffectiveTimeScale(1)
            .setEffectiveWeight(1)
            .fadeIn(0.5)
            .play();
        }
    }
    render() {
        const delta = this.clock.getDelta() //获取自上次调用的时间差
        // this.firstPersonControls.update(delta) //更新第一人称控件
        this.renderer.render(this.scene, this.camera);
        // 更新动画帧
        if(this.mixer){
            this.mixer.update(delta);
        }


        //更新镜头
        this.updateCamera();


        //更新人物坐标
        const relativeCameraOffset = new THREE.Vector3(0, -30, -50);
        const cameraOffset = relativeCameraOffset.applyMatrix4(
            this.camera.matrixWorld
        );
        if (this.author) {
           this.author.rotation.y = Math.PI + this.camera.rotation.y;
           this.author.position.x = cameraOffset.x;
           this.author.position.y = cameraOffset.y;
           this.author.position.z = cameraOffset.z-10;
             // 始终让相机看向物体
            this.camera.target =this.author.position;
        }
        
        
       


        requestAnimationFrame(this.render.bind(this))
    }

}