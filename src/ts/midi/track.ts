import {Soundfont} from "./soundfont";
import {Effector} from "./effector";

/**
 * 音声トラック
 */
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
  private context:AudioContext; // とりあえず内部のコンテキスト保持してみたけど、こうすると、途中でcontextがかわったときに困ったことがおきると思われる。
  // これ・・・でも途中でcontextがかわったら・・・どうなるんだろう・・・そもそも破滅しないか？
  private soundfont:Soundfont;
  private effector:Effector;

  private effectNode:ConvolverNode;
  private effectGain:GainNode;
  private outputNode:GainNode;

  private bufferNodes:{}; // nodeId -> bufferのmap再生中であるかとか判定する。
  /**
   * コンストラクタ
   * @param context AudioContext
   */
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
  /**
   * soundfontを読み込みます。
   */
  public loadSoundfont(url:string):Promise<void> {
    return new Promise<void>((resolve, reject) => {
      Soundfont.load(this.context, url)
      .then((soundfont:Soundfont) => {
        this.soundfont = soundfont;
        resolve();
      });
    });
  }
  /**
   * effectorを読み込み設定します。
   * @param name effectorの名前(音源データの中のどの音を使うかを指定します。)
   * @param url  effectorの音源データ
   */
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
  /**
   * effectの強さを指定します。
   * @param value 0-127
   */
  public setEffectLevel(value:number):void {
    this.effectGain.gain.value = value / 127;
  }
  /**
   * 音を鳴らします。
   * @param note  音のたかさ
   * @param value 音の強さ 0-127
   */
  public noteOn(note:number, value:number):void {
    if(!this.context) {
      return;
    }
    if(value == 0) {
      this.noteOff(note);
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
  /**
   * 音を止める。
   * @param note 止める音の高さ
   */
  public noteOff(note:number):void {
    if(!this.bufferNodes[note]) {
      // すでに止まってる。
      return;
    }
    this.bufferNodes[note].stop(0); // iOSだと、ここに0をいれておかないと、うまく処理してくれないみたい。
    this.bufferNodes[note] = null; // nullにして再度再生可能にしておく。
  }
  /**
   * 出力のnodeを参照します。
   */
  public refNode():AudioNode {
    return this.outputNode;
  }
}
