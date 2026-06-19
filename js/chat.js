/* ===== Compass Works 会社案内チャットボット（フロント） =====
   APIキーは持たない。/api/chat へ会話履歴を送り、サーバー経由で Claude を呼ぶ。 */
(function () {
  const MAX_CHARS = 1000;
  const history = []; // {role:'user'|'assistant', content}

  // --- DOM 生成 ---
  const root = document.createElement('div');
  root.className = 'cw-chat';
  root.innerHTML = `
    <button class="cw-chat__launcher" type="button" aria-label="チャットで質問する">
      <span class="cw-chat__launcher-icon">💬</span>
    </button>
    <section class="cw-chat__panel" role="dialog" aria-label="Compass Works 案内チャット" hidden>
      <header class="cw-chat__head">
        <div>
          <p class="cw-chat__title">Compass Works 案内</p>
          <p class="cw-chat__sub">会社・事業についてお答えします</p>
        </div>
        <button class="cw-chat__close" type="button" aria-label="閉じる">×</button>
      </header>
      <div class="cw-chat__log" aria-live="polite"></div>
      <form class="cw-chat__form">
        <textarea class="cw-chat__input" rows="1" maxlength="${MAX_CHARS}" placeholder="質問を入力（例：事業内容を教えて）"></textarea>
        <button class="cw-chat__send" type="submit" aria-label="送信">→</button>
      </form>
      <p class="cw-chat__note">※ デモ用のAIアシスタントです。内容は架空の設定に基づきます。</p>
    </section>`;
  document.body.appendChild(root);

  const launcher = root.querySelector('.cw-chat__launcher');
  const panel = root.querySelector('.cw-chat__panel');
  const closeBtn = root.querySelector('.cw-chat__close');
  const log = root.querySelector('.cw-chat__log');
  const form = root.querySelector('.cw-chat__form');
  const input = root.querySelector('.cw-chat__input');
  const sendBtn = root.querySelector('.cw-chat__send');

  let greeted = false;
  function open() {
    panel.hidden = false;
    root.classList.add('is-open');
    if (!greeted) {
      greeted = true;
      addBubble('assistant', 'こんにちは。Compass Works の案内アシスタントです。事業内容・事例・会社情報など、お気軽にどうぞ。');
    }
    setTimeout(() => input.focus(), 50);
  }
  function close() {
    panel.hidden = true;
    root.classList.remove('is-open');
  }
  launcher.addEventListener('click', () => (panel.hidden ? open() : close()));
  closeBtn.addEventListener('click', close);

  // --- メッセージ描画 ---
  function addBubble(role, text) {
    const el = document.createElement('div');
    el.className = 'cw-chat__msg cw-chat__msg--' + role;
    el.textContent = text;
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
    return el;
  }
  function addTyping() {
    const el = document.createElement('div');
    el.className = 'cw-chat__msg cw-chat__msg--assistant cw-chat__typing';
    el.innerHTML = '<span></span><span></span><span></span>';
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
    return el;
  }

  // textarea 自動リサイズ
  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 120) + 'px';
  });
  // Enterで送信（Shift+Enterで改行）
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      form.requestSubmit();
    }
  });

  let busy = false;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (busy) return;
    const text = input.value.trim();
    if (!text) return;

    addBubble('user', text);
    history.push({ role: 'user', content: text });
    input.value = '';
    input.style.height = 'auto';

    busy = true;
    sendBtn.disabled = true;
    const typing = addTyping();

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history.slice(-12) }),
      });
      typing.remove();
      if (!res.ok) throw new Error('http ' + res.status);
      const data = await res.json();
      const reply = (data && data.reply) || '申し訳ありません、うまくお答えできませんでした。';
      addBubble('assistant', reply);
      history.push({ role: 'assistant', content: reply });
    } catch (err) {
      typing.remove();
      addBubble('assistant', '通信エラーが発生しました。時間をおいて再度お試しください。');
    } finally {
      busy = false;
      sendBtn.disabled = false;
      input.focus();
    }
  });
})();
