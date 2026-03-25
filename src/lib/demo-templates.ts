export const SPRING_SALE_TEMPLATE = `<section class="spring-sale" id="section-{{ section.id }}">
  <style>
    #section-{{ section.id }} {
      --bg: {{ section.settings.bg_color }};
      --bg-alt: {{ section.settings.bg_alt_color }};
      --surface: {{ section.settings.card_color }};
      --text: {{ section.settings.text_color }};
      --muted: {{ section.settings.muted_color }};
      --heading: {{ section.settings.heading_color }};
      --accent: {{ section.settings.accent_color }};
      --accent-hover: {{ section.settings.accent_hover_color }};
      --btn-text: {{ section.settings.btn_text_color }};
      --border: {{ section.settings.border_color }};
      --glow: {{ section.settings.glow_color }};
      --max-w: 1200px;
      --radius: 18px;
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      overflow: hidden;
      position: relative;
    }
    #section-{{ section.id }} * { box-sizing: border-box; margin: 0; }
    #section-{{ section.id }} a { color: inherit; text-decoration: none; }
    #section-{{ section.id }} img { display: block; max-width: 100%; height: auto; }

    #section-{{ section.id }} .ss-wrap {
      max-width: var(--max-w);
      margin: 0 auto;
      padding: 0 24px;
    }

    /* ── Urgency Marquee ── */
    #section-{{ section.id }} .ss-marquee {
      background: var(--accent);
      color: var(--btn-text);
      overflow: hidden;
      white-space: nowrap;
      font-weight: 800;
      font-size: 0.8rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      padding: 10px 0;
    }
    #section-{{ section.id }} .ss-marquee-track {
      display: inline-flex;
      animation: ssScroll 20s linear infinite;
    }
    #section-{{ section.id }} .ss-marquee-track span {
      padding: 0 32px;
      display: inline-flex;
      align-items: center;
      gap: 12px;
    }
    #section-{{ section.id }} .ss-marquee-track span::after {
      content: "✦";
      opacity: 0.5;
    }

    /* ── Hero ── */
    #section-{{ section.id }} .ss-hero {
      padding: clamp(80px, 14vw, 160px) 0 clamp(60px, 10vw, 120px);
      text-align: center;
      position: relative;
    }
    #section-{{ section.id }} .ss-hero::before {
      content: "";
      position: absolute;
      top: -50%;
      left: 50%;
      transform: translateX(-50%);
      width: 1000px;
      height: 1000px;
      background: radial-gradient(circle, color-mix(in srgb, var(--glow) 18%, transparent) 0%, transparent 65%);
      pointer-events: none;
    }
    #section-{{ section.id }} .ss-hero::after {
      content: "";
      position: absolute;
      bottom: -20%;
      right: -10%;
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, color-mix(in srgb, var(--accent) 8%, transparent) 0%, transparent 70%);
      pointer-events: none;
    }
    #section-{{ section.id }} .ss-badge {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 10px 22px;
      border-radius: 999px;
      background: color-mix(in srgb, var(--accent) 10%, transparent);
      border: 1px solid color-mix(in srgb, var(--accent) 20%, transparent);
      backdrop-filter: blur(12px);
      color: var(--accent);
      font-weight: 700;
      font-size: 0.82rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      margin-bottom: 28px;
      animation: ssFadeUp 0.7s ease both;
    }
    #section-{{ section.id }} .ss-badge::before {
      content: "";
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--accent);
      box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent) 20%, transparent);
      animation: ssPulse 2s ease-in-out infinite;
    }
    #section-{{ section.id }} .ss-hero h1 {
      font-size: clamp(3rem, 7vw, 5.5rem);
      font-weight: 900;
      line-height: 0.95;
      letter-spacing: -0.04em;
      color: var(--heading);
      margin-bottom: 24px;
      animation: ssFadeUp 0.7s ease 0.1s both;
    }
    #section-{{ section.id }} .ss-hero h1 em {
      font-style: normal;
      background: linear-gradient(135deg, var(--accent), var(--glow));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    #section-{{ section.id }} .ss-hero-sub {
      font-size: clamp(1.05rem, 2vw, 1.25rem);
      line-height: 1.65;
      color: var(--muted);
      max-width: 560px;
      margin: 0 auto 36px;
      animation: ssFadeUp 0.7s ease 0.2s both;
    }
    #section-{{ section.id }} .ss-hero-actions {
      display: flex;
      justify-content: center;
      gap: 14px;
      flex-wrap: wrap;
      animation: ssFadeUp 0.7s ease 0.3s both;
    }

    /* ── Buttons ── */
    #section-{{ section.id }} .ss-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 15px 36px;
      border-radius: 999px;
      font-weight: 700;
      font-size: 1rem;
      border: none;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }
    #section-{{ section.id }} .ss-btn-primary {
      background: linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 80%, var(--glow)));
      color: var(--btn-text);
      box-shadow: 0 8px 30px color-mix(in srgb, var(--accent) 35%, transparent);
    }
    #section-{{ section.id }} .ss-btn-primary:hover {
      transform: translateY(-3px);
      box-shadow: 0 14px 40px color-mix(in srgb, var(--accent) 45%, transparent);
    }
    #section-{{ section.id }} .ss-btn-outline {
      background: color-mix(in srgb, var(--surface) 50%, transparent);
      color: var(--text);
      border: 1.5px solid var(--border);
      backdrop-filter: blur(8px);
    }
    #section-{{ section.id }} .ss-btn-outline:hover {
      border-color: var(--accent);
      color: var(--accent);
      transform: translateY(-3px);
    }

    /* ── Countdown ── */
    #section-{{ section.id }} .ss-countdown {
      background: linear-gradient(180deg, var(--bg-alt), color-mix(in srgb, var(--bg-alt) 90%, var(--accent) 10%));
      padding: 56px 24px;
      border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
    }
    #section-{{ section.id }} .ss-countdown-inner {
      max-width: var(--max-w);
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 48px;
      flex-wrap: wrap;
      text-align: center;
    }
    #section-{{ section.id }} .ss-countdown-label {
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--heading);
      letter-spacing: -0.01em;
    }
    #section-{{ section.id }} .ss-timer {
      display: flex;
      gap: 10px;
    }
    #section-{{ section.id }} .ss-timer-unit {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 72px;
      padding: 16px 18px;
      border-radius: 14px;
      background: var(--surface);
      border: 1px solid var(--border);
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    }
    #section-{{ section.id }} .ss-timer-num {
      font-size: 2rem;
      font-weight: 900;
      color: var(--accent);
      font-variant-numeric: tabular-nums;
      line-height: 1;
    }
    #section-{{ section.id }} .ss-timer-txt {
      font-size: 0.65rem;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      color: var(--muted);
      margin-top: 6px;
      font-weight: 600;
    }

    /* ── Products ── */
    #section-{{ section.id }} .ss-products {
      padding: clamp(72px, 10vw, 120px) 0;
    }
    #section-{{ section.id }} .ss-section-header {
      text-align: center;
      margin-bottom: 56px;
    }
    #section-{{ section.id }} .ss-section-header h2 {
      font-size: clamp(2rem, 4.5vw, 3rem);
      font-weight: 900;
      color: var(--heading);
      letter-spacing: -0.03em;
      margin-bottom: 14px;
      line-height: 1.05;
    }
    #section-{{ section.id }} .ss-section-header p {
      color: var(--muted);
      font-size: 1.1rem;
      max-width: 500px;
      margin: 0 auto;
      line-height: 1.65;
    }
    #section-{{ section.id }} .ss-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 20px;
    }
    #section-{{ section.id }} .ss-card {
      border-radius: var(--radius);
      background: var(--surface);
      border: 1px solid var(--border);
      overflow: hidden;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
    }
    #section-{{ section.id }} .ss-card::after {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: var(--radius);
      opacity: 0;
      transition: opacity 0.4s ease;
      background: linear-gradient(180deg, transparent 50%, color-mix(in srgb, var(--accent) 6%, transparent));
      pointer-events: none;
    }
    #section-{{ section.id }} .ss-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 24px 60px rgba(0,0,0,0.25), 0 0 0 1px color-mix(in srgb, var(--accent) 20%, transparent);
      border-color: color-mix(in srgb, var(--accent) 30%, var(--border));
    }
    #section-{{ section.id }} .ss-card:hover::after { opacity: 1; }

    #section-{{ section.id }} .ss-card-img {
      aspect-ratio: 1;
      overflow: hidden;
      background: linear-gradient(135deg, color-mix(in srgb, var(--surface) 60%, white 40%), var(--surface));
      position: relative;
    }
    #section-{{ section.id }} .ss-card-img img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }
    #section-{{ section.id }} .ss-card:hover .ss-card-img img {
      transform: scale(1.06);
    }
    #section-{{ section.id }} .ss-card-sale {
      position: absolute;
      top: 14px;
      left: 14px;
      background: linear-gradient(135deg, var(--accent), var(--accent-hover));
      color: var(--btn-text);
      padding: 6px 14px;
      border-radius: 999px;
      font-size: 0.72rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      box-shadow: 0 4px 14px color-mix(in srgb, var(--accent) 40%, transparent);
      z-index: 1;
    }
    #section-{{ section.id }} .ss-card-body {
      padding: 18px 20px 22px;
      position: relative;
      z-index: 1;
    }
    #section-{{ section.id }} .ss-card-title {
      font-weight: 700;
      font-size: 1.05rem;
      color: var(--heading);
      margin-bottom: 10px;
      line-height: 1.3;
    }
    #section-{{ section.id }} .ss-card-prices {
      display: flex;
      align-items: baseline;
      gap: 10px;
    }
    #section-{{ section.id }} .ss-card-price {
      font-weight: 900;
      font-size: 1.15rem;
      color: var(--accent);
    }
    #section-{{ section.id }} .ss-card-compare {
      font-size: 0.85rem;
      color: var(--muted);
      text-decoration: line-through;
    }

    /* ── Social Proof ── */
    #section-{{ section.id }} .ss-proof {
      background: var(--bg-alt);
      border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
      padding: 56px 24px;
    }
    #section-{{ section.id }} .ss-proof-inner {
      max-width: var(--max-w);
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1fr;
      gap: 24px;
    }
    #section-{{ section.id }} .ss-review {
      padding: 28px;
      border-radius: var(--radius);
      background: var(--surface);
      border: 1px solid var(--border);
      position: relative;
    }
    #section-{{ section.id }} .ss-review-stars {
      color: #fbbf24;
      font-size: 1rem;
      margin-bottom: 12px;
      letter-spacing: 2px;
    }
    #section-{{ section.id }} .ss-review-text {
      font-size: 0.95rem;
      line-height: 1.65;
      color: var(--text);
      margin-bottom: 14px;
      font-style: italic;
    }
    #section-{{ section.id }} .ss-review-author {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--heading);
    }
    #section-{{ section.id }} .ss-review-meta {
      font-size: 0.8rem;
      color: var(--muted);
    }

    /* ── Benefits ── */
    #section-{{ section.id }} .ss-benefits {
      padding: clamp(72px, 10vw, 120px) 0;
    }
    #section-{{ section.id }} .ss-benefits-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 16px;
      max-width: var(--max-w);
      margin: 0 auto;
      padding: 0 24px;
    }
    #section-{{ section.id }} .ss-benefit {
      text-align: center;
      padding: 36px 24px;
      border-radius: var(--radius);
      background: var(--surface);
      border: 1px solid var(--border);
      transition: all 0.3s ease;
    }
    #section-{{ section.id }} .ss-benefit:hover {
      border-color: color-mix(in srgb, var(--accent) 25%, var(--border));
      transform: translateY(-4px);
      box-shadow: 0 12px 30px rgba(0,0,0,0.15);
    }
    #section-{{ section.id }} .ss-benefit-icon {
      font-size: 2.2rem;
      margin-bottom: 14px;
    }
    #section-{{ section.id }} .ss-benefit h3 {
      font-size: 1rem;
      font-weight: 800;
      color: var(--heading);
      margin-bottom: 6px;
    }
    #section-{{ section.id }} .ss-benefit p {
      font-size: 0.88rem;
      color: var(--muted);
      line-height: 1.55;
    }

    /* ── CTA ── */
    #section-{{ section.id }} .ss-cta {
      padding: clamp(72px, 10vw, 120px) 24px;
    }
    #section-{{ section.id }} .ss-cta-card {
      max-width: 860px;
      margin: 0 auto;
      text-align: center;
      padding: clamp(48px, 7vw, 80px) clamp(32px, 5vw, 64px);
      border-radius: calc(var(--radius) + 6px);
      background: linear-gradient(135deg, var(--surface), color-mix(in srgb, var(--surface) 85%, var(--accent) 15%));
      border: 1px solid color-mix(in srgb, var(--accent) 25%, var(--border));
      position: relative;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    }
    #section-{{ section.id }} .ss-cta-card::before {
      content: "";
      position: absolute;
      top: -50%;
      right: -30%;
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, color-mix(in srgb, var(--glow) 20%, transparent), transparent 70%);
      pointer-events: none;
    }
    #section-{{ section.id }} .ss-cta-card::after {
      content: "";
      position: absolute;
      bottom: -30%;
      left: -20%;
      width: 300px;
      height: 300px;
      background: radial-gradient(circle, color-mix(in srgb, var(--accent) 12%, transparent), transparent 70%);
      pointer-events: none;
    }
    #section-{{ section.id }} .ss-cta-card h2 {
      font-size: clamp(1.8rem, 4.5vw, 2.8rem);
      font-weight: 900;
      color: var(--heading);
      letter-spacing: -0.03em;
      margin-bottom: 14px;
      position: relative;
      line-height: 1.1;
    }
    #section-{{ section.id }} .ss-cta-card p {
      color: var(--muted);
      margin-bottom: 32px;
      font-size: 1.1rem;
      line-height: 1.65;
      position: relative;
      max-width: 520px;
      margin-left: auto;
      margin-right: auto;
    }

    /* ── Media queries ── */
    @media (min-width: 640px) {
      #section-{{ section.id }} .ss-grid { grid-template-columns: repeat(2, 1fr); }
      #section-{{ section.id }} .ss-benefits-grid { grid-template-columns: repeat(2, 1fr); }
      #section-{{ section.id }} .ss-proof-inner { grid-template-columns: repeat(2, 1fr); }
    }
    @media (min-width: 900px) {
      #section-{{ section.id }} .ss-grid { grid-template-columns: repeat(4, 1fr); }
      #section-{{ section.id }} .ss-benefits-grid { grid-template-columns: repeat(4, 1fr); }
      #section-{{ section.id }} .ss-proof-inner { grid-template-columns: repeat(3, 1fr); }
    }

    /* ── Animations ── */
    @keyframes ssFadeUp {
      from { opacity: 0; transform: translateY(24px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes ssPulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.9); }
    }
    @keyframes ssScroll {
      from { transform: translateX(0); }
      to { transform: translateX(-50%); }
    }
    @media (prefers-reduced-motion: reduce) {
      #section-{{ section.id }} * { animation: none !important; transition: none !important; }
    }
  </style>

  <!-- Urgency Banner -->
  <div class="ss-marquee" aria-hidden="true">
    <div class="ss-marquee-track">
      <span>{{ section.settings.marquee_text }}</span>
      <span>{{ section.settings.marquee_text }}</span>
      <span>{{ section.settings.marquee_text }}</span>
      <span>{{ section.settings.marquee_text }}</span>
      <span>{{ section.settings.marquee_text }}</span>
      <span>{{ section.settings.marquee_text }}</span>
      <span>{{ section.settings.marquee_text }}</span>
      <span>{{ section.settings.marquee_text }}</span>
    </div>
  </div>

  <!-- Hero -->
  <div class="ss-hero">
    <div class="ss-wrap">
      <div class="ss-badge">{{ section.settings.badge_text }}</div>
      <h1>{{ section.settings.hero_title }}</h1>
      <p class="ss-hero-sub">{{ section.settings.hero_text }}</p>
      <div class="ss-hero-actions">
        <a href="{{ section.settings.cta_link }}" class="ss-btn ss-btn-primary">{{ section.settings.cta_label }}</a>
        <a href="{{ section.settings.cta2_link }}" class="ss-btn ss-btn-outline">{{ section.settings.cta2_label }}</a>
      </div>
    </div>
  </div>

  <!-- Countdown -->
  <div class="ss-countdown">
    <div class="ss-countdown-inner">
      <span class="ss-countdown-label">{{ section.settings.countdown_label }}</span>
      <div class="ss-timer" id="ss-timer-{{ section.id }}">
        <div class="ss-timer-unit"><span class="ss-timer-num">03</span><span class="ss-timer-txt">Days</span></div>
        <div class="ss-timer-unit"><span class="ss-timer-num">14</span><span class="ss-timer-txt">Hours</span></div>
        <div class="ss-timer-unit"><span class="ss-timer-num">22</span><span class="ss-timer-txt">Mins</span></div>
        <div class="ss-timer-unit"><span class="ss-timer-num">48</span><span class="ss-timer-txt">Secs</span></div>
      </div>
    </div>
  </div>

  <!-- Products -->
  <div class="ss-products">
    <div class="ss-wrap">
      <div class="ss-section-header">
        <h2>{{ section.settings.products_title }}</h2>
        <p>{{ section.settings.products_text }}</p>
      </div>
      <div class="ss-grid">
        {% assign collection = collections[section.settings.sale_collection] %}
        {% if collection != blank and collection.products_count > 0 %}
          {% for product in collection.products limit: 4 %}
            <article class="ss-card">
              <a href="{{ product.url }}">
                <div class="ss-card-img">
                  {% if product.featured_image != blank %}
                    {{ product.featured_image | image_url: width: 600 | image_tag: loading: 'lazy', alt: product.title }}
                  {% endif %}
                  <span class="ss-card-sale">40% Off</span>
                </div>
                <div class="ss-card-body">
                  <h3 class="ss-card-title">{{ product.title }}</h3>
                  <div class="ss-card-prices">
                    <span class="ss-card-price">{{ product.price | money }}</span>
                    {% if product.compare_at_price > product.price %}
                      <span class="ss-card-compare">{{ product.compare_at_price | money }}</span>
                    {% endif %}
                  </div>
                </div>
              </a>
            </article>
          {% endfor %}
        {% else %}
          {% for i in (1..4) %}
            <article class="ss-card">
              <div class="ss-card-img">
                <div style="width:100%;height:100%;display:grid;place-items:center;color:var(--muted);font-size:0.85rem;padding:20px;text-align:center;background:linear-gradient(135deg, color-mix(in srgb, var(--surface) 60%, white 40%), var(--surface));">
                  {% case i %}{% when 1 %}The Complete Snowboard{% when 2 %}The Multi-location Snowboard{% when 3 %}The Collection Snowboard: Hydrogen{% when 4 %}Gift Card{% endcase %}
                </div>
                <span class="ss-card-sale">40% Off</span>
              </div>
              <div class="ss-card-body">
                <h3 class="ss-card-title">{% case i %}{% when 1 %}The Complete Snowboard{% when 2 %}The Multi-location Snowboard{% when 3 %}The Collection Snowboard: Hydrogen{% when 4 %}Gift Card{% endcase %}</h3>
                <div class="ss-card-prices">
                  <span class="ss-card-price">{% case i %}{% when 1 %}$389.94{% when 2 %}$359.94{% when 3 %}$371.94{% when 4 %}$15.00{% endcase %}</span>
                  <span class="ss-card-compare">{% case i %}{% when 1 %}$649.90{% when 2 %}$599.90{% when 3 %}$619.90{% when 4 %}$25.00{% endcase %}</span>
                </div>
              </div>
            </article>
          {% endfor %}
        {% endif %}
      </div>
    </div>
  </div>

  <!-- Social Proof -->
  <div class="ss-proof">
    <div class="ss-proof-inner">
      <div class="ss-review">
        <div class="ss-review-stars">★★★★★</div>
        <p class="ss-review-text">"{{ section.settings.review1_text }}"</p>
        <div class="ss-review-author">{{ section.settings.review1_author }}</div>
        <div class="ss-review-meta">Verified Buyer</div>
      </div>
      <div class="ss-review">
        <div class="ss-review-stars">★★★★★</div>
        <p class="ss-review-text">"{{ section.settings.review2_text }}"</p>
        <div class="ss-review-author">{{ section.settings.review2_author }}</div>
        <div class="ss-review-meta">Verified Buyer</div>
      </div>
      <div class="ss-review">
        <div class="ss-review-stars">★★★★★</div>
        <p class="ss-review-text">"{{ section.settings.review3_text }}"</p>
        <div class="ss-review-author">{{ section.settings.review3_author }}</div>
        <div class="ss-review-meta">Verified Buyer</div>
      </div>
    </div>
  </div>

  <!-- Benefits -->
  <div class="ss-benefits">
    <div class="ss-benefits-grid">
      <div class="ss-benefit">
        <div class="ss-benefit-icon">🚚</div>
        <h3>{{ section.settings.b1_title }}</h3>
        <p>{{ section.settings.b1_text }}</p>
      </div>
      <div class="ss-benefit">
        <div class="ss-benefit-icon">🔄</div>
        <h3>{{ section.settings.b2_title }}</h3>
        <p>{{ section.settings.b2_text }}</p>
      </div>
      <div class="ss-benefit">
        <div class="ss-benefit-icon">🛡️</div>
        <h3>{{ section.settings.b3_title }}</h3>
        <p>{{ section.settings.b3_text }}</p>
      </div>
      <div class="ss-benefit">
        <div class="ss-benefit-icon">⭐</div>
        <h3>{{ section.settings.b4_title }}</h3>
        <p>{{ section.settings.b4_text }}</p>
      </div>
    </div>
  </div>

  <!-- Final CTA -->
  <div class="ss-cta">
    <div class="ss-cta-card">
      <h2>{{ section.settings.cta_bottom_title }}</h2>
      <p>{{ section.settings.cta_bottom_text }}</p>
      <a href="{{ section.settings.cta_link }}" class="ss-btn ss-btn-primary" style="position:relative;">{{ section.settings.cta_bottom_label }}</a>
    </div>
  </div>

  {% schema %}
  {
    "name": "Spring Sale Landing Page",
    "settings": [
      { "type": "text", "id": "marquee_text", "label": "Marquee text", "default": "40% OFF EVERYTHING — SPRING SALE — FREE SHIPPING OVER $50 — LIMITED TIME ONLY" },
      { "type": "text", "id": "badge_text", "label": "Badge text", "default": "Limited Time — Spring Sale" },
      { "type": "text", "id": "hero_title", "label": "Hero headline", "default": "40% Off <em>Everything</em> This Spring" },
      { "type": "textarea", "id": "hero_text", "label": "Hero subtext", "default": "Our biggest sale of the season is here. Shop premium gear at unbeatable prices — but act fast, these deals won't last." },
      { "type": "text", "id": "cta_label", "label": "Primary CTA", "default": "Shop the Sale" },
      { "type": "url", "id": "cta_link", "label": "Primary CTA link" },
      { "type": "text", "id": "cta2_label", "label": "Secondary CTA", "default": "View All Collections" },
      { "type": "url", "id": "cta2_link", "label": "Secondary CTA link" },
      { "type": "text", "id": "countdown_label", "label": "Countdown label", "default": "Sale ends in:" },
      { "type": "text", "id": "products_title", "label": "Products heading", "default": "Spring Sale Picks" },
      { "type": "textarea", "id": "products_text", "label": "Products subtext", "default": "Hand-picked favorites at 40% off — while supplies last." },
      { "type": "collection", "id": "sale_collection", "label": "Sale collection" },
      { "type": "text", "id": "review1_text", "label": "Review 1 text", "default": "Incredible quality and the sale price made it an absolute steal. Already ordered two more." },
      { "type": "text", "id": "review1_author", "label": "Review 1 author", "default": "Sarah M." },
      { "type": "text", "id": "review2_text", "label": "Review 2 text", "default": "Fast shipping, beautiful packaging, and the product exceeded my expectations. 10/10 would recommend." },
      { "type": "text", "id": "review2_author", "label": "Review 2 author", "default": "James K." },
      { "type": "text", "id": "review3_text", "label": "Review 3 text", "default": "Best purchase I've made this year. The 40% off made it a no-brainer — grabbed one for my brother too." },
      { "type": "text", "id": "review3_author", "label": "Review 3 author", "default": "Emily R." },
      { "type": "text", "id": "b1_title", "label": "Benefit 1 title", "default": "Free Shipping" },
      { "type": "text", "id": "b1_text", "label": "Benefit 1 text", "default": "On all orders over $50" },
      { "type": "text", "id": "b2_title", "label": "Benefit 2 title", "default": "Easy Returns" },
      { "type": "text", "id": "b2_text", "label": "Benefit 2 text", "default": "30-day hassle-free returns" },
      { "type": "text", "id": "b3_title", "label": "Benefit 3 title", "default": "Secure Checkout" },
      { "type": "text", "id": "b3_text", "label": "Benefit 3 text", "default": "SSL encrypted payments" },
      { "type": "text", "id": "b4_title", "label": "Benefit 4 title", "default": "5-Star Rated" },
      { "type": "text", "id": "b4_text", "label": "Benefit 4 text", "default": "Trusted by 10,000+ customers" },
      { "type": "text", "id": "cta_bottom_title", "label": "Bottom CTA heading", "default": "Don't miss 40% off everything" },
      { "type": "textarea", "id": "cta_bottom_text", "label": "Bottom CTA text", "default": "Spring won't last forever — and neither will these prices. Grab your favorites before they're gone." },
      { "type": "text", "id": "cta_bottom_label", "label": "Bottom CTA button", "default": "Start Shopping" },
      { "type": "color", "id": "bg_color", "label": "Background", "default": "#09090b" },
      { "type": "color", "id": "bg_alt_color", "label": "Alt background", "default": "#111114" },
      { "type": "color", "id": "card_color", "label": "Card background", "default": "#16161a" },
      { "type": "color", "id": "text_color", "label": "Body text", "default": "#e4e4e7" },
      { "type": "color", "id": "muted_color", "label": "Muted text", "default": "#a1a1aa" },
      { "type": "color", "id": "heading_color", "label": "Heading color", "default": "#fafafa" },
      { "type": "color", "id": "accent_color", "label": "Accent", "default": "#34d399" },
      { "type": "color", "id": "accent_hover_color", "label": "Accent hover", "default": "#10b981" },
      { "type": "color", "id": "btn_text_color", "label": "Button text", "default": "#022c22" },
      { "type": "color", "id": "border_color", "label": "Border", "default": "#27272a" },
      { "type": "color", "id": "glow_color", "label": "Glow color", "default": "#6ee7b7" }
    ],
    "presets": [{ "name": "Spring Sale Landing Page" }]
  }
  {% endschema %}
</section>`;
