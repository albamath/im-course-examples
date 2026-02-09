import * as THREE from "three";
// OrbitControls is there to move the scene around in 3D
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { ParametricGeometry } from 'three/addons/geometries/ParametricGeometry.js';
import { truncate, lerp, makeScene } from "./three-utils.js";

// create scene
const { scene } = makeScene({
/*  animate: () => {
    surface.rotation.x += 0.01;
    surface.rotation.y += 0.01;
  },*/
  camera: {
    position: [6.12, 3.59, 5.43],
    up: [0, 0, 1], // math convention, otherwise x, y are the coordinates for screen and z points outwards the screen
  },
  container: document.getElementById("container"),
  controls: OrbitControls,
});
//camera.lookAt(...) to look at somewhere else than the origin

// add lights
const ambientLight = new THREE.AmbientLight(undefined, 0.1);
scene.add(ambientLight);

const pointLights = [
  { position: [0, 5, 5], intensity: Math.PI, decay: 0 },
  { position: [0, 0, -2], intensity: Math.PI },
];

for (const config of pointLights) {
  const pointLight = new THREE.PointLight(
    config.color,
    config.intensity,
    config.distance,
    config.decay,
  );
  //... is for calling with the parameters specified
  pointLight.position.set(...config.position);
  scene.add(pointLight);
}

// axes helper
scene.add(new THREE.AxesHelper(5));

const fn =  (x,y) => Math.cos(2*x) * Math.sin(y) + 1;

let geometry;
let material;
// parametric surface
geometry = new ParametricGeometry((u,v,target)=> {
  const x = lerp(-5,5,u);
  const y = lerp(-5,5,v);
  target.set(x,y,fn(x,y));
  //console.log({x,y,target});
},64,64); //precision, how many points along each parameter
material = new THREE.MeshPhongMaterial({ 
color: 0x00ff00,
side: THREE.DoubleSide,
opacity: 0.5,
transparent: true
});
const surface = new THREE.Mesh(geometry, material);
scene.add(surface);

// Add a dot, input (x,y,z) point
geometry = new THREE.SphereGeometry(0.1,32,32);
material = new THREE.MeshPhongMaterial({color: 0xff0000});
let input = new THREE.Mesh(geometry, material);
scene.add(input);

// Add a dot, output (x,y,z) point
/** @Type THREE.Mesh **/
let output;
geometry = new THREE.SphereGeometry(0.1,32,32);
material = new THREE.MeshPhongMaterial({ color: 0xff00ff});
output = new THREE.Mesh(geometry, material);
setOutputPosition();
scene.add(output);

//** amount to move the point by **/
const step = 0.1;

//set output position from input
function setOutputPosition() {
  const {x, y} = input.position;
  output.position.set (
      x,
      y,
      fn(x,y)
  )
}

// keyboard interaction
document.body.addEventListener("keydown", (e) => {
  console.log(e.key);
  
  switch (e.key) {
      case "ArrowLeft":
        input.position.setX(input.position.x - step);
        break;
      case "ArrowUp":
        input.position.setY(input.position.y + step);
        break;
      case "ArrowDown":
        input.position.setY(input.position.y - step);
        break;
      case "ArrowRight":
        input.position.setX(input.position.x + step);  
        break; 
      case "?":
        e.preventDefault();
        document.getElementById("controls").classList.toggle("hidden");
        break;
      /*
      this last line is equivalent to
      const controls = document.getElementById("controls");
      if controls
      ...
      */
      case " ":
        playPitch(output.position.z);
        break;
      case ";":
        let {x, y, z} = output.position;
        [x,y,z] = [x, y, z].map((t) => truncate(t));
        speak(`x: ${x}, y:${y}, z: ${z}`);
        break;
    }
    setOutputPosition();
});

// speech synthesis

const synth = window.speechSynthesis;

//comment out the extra options from the MDN example
/*
const inputForm = document.querySelector("form");
const inputTxt = document.querySelector(".txt");
*/
const voiceSelect = document.querySelector("select");

const pitch = document.querySelector("#pitch");
const pitchValue = document.querySelector(".pitch-value");
const rate = document.querySelector("#rate");
const rateValue = document.querySelector(".rate-value");

let voices = [];

function populateVoiceList() {
  // selects a shorter list of languages
  // for chosing only one language options you can use
  // filter(voice => voice.lang === "en-US")
  voices = synth.getVoices()
  .filter(voice =>
    voice.lang.startsWith("en-")
    ||
    voice.lang.startsWith("es-")
    ||
    voice.lang.startsWith("fr-")
  )
  .sort(function (a, b) {
    const aname = a.name.toUpperCase();
    const bname = b.name.toUpperCase();

    if (aname < bname) {
      return -1;
    } else if (aname == bname) {
      return 0;
    } else {
      return +1;
    }
  });
  const selectedIndex =
    voiceSelect.selectedIndex < 0 ? 0 : voiceSelect.selectedIndex;
  voiceSelect.innerHTML = "";

  for (let i = 0; i < voices.length; i++) {
    const option = document.createElement("option");
    option.textContent = `${voices[i].name} (${voices[i].lang})`;

    if (voices[i].default) {
      option.textContent += " -- DEFAULT";
    }

    option.setAttribute("data-lang", voices[i].lang);
    option.setAttribute("data-name", voices[i].name);
    voiceSelect.appendChild(option);
  }
  voiceSelect.selectedIndex = selectedIndex;
}

populateVoiceList();

if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = populateVoiceList;
}

function speak(text) {
  if (synth.speaking) {
    console.error("speechSynthesis.speaking");
    return;
  }

  if (text==="") return;
  if (text !== "") {
    const utterThis = new SpeechSynthesisUtterance(text);

    utterThis.onend = function (event) {
      console.log("SpeechSynthesisUtterance.onend");
    };

    utterThis.onerror = function (event) {
      console.error("SpeechSynthesisUtterance.onerror");
    };

    const selectedOption =
      voiceSelect.selectedOptions[0].getAttribute("data-name");

    for (let i = 0; i < voices.length; i++) {
      if (voices[i].name === selectedOption) {
        utterThis.voice = voices[i];
        break;
      }
    }
    utterThis.pitch = 1;
    utterThis.rate = 1;
    synth.speak(utterThis);
  }
}
/*
inputForm.onsubmit = function (event) {
  event.preventDefault();

  speak();

  inputTxt.blur();
};

pitch.onchange = function () {
  pitchValue.textContent = pitch.value;
};

rate.onchange = function () {
  rateValue.textContent = rate.value;
}
*/

voiceSelect.onchange = function () {
  speak();
};

//pitches

const audioCtx = (new window.AudioContext || new window.webkitAudioContext);

function playPitch(z){
  console.log(audioCtx);
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  const duration = 0.5;

  //remap pitch to [0,1]
  const minZ = 0;
  const maxZ = 1;
  const pitch = (z-minZ) / (maxZ - minZ);

  //frequency range : C4 to A5
  const minFreq = 261.63;
  const maxFreq = 880;

  const frequency = lerp(minFreq, maxFreq, pitch);

  oscillator.type = "sine" // or square or sawtooth
  oscillator.frequency.value = frequency;

  gainNode.gain.value = 0.2; // keep it gentle

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + duration);
}
