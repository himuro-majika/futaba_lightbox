// ==UserScript==
// @name        futaba lightbox
// @namespace   https://github.com/himuro-majika
// @description ふたばの画像表示をギャラリー風にしちゃう
// @author      himuro_majika
// @include     http://*.2chan.net/*/res/*
// @include     https://*.2chan.net/*/res/*
// @include     http://board.futakuro.com/*/res/*
// @require     http://ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js
// @require     https://cdn.jsdelivr.net/npm/fancybox@2.1.5/lib/jquery.mousewheel.pack.js
// @require     https://cdn.jsdelivr.net/npm/fancybox@2.1.5/dist/js/jquery.fancybox.js
// @resource    fancyboxCSS https://cdn.jsdelivr.net/npm/fancybox@2.1.5/dist/css/jquery.fancybox.css
// @resource    fancyboxSprite https://cdn.jsdelivr.net/npm/fancybox@2.1.5/dist/img/fancybox_sprite.png
// @version     1.3.0
// @grant       GM_getResourceText
// @grant       GM_getResourceURL
// @grant       GM_addStyle
// @license     MIT
// @noframes
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAAPUExURYv4i2PQYy2aLUe0R////zorx9oAAAAFdFJOU/////8A+7YOUwAAAElJREFUeNqUj1EOwDAIQoHn/c88bX+2fq0kRsAoUXVAfwzCttWsDWzw0kNVWd2tZ5K9gqmMZB8libt4pSg6YlO3RnTzyxePAAMAzqMDgTX8hYYAAAAASUVORK5CYII=
// ==/UserScript==
this.$ = this.jQuery = jQuery.noConflict(true);

(function($) {
	/*
	 * 設定
	 */
	// 閉じるボタンを表示する
	var USE_CLOSEBTN = false;
	// 末尾から先頭にループさせる
	var USE_LOOP = false;
	// マウスホイールでのナビゲーションを使用する
	var USE_MOUSEWHEEL = true;
	// 該当レスにスクロールする
	var USE_SCROLL = true;
	// スクロールのなめらかさ
	var SCROLL_DURATION = 100;
	// 動画の幅
	var VIDEO_WIDTH = 1280;
	// 動画の高さ
	var VIDEO_HEIGHT = 720;
	// 動画の自動再生
	var VIDEO_AUTOPLAY = false;


	var options;
	var currentidx;
	var reopenflag = false;

	init();

	function init() {
		// var Start = new Date().getTime();//count parsing time
		add_class_and_rel();
		add_css();
		setup_fancybox();
		// console.log('Parsing : '+((new Date()).getTime()-Start) +'msec');//log parsing time
	}
	// スレ内の画像にクラス、rel属性を付加する
	function add_class_and_rel() {
		var FUTAKURO = false, FUTABOARD = false;
		// 赤福が有効か
		setTimeout(function() {
			if ($("#akahuku_thumbnail").length) {
				removeAkahukuThrop();
			}
		}, 5000)

		// ふたクロが有効か
		if ($("#master").length) { FUTAKURO = true; }
		// futaboardか
		if ($("#threadsbox").length) { FUTABOARD = true; }
		add_class_and_rel_Thread();
		add_class_and_rel_Res();
		observeInserted();
		// スレ画
		function add_class_and_rel_Thread() {
			var $sure_a = $(".thre").length ?
				$(".thre > a > img").parent() :
				$("body > form > a > img").parent();
			if (FUTAKURO) { // ふたクロ
				$sure_a = $("#master > a > img").parent();
			}
			if (FUTABOARD) { // futaboard
				$sure_a = $(".d7 > a > img").parent();
			}
			if($(".c9-1").length) {
				$sure_a = $(".c9-1").parent();
			}
			addAttr($sure_a);
		}
		// レス画像
		function add_class_and_rel_Res() {
			//  var Start = new Date().getTime();//count parsing time
			var $res_a = $(".rtd > a > img").parent();
			if (FUTABOARD) { // futaboard
				$res_a = $(".d6 > table img").parent();
			}
			if($(".c9-10").length) {
				$res_a = $(".c9-10 a > img").parent();
			}
			addAttr($res_a);
			//  console.log('Parsing : '+((new Date()).getTime()-Start) +'msec');//log parsing time
		}
		// 続きを読むで挿入される要素を監視
		function observeInserted() {
			var target = $(".thre").length ?
				$(".thre").get(0) :
				$("html > body > form[action]:not([enctype])").get(0);
			if (FUTABOARD) {
				target = $(".d6").get(0); // futaboard
			}
			if($(".c9-1").length) return;
			var observer = new MutationObserver(function(mutations) {
				var imgEle;
				mutations.forEach(function(mutation) {
					var $nodes = $(mutation.addedNodes);
					var $res_a_inserted = $nodes.find("td > a > img");
					if ($res_a_inserted.length > 0) {
						imgEle = $res_a_inserted;
						addAttr($res_a_inserted.parent());
					}
				});
				if (imgEle && imgEle.length > 0) {
					var video = getIframeVideo();
					if (video.length == 0 || (!VIDEO_AUTOPLAY && video[0].paused)) reopenFancybox();
				}
			});
			observer.observe(target, { childList: true });
		}
		// ノードにクラス、属性を付加
		function addAttr(node) {
			node.addClass("futaba_lightbox");
			node.attr("rel", "futaba_lightbox_gallery");
			// 動画
			node.each(function() {
				if ($(this).attr("href").match(/\.(webm|mp4)$/)) {
					$(this).addClass("fancybox.html");
				}
			})
		}
	}
	// 赤福操作パネル対策
	function removeAkahukuThrop() {
		var $attb = $("#akahuku_throp_thumbnail_button");
		if ($attb.length) {
			removeAttr($attb);
		}
	}
	// ノードからfancyboxクラス、属性を削除
	function removeAttr(node) {
		node.removeClass("futaba_lightbox");
		node.attr("rel", "");
	}
	// CSSを設定
	function add_css() {
		var css = GM_getResourceText("fancyboxCSS");
		GM_addStyle(css);
		var sprite = GM_getResourceURL("fancyboxSprite");
		GM_addStyle(
			"#fancybox-loading, .fancybox-close, .fancybox-prev span, .fancybox-next span {" +
			"  background-image: url(" + sprite + ");" +
			"}" +
			"#fancybox-loading div {" +
			"  display: none;" +
			"}" +
			".fancybox-nav {" +
			"  background: transparent;" +
			"  width: 45%;" +
			"  height: 90%;" +
			"}" +
			// ふたクロ書き込みウィンドウ対応
			".fancybox-opened {" +
			"  z-index: 2000000013;" +
			"}"
		);
	}
	// fancyboxの設定
	function setup_fancybox() {
		options = {
			autoSize: false,
			width: VIDEO_WIDTH,	//動画の幅
			height: VIDEO_HEIGHT,	//動画の高さ
			minWidth : 300, // 画像の最小幅
			margin: 15, //画像外側のスペース
			padding: 5, //画像内側のスペース(白枠部)
			openEffect: "none", //開く時のエフェクト
			closeEffect: "none", //閉じる時のエフェクト
			prevEffect: "none", //次移動時のエフェクト
			nextEffect: "none", //前移動時のエフェクト
			preload: 3, //プリロードする画像の数
			mouseWheel: USE_MOUSEWHEEL,
			closeBtn: USE_CLOSEBTN, //閉じるボタン
			loop: USE_LOOP, //末尾から先頭へのループ
			helpers: {
				overlay: {
					speedOut: 100, //閉じる時の背景のフェード時間
					// showEarly : false,
					fixed: false, //固定表示(falseでスクロール可能)
					css: {
						// "background" : "rgba(0,0,0,0.85)"     //背景色
						background: "none"
					}
				}
			},
			// テンプレート
			tpl: {
				image: '<a href="{href}" target="_blank"><img class="fancybox-image" src="{href}" alt="" /></a>',
				error: '<p class="fancybox-error">画像がないよ<br>すでに削除されてるかも</p>',
				next: '<a title="次" class="fancybox-nav fancybox-next"><span></span></a>',
				prev: '<a title="前" class="fancybox-nav fancybox-prev"><span></span></a>'
			},
			// 読み込み前
			beforeLoad: function() {
				if (this.element[0].id == "akahuku_throp_thumbnail_button") {
					removeAkahukuThrop();
					return false;
				}
			},
			// 画像読み込み後イベント
			afterLoad: function(current, previous) {
				// 動画
				if (current.type == "html") {
					var ext = current.href.match(/\.(webm|mp4)$/)[1];
					var autoplay = VIDEO_AUTOPLAY ? "autoplay=''" : "";
					var videohtml = "<video " + autoplay + " controls='' style='width: 100%; height: 100%; background-color: #000;' class='extendWebm'>";
					if (ext == "webm") {
						videohtml += "<source src='" + current.href + "' type='video/webm'>";
					}
					videohtml += "<source src='" + current.href + "' type='video/mp4'></video>";
					current.content = videohtml;
					//デフォルトのプレイヤーを閉じる
					var cancelbutton = $(current.element[0]).parent().find(".cancelbk");
					var event = new Event("click");
					if (cancelbutton[0]) {
						cancelbutton[0].dispatchEvent(event);
					}
				}

				currentidx = current.index;
				if (USE_SCROLL) {
					if (reopenflag) {
						reopenflag = false;
					} else {
						scrollToRes(current.href);
					}
				}
			}
		};

		$(".futaba_lightbox").fancybox(options);

		// ギャラリー表示中の画像を含むレスにスクロール
		function scrollToRes(currenthref) {
			var $img_a = $(".futaba_lightbox[href='" + currenthref + "']").parent();
			if ($img_a.length) {
				var img_position = $img_a.offset().top;
				$("html,body").animate({
					scrollTop: img_position
				}, {
					duration: SCROLL_DURATION,
					queue: false
				});
				// $("html,body").scrollTop(img_position);
			}
		}
	}

	function getIframeVideo() {
		var video = $(".fancybox-opened video")
		return video;
	}

	function reopenFancybox() {
		if ($(".fancybox-opened").length == 0) return;

		var group = $(".futaba_lightbox");
		options.index = currentidx;
		reopenflag = true;

		$.fancybox.open(group, options);
	}
})(jQuery);
