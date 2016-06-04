// ==UserScript==
// @name        futaba lightbox
// @namespace   https://github.com/himuro-majika
// @description ふたばの画像表示をギャラリー風にしちゃう
// @author      himuro_majika
// @include     http://*.2chan.net/*/res/*
// @include     http://board.futakuro.com/*/res/*
// @exclude     http://img.2chan.net/*/res/*
// @exclude     http://dat.2chan.net/*/res/*
// @require     http://ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js
// @require     https://github.com/fancyapps/fancyBox/raw/master/lib/jquery.mousewheel.pack.js
// @require     https://github.com/fancyapps/fancyBox/raw/master/source/jquery.fancybox.js
// @resource    fancyboxCSS https://github.com/fancyapps/fancyBox/raw/master/source/jquery.fancybox.css
// @resource    fancyboxSprite https://github.com/fancyapps/fancyBox/raw/master/source/fancybox_sprite.png
// @version     1.2.0
// @grant       GM_getResourceText
// @grant       GM_getResourceURL
// @grant       GM_addStyle
// @run-at      document-idle
// @license     MIT
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
		var AKAHUKU = false, FUTAKURO = false, FUTABOARD = false;
		// 赤福が有効か
		if ($("#akahuku_thumbnail").length) { AKAHUKU = true; }
		// ふたクロが有効か
		if ($("#master").length) { FUTAKURO = true; }
		// futaboardか
		if ($("#threadsbox").length) { FUTABOARD = true; }
		add_class_and_rel_Thread();
		add_class_and_rel_Res();
		if (AKAHUKU || FUTAKURO) {
			observeInserted();
		}
		// スレ画
		function add_class_and_rel_Thread() {
			var $attc = $("#akahuku_throp_thumbnail_container");
			if (AKAHUKU && $attc.length) {
				removeAkahukuThrop();
			}
			var $sure_a = $(".thre").length
				? $(".thre > a > img").parent()
				: $("body > form > a > img").parent();
			if (FUTAKURO) { // ふたクロ
				$sure_a = $("#master > a > img").parent();
			}
			if (FUTABOARD) { // futaboard
				$sure_a = $(".d7 > a > img").parent();
			}
			addAttr($sure_a);
			// 赤福操作パネル対策	
			function removeAkahukuThrop() {
				var observer = new MutationObserver(function(mutations) {
					mutations.forEach(function(mutation) {
						removeAttr($(mutation.addedNodes));
						// 監視を中止
						observer.disconnect();
					});
				});
				observer.observe($attc.get(0), { childList: true });
			}
		}
		// レス画像
		function add_class_and_rel_Res() {
			//  var Start = new Date().getTime();//count parsing time
			var $res_a = $(".rtd > a > img").parent();
			if (FUTABOARD) { // futaboard
				$res_a = $(".d6 > table img").parent();
			}
			addAttr($res_a);
			//  console.log('Parsing : '+((new Date()).getTime()-Start) +'msec');//log parsing time
		}
		// 続きを読むで挿入される要素を監視
		function observeInserted() {
			var target = $("html > body > form[action]:not([enctype])").get(0);
			if (FUTABOARD) {
				target = $(".d6").get(0); // futaboard
			}
			var observer = new MutationObserver(function(mutations) {
				mutations.forEach(function(mutation) {
					var $nodes = $(mutation.addedNodes);
					add_class_res_inserted($nodes);
				});
			});
			observer.observe(target, { childList: true });
		}
		// 挿入されたレスに属性を付加
		function add_class_res_inserted($nodes) {
			//  var Start = new Date().getTime();//count parsing time
			var $res_a_inserted = $nodes.find("td > a > img").parent();
			addAttr($res_a_inserted);
			//  console.log('Parsing : '+((new Date()).getTime()-Start) +'msec');//log parsing time
		}
		// ノードにクラス、属性を付加
		function addAttr(node) {
			node.addClass("futaba_lightbox");
			node.attr("rel", "futaba_lightbox_gallery");
		}
		// ノードからfancyboxクラス、属性を削除
		function removeAttr(node) {
			node.removeClass("futaba_lightbox");
			node.attr("rel", "");
		}
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
			"}" +
			// ふたクロ書き込みウィンドウ対応
			".fancybox-opened {" +
			"  z-index: 2000000013;" +
			"}"
		);
	}
	// fancyboxの設定
	function setup_fancybox() {
		$(".futaba_lightbox").fancybox({
			minWidth : "300", // 画像の最小幅
			margin: 15, //画像外側のスペース
			padding: 5, //画像内側のスペース(白枠部)
			openEffect: "none", //開く時のエフェクト
			closeEffect: "none", //閉じる時のエフェクト
			prevEffect: "none", //次移動時のエフェクト
			nextEffect: "none", //前移動時のエフェクト
			preload: "2", //プリロードする画像の数
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
			// 画像読み込み後イベント
			afterLoad: function(current, previous) {
				// console.info( 'Current: ' + current.href );
				// console.info( 'Previous: ' + (previous ? previous.href : '-') );
				// if (previous) {
				//     console.info( 'Navigating: ' + (current.index > previous.index ? 'right' : 'left') );
				// }
				if (USE_SCROLL) {
					scrollToRes(current.href);
				}
			}
		});
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

})(jQuery);
