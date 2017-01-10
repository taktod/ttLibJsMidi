// base64のmp3をloadする動作

export class Base64Mp3Loader {
  public static load(context:AudioContext, base:string, data:string):Promise<AudioBuffer> {
    return new Promise<AudioBuffer>((resolve, reject) => {
      var baseElement = base.split(",");
      var dataElement = data.split(",");
      var elementLength = dataElement.length;
      var soundString = "";
      for(var i = 0;i < elementLength;++ i) {
        soundString += baseElement[i];
        soundString += dataElement[i];
      }
      var soundBinary = window.atob(soundString);
      var binaryLength = soundBinary.length;
      var soundBytes = new Uint8Array(binaryLength);
      for(var i = 0;i < binaryLength;++ i) {
        soundBytes[i] = soundBinary.charCodeAt(i);
      }
      // あとはAudioBufferをつくって応答すればよい。
      context.decodeAudioData(
        soundBytes.buffer,
        (buffer:AudioBuffer) => {
          resolve(buffer);
        },
        () => {
          reject();
        }
      )
    });
  }
}