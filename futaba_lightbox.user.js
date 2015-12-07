// ==UserScript==
// @name        futaba lightbox
// @namespace   https://github.com/himuro-majika
// @description ふたばの画像表示をギャラリー風にしちゃう
// @include     http://*.2chan.net/*/res/*
// @exclude     http://img.2chan.net/*/res/*
// @exclude     http://dat.2chan.net/*/res/*
// @require     http://ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js
// @require     https://github.com/fancyapps/fancyBox/raw/master/source/jquery.fancybox.js
// @resource    fancyboxCSS https://github.com/fancyapps/fancyBox/raw/master/source/jquery.fancybox.css
// @resource    fancyboxSprite https://github.com/fancyapps/fancyBox/raw/master/source/fancybox_sprite.png
// @version     1.0.1
// @grant       GM_getResourceText
// @grant       GM_getResourceURL
// @grant       GM_addStyle
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAAPUExURYv4i2PQYy2aLUe0R////zorx9oAAAAFdFJOU/////8A+7YOUwAAAElJREFUeNqUj1EOwDAIQoHn/c88bX+2fq0kRsAoUXVAfwzCttWsDWzw0kNVWd2tZ5K9gqmMZB8libt4pSg6YlO3RnTzyxePAAMAzqMDgTX8hYYAAAAASUVORK5CYII=
// ==/UserScript==
this.$ = this.jQuery = jQuery.noConflict(true);

(function ($) {
    /*
    設定
    */
    //閉じるボタンを表示する
    var USE_CLOSEBTN = false;
    //末尾から先頭にループさせる
    var USE_LOOP = false;
    //該当レスにスクロールする
    var USE_SCROLL = true;

    init();

    function init(){
        // var Start = new Date().getTime();//count parsing time
        add_class_and_rel();
        add_css();
        setup_fancybox();
        // console.log('Parsing : '+((new Date()).getTime()-Start) +'msec');//log parsing time
    }

    function add_class_and_rel() {
        var $sure_a = $("body > form > a > img").parents("a");
        $sure_a.addClass("futaba_lightbox");
        $sure_a.attr("rel", "futaba_lightbox_gallery");

        add_class_res();

        setInterval(function(){
            add_class_res();
        }, 5000);

        //赤福操作パネル対策
        setTimeout(function(){
            $attb = $("#akahuku_throp_thumbnail_button");
            $attb.removeClass("futaba_lightbox");
            $attb.attr("rel", "");
        },3000);

        function add_class_res() {
            //  var Start = new Date().getTime();//count parsing time
            var $res_a = $(".rtd > a > img").parents("a");
            $res_a.addClass('futaba_lightbox');
            $res_a.attr("rel", "futaba_lightbox_gallery");
            //  console.log('Parsing : '+((new Date()).getTime()-Start) +'msec');//log parsing time
        }
    }

    function add_css() {
        var css = GM_getResourceText("fancyboxCSS");
        GM_addStyle(css);
        var sprite = GM_getResourceURL("fancyboxSprite");
        GM_addStyle(
            "#fancybox-loading, .fancybox-close, .fancybox-prev span, .fancybox-next span {" +
            "	background-image: url(" + sprite + ");" +
            "}" +
            "#fancybox-loading div {" +
            "    display: none;" +
            "}"
        );
    }

    function setup_fancybox() {
        $(".futaba_lightbox").fancybox({
            margin : 15,                                         //画像外側のスペース
            padding : 5,                                         //画像内側のスペース(白枠部)
            openEffect : "none",                                 //開く時のエフェクト
            closeEffect : "none",                                //閉じる時のエフェクト
            prevEffect : "none",                                 //次移動時のエフェクト
    		nextEffect : "none",                                 //前移動時のエフェクト
            preload : "1",                                       //プリロードする画像の数
    		closeBtn : USE_CLOSEBTN,                             //閉じるボタン
            loop : USE_LOOP,                                     //末尾から先頭へのループ
            helpers : {
                overlay : {
                    speedOut   : 100,                            //閉じる時の背景のフェード時間
                    // showEarly : false,
                    fixed : false,                               //固定表示(falseでスクロール可能)
                    css : {
                        // "background" : "rgba(0,0,0,0.85)"     //背景色
                    }
                }
            },
            afterLoad: function(current, previous) {
                // console.info( 'Current: ' + current.href );
                // console.info( 'Previous: ' + (previous ? previous.href : '-') );
                // if (previous) {
                //     console.info( 'Navigating: ' + (current.index > previous.index ? 'right' : 'left') );
                // }
                if(USE_SCROLL){
                    scrollToRes(current.href);
                }
            }
        });
    }

    function scrollToRes(currenthref) {
        var $img_a = $(".futaba_lightbox[href='" + currenthref + "']");
        if($img_a.length){
            var img_position = $img_a.offset().top;
            $("html,body").animate({
                scrollTop : img_position
            },
            {
                duration: 100,
                queue: false
            });
        }
    }

})(jQuery);
