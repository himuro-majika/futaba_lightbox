
## なにコレ
ブラウザ上で動くUserscriptです  

ふたば☆ちゃんねるのスレ内の画像をページ内でギャラリー風に表示します  
マウスホイールやカーソルキーでの前後移動も可能です  

Firefox + [Greasemonkey](https://addons.mozilla.org/ja/firefox/addon/greasemonkey/),  
Chrome + [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo),  
Opera(ver.15+) + [Tampermonkey](https://addons.opera.com/extensions/details/tampermonkey-beta/)  
で動作確認済みです

※このUserscriptは[赤福Firefox SP](http://toshiakisp.github.io/akahuku-firefox-sp/)と[ふたクロ](http://futakuro.com/)に対応しています。

## インストール
[ここ](https://github.com/himuro-majika/futaba_lightbox/raw/master/futaba_lightbox.user.js)


## 使い方
* 画像のサムネイルをクリックでギャラリー表示
* マウスクリック、マウスホイール、カーソルキー押下で前後移動
* 画像の外側をクリックまたはEscキー押下で閉じる


※ギャラリー表示せず通常通り画像を開くときはサムネイルを中ボタンクリックするかサムネイルの上のファイル名部分をクリックしてください

## 制限事項

* 赤福の続きを読むで読み込んだレス画像に対しては一定間隔で読み込むため即座に反映されないことがあります。
* 赤福の引用ポップアップから画像を開いた場合は次の画像・前の画像の順番が正しく表示されません。

## ライセンス

このUserscriptには[FancyBox](http://fancyapps.com/fancybox/)を使用しています

## 更新履歴
* 
  - マウスホイールでの前後移動を追加しました
  - ギャラリーで表示している画像を含むレスに自動的にスクロールするようにしました
  - 前後のナビゲーションボタンの反応エリアを少し広くしました
  - 画像のプリロード設定を復活(0→2)
* v1.0.1 2015-11-02
  - 数1000レス程度のレス数の多いスレで画像の開閉が遅くなる現象を修正(黒透過背景をやめました)
  - ギャラリー表示時のページスクロールを有効に
  - 前後の画像のプリロードを停止
  - マージンを微調整
* v1.0 2015-10-14
  - 公開
