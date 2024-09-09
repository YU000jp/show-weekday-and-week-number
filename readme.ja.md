# Logseq プラグイン: *Show weekday and week-number* 📆

- Logseqのジャーナル機能を強化
  1. 日付タイトルの横に、曜日と週番号を表示
  1. 2行カレンダー
  1. ジャーナルのナビゲーションリンク
     1. 「週次ジャーナル」機能

> [!WARNING]
>現在、このプラグインはLogseq dbバージョンでは動作しません。

<div align="right">

[English](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/)/[日本語](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/blob/main/readme.ja.md) [![latest release version](https://img.shields.io/github/v/release/YU000jp/logseq-plugin-show-weekday-and-week-number)](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/releases)[![License](https://img.shields.io/github/license/YU000jp/logseq-plugin-show-weekday-and-week-number?color=blue)](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/LICENSE)
[![Downloads](https://img.shields.io/github/downloads/YU000jp/logseq-plugin-show-weekday-and-week-number/total.svg)](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/releases) 公開日 20230526 <a href="https://www.buymeacoffee.com/yu000japan"><img src="https://img.buymeacoffee.com/button-api/?text=Buy me a pizza&emoji=🍕&slug=yu000japan&button_colour=FFDD00&font_colour=000000&font_family=Poppins&outline_colour=000000&coffee_colour=ffffff" /></a>
</div>

## 機能一覧

### デイリージャーナルの詳細表示 (Daily journal Details)

- 日付タイトルの横に、次のように、曜日や週番号が表示されます。プラグイン設定で、表示する内容を選択できます。

1. ![画像](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/assets/111847207/f47b8948-5e7a-4e16-a5ae-6966672742b1)

### ジャーナル用カレンダー (Journal Boundaries)

- 日誌や日付ページ、あるいは週次ジャーナルなどを開いているときに表示します。
- 前後の日付にアクセスできます。Shiftキーを押しながらクリックすると、サイドバーで開きます。
- 祝日対応のカレンダーです！
- 日付のページが存在するかどうかのインジケーター もあります。

1. 2行ミニカレンダー

   > ![image](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/assets/111847207/bf085523-89e7-4c2a-a7ef-9a260975bde8)
   - ↑ ↓ で前後の週に切り替わります。
   - 左の`5月`は、`[[2024/05]]`というページが開きます。 >> 月次ジャーナル
   - 右の`W19`は、`[[2024/Q2/W19]]`というページが開きます。 >> 週次ジャーナル

1. 月間カレンダー (左サイドバー) 🆕

   > ![image](https://github.com/user-attachments/assets/3f1c717b-82b0-4869-b9c2-6369d5a82b38)

### ジャーナルのナビゲーションリンク 🆕

1. 各種ジャーナルのページ上部のナビゲーションリンクから、ほかのジャーナルへアクセスできます。

   > ![image](https://github.com/user-attachments/assets/6beaf16a-3a6b-4846-aeaa-840816837da3)


### 週次ジャーナル (Weekly Journal)

- 週番号のリンクをクリックして開くと、ページが生成されます。一週間のふりかえりを容易にするためのしくみを提供します。

> [ドキュメントはこちら](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/wiki/%E9%80%B1%E6%AC%A1%E3%82%B8%E3%83%A3%E3%83%BC%E3%83%8A%E3%83%AB-(Weekly-Journal))

サンプル:

  ![image](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/assets/111847207/eb35708d-89e9-401d-a0b9-9ff8e49bb290)

1. 上のナビゲーションリンクによって、前後の週にアクセスできます。

### 月次ジャーナル (Monthly Journal)

- ミニカレンダーの左側にあるリンクをクリックすると`[[2023/10]]`のようなページが生成され、テンプレートが適用されます。

### 四半期ジャーナル (Quarterly Journal) / 年次ジャーナル (Yearly Journal) 🆕

> 注: 四半期ジャーナルは、週次ジャーナルのページタイトルのフォーマットが`yyyy/qqq/Www`に設定されている場合のみ有効です。
- 月次もしくは週次の階層リンクからアクセスしてください。ページが生成され、テンプレートが適用されます。

### 週番号などのスラッシュコマンド

> [ドキュメントはこちら](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/wiki/Slash-Command)

---

## はじめに

Logseq マーケットプレイスからインストール
  - 右上のツールバーで[`---`]を押して [`プラグイン`] を開きます。`マーケットプレイス` を選択します。検索フィールドに `Show` と入力し、検索結果から選択してインストールします。

   ![image](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/assets/111847207/6bd1d650-f3ce-4962-aa22-4cd3839d0466)

### 使用方法

- プラグイン設定から個別にカスタマイズが可能です。一部の機能はデフォルトではオフになっています。
- 初期設定
  1. プラグイン設定にて、週番号の計算方式を選択してください。
     - `USフォーマット (アメリカ式)`または`ISOフォーマット`のどちらかになります。
       > [週番号についてのドキュメントはこちら](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/wiki/%E9%80%B1%E7%95%AA%E5%8F%B7%E3%83%95%E3%82%A9%E3%83%BC%E3%83%9E%E3%83%83%E3%83%88%E3%81%AE%E9%81%B8%E6%8A%9E%E8%82%A2-(Japanese))

---

# ショーケース / 質問 / アイデア / ヘルプ

> [ディスカッション](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/discussions) タブに移動して、この種の情報を質問したり見つけたりできます。

- 関連
  1. 日付リンクに含まれる曜日を、日本語表記にする
     > [Flex date format プラグイン](https://github.com/YU000jp/logseq-plugin-flex-date-format)を利用してください。
  1. 古い日付シングルページを開いたときに、ジャーナルテンプレートが適用されない
     > [Default Template プラグイン](https://github.com/YU000jp/logseq-plugin-default-template)のジャーナルテンプレート補完機能を利用してください。

## 貢献 / クレジット

- スクリプト > [曜日と週番号を表示 - discuss.logseq.com](https://discuss.logseq.com/t/show-week-day-and-week-number/12685/18) @[danilofaria](https://discuss.logseq.com/u/danilofaria/), @[ottodevs](https://discuss.logseq.com/u/ottodevs/)
- ライブラリ > [date-fns](https://date-fns.org/)
- ライブラリ > [date-holidays](https://github.com/commenthol/date-holidays) 祝日のハイライト
- ライブラリ > [@sethyuan/ logseq-l10n](https://github.com/sethyuan/logseq-l10n) 翻訳機能
- アイコン > [@IonutNeagu - svgrepo.com](https://www.svgrepo.com/svg/490868/monday)
- 製作者 > [@YU000jp](https://github.com/YU000jp)
