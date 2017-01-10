import {Base64Mp3Loader} from "./base64Mp3Loader";

/**
 * soundfontを取り扱います。
 */
export class Soundfont {
  private static urls:{} = {}; // address -> Soundfontオブジェクト
  private bufferList:{}; // noteId -> AudioBuffer
  public name:string;
  /**
   * コンストラクタ
   */
  constructor() {
    this.name = "";
    this.bufferList = {};
  }
  /**
   * データを読み込みます。AudioBufferも準備します。
   * @param context AudioContext
   * @param url     soundfontのアドレス
   */
  private load_(context:AudioContext, url:string):Promise<void> {
    return new Promise<void>((resolve, reject) => {
      // ここにきたら、soundfontをロードしないといけない。
      window["callback"] = (data:{name:string, base:string}) => {
        this.name = data.name;
        var promises:Array<Promise<any>> = [];
        Object.keys(data).forEach((key:string) => {
          if(key == "base" || key == "name") {
            return;
          }
          promises.push(
            Base64Mp3Loader.load(context, data.base, data[key])
            .then((buffer:AudioBuffer) => {
              this.bufferList[parseInt(key)] = buffer;
            })
          );
        });
        Promise.all(promises).then(() => {
          resolve();
        });
      };
      var script = document.createElement("script");
      script.src = url;
      document.body.appendChild(script);
    });
  }
  /**
   * soundfontを読み込みます。
   * @param context AudioContext
   * @param url     soundfontのアドレス
   * すでに読み込み済みのsoundfontがあれば、それを利用します。
   */
  public static load(context:AudioContext, url:string):Promise<Soundfont> {
    // すでにurlにロード済みのデータがあるならそれを取得する。
    // ないなら、新たにロードする。
    return new Promise<Soundfont>((resolve, reject) => {
      if(Soundfont.urls[url]) {
        resolve(Soundfont.urls[url]);
        return;
      }
      var soundfont = new Soundfont();
      Soundfont.urls[url] = soundfont;
      soundfont.load_(context, url)
      .then(() => {
        resolve(soundfont);
      });
    });
  }
  /**
   * それぞれの音に対応するAudioBufferを参照します。
   */
  public refAudioBuffer(note:number):AudioBuffer {
    return this.bufferList[note];
  }
}
