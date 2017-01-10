import {Base64Mp3Loader} from "./base64Mp3Loader";
import {Soundfont} from "./soundfont";
import {Effector} from "./effector";

export class MIDI {
  private context:AudioContext;
  private endNode:DynamicsCompressorNode; // データをまとめる

  /*
  ここがややこしくなってるので、調整する。
  name -> soundfontの紐付けはここでやるべき。
  urlの紐付けとかはsoundfontでやるべき。
  */
  private tracks: {}; // ターゲット名 -> Trackオブジェクト
  private soundfont:{}; // ターゲット名 -> Soundfontオブジェクト
  private buffer:{}; // 現在再生しているbufferを記録 noteOffで利用する

  private effectNode:ConvolverNode; // エフェクト動作
  private effectGain:GainNode; // エフェクトのレベルを調整する。

  private effector:Effector; // 今の所これは配列にせずおいとく。
  // track化したら配列にしないとまずい。
//  private effectUrl:string;
//  private effectUrls:{}; // url -> effectデータのjson
  // 増えすぎるとしにそう・・・まぁなんとかなるだろ。
  /**
   * コンストラクタ
   * @param context webAudioの動作コンテキスト
   */
  constructor(context:AudioContext) {
    // コンテキストは保持しておく。(nodeやbufferをつくるのに使う)
    this.context = context;
    this.endNode = context.createDynamicsCompressor();
    this.effectGain = context.createGain();
    this.effectNode = context.createConvolver();
    this.effectGain.connect(this.endNode);

    this.soundfont = {};
    this.buffer = {};

//    this.effectUrls = {};
//    this.effectUrl = null;
    this.effector = null;
  }
  /**
   * エフェクト用のフォントをDLする。
   * @param url 取得先アドレス
   * @return promise
   */
  public loadEffectFont(url:string):Promise<void> {
    this.changeEffect(null);
    return new Promise<void>((resolve, reject) => {
      Effector.load(url)
      .then((effector:Effector) => {
        this.effector = effector;
        resolve();
      });
    });
/*    return new Promise<void>((resolve, reject) => {
      // エフェクトデータを取得する。
      if(typeof(this.effectUrls[url]) === "undefined") {
        window["callback"] = (data) => {
          this.effectUrls[url] = data;
          this.effectUrl = url;
          resolve();
        };
        var script = document.createElement("script");
        script.src = url;
        document.body.appendChild(script);
      }
      else {
        resolve();
      }
    });*/
  }
  /**
   * サウンドフォントをDLして、nameに関連づけておく。
   * @param name 関連づける名前
   * @param url  DL対象
   * @return promise
   */
  public loadSoundfont(name:string, url:string):Promise<void> {
    return new Promise<void>((resolve, reject) => {
      Soundfont.load(this.context, url).then((soundfont:Soundfont) => {
        this.soundfont[name] = soundfont;
        resolve();
      })
    })
  }
  /**
   * 利用するeffectを変更する。取得したjsonpのeffect名前を指定する。
   * @param name 変更するeffectの名前を設定
   */
  public changeEffect(name:string):Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.effectNode.disconnect(); // 切断しておく。
      if(!name) {
        // エフェクトはずす。
        resolve();
        return;
      }
      // effectからaudioBufferをつくって、それをeffect_nodeに設定しなければならない。
      this.effector.refAudioBuffer(this.context, name)
      .then((buffer:AudioBuffer) => {
        this.effectNode.buffer = buffer;
        this.effectNode.connect(this.effectGain);
        resolve();
      });
    });
  }
  /**
   * エフェクトのレベルを変更する。127が最大0が最小
   */
  public changeEffectLevel(value:number):void {
    this.effectGain.gain.value = value / 127;
  }
  /**
   * 音を再生する。
   * @param name  音の関連付け名
   * @param note  再生する音のid 0 - 127 60が真ん中のドの音
   * @param value 音の大きさ設定
   * あとでpitchもいれとくか・・・
   */
  public noteOn(name:string, note:number, value:number):void {
    if(!this.context) {
      return;
    }
    if(!this.buffer[name]) {
      this.buffer[name] = {};
    }
    if(this.buffer[name][note]) {
      return;
    }
    var soundfont:Soundfont = this.soundfont[name];
    if(!soundfont) {
      // soundfontがloadされてない。
      return;
    }
    var buffer:AudioBuffer = soundfont.refAudioBuffer(note);
    if(!buffer) {
      // 該当bufferが存在しない。
      return;
    }
    var bufferNode = this.context.createBufferSource();
    bufferNode.buffer = buffer;
    var gainNode = this.context.createGain();
    gainNode.gain.value = value / 127;
    bufferNode.connect(gainNode);

    gainNode.connect(this.effectNode);

    gainNode.connect(this.endNode);
    bufferNode.start(0);
    this.buffer[name][note] = bufferNode;
  }
  /**
   * 音を止める。
   * @param name 音の関連付け名
   * @param note 再生する音のid 0 - 127
   */
  public noteOff(name:string, note:number):void {
    if(!this.buffer[name]) {
      return;
    }
    if(!this.buffer[name][note]) {
      return;
    }
    this.buffer[name][note].stop();
    this.buffer[name][note] = null;
  }
  /**
   * 動作nodeを参照する。
   */
  public refNode():AudioNode {
    return this.endNode;
  }
}
