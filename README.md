# 佐藤研究室 公式Webサイト

電気通信大学・佐藤研究室の日本語／英語サイトです。Astro＋TypeScriptで静的HTMLを生成し、GitHub Pagesへ配置します。

- リポジトリ：<https://github.com/kosukesato-lab/kosukesato-lab.github.io>
- 公開先：<https://kosukesato-lab.github.io/>
- 日本語：`/ja/`、英語：`/en/`、ルート：言語選択
- 公開形態：User Pages、baseは空文字

このリポジトリは `C:\TEST\Lab_HP\production` に分離した公開用ソースです。制作元のContents、元の図版PNG、古いデモ・検証記録、一時fixture、生成済みdist、node_modulesは含めません。下書き活動レコードは公開用データから除外しました。

## 起動・検証

Node.js **24.14.1（24系）**、npm 11系を利用します。

```sh
npm ci
npm run dev
npm run verify
npx playwright install chromium
npm run test:browser
npm run preview
```

`npm run dev` で表示されたlocalhostの `/ja/` を開きます。`npm run preview` はbuild済みのdistを表示します。終了はCtrl+Cです。

既定設定は **production**、`https://kosukesato-lab.github.io`、baseなしです。原稿に未完成フラグ・無効な参照・不正な日付があるとbuildは失敗します。`npm run test:production` は公開データの検証だけを実行します。テスト専用の仮データは公開原稿へ書き込みません。

必要な場合だけシェルの `CONTENT_MODE`、`SITE_ORIGIN`、`BASE_PATH` で上書きできます。`.env.example` は項目の見本で、`.env` の自動読込みは行いません。

## GitHub Pagesで公開を開始する

初期pushは公開準備です。`PAGES_ENABLED` が未設定なら、検証だけを実行してdeployをスキップします。

1. GitHubで **Settings → Pages → Build and deployment → Source → GitHub Actions** を選択します。
2. **Settings → Secrets and variables → Actions → Variables** に `PAGES_ENABLED` を作り、値を `true` にします。
3. **Actions → Validate and prepare GitHub Pages → Run workflow** で既定ブランチを指定して実行します。
4. `validate`、`build`、`deploy` の成功と、`github-pages` environmentに表示されたURLを確認します。

有効化後はmainへのpushでも検証成功後に公開します。PRや既定ブランチ以外からは公開しません。機密トークンの登録は不要で、deployジョブだけにPages書込みとOIDC権限を付けています。公開を停止する場合は `PAGES_ENABLED` をfalseにします。

Actionsは実データのproductionビルドを、baseなしと `/lab-test` 配下の両方で検証し、型・データ・内部リンク・リソース量・単体テスト・ブラウザテストを実行します。GitHub Pagesへ渡すのは `dist/` の生成物だけです。

## コンテンツの更新

|場所|内容|
|---|---|
|`src/data/site.json`|研究室名、概要、連絡先、配属方針、FAQ|
|`src/data/profiles.json`|主宰者の経歴・研究分野・写真|
|`src/data/members.json`|メンバー、職位、掲載年度に関する情報|
|`src/data/publications.json`|原著論文・解説・特許、著者記号、代表論文|
|`src/data/activities.json`|報道・受賞。未掲載の場合は空配列|
|`src/content/research/ja/`・`en/`|日英の研究テーマMarkdown|
|`src/content/news/ja/`・`en/`|日英のニュースMarkdown|
|`public/assets/`|掲載許可のある写真・図・ロゴ・PDF|
|`src/i18n/ui.ts`|共通の日英文言|
|`src/styles/global.css`|配色・余白・文字サイズ|

手順は[更新マニュアル](docs/maintenance.md)を参照してください。新規原稿の雛形は `docs/templates/` にあります。雛形自体は公開ページにはなりません。

変更はこの公開用フォルダで行い、`npm run verify` とブラウザ確認の後でcommit・pushします。制作元フォルダから反映する場合は、必要な原稿・画像だけを比較してコピーし、本番config・ワークフロー・READMEを上書きしないでください。

## 利用条件

原稿・研究成果・人物写真・大学ロゴ等の権利は各権利者に帰属します。一律のオープンライセンスは付与していません。コードのライセンスも現時点では未指定です。
