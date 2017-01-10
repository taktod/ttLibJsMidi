import {Base64Mp3Loader} from "./base64Mp3Loader";
import {Soundfont} from "./soundfont";
import {Effector} from "./effector";
import {Track} from "./track";

export class MIDI {
  private context:AudioContext; // 動作コンテキスト
  private endNode:DynamicsCompressorNode; // データをまとめる
  private tracks: {}; // ターゲット名 -> Trackオブジェクト

  // 増えすぎるとしにそう・・・まぁなんとかなるだろ。
  /**
   * コンストラクタ
   * @param context webAudioの動作コンテキスト
   */
  constructor(context:AudioContext) {
    // コンテキストは保持しておく。(nodeやbufferをつくるのに使う)
    this.context = context;
    this.endNode = context.createDynamicsCompressor();

    this.tracks = {};
  }
  /**
   * 音を鳴らす。
   * @param name  対象トラック指定
   * @param note  対象音の高さ指定
   * @param value 音の強さ指定
   */
  public noteOn(name:string, note:number, value:number):void {
    if(!this.tracks[name]) {
      return;
    }
    this.tracks[name].noteOn(note, value);
  }
  /**
   * 音を消す
   * @param name 対象トラック指定
   * @param note 対象音の高さ指定
   */
  public noteOff(name:string, note:number):void {
    if(!this.tracks[name]) {
      return;
    }
    this.tracks[name].noteOff(note);
  }
  /**
   * 動作nodeを参照する。
   */
  public refNode():AudioNode {
    return this.endNode;
  }
  /**
   * トラックを作成する
   * @param name 設定名 参照で利用します。
   * @param url  soundfontのurl
   */
  public makeTrack(name:string, url:string):Promise<Track> {
    return new Promise<Track>((resolve, reject) => {
      var track = new Track(this.context);
      track.loadSoundfont(url)
      .then(() => {
        this.tracks[name] = track;
        track.refNode().connect(this.endNode);
        resolve(track);
      });
    });
  }
}
