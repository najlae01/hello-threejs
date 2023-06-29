import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import {FontLoader} from 'three/examples/jsm/loaders/FontLoader.js'
import {TextGeometry} from 'three/examples/jsm/geometries/TextGeometry.js'

THREE.ColorManagement.enabled = false

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**Axes Helper */
// const axesHelper = new THREE.AxesHelper()
// scene.add(axesHelper)

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()

const textMatcapTexture = textureLoader.load('/textures/matcaps/8.png')
const donutMatcapTexture = textureLoader.load('/textures/matcaps/4.png')

/**
 * Fonts
 */
const fontLoader = new FontLoader()

let text

fontLoader.load(
    '/fonts/helvetiker_regular.typeface.json',
    (font) => 
    {
        const textGeometry = new TextGeometry(
            'Hello World',
            {
                font: font,
                size: 0.5,
                height: 0.2,
                curveSegments: 5,
                bevelEnabled: true,
                bevelThickness: 0.03,
                bevelSize: 0.02,
                bevelSegments: 4,
                bevelOffset: 0
            }
        )
        // textGeometry.computeBoundingBox()
        
        // textGeometry.translate(
        //     - (textGeometry.boundingBox.max.x - 0.02) * 0.5,
        //     - (textGeometry.boundingBox.max.y - 0.02) * 0.5,
        //     - (textGeometry.boundingBox.max.z - 0.03) * 0.5,
        // )
        // textGeometry.computeBoundingBox()
        // console.log(textGeometry.boundingBox)
        textGeometry.center()
        textGeometry.computeBoundingBox()
        console.log(textGeometry.boundingBox)

        const textMaterial = new THREE.MeshMatcapMaterial({matcap: textMatcapTexture})
        //textMaterial.wireframe = true
        text = new THREE.Mesh(textGeometry, textMaterial)
        scene.add(text)

        const donutGeometry = new THREE.TorusGeometry(0.3, 0.2, 20, 45)
        const donutMaterial = new THREE.MeshMatcapMaterial({matcap: donutMatcapTexture})

        const textBoundingBox = text.geometry.boundingBox;

        for(let i = 0; i < 200; i++)
        {

            const donut = new THREE.Mesh(donutGeometry, donutMaterial)

            let isColliding = false;

            do {
                // Generate random position within a range
                donut.position.x = (Math.random() - 0.5) * 10;
                donut.position.y = (Math.random() - 0.5) * 10;
                donut.position.z = (Math.random() - 0.5) * 10;

                // Check for collision with text
                const donutBoundingBox = new THREE.Box3().setFromObject(donut);
                isColliding = donutBoundingBox.intersectsBox(textBoundingBox);
            } while (isColliding);

            donut.rotation.x = Math.random() * Math.PI
            donut.rotation.y = Math.random() * Math.PI

            const scale = Math.random()
            donut.scale.set(scale, scale, scale)

            // make the donut rotate slowly

            scene.add(donut)
        }
    }
)


/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 1
camera.position.y = 1
camera.position.z = 2
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.outputColorSpace = THREE.LinearSRGBColorSpace
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()


const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()


    // Update camera lookAt
    camera.lookAt(scene.position);


    scene.traverse((child) => {
    if (child instanceof THREE.Mesh && child !== text) {
        child.rotation.y += 0.005; 
    }
    });

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()