import * as THREE from "three";

/**
 * Boilerplate to create a THREE.js scene
 */
export function makeScene({
	animate: animationFn,
	camera: cameraConfig = {},
	container = document.body,
	controls: controlsConstructor,
} = {}) {
	// create a scene
	const scene = new THREE.Scene();

	// create a camera
	const rect = container.getBoundingClientRect();
	const camera = new THREE.PerspectiveCamera(
		75,
		rect.width / rect.height,
		0.1,
		1000,
	);

   // set up direction
	if (cameraConfig.up) {
		camera.up.set(...cameraConfig.up);
	}
	if (cameraConfig.position) {
		camera.position.set(...cameraConfig.position);
	}

	// create a renderer and add it to the document
	const renderer = new THREE.WebGLRenderer({
		alpha: true,
		antialias: true,
	});

	renderer.setSize(rect.width, rect.height);
	container.appendChild(renderer.domElement);

	// controls
	// this  @type is called type doc
	// it is used to add typescript information to the javascript
	/** @type THREE.Controls */
	let controls;
	if (controlsConstructor) {
		controls = new controlsConstructor(camera, renderer.domElement);
	}

	// handle resizing
	window.addEventListener("resize", () => {
		const { height, width } = container.getBoundingClientRect();

		camera.aspect = width / height;
		camera.updateProjectionMatrix();
		renderer.setSize(width, height);
	});

	// animation loop
	function animate() {
		animationFn?.(); //the syntax with ? means if the author passed an animation function, then call it

		// required if controls.enableDamping or controls.autoRotate are set to true
		controls?.update();
		renderer.render(scene, camera);
	}
	renderer.setAnimationLoop(animate);

	// camera helper
	document.body.addEventListener("click", (e) => {
		if (e.shiftKey) {
			let { x, y, z } = camera.position;
			[x, y, z] = [x, y, z].map((t) => truncate(t));
			console.log(`camera position: [${x}, ${y}, ${z}]`);
			navigator.clipboard.writeText([x, y, z].join(", ")).then(() => {
				console.log("copied camera coords to clipboard!");
			});
		}
	});

	// return values
	return { camera, controls, renderer, scene };
}

/**
 * Truncate a number to 2 decimal digits of precision
 */
export function truncate(x, precision = 2) {
	return parseFloat(x.toFixed(precision));
}

/**
 * Linear interpolation from a to b
 * @param {number} a starting point
 * @param {number} b ending point
 * @param {number} t Progress
 */
export function lerp(a, b, t) {
	return a + t * (b - a);
}
