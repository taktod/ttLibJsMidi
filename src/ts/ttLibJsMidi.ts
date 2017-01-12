import * as mid from "./midi/midi";
import * as efc from "./midi/effector";
import * as sft from "./midi/soundfont";

export namespace midi {
  export class MIDI extends mid.MIDI{};
  export class Effector extends efc.Effector{};
  export class Soundfont extends sft.Soundfont{};
}
export class MIDI extends mid.MIDI{};
export class Effector extends efc.Effector{};
export class Soundfont extends sft.Soundfont{};
