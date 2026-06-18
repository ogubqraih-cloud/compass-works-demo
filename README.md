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

## ローカルでの起動

```bash
node .claude/server.js
# → http://localhost:4321
```

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
