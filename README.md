# ttLibJsMidi

midiの音を扱うためのtaktod用のライブラリ

# author
taktod <https://twitter.com/taktod/>

# 概要
とりあえずMIDIっぽく、音を出すのをつくりたい。
でもできるだけサイズは小さくしたい。

というわけで作ろうと思う。

# リソースについて
https://github.com/gleitz/midi-js-soundfonts
ここのsoundfontからjsonpをつくってみました。
ライセンス的には以下のになると思います。
https://creativecommons.org/licenses/by-sa/3.0/deed.ja

プログラムは全部3-CauseBSD Licenseとしておきます。

とりあえず音源は準備できた。

とりあえずMIDI音源を再生する動作がほしいところ。
reverveとかのエフェクト(convolverの動作)は全体がけ
トラックごとにした方がいいかもしれない。
