# Compass Works — コーポレートサイト デモ

架空ブランド **Compass Works（株式会社コンパスワークス）** のコーポレートサイト デモです。
ポートフォリオ用に、実在サイトの構成を参考にしつつ、社名・コピー・画像・タグラインはすべてオリジナル／架空に差し替えて制作しています。

> ⚠️ 本サイトはデモです。社名・人物・取引先・住所・連絡先はすべて架空であり、実在の企業・団体とは一切関係ありません。

## 構成

- マルチページ構成（クリーンURL `/about/` 形式・全10ページ）
  - トップ / 私たちについて / 事業内容 / 事例紹介 / メンバー紹介 / 会社情報 / お知らせ / コラム / お問い合わせ / 資料請求
- レスポンシブ対応・OGP / favicon / `prefers-reduced-motion` 対応

## 技術スタック

- 静的 HTML / CSS / JavaScript（CMSなし・フォームは見た目のみのデモ）
- アニメーション: GSAP + ScrollTrigger / Lenis（スムーススクロール）/ Splide（ヒーロー）/ Swiper（コラム）
- フォント: Zen Old Mincho + Cormorant Garamond + Noto Sans JP
- 会社案内チャットボット: Claude Haiku 4.5（`@anthropic-ai/sdk`）+ サーバーレス関数 `api/chat.js`

## チャットボット

全ページ右下の💬から起動する会社案内アシスタント。回答は Compass Works の案内に限定。

- **APIキーはサーバー側のみ**（環境変数 `ANTHROPIC_API_KEY`）。フロントには出さない
- フロント（`js/chat.js`）→ `POST /api/chat` → Claude を代理呼び出し
- 本番(Vercel): Settings → Environment Variables に `ANTHROPIC_API_KEY` を登録
- ⚠️ 公開エンドポイントです。本番運用ではレート制限／不正対策の追加を推奨

## ローカルでの起動

```bash
npm install                          # @anthropic-ai/sdk を取得
export ANTHROPIC_API_KEY=sk-ant-...  # チャットを使う場合のみ必要
node .claude/server.js
# → http://localhost:4321
```

※ キー未設定でもサイトは表示されます（チャット送信時のみエラー応答）。

## ディレクトリ

```
├ index.html            トップ
├ about/ business/ cases/ members/ company/ news/ columns/ contact/ catalog/
├ css/style.css         スタイル
├ js/main.js            スクリプト
├ images/               画像（Unsplash・商用可）
├ favicon.svg  robots.txt
└ .claude/server.js     ローカル配信用の簡易サーバー
```
