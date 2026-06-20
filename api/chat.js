// Vercel サーバーレス関数： POST /api/chat
// ブラウザからの会話履歴を受け取り、サーバー側のキーで Claude を呼び出して回答を返す。
// APIキーは process.env.ANTHROPIC_API_KEY（Vercel 環境変数）にのみ存在し、フロントには出さない。
const { chat } = require('./_chat-core');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    return;
  }

  try {
    // body は Vercel が自動パースする場合と文字列の場合がある
    let body = req.body;
    if (typeof body === 'string') body = JSON.parse(body || '{}');
    if (!body) body = {};

    const reply = await chat(body.messages);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ reply }));
  } catch (e) {
    const code = e && e.code;
    let status = 500;
    let error = 'サーバーエラーが発生しました。時間をおいて再度お試しください。';
    if (code === 'BAD_INPUT') { status = 400; error = '入力が不正です。'; }
    else if (code === 'NO_KEY') { status = 503; error = 'ただいまAIアシスタントを準備中です（サーバーにAPIキーが未設定）。お問い合わせはお問い合わせフォームをご利用ください。'; }
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error }));
  }
};
