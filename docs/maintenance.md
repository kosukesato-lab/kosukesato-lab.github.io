# 公開サイトの更新手順

## 変更後に必ず行うこと

JSON・Markdownの編集後、`npm run verify` と `npm run test:browser` を実行し、日英両方を確認してcommit・pushしてください。`updatedAt` は実際に原稿を更新した日付を `YYYY-MM-DD` で記録します。

この公開用フォルダの既定値はproductionです。プレースホルダーは完成させるか、対象レコードを `draft: true` にして公開対象から外します。公開中のデータからdraftへ参照を残すことはできません。

業績の表示件数は、productionでは `draft: false` のレコードだけを数えます。`status: published` でも `draft: true` なら非表示です。JSONの総件数と公開件数が異なるのは正常です。原稿を編集したら、ブラウザテストの前に `npm run verify` でdistも再生成してください。プレビューはJSONから直接表示せず、生成済みのHTMLを使います。

## 基本情報と配色

`src/data/site.json` の `name`、`institution`、`department`、`overview`、`address`、`email`、`phone` を編集します。`philosophy`、`environment`、`faq` は配属進学ページ、`transport`・`mapUrl` はアクセスページに使います。原稿は `{ "ja": "日本語", "en": "English" }` の組です。

配色は `src/styles/global.css` 先頭のCSS変数で変更します。アクセント色を変更したら、文字と背景のコントラストを再確認してください。

## ニュース

`docs/templates/news.md` を `src/content/news/ja/新しいslug.md` と `en/新しいslug.md` へコピーします。両言語で同じ `id`・`slug`・`translationKey` を指定し、`lang` をそれぞれja/enとします。掲載日は `date`、同日の順序は `order` です。カテゴリは `lab`・`publication`・`award`・`event`。本文はMarkdownで記述し、H1はページ側で表示するため本文に重複させません。

`publicationIds`、`themeIds`、`activityIds` で関連データを参照します。完成後 `isPlaceholder: false`、`draft: false` にします。片方の翻訳がない場合は言語切替が一覧へ戻ります。両言語を揃える運用を推奨します。

## 論文・解説・特許

`docs/templates/publication.json` のオブジェクトを `src/data/publications.json` の配列に追加します。`id` は重複しないものを使います。著者は配列順を保持し、研究室メンバーは `memberId`、責任著者は `corresponding: true`、共同第一著者は `equalContribution: true` を指定します。

年は `year`、同年内の順序は `order`。`type` はarticle/review/book/patent、`status` はpublished/in-press/preprint/patent-applicationです。未査読プレプリントは掲載済み論文と区別します。タイトルは原文を保持します。

`doi` は `10.xxxx/xxxx` 形式で、URL接頭辞は付けません。`url` は完全なURL、`pdf` は `assets/papers/file.pdf` のようなpublic相対パスです。未設定はnullとし、架空の値は入れません。`featured: true` と `featuredOrder` の小さい順で代表論文3件を選びます。

## 研究紹介・図

`src/content/research/{ja,en}/theme-01.md` 等の本文と先頭メタ情報を編集します。図は `public/assets/research/` へ置き、`image` に高解像度版、`imageThumbnail` に一覧用画像、`imageWidth`・`imageHeight` に実際の寸法を指定します。`caption` は説明、`imageAlt` は内容を説明する代替テキストです。

図は切り取らず元の縦横比で表示し、拡大リンクを提供します。画像はWebP等で最適化し、一覧では軽量な画像を使ってください。元の図版は制作元フォルダに保管し、公開用リポジトリへ作業資料を一括コピーしないでください。

関連論文は `publicationIds` で指定します。`H<sub>2</sub>O`、`cm<sup>−1</sup>` のような下付き・上付き表記が可能です。

## プロフィール・メンバー・年度更新

`src/data/profiles.json` に経歴・学歴・学会等を記載します。開始月・終了月はYYYY-MM、現職の終了月はnull。配列は新しい順にします。外部プロフィールは正式URLがある時だけ `externalProfiles` にlabelとurlを設定します。

メンバーの雛形は `docs/templates/member.json` です。groupはfaculty/staff/doctoral/masters/undergraduate/alumni、roleは日英の職位・学年、orderは表示順です。学生の個別メールは掲載しません。

年度更新は `site.json` の `fiscalYear` と、各人のrole・groupを手動で変更します。自動進級はしません。卒業時はgroupとstatusをalumniにし、graduationYearを設定します。写真はnullなら準備中表示になります。

## 報道・受賞

未掲載の場合は `activities.json` を空配列にできます。記録がある場合はid、type、date、日英title、media、recipient、organization、research、url、および共通メタ情報を設定します。既存ページの表示処理に必要な項目を揃え、未使用の媒体・受賞欄は日英の説明的な実値で記載するか、レコード型と検証を調整してください。情報を創作しないでください。

## 公開・復旧

公開開始はREADME記載のPages設定と `PAGES_ENABLED=true` で行います。Actionsの赤いステップでは、検証ログのファイル名・項目名を修正してください。公開URLはdeployとgithub-pages environmentに表示されます。

誤更新は `git revert <コミットID>` で戻し、差分を確認してpushします。検証と再デプロイ後、実URLを確認してください。履歴を消すforce pushは不要です。

独自ドメインへ移行するときはconfig.mjsとワークフローのSITE_ORIGINを揃え、GitHub PagesのCustom domain・DNS・必要に応じてCNAMEを設定します。Project Pagesへ移す場合はBASE_PATHも設定し、canonical・アセット・言語切替を検証してください。

公開する画像・PDFの権利を確認し、コードとは別に管理してください。秘密情報・非公開原稿・不要な個人連絡先をリポジトリへ追加しないでください。
