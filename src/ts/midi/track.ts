import {Soundfont} from "./soundfont";
import {Effector} from "./effector";

// トラックのクラス
export class Track {
  // トラックでsoundfontとeffectorをコントロールしておかなければならない。
  // いままで buffer -> gain -> effect -> gain -> output
  //         buffer -> gain                   -> output

  // 今後 buffer -> effect -> gain -> gain -> output
  //      buffer                  -> gain -> output
  // こうすると、音のgainをさげると、全体の音量がさがるのか・・・それはおかしいな。

  // buffer -> gain -> effect -> gain -> gain -> output
  // buffer -> gain                   -> gain -> output
  // なんか妙だけど、こうしておくか・・・
  // effectをoffにすると、effectをdisconnectする。とする。
  private context:AudioContext;
  private soundfont:Soundfont;
  private effector:Effector;

  private effectNode:ConvolverNode;
  private effectGain:GainNode;
  private outputNode:GainNode;

  private bufferNodes:{}; // nodeId -> bufferのmap再生中であるかとか判定する。
  constructor(context:AudioContext) {
    this.context = context;
    this.soundfont = null;
    this.effector = null;
    this.effectNode = context.createConvolver();
    this.effectGain = context.createGain();
    this.outputNode = context.createGain();
    this.effectGain.connect(this.outputNode);
    this.bufferNodes = {};
  }
  public loadSoundfont(url:string):Promise<void> {
    return new Promise<void>((resolve, reject) => {
      Soundfont.load(this.context, url)
      .then((soundfont:Soundfont) => {
        this.soundfont = soundfont;
        resolve();
      });
    });
  }
  public setEffector(name:string, url:string):Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if(!name) {
        this.effectNode.disconnect();
        resolve();
        return;
      }
      Effector.load(url)
      .then((effector:Effector) => {
        return effector.refAudioBuffer(this.context, name)})
      .then((buffer:AudioBuffer) => {
        // ここでeffectのconvolverNodeにこのbufferを設定しなければならない。
        this.effectNode.buffer = buffer;
        this.effectNode.connect(this.effectGain);
        resolve();
      }); // catchしてeffectNodeをdisconnectしておいた方がいいかな・・・
    });
  }
  public setEffectLevel(value:number):void {
    this.effectGain.gain.value = value / 127;
  }
  public noteOn(note:number, value:number):void {
    if(!this.context) {
      return;
    }
    // 現在対象のnoteが再生中であるか確認。再生中なら再生しない。
    if(this.bufferNodes[note]) {
      return;
    }
    // soundfontを確認。loadされてなければ再生できない。
    if(!this.soundfont) {
      return;
    }
    // bufferがあるか確認。bufferがないなら、再生できない。
    var buffer:AudioBuffer = this.soundfont.refAudioBuffer(note);
    if(!buffer) {
      return;
    }
    // ここまできたら再生可能。
    var bufferNode = this.context.createBufferSource();
    bufferNode.buffer = buffer;
    var gainNode = this.context.createGain();
    gainNode.gain.value = value / 127;
    bufferNode.connect(gainNode);
    gainNode.connect(this.effectNode);
    gainNode.connect(this.outputNode);
    bufferNode.start(0);
    this.bufferNodes[note] = bufferNode;
  }
  public noteOff(note:number):void {
    if(!this.bufferNodes[note]) {
      // すでに止まってる。
      return;
    }
    this.bufferNodes[note].stop();
    this.bufferNodes[note] = null; // nullにして再度再生可能にしておく。
  }
  public refNode():AudioNode {
    return this.outputNode;
  }
}
