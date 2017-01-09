var ttm =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var mid = __webpack_require__(1);
	var midi;
	(function (midi) {
	    var MIDI = (function (_super) {
	        __extends(MIDI, _super);
	        function MIDI() {
	            return _super.apply(this, arguments) || this;
	        }
	        return MIDI;
	    }(mid.MIDI));
	    midi.MIDI = MIDI;
	    ;
	})(midi = exports.midi || (exports.midi = {}));
	var MIDI = (function (_super) {
	    __extends(MIDI, _super);
	    function MIDI() {
	        return _super.apply(this, arguments) || this;
	    }
	    return MIDI;
	}(mid.MIDI));
	exports.MIDI = MIDI;
	;


/***/ },
/* 1 */
/***/ function(module, exports) {

	"use strict";
	var MIDI = (function () {
	    // 増えすぎるとしにそう・・・まぁなんとかなるだろ。
	    /**
	     * コンストラクタ
	     * @param context webAudioの動作コンテキスト
	     */
	    function MIDI(context) {
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
	    MIDI.prototype.loadEffectFont = function (url) {
	        var _this = this;
	        this.changeEffect(null);
	        return new Promise(function (resolve, reject) {
	            // エフェクトデータを取得する。
	            if (typeof (_this.effectUrls[url]) === "undefined") {
	                window["callback"] = function (data) {
	                    _this.effectUrls[url] = data;
	                    _this.effectUrl = url;
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
	    };
	    /**
	     * サウンドフォントをDLして、nameに関連づけておく。
	     * @param name 関連づける名前
	     * @param url  DL対象
	     * @return promise
	     */
	    MIDI.prototype.loadSoundFont = function (name, url) {
	        var _this = this;
	        return new Promise(function (resolve, reject) {
	            if (typeof (_this.urls[url]) === "undefined") {
	                // jqueryとか使うと、違うライブラリ使いにくくなるので独自にタグを読み込むことで対処しておく。
	                window["callback"] = function (data) {
	                    // あとはこのデータから音声bufferを復元して、soundfontに保持させておく。
	                    _this.urls[url] = name;
	                    _this.names[name] = data["name"];
	                    _this.soundfont[data["name"]] = {};
	                    // soundFontをすべて読みださないといけない。
	                    var base = data["base"].split(",");
	                    var promises = [];
	                    Object.keys(data).forEach(function (key) {
	                        if (key == 'base' || key == "name") {
	                            return;
	                        }
	                        var target = data[key].split(",");
	                        var length = target.length;
	                        var sound = "";
	                        for (var i = 0; i < length; i++) {
	                            sound += base[i];
	                            sound += target[i];
	                        }
	                        var binary_string = window.atob(sound);
	                        var len = binary_string.length;
	                        var bytes = new Uint8Array(len);
	                        for (var i = 0; i < len; i++) {
	                            bytes[i] = binary_string.charCodeAt(i);
	                        }
	                        promises.push(_this.context.decodeAudioData(bytes.buffer, function (buffer) {
	                            // あとはnodeをつくったら、再生できるようになる。
	                            _this.soundfont[data["name"]][parseInt(key)] = buffer;
	                        }, function () {
	                        }));
	                    });
	                    Promise.all(promises).then(function () {
	                        resolve();
	                    });
	                };
	                var script = document.createElement("script");
	                script.src = url;
	                document.body.appendChild(script);
	            }
	            else {
	                _this.names[name] = _this.names[_this.urls[url]];
	                _this.urls[url] = name;
	                resolve();
	            }
	        });
	    };
	    /**
	     * 利用するeffectを変更する。取得したjsonpのeffect名前を指定する。
	     * @param name 変更するeffectの名前を設定
	     */
	    MIDI.prototype.changeEffect = function (name) {
	        var _this = this;
	        return new Promise(function (resolve, reject) {
	            if (!name) {
	                // エフェクトとはずす。
	                _this.effectName = null;
	                _this.effectNode.disconnect(); // 切断しておく。
	                resolve();
	                return;
	            }
	            // effectからaudioBufferをつくって、それをeffect_nodeに設定しなければならない。
	            if (!_this.effectUrls[_this.effectUrl]) {
	                reject();
	                return;
	            }
	            // 問題ないので、読み込まなければならない
	            var base = _this.effectUrls[_this.effectUrl]["base"].split(",");
	            var target = _this.effectUrls[_this.effectUrl][name].split(",");
	            var length = target.length;
	            var sound = "";
	            for (var i = 0; i < length; i++) {
	                sound += base[i];
	                sound += target[i];
	            }
	            var binary_string = window.atob(sound);
	            var len = binary_string.length;
	            var bytes = new Uint8Array(len);
	            for (var i = 0; i < len; i++) {
	                bytes[i] = binary_string.charCodeAt(i);
	            }
	            _this.context.decodeAudioData(bytes.buffer, function (buffer) {
	                _this.effectNode.buffer = buffer;
	                _this.effectNode.connect(_this.effectGain);
	                _this.effectName = name;
	                resolve();
	            }, function () {
	                reject();
	            });
	        });
	    };
	    /**
	     * エフェクトのレベルを変更する。127が最大0が最小
	     */
	    MIDI.prototype.changeEffectLevel = function (value) {
	        this.effectGain.gain.value = value / 127;
	    };
	    /**
	     * 音を再生する。
	     * @param name  音の関連付け名
	     * @param note  再生する音のid 0 - 127 60が真ん中のドの音
	     * @param value 音の大きさ設定
	     * あとでpitchもいれとくか・・・
	     */
	    MIDI.prototype.noteOn = function (name, note, value) {
	        if (!this.context) {
	            return;
	        }
	        if (!this.buffer[name]) {
	            this.buffer[name] = {};
	        }
	        if (this.buffer[name][note]) {
	            return;
	        }
	        if (!this.soundfont[this.names[name]][note]) {
	            return;
	        }
	        var bufferNode = this.context.createBufferSource();
	        bufferNode.buffer = this.soundfont[this.names[name]][note];
	        var gainNode = this.context.createGain();
	        gainNode.gain.value = value / 127;
	        bufferNode.connect(gainNode);
	        if (this.effectName) {
	            gainNode.connect(this.effectNode);
	        }
	        gainNode.connect(this.endNode);
	        bufferNode.start(0);
	        this.buffer[name][note] = bufferNode;
	    };
	    /**
	     * 音を止める。
	     * @param name 音の関連付け名
	     * @param note 再生する音のid 0 - 127
	     */
	    MIDI.prototype.noteOff = function (name, note) {
	        if (!this.buffer[name]) {
	            return;
	        }
	        if (!this.buffer[name][note]) {
	            return;
	        }
	        this.buffer[name][note].stop();
	        this.buffer[name][note] = null;
	    };
	    /**
	     * 動作nodeを参照する。
	     */
	    MIDI.prototype.refNode = function () {
	        return this.endNode;
	    };
	    return MIDI;
	}());
	exports.MIDI = MIDI;


/***/ }
/******/ ]);