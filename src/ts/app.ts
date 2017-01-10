/// <reference types="@types/jquery" />

import {ttm} from "./../../";
import * as tttm from "./../../";

$(function() {
  interface ITrack {
    setEffectLevel(value:number):void;
    setEffector(name:string, url:string):Promise<void>;
    noteOn(note:number, value:number):void;
    noteOff(note:number):void;
  }
  var context = new AudioContext();
  var midi = new ttm.MIDI(context);
  var piano:ITrack = null;
  var drum:ITrack = null;
  midi.refNode().connect(context.destination);
  // loadSoundfontでどのトラックに音色を設定するか指定できる。
  midi.makeTrack("piano", "/soundfont/MusyngKite/acoustic_grand_piano.jsonp")
  .then((track:ITrack) => {
    piano = track;
    // trackのeffectorを設定する。
/*    track.setEffectLevel(100);
    return track.setEffector("smooth-hall", "/soundfont/impulse/impulse.jsonp");*/
  })
/*  .then(() => {
    return midi.makeTrack("drum", "/soundfont/drum/Stark.jsonp");})
  .then((track:ITrack) => {
    drum = track;
  })*/
  .then(() => {
    console.log("ここきてるか？");
    $(window).keyup((e) => {
      switch(e.keyCode) {
      case 'Q'.charCodeAt(0):drum.noteOff(40);break;
      case 'W'.charCodeAt(0):drum.noteOff(36);break;
      case 'E'.charCodeAt(0):drum.noteOff(38);break;
      case 'R'.charCodeAt(0):drum.noteOff(45);break;
      case 'T'.charCodeAt(0):drum.noteOff(47);break;
      case 'Y'.charCodeAt(0):drum.noteOff(50);break;

      case 'Z'.charCodeAt(0):piano.noteOff(60);break;
      case 'S'.charCodeAt(0):piano.noteOff(61);break;
      case 'X'.charCodeAt(0):piano.noteOff(62);break;
      case 'D'.charCodeAt(0):piano.noteOff(63);break;
      case 'C'.charCodeAt(0):piano.noteOff(64);break;
      case 'V'.charCodeAt(0):piano.noteOff(65);break;
      case 'G'.charCodeAt(0):piano.noteOff(66);break;
      case 'B'.charCodeAt(0):piano.noteOff(67);break;
      case 'H'.charCodeAt(0):piano.noteOff(68);break;
      case 'N'.charCodeAt(0):piano.noteOff(69);break;
      case 'J'.charCodeAt(0):piano.noteOff(70);break;
      case 'M'.charCodeAt(0):piano.noteOff(71);break;
      case 188:piano.noteOff(72);break;
      default:
        console.log(e.keyCode);
        break;
      }
    });
    $(window).keydown((e) => {
      switch(e.keyCode) {
      case 'Q'.charCodeAt(0):drum.noteOn(40, 20);break;
      case 'W'.charCodeAt(0):drum.noteOn(36, 20);break;
      case 'E'.charCodeAt(0):drum.noteOn(38, 20);break;
      case 'R'.charCodeAt(0):drum.noteOn(45, 20);break;
      case 'T'.charCodeAt(0):drum.noteOn(47, 20);break;
      case 'Y'.charCodeAt(0):drum.noteOn(50, 20);break;

      case 'Z'.charCodeAt(0):piano.noteOn(60, 127);break;
      case 'S'.charCodeAt(0):piano.noteOn(61, 127);break;
      case 'X'.charCodeAt(0):piano.noteOn(62, 127);break;
      case 'D'.charCodeAt(0):piano.noteOn(63, 127);break;
      case 'C'.charCodeAt(0):piano.noteOn(64, 127);break;
      case 'V'.charCodeAt(0):piano.noteOn(65, 127);break;
      case 'G'.charCodeAt(0):piano.noteOn(66, 127);break;
      case 'B'.charCodeAt(0):piano.noteOn(67, 127);break;
      case 'H'.charCodeAt(0):piano.noteOn(68, 127);break;
      case 'N'.charCodeAt(0):piano.noteOn(69, 127);break;
      case 'J'.charCodeAt(0):piano.noteOn(70, 127);break;
      case 'M'.charCodeAt(0):piano.noteOn(71, 127);break;
      case 188:piano.noteOn(72, 127);break;
      default:
        console.log(e.keyCode);
        break;
      }
    });
  });
});

