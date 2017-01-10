import {Base64Mp3Loader} from "./base64Mp3Loader";
import {Soundfont} from "./soundfont";
import {Effector} from "./effector";
import {Track} from "./track";

export class MIDI {
  private context:AudioContext;
  private endNode:DynamicsCompressorNode; // データをまとめる

  /*
  ここがややこしくなってるので、調整する。
  name -> soundfontの紐付けはここでやるべき。
  urlの紐付けとかはsoundfontでやるべき。
  */
  private tracks: {}; // ターゲット名 -> Trackオブジェクト
  // track化したら配列にしないとまずい。
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
  public noteOn(name:string, note:number, value:number):void {
    if(!this.tracks[name]) {
      return;
    }
    this.tracks[name].noteOn(note, value);
  }
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
