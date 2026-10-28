# 本番用ソースの準備・検証

実施日：2026-10-28。

- 公開先：`https://kosukesato-lab.github.io/`、User Pages、baseなし。
- 制作元から `production/` へ分離し、原資料・一時生成物・デモの履歴を除外。
- 公開用データからdraftの報道・受賞2件を除外。実原稿56業績・研究3テーマ・ニュース1件・主宰者情報を保持。
- productionモードの型・データ・内部リンク・参照ID・リソース検証に成功。
- 単体テスト12件に成功。初期サンプルの存在を前提にした検証を、テスト内で異常データを注入する方式へ修正。
- ブラウザテスト11件が、baseなしと `/lab-test` 配下の両方で成功。
- 作業用サーバーとの混同を避けるため、ブラウザ検証には専用ポート4325と新しいサーバーを使用。
- 静的HTML28ページを生成。日本語・英語の主要ページ、研究詳細、開設記事、言語選択と404を含む。
- productionのホームはindex可能、404はnoindex。canonicalとサイトマップは正式URLを使用。
- 転送量の目標（JS gzip 100KB、ページ1.5MB）以内。

元リポジトリのJekyll用 `_config.yml` は `docs/legacy-jekyll-config.yml` に保持しました。今回のAstroビルドでは使いません。PagesのSourceをGitHub Actionsへ変更してください。

初期のpushでは検証のみ実行します。README記載の手順で `PAGES_ENABLED=true` を設定してから公開を開始できます。公開用ソースの準備・反映と、Pagesでの公開成功は別に確認してください。
