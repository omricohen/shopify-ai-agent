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
      --max-w: 1200px;
      --radius: 16px;
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      overflow: hidden;
    }

    #section-{{ section.id }} * { box-sizing: border-box; margin: 0; }
    #section-{{ section.id }} a { color: inherit; text-decoration: none; }
    #section-{{ section.id }} img { display: block; max-width: 100%; height: auto; }

    #section-{{ section.id }} .ss-wrap {
      max-width: var(--max-w);
      margin: 0 auto;
      padding: 0 24px;
    }

    /* ── Hero ── */
    #section-{{ section.id }} .ss-hero {
      padding: clamp(80px, 12vw, 140px) 0 clamp(60px, 8vw, 100px);
      text-align: center;
      position: relative;
    }
    #section-{{ section.id }} .ss-hero::before {
      content: "";
      position: absolute;
      top: -40%;
      left: 50%;
      transform: translateX(-50%);
      width: 800px;
      height: 800px;
      background: radial-gradient(circle, color-mix(in srgb, var(--accent) 15%, transparent) 0%, transparent 70%);
      pointer-events: none;
    }
    #section-{{ section.id }} .ss-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 20px;
      border-radius: 999px;
      background: color-mix(in srgb, var(--accent) 12%, transparent);
      border: 1px solid color-mix(in srgb, var(--accent) 25%, transparent);
      color: var(--accent);
      font-weight: 700;
      font-size: 0.85rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-bottom: 24px;
      animation: ssFadeUp 0.6s ease both;
    }
    #section-{{ section.id }} .ss-badge::before {
      content: "";
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--accent);
      animation: ssPulse 2s ease-in-out infinite;
    }
    #section-{{ section.id }} .ss-hero h1 {
      font-size: clamp(2.5rem, 6vw, 4.5rem);
      font-weight: 800;
      line-height: 1;
      letter-spacing: -0.03em;
      color: var(--heading);
      margin-bottom: 20px;
      animation: ssFadeUp 0.6s ease 0.1s both;
    }
    #section-{{ section.id }} .ss-hero h1 em {
      font-style: normal;
      color: var(--accent);
    }
    #section-{{ section.id }} .ss-hero p {
      font-size: clamp(1rem, 2vw, 1.2rem);
      line-height: 1.6;
      color: var(--muted);
      max-width: 540px;
      margin: 0 auto 32px;
      animation: ssFadeUp 0.6s ease 0.2s both;
    }
    #section-{{ section.id }} .ss-hero-actions {
      display: flex;
      justify-content: center;
      gap: 14px;
      flex-wrap: wrap;
      animation: ssFadeUp 0.6s ease 0.3s both;
    }

    /* ── Buttons ── */
    #section-{{ section.id }} .ss-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 14px 32px;
      border-radius: 999px;
      font-weight: 700;
      font-size: 1rem;
      border: none;
      cursor: pointer;
      transition: all 0.25s ease;
    }
    #section-{{ section.id }} .ss-btn-primary {
      background: var(--accent);
      color: var(--btn-text);
      box-shadow: 0 8px 24px color-mix(in srgb, var(--accent) 30%, transparent);
    }
    #section-{{ section.id }} .ss-btn-primary:hover {
      background: var(--accent-hover);
      transform: translateY(-2px);
      box-shadow: 0 12px 32px color-mix(in srgb, var(--accent) 40%, transparent);
    }
    #section-{{ section.id }} .ss-btn-outline {
      background: transparent;
      color: var(--text);
      border: 2px solid var(--border);
    }
    #section-{{ section.id }} .ss-btn-outline:hover {
      border-color: var(--accent);
      color: var(--accent);
      transform: translateY(-2px);
    }

    /* ── Countdown ── */
    #section-{{ section.id }} .ss-countdown {
      background: var(--bg-alt);
      padding: 48px 24px;
    }
    #section-{{ section.id }} .ss-countdown-inner {
      max-width: var(--max-w);
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 40px;
      flex-wrap: wrap;
      text-align: center;
    }
    #section-{{ section.id }} .ss-countdown-label {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--heading);
    }
    #section-{{ section.id }} .ss-timer {
      display: flex;
      gap: 12px;
    }
    #section-{{ section.id }} .ss-timer-unit {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 64px;
      padding: 12px 16px;
      border-radius: 12px;
      background: var(--surface);
      border: 1px solid var(--border);
    }
    #section-{{ section.id }} .ss-timer-num {
      font-size: 1.8rem;
      font-weight: 800;
      color: var(--accent);
      font-variant-numeric: tabular-nums;
      line-height: 1;
    }
    #section-{{ section.id }} .ss-timer-txt {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--muted);
      margin-top: 4px;
    }

    /* ── Products ── */
    #section-{{ section.id }} .ss-products {
      padding: clamp(60px, 8vw, 100px) 0;
    }
    #section-{{ section.id }} .ss-section-header {
      text-align: center;
      margin-bottom: 48px;
    }
    #section-{{ section.id }} .ss-section-header h2 {
      font-size: clamp(1.8rem, 4vw, 2.6rem);
      font-weight: 800;
      color: var(--heading);
      letter-spacing: -0.02em;
      margin-bottom: 12px;
    }
    #section-{{ section.id }} .ss-section-header p {
      color: var(--muted);
      font-size: 1.05rem;
      max-width: 480px;
      margin: 0 auto;
      line-height: 1.6;
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
      transition: all 0.3s ease;
    }
    #section-{{ section.id }} .ss-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 20px 50px rgba(0,0,0,0.2);
      border-color: color-mix(in srgb, var(--accent) 30%, var(--border));
    }
    #section-{{ section.id }} .ss-card-img {
      aspect-ratio: 1;
      overflow: hidden;
      background: color-mix(in srgb, var(--surface) 80%, white 20%);
      position: relative;
    }
    #section-{{ section.id }} .ss-card-img img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s ease;
    }
    #section-{{ section.id }} .ss-card:hover .ss-card-img img {
      transform: scale(1.05);
    }
    #section-{{ section.id }} .ss-card-sale {
      position: absolute;
      top: 12px;
      left: 12px;
      background: var(--accent);
      color: var(--btn-text);
      padding: 4px 12px;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    #section-{{ section.id }} .ss-card-body {
      padding: 16px 20px 20px;
    }
    #section-{{ section.id }} .ss-card-title {
      font-weight: 700;
      font-size: 1rem;
      color: var(--heading);
      margin-bottom: 8px;
    }
    #section-{{ section.id }} .ss-card-prices {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    #section-{{ section.id }} .ss-card-price {
      font-weight: 800;
      font-size: 1.1rem;
      color: var(--accent);
    }
    #section-{{ section.id }} .ss-card-compare {
      font-size: 0.9rem;
      color: var(--muted);
      text-decoration: line-through;
    }

    /* ── Benefits ── */
    #section-{{ section.id }} .ss-benefits {
      background: var(--bg-alt);
      padding: clamp(60px, 8vw, 100px) 0;
    }
    #section-{{ section.id }} .ss-benefits-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 20px;
      max-width: var(--max-w);
      margin: 0 auto;
      padding: 0 24px;
    }
    #section-{{ section.id }} .ss-benefit {
      text-align: center;
      padding: 32px 24px;
      border-radius: var(--radius);
      background: var(--surface);
      border: 1px solid var(--border);
    }
    #section-{{ section.id }} .ss-benefit-icon {
      font-size: 2rem;
      margin-bottom: 12px;
    }
    #section-{{ section.id }} .ss-benefit h3 {
      font-size: 1rem;
      font-weight: 700;
      color: var(--heading);
      margin-bottom: 6px;
    }
    #section-{{ section.id }} .ss-benefit p {
      font-size: 0.9rem;
      color: var(--muted);
      line-height: 1.5;
    }

    /* ── CTA ── */
    #section-{{ section.id }} .ss-cta {
      padding: clamp(60px, 8vw, 100px) 24px;
    }
    #section-{{ section.id }} .ss-cta-card {
      max-width: 800px;
      margin: 0 auto;
      text-align: center;
      padding: clamp(40px, 6vw, 64px);
      border-radius: calc(var(--radius) + 4px);
      background: var(--surface);
      border: 1px solid color-mix(in srgb, var(--accent) 20%, var(--border));
      position: relative;
      overflow: hidden;
    }
    #section-{{ section.id }} .ss-cta-card::before {
      content: "";
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at top right, color-mix(in srgb, var(--accent) 10%, transparent), transparent 60%);
      pointer-events: none;
    }
    #section-{{ section.id }} .ss-cta-card h2 {
      font-size: clamp(1.6rem, 4vw, 2.4rem);
      font-weight: 800;
      color: var(--heading);
      letter-spacing: -0.02em;
      margin-bottom: 12px;
      position: relative;
    }
    #section-{{ section.id }} .ss-cta-card p {
      color: var(--muted);
      margin-bottom: 28px;
      font-size: 1.05rem;
      line-height: 1.6;
      position: relative;
    }

    /* ── Media queries ── */
    @media (min-width: 640px) {
      #section-{{ section.id }} .ss-grid { grid-template-columns: repeat(2, 1fr); }
      #section-{{ section.id }} .ss-benefits-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (min-width: 900px) {
      #section-{{ section.id }} .ss-grid { grid-template-columns: repeat(4, 1fr); }
      #section-{{ section.id }} .ss-benefits-grid { grid-template-columns: repeat(4, 1fr); }
    }

    /* ── Animations ── */
    @keyframes ssFadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes ssPulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
  </style>

  <div class="ss-hero">
    <div class="ss-wrap">
      <div class="ss-badge">{{ section.settings.badge_text }}</div>
      <h1>{{ section.settings.hero_title }}</h1>
      <p>{{ section.settings.hero_text }}</p>
      <div class="ss-hero-actions">
        <a href="{{ section.settings.cta_link }}" class="ss-btn ss-btn-primary">{{ section.settings.cta_label }}</a>
        <a href="{{ section.settings.cta2_link }}" class="ss-btn ss-btn-outline">{{ section.settings.cta2_label }}</a>
      </div>
    </div>
  </div>

  <div class="ss-countdown">
    <div class="ss-countdown-inner">
      <span class="ss-countdown-label">{{ section.settings.countdown_label }}</span>
      <div class="ss-timer" id="ss-timer-{{ section.id }}">
        <div class="ss-timer-unit"><span class="ss-timer-num" data-unit="days">03</span><span class="ss-timer-txt">Days</span></div>
        <div class="ss-timer-unit"><span class="ss-timer-num" data-unit="hours">14</span><span class="ss-timer-txt">Hours</span></div>
        <div class="ss-timer-unit"><span class="ss-timer-num" data-unit="mins">22</span><span class="ss-timer-txt">Mins</span></div>
        <div class="ss-timer-unit"><span class="ss-timer-num" data-unit="secs">48</span><span class="ss-timer-txt">Secs</span></div>
      </div>
    </div>
  </div>

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
                <div style="width:100%;height:100%;display:grid;place-items:center;color:var(--muted);font-size:0.85rem;background:color-mix(in srgb, var(--surface) 70%, white 30%);">
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

  <div class="ss-cta">
    <div class="ss-cta-card">
      <h2>{{ section.settings.cta_bottom_title }}</h2>
      <p>{{ section.settings.cta_bottom_text }}</p>
      <a href="{{ section.settings.cta_link }}" class="ss-btn ss-btn-primary">{{ section.settings.cta_bottom_label }}</a>
    </div>
  </div>

  {% schema %}
  {
    "name": "Spring Sale Landing Page",
    "settings": [
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
      { "type": "color", "id": "border_color", "label": "Border", "default": "#27272a" }
    ],
    "presets": [{ "name": "Spring Sale Landing Page" }]
  }
  {% endschema %}
</section>`;
