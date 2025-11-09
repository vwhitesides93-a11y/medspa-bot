(function () {
  const API      = document.currentScript.getAttribute('data-api')   || '/api/chat';
  const BRAND    = document.currentScript.getAttribute('data-brand') || 'Med-Spa Concierge';
  const BOOK_URL = document.currentScript.getAttribute('data-book')  || '';

// Bubble button
const bubble = document.createElement('div');
bubble.id = 'ms-bot-bubble';
bubble.className = 'ms-bot-bubble'; 
bubble.innerHTML = '💬';

// Window
const win = document.createElement('div');
win.id = 'ms-bot-window';
win.className = 'ms-bot-window';     
  win.innerHTML = `
    <div id="ms-header">${BRAND}<span id="ms-close" style="cursor:pointer">✕</span></div>
    <div id="ms-lead">
      <div style="font-weight:600; margin-bottom:6px">Let's get you set up:</div>
      <input id="lead-name"  placeholder="Name"/>
      <input id="lead-email" placeholder="Email"/>
      <input id="lead-phone" placeholder="Phone"/>
      <div style="font-size:12px; color:#666">By proceeding, you agree to be contacted about your appointment.</div>
    </div>
    <div id="ms-body"></div>
    <div id="ms-input">
      <input id="ms-text" placeholder="Ask about services, pricing, prep…"/>
      <button id="ms-send">Send</button>
    </div>
  `;

  function mountWidget () {
    // Attach CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = (document.currentScript.getAttribute('data-css') || '/public/widget.css');
    document.head.appendChild(link);

    // Add to DOM
    document.body.appendChild(bubble);
    document.body.appendChild(win);

    // Refs
    const body  = win.querySelector('#ms-body');
    const input = win.querySelector('#ms-text');
    const send  = win.querySelector('#ms-send');
    const close = win.querySelector('#ms-close');

    // Helpers
    function addMsg (text, who) {
      const div = document.createElement('div');
      div.className = `ms-msg ${who === 'user' ? 'ms-user' : 'ms-bot'}`;
      div.textContent = text;
      body.appendChild(div);
      body.scrollTop = body.scrollHeight;
    }

    async function ask () {
      const text = input.value.trim();
      if (!text) return;
      addMsg(text, 'user');
      input.value = '';

      const lead = {
        name:  document.getElementById('lead-name').value.trim(),
        email: document.getElementById('lead-email').value.trim(),
        phone: document.getElementById('lead-phone').value.trim(),
      };

      try {
        const r = await fetch(API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text, lead }),
        });
        const data  = await r.json();
        const reply = data.reply || 'Thanks! Our team will follow up shortly.';
        addMsg(reply, 'bot');

        if (data.booking && data.booking.url) {
          const a = document.createElement('div');
          a.id = 'ms-book';
          a.textContent = '→ Book Now';
          a.onclick = () => window.open(BOOK_URL || data.booking.url, '_blank');
          body.appendChild(a);
          body.scrollTop = body.scrollHeight;
        }
      } catch (e) {
        addMsg('Temporary issue — please try again or use the Book Now link on our site.', 'bot');
      }
    }

    // Welcome & handlers
    addMsg('Hi! I can answer questions and help you book an appointment.', 'bot');
    bubble.onclick = () => { win.style.display = 'flex'; };
    close.onclick  = () => { win.style.display = 'none'; };
    send.onclick   = ask;
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') ask(); });
  }
// Make a tiny public API so demo pages (or client sites) can open the bot prefilled
window.MedSpaBot = {
  open(prefill) {
    win.style.display = 'flex';
    if (prefill) {
      input.value = prefill;
      // trigger the same action as clicking Send
      send.click();
    }
  }
};

  // Run whether DOM is ready or not
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountWidget);
  } else {
    mountWidget();
  }
})();
