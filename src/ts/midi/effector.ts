import {Base64Mp3Loader} from "./base64Mp3Loader";

export class Effector {
  private static urls:{} = {}; // address -> effectorデータjson
  private json:{name:string, base:string};
  private bufferList:{};
  public name:string;
  constructor() {
    this.name = "";
    this.bufferList = {};
    this.json = null;
  }
  private load_(url:string):Promise<void> {
    return new Promise<void>((resolve, reject) => {
      window["callback"] = (data:{name:string, base:string}) => {
        this.name = data.name;
        this.json = data;
        resolve();
      };
      var script = document.createElement("script");
      script.src = url;
      document.body.appendChild(script);
    });
  }
  public static load(url:string):Promise<Effector> {
    return new Promise<Effector>((resolve, reject) => {
      if(Effector.urls[url]) {
        resolve(Effector.urls[url]);
        return;
      }
      var effector = new Effector();
      effector.load_(url)
      .then(() => {
        resolve(effector);
      });
    });
  }
  public refAudioBuffer(context:AudioContext, name:string):Promise<AudioBuffer> {
    return new Promise<AudioBuffer>((resolve, reject) => {
      if(this.bufferList[name]) {
        resolve(this.bufferList[name]);
        return;
      }
      if(!this.json[name]) {
        reject();
        return;
      }
      // jsonデータがあり、bufferのデータもあるので、audioBufferを再生成して応答しなければならない。
      Base64Mp3Loader.load(context, this.json.base, this.json[name])
      .then((buffer:AudioBuffer) => {
        this.bufferList[name] = buffer;
        resolve(buffer);
      });
    });
  }
}
