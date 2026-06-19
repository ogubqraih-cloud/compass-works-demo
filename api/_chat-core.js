// 共有コア：Vercel関数(api/chat.js)とローカル開発サーバー(.claude/server.js)の両方から利用。
// 公式SDK @anthropic-ai/sdk を使用（claude-api スキル準拠）。
// ※先頭が "_" のファイルは Vercel のルートにならない（共有モジュール用）。
const Anthropic = require('@anthropic-ai/sdk');

const MODEL = 'claude-haiku-4-5';
const MAX_TOKENS = 512;
const MAX_HISTORY = 12;      // 直近の会話往復数の上限
const MAX_CHARS = 1000;      // 1メッセージあたりの最大文字数

// 会社案内ボットのシステムプロンプト（Compass Works は架空ブランド）
const SYSTEM = `あなたは「Compass Works（株式会社コンパスワークス）」のコーポレートサイトに設置された案内アシスタントです。来訪者の質問に、当社に関する範囲で簡潔・丁寧に日本語（相手が他言語ならその言語）で答えます。

# 会社の基本情報（これ以外の事実は作らない）
- ブランド: Compass Works / 株式会社コンパスワークス
- タグライン: 「迷わぬ経営へ、針路を共に。」
- 提供価値: 外から助言するだけでなく、経営の現場に当事者として入り込み、進むべき針路を共に定め、結果が出るまで伴走する実行型の経営パートナー。
- 事業内容:
  1. 経営実行支援「Compass Management」… 経営チームの一員として意思決定と実行を共に担う
  2. 事業承継・再編支援 … 後継者不在・資本再構成など経営の転換点を支援
  3. 成長戦略パートナー … 戦略立案から現場実装までワンストップ
- 事例カテゴリ: 新生(Rebirth)／分社(Spinoff)／承継(Succession)／再編(Reorganization)
- メンバー: 豊富な実務経験を持つシニアエキスパート（代表取締役 佐藤 拓也 ほか）
- 会社情報: 東京都千代田区（住所・電話・FAXはデモ用の架空値）
- お問い合わせ: サイトの「お問い合わせ」ページ(/contact/) / 資料請求(/catalog/)

# 重要なルール
- 回答は当社（Compass Works）の案内に限定する。事業内容・事例・メンバー・会社情報・問い合わせ方法などに答える。
- 当社と無関係な話題（一般知識・時事・雑談・他社のこと・専門的な相談の実務代行 など）には踏み込まず、丁寧にお断りし、「具体的なご相談はお問い合わせページ(/contact/)へ」と案内する。
- 上記の基本情報にない具体的事実（正確な住所・電話番号・料金・実在の取引先名など）は創作しない。「本サイトはデモであり、住所・連絡先・人物・取引先は架空です」と正直に伝える。
- 簡潔に。長くなりすぎない（数文〜箇条書き程度）。
- 個人情報の入力は求めない。`;

function getClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    const err = new Error('ANTHROPIC_API_KEY is not set');
    err.code = 'NO_KEY';
    throw err;
  }
  return new Anthropic({ apiKey });
}

// messages: [{role:'user'|'assistant', content:'...'}] を受け取り、回答テキストを返す
async function chat(messages) {
  if (!Array.isArray(messages) || messages.length === 0) {
    const err = new Error('messages is required');
    err.code = 'BAD_INPUT';
    throw err;
  }
  // 正規化・サニタイズ＋直近のみに制限
  const clean = messages
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }))
    .slice(-MAX_HISTORY);

  if (clean.length === 0 || clean[clean.length - 1].role !== 'user') {
    const err = new Error('last message must be from user');
    err.code = 'BAD_INPUT';
    throw err;
  }

  const client = getClient();
  const resp = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: SYSTEM,
    messages: clean,
  });
  const reply = (resp.content || [])
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim();
  return reply || '申し訳ありません、うまくお答えできませんでした。お手数ですがお問い合わせページからご連絡ください。';
}

module.exports = { chat, MODEL, MAX_CHARS };
