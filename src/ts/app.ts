/// <reference types="@types/jquery" />

import {ttm} from "./../../";

$(function() {
  var context = new AudioContext();
  var midi = new ttm.MIDI(context);
  midi.refNode().connect(context.destination);
  midi.loadSoundFont("piano", "/soundfont/MusyngKite/acoustic_grand_piano.jsonp")
//  .then(() => {
//    return midi.loadSoundFont("drum", "/soundfont/drum/Stark.jsonp");
//  })
//  .then(() => {
//    return midi.loadEffectFont("/soundfont/impulse/impulse.jsonp")})
//  .then(() => {
//    return midi.changeEffect("smooth-hall");
//  })
  .then(function() {
    $(window).keyup((e) => {
      switch(e.keyCode) {
      case 'Q'.charCodeAt(0):midi.noteOff("drum", 40);break;
      case 'W'.charCodeAt(0):midi.noteOff("drum", 36);break;
      case 'E'.charCodeAt(0):midi.noteOff("drum", 38);break;
      case 'R'.charCodeAt(0):midi.noteOff("drum", 45);break;
      case 'T'.charCodeAt(0):midi.noteOff("drum", 47);break;
      case 'Y'.charCodeAt(0):midi.noteOff("drum", 50);break;

      case 'Z'.charCodeAt(0):midi.noteOff("piano", 60);break;
      case 'S'.charCodeAt(0):midi.noteOff("piano", 61);break;
      case 'X'.charCodeAt(0):midi.noteOff("piano", 62);break;
      case 'D'.charCodeAt(0):midi.noteOff("piano", 63);break;
      case 'C'.charCodeAt(0):midi.noteOff("piano", 64);break;
      case 'V'.charCodeAt(0):midi.noteOff("piano", 65);break;
      case 'G'.charCodeAt(0):midi.noteOff("piano", 66);break;
      case 'B'.charCodeAt(0):midi.noteOff("piano", 67);break;
      case 'H'.charCodeAt(0):midi.noteOff("piano", 68);break;
      case 'N'.charCodeAt(0):midi.noteOff("piano", 69);break;
      case 'J'.charCodeAt(0):midi.noteOff("piano", 70);break;
      case 'M'.charCodeAt(0):midi.noteOff("piano", 71);break;
      case 188:midi.noteOff("piano", 72);break;
      default:
        console.log(e.keyCode);
        break;
      }
    });
    $(window).keydown((e) => {
      switch(e.keyCode) {
      case 'Q'.charCodeAt(0):midi.noteOn("drum", 40, 80);break;
      case 'W'.charCodeAt(0):midi.noteOn("drum", 36, 80);break;
      case 'E'.charCodeAt(0):midi.noteOn("drum", 38, 80);break;
      case 'R'.charCodeAt(0):midi.noteOn("drum", 45, 80);break;
      case 'T'.charCodeAt(0):midi.noteOn("drum", 47, 80);break;
      case 'Y'.charCodeAt(0):midi.noteOn("drum", 50, 80);break;

      case 'Z'.charCodeAt(0):midi.noteOn("piano", 60, 127);break;
      case 'S'.charCodeAt(0):midi.noteOn("piano", 61, 127);break;
      case 'X'.charCodeAt(0):midi.noteOn("piano", 62, 127);break;
      case 'D'.charCodeAt(0):midi.noteOn("piano", 63, 127);break;
      case 'C'.charCodeAt(0):midi.noteOn("piano", 64, 127);break;
      case 'V'.charCodeAt(0):midi.noteOn("piano", 65, 127);break;
      case 'G'.charCodeAt(0):midi.noteOn("piano", 66, 127);break;
      case 'B'.charCodeAt(0):midi.noteOn("piano", 67, 127);break;
      case 'H'.charCodeAt(0):midi.noteOn("piano", 68, 127);break;
      case 'N'.charCodeAt(0):midi.noteOn("piano", 69, 127);break;
      case 'J'.charCodeAt(0):midi.noteOn("piano", 70, 127);break;
      case 'M'.charCodeAt(0):midi.noteOn("piano", 71, 127);break;
      case 188:midi.noteOn("piano", 72, 127);break;
      default:
        console.log(e.keyCode);
        break;
      }
    });
  });
});

