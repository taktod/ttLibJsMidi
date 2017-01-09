export class MIDI {
  private context:AudioContext;
  private endNode:DynamicsCompressorNode; // データをまとめる

  private buffer:{}; // 現在再生しているbufferを記録 noteOffで利用する
  private soundfont:{}; // サウンドフォント名[note] -> 実際のフォント
  private names:{}; // 設定名 -> サウンドフォント名
  private urls:{}; // url -> 設定名

  private effectNode:ConvolverNode; // エフェクト動作
  private effectGain:GainNode; // エフェクトのレベルを調整する。
  private effectName:string;
  private effectUrl:string;
  private effectUrls:{}; // url -> effectデータのjson
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
    this.effectName = null;
    this.soundfont = {};
    this.names = {};
    this.urls = {};
    this.buffer = {};
    this.effectUrls = {};
    this.effectUrl = null;
  }
  /**
   * エフェクト用のフォントをDLする。
   * @param url 取得先アドレス
   * @return promise
   */
  public loadEffectFont(url:string):Promise<void> {
    this.changeEffect(null);
    return new Promise<void>((resolve, reject) => {
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
    });
  }url
  /**
   * サウンドフォントをDLして、nameに関連づけておく。
   * @param name 関連づける名前
   * @param url  DL対象
   * @return promise
   */
  public loadSoundFont(name:string, url:string):Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if(typeof(this.urls[url]) === "undefined") {
        // jqueryとか使うと、違うライブラリ使いにくくなるので独自にタグを読み込むことで対処しておく。
        window["callback"] = (data) => {
          // あとはこのデータから音声bufferを復元して、soundfontに保持させておく。
          this.urls[url] = name;
          this.names[name] = data["name"];
          this.soundfont[data["name"]] = {};
          // soundFontをすべて読みださないといけない。
          var base = data["base"].split(",");
          var promises = [];
          Object.keys(data).forEach((key) => {
            if(key == 'base' || key == "name") {
              return;
            }
            var target = data[key].split(",");
            var length = target.length;
            var sound = "";
            for(var i = 0;i < length;i ++) {
              sound += base[i];
              sound += target[i];
            }
            var binary_string = window.atob(sound);
            var len = binary_string.length;
            var bytes = new Uint8Array(len);
            for (var i = 0; i < len; i++) {
              bytes[i] = binary_string.charCodeAt(i);
            }
            promises.push(this.context.decodeAudioData(bytes.buffer, (buffer) => {
              // あとはnodeをつくったら、再生できるようになる。
              this.soundfont[data["name"]][parseInt(key)] = buffer;
            }, () => {
            }));
          });
          Promise.all(promises).then(() => {
            resolve();
          });
        };
        var script = document.createElement("script");
        script.src = url;
        document.body.appendChild(script);
      }
      else {
        this.names[name] = this.names[this.urls[url]];
        this.urls[url] = name;
        resolve();
      }
    });
  }
  /**
   * 利用するeffectを変更する。取得したjsonpのeffect名前を指定する。
   * @param name 変更するeffectの名前を設定
   */
  public changeEffect(name:string):Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if(!name) {
        // エフェクトとはずす。
        this.effectName = null;
        this.effectNode.disconnect(); // 切断しておく。
        resolve();
        return;
      }
      // effectからaudioBufferをつくって、それをeffect_nodeに設定しなければならない。
      if(!this.effectUrls[this.effectUrl]) {
        reject();
        return;
      }
      // 問題ないので、読み込まなければならない
      var base = this.effectUrls[this.effectUrl]["base"].split(",");
      var target = this.effectUrls[this.effectUrl][name].split(",");
      var length = target.length;
      var sound = "";
      for(var i = 0;i < length;i ++) {
        sound += base[i];
        sound += target[i];
      }
      var binary_string = window.atob(sound);
      var len = binary_string.length;
      var bytes = new Uint8Array(len);
      for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
      }
      this.context.decodeAudioData(bytes.buffer, (buffer) => {
        this.effectNode.buffer = buffer;
        this.effectNode.connect(this.effectGain);
        this.effectName = name;
        resolve();
      }, () => {
        reject();
      })
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
    if(!this.soundfont[this.names[name]][note]) {
      return;
    }
    var bufferNode = this.context.createBufferSource();
    bufferNode.buffer = this.soundfont[this.names[name]][note];
    var gainNode = this.context.createGain();
    gainNode.gain.value = value / 127;
    bufferNode.connect(gainNode);

    if(this.effectName) {
      gainNode.connect(this.effectNode);
    }

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
