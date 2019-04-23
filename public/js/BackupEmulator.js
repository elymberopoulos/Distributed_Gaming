// import softwareButtons from "./software-buttons";
// import keyboardButtons from "./keyboard-buttons";
// import gamepadButtons from "./gamepad-buttons";
// import Fullscreen from "jsfullscreen";
// import PointerLock from "jspointerlock";
// import fileButtons from "./file-buttons";
// import notifier from "./notifier";
// import homescreen from "./homescreen";
const $ = require('jquery');
const Gameboy = require('jsgbc');


// if (window.WebComponentsReady) {
//   init();
// } else {
//   window.addEventListener("WebComponentsReady", init);
// }
function StartBackup() {
  var reader = new FileReader();
  // var rom = reader.readAsArrayBuffer('./localEmulator/TetrisDX.gbc');
  let canvas = document.getElementById('mainCanvas');
  // const jsGBCui = $jsGBCui.get(0);
  // const $screen = $(jsGBCui.screenElement);
  const gameboy = new Gameboy.GameBoy({
    lcd: { 
        canvas: canvas }
  });
  // gameboy.replaceCartridge(rom);
  //   const fullscreen = new Fullscreen($screen);
//   const pointerLock = new PointerLock($screen);

//   fullscreen.on("change", () => {
//     if (fullscreen.isActive) {
//       jsGBCui.fullscreen = true;
//     } else {
//       PointerLock.exitPointerLock();
//       jsGBCui.fullscreen = false;
//     }
//   });

//   $screen.on("dblclick", () => {
//     toggleFullscreen();
//   });

  // keyboardButtons.bind(gameboy);
  // softwareButtons.bind(gameboy, jsGBCui);
  // gamepadButtons.bind(gameboy);
  // fileButtons.bind(gameboy);
  // notifier.bind(gameboy);
  // notifier.appendTo(jsGBCui.screenElement);

  // jsGBCui.loading = false;

//   homescreen.bind().then(() => {
//     setAddToHomescreen();
//   });

//   const ribbonElement = document.querySelector(".ribbon") as HTMLElement;
//   let ribbonText = ribbonElement.textContent;

//   function setAddToHomescreen() {
//     ribbonElement.textContent = "Add to Homescreen";
//     ribbonElement.addEventListener("click", addToHomescreen);
//     ribbonElement.classList.add("highlighted");
//   }

//   function unsetAddToHomescreen() {
//     ribbonElement.textContent = ribbonText;
//     ribbonElement.removeEventListener("click", addToHomescreen);
//     ribbonElement.classList.remove("highlighted");
//   }

  // async function addToHomescreen(e) {
  //   e.preventDefault();
  //   await homescreen.prompt();
  //   unsetAddToHomescreen();
  // }

  // function toggleFullscreen() {
  //   if (fullscreen.isActive) {
  //     Fullscreen.exitFullscreen();
  //     PointerLock.exitPointerLock();
  //   } else {
  //     fullscreen.requestFullscreen();
  //     pointerLock.requestPointerLock();
  //   }
  // }
}
module.exports = {
  StartBackup
}