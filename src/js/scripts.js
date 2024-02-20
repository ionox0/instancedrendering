import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {RGBELoader} from 'three/examples/jsm/loaders/RGBELoader.js';


class Test {
    renderer = new THREE.WebGLRenderer({antialias: true});
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    gltfLoader = new GLTFLoader();
    rgbeLoader = new RGBELoader();

    constructor () {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0xFFEA00);
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 2;

        document.body.appendChild(this.renderer.domElement);
        this.camera.position.set(0, 6, 15);
        this.camera.lookAt(this.scene.position);
        this.controls.update();

        const ambientLight = new THREE.AmbientLight(0x333333);
        const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
        directionalLight.position.set(0, 10, 10);
        this.scene.add(ambientLight);
        this.scene.add(directionalLight);
    }
    

    init() {
        this.rgbeLoader.load('./assets/MR_INT-005_WhiteNeons_NAD.hdr', (texture) => {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            this.scene.environment = texture;

            this.gltfLoader.load('./assets/star.glb', (glb) => {
                const mesh = glb.scene.getObjectByName('Star_Star_0');
                const geometry = mesh.geometry.clone();
                const material = mesh.material;
                this.starMesh = new THREE.InstancedMesh(geometry, material, 10000);
                this.scene.add(this.starMesh);

                const dummy = new THREE.Object3D();
                for(let i = 0; i < 10000; i++) {
                    dummy.position.x = Math.random() * 40 - 20;
                    dummy.position.y = Math.random() * 40 - 20;
                    dummy.position.z = Math.random() * 40 - 20;
                    dummy.rotation.x = Math.random() * 2 * Math.PI;
                    dummy.rotation.y = Math.random() * 2 * Math.PI;
                    dummy.rotation.z = Math.random() * 2 * Math.PI;
                    dummy.scale.x = dummy.scale.y = dummy.scale.z = 0.04 * Math.random();

                    dummy.updateMatrix();
                    this.starMesh.setMatrixAt(i, dummy.matrix);
                    this.starMesh.setColorAt(i, new THREE.Color(Math.random() * 0xFFFFFF));
                }

                this.renderer.setAnimationLoop((time) => { this.animate(time, dummy) });
            });
        });
    }

    animate(time, dummy) {
        const matrix = new THREE.Matrix4();

        for(let i = 0; i < 10000; i++) {
            this.starMesh.getMatrixAt(i, matrix);
            matrix.decompose(dummy.position, dummy.rotation, dummy.scale);

            dummy.rotation.x = i/10000 * time/1000;
            dummy.rotation.y = i/10000 * time/500;
            dummy.rotation.z = i/10000 * time/1200;
        
            dummy.updateMatrix();
            this.starMesh.setMatrixAt(i, dummy.matrix);
        }
        this.starMesh.instanceMatrix.needsUpdate = true;
        this.starMesh.rotation.y = time / 10000;
        this.renderer.render(this.scene, this.camera);
    }

}

t = new Test();
t.init();
