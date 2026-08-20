const STORAGE_KEY = "sommerfest-kasse-v1";
const PFAND = 2;

const ARTICLES = [
  { id: "helles", name: "Kleines Helles vom Fass", group: "Biere", price: 4.5, pfand: true },
  { id: "radler", name: "Radler vom Fass", group: "Biere", price: 4.5, pfand: true },
  { id: "hefe", name: "Hefeweizen", group: "Biere", price: 4.5, pfand: true },
  { id: "hefe-af", name: "Hefeweizen Alkoholfrei", group: "Biere", price: 4.5, pfand: true },

  { id: "softdrink", name: "Softdrink", group: "Soft Drinks", price: 3.5, pfand: false },

  { id: "riesling", name: "Rieslingschorle", group: "Schorle / Cocktails", price: 6, pfand: true },
  { id: "weissherbst", name: "Weißherbstschorle", group: "Schorle / Cocktails", price: 6, pfand: true },
  { id: "aperol", name: "Aperol Spritz", group: "Schorle / Cocktails", price: 7, pfand: true },
  { id: "kukki", name: "Kukki Cocktail", group: "Schorle / Cocktails", price: 7, pfand: false },
  { id: "jaeger", name: "Jäger Shot", group: "Schorle / Cocktails", price: 3, pfand: false },
  { id: "berliner", name: "Berliner Luft", group: "Schorle / Cocktails", price: 3, pfand: false },

  { id: "bratwurst", name: "Bratwurst", group: "Speisen", price: 4.5, pfand: false },
  { id: "steak", name: "Steak Schwein", group: "Speisen", price: 6, pfand: false },
  { id: "putensteak", name: "Steak Pute", group: "Speisen", price: 6, pfand: false },
  { id: "crepes-zimt", name: "Crêpe Zimt/Zucker", group: "Speisen", price: 3.5, pfand: false },
  { id: "crepes-nutella", name: "Crêpe Nutella", group: "Speisen", price: 4.5, pfand: false },
];

const GROUP_ORDER = [
  { id: "Biere", label: "Biere" },
  { id: "Soft Drinks", label: "Softgetränke" },
  { id: "Schorle / Cocktails", label: "Schorle & Cocktails" },
  { id: "Speisen", label: "Speisen" },
];

const SOLD_OVERVIEW = [
  { label: "Biere", ids: ["helles", "radler", "hefe", "hefe-af"], tone: "beer" },
  { label: "Schorle", ids: ["riesling", "weissherbst"], tone: "schorle" },
  { label: "Aperol Spritz", ids: ["aperol"], tone: "cocktail" },
  { label: "Cocktail", ids: ["kukki"], tone: "cocktail" },
  { label: "Jäger Shot", ids: ["jaeger"], tone: "jaeger" },
  { label: "Berliner Luft", ids: ["berliner"], tone: "jaeger" },
  { label: "Softdrink", ids: ["softdrink"], tone: "softdrink" },
  { label: "Bratwurst", ids: ["bratwurst"], tone: "bratwurst" },
  { label: "Steak Schwein", ids: ["steak"], tone: "steak" },
  { label: "Steak Pute", ids: ["putensteak"], tone: "steak" },
  { label: "Crêpe Zimt/Zucker", ids: ["crepes-zimt"], tone: "crepes" },
  { label: "Crêpe Nutella", ids: ["crepes-nutella"], tone: "crepes" },
];

const state = {
  cart: [],
  sales: [],
  paymentMethod: "bar",
};

const els = {
  products: document.getElementById("products"),
  cartList: document.getElementById("cart-list"),
  cartEmpty: document.getElementById("cart-empty"),
  clearCart: document.getElementById("clear-cart"),
  sumArticles: document.getElementById("sum-articles"),
  sumPfand: document.getElementById("sum-pfand"),
  sumTotal: document.getElementById("sum-total"),
  pay: document.getElementById("pay"),
  pfandReturn: document.getElementById("pfand-return"),
  saleOverview: document.getElementById("sale-overview"),
  clock: document.getElementById("clock"),
  viewKasse: document.getElementById("view-kasse"),
  viewAuswertung: document.getElementById("view-auswertung"),
  statsCards: document.getElementById("stats-cards"),
  statsBody: document.getElementById("stats-body"),
  salesLog: document.getElementById("sales-log"),
  payModal: document.getElementById("pay-modal"),
  payAmount: document.getElementById("pay-amount"),
  cashFields: document.getElementById("cash-fields"),
  tenderGrid: document.getElementById("tender-grid"),
  tenderInput: document.getElementById("tender-input"),
  changeAmount: document.getElementById("change-amount"),
  confirmPay: document.getElementById("confirm-pay"),
  toast: document.getElementById("toast"),
};

function money(value) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (Array.isArray(data.sales)) state.sales = data.sales;
  } catch {
    showToast("Gespeicherte Daten konnten nicht gelesen werden.");
  }
}

function save() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      version: 1,
      updatedAt: new Date().toISOString(),
      sales: state.sales,
    })
  );
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.hidden = false;
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    els.toast.hidden = true;
  }, 2200);
}

function updateClock() {
  els.clock.textContent = new Intl.DateTimeFormat("de-DE", {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

function renderProducts() {
  els.products.innerHTML = GROUP_ORDER.map(({ id, label }) => {
    const items = ARTICLES.filter((article) => article.group === id);
    const buttons = items
      .map(
        (article) => `
        <button type="button" class="product" data-id="${article.id}" data-group="${article.group}">
          <span class="product-name">${article.name.replace(/\n/g, "<br>")}</span>
          <span class="product-meta">
            <span class="product-price">${money(article.price)}</span>
            ${article.pfand ? `<span class="product-pfand">+ ${money(PFAND)} Pfand</span>` : ""}
          </span>
        </button>`
      )
      .join("");

    return `
      <section class="product-group" data-group="${id}">
        <h2 class="product-group-title">${label}</h2>
        <div class="product-group-grid">${buttons}</div>
      </section>`;
  }).join("");
}

function findCartLine(predicate) {
  return state.cart.find(predicate);
}

function addArticle(articleId) {
  const article = ARTICLES.find((a) => a.id === articleId);
  if (!article) return;

  const existing = findCartLine((line) => line.type === "article" && line.articleId === article.id);
  if (existing) {
    existing.qty += 1;
  } else {
    state.cart.push({
      key: `article-${article.id}`,
      type: "article",
      articleId: article.id,
      name: article.name.replace(/\n/g, " "),
      group: article.group,
      unitPrice: article.price,
      qty: 1,
      hasPfand: article.pfand,
    });
  }

  if (article.pfand) {
    const pfandLine = findCartLine((line) => line.type === "pfand");
    if (pfandLine) {
      pfandLine.qty += 1;
    } else {
      state.cart.push({
        key: "pfand-out",
        type: "pfand",
        name: "Pfand",
        unitPrice: PFAND,
        qty: 1,
      });
    }
  }

  renderCart();
}

function addPfandReturn() {
  const existing = findCartLine((line) => line.type === "pfand_return");
  if (existing) {
    existing.qty += 1;
  } else {
    state.cart.push({
      key: "pfand-return",
      type: "pfand_return",
      name: "Pfandrücknahme",
      unitPrice: -PFAND,
      qty: 1,
    });
  }
  renderCart();
}

function changeQty(key, delta) {
  const line = state.cart.find((item) => item.key === key);
  if (!line) return;

  if (line.type === "article" && line.hasPfand) {
    const pfandLine = findCartLine((item) => item.type === "pfand");
    if (pfandLine) {
      pfandLine.qty += delta;
      if (pfandLine.qty <= 0) {
        state.cart = state.cart.filter((item) => item.key !== pfandLine.key);
      }
    }
  }

  line.qty += delta;
  if (line.qty <= 0) {
    state.cart = state.cart.filter((item) => item.key !== key);
  }

  renderCart();
}

function cartTotals() {
  let articles = 0;
  let pfand = 0;

  for (const line of state.cart) {
    const lineTotal = line.unitPrice * line.qty;
    if (line.type === "article") articles += lineTotal;
    else pfand += lineTotal;
  }

  return {
    articles,
    pfand,
    total: articles + pfand,
  };
}

function renderCart() {
  const totals = cartTotals();
  const hasItems = state.cart.length > 0;

  els.cartEmpty.classList.toggle("is-visible", !hasItems);
  els.clearCart.disabled = !hasItems;
  els.pay.disabled = !hasItems;
  els.sumArticles.textContent = money(totals.articles);
  els.sumPfand.textContent = money(totals.pfand);
  els.sumTotal.textContent = money(totals.total);

  els.cartList.innerHTML = state.cart
    .map((line) => {
      const lineTotal = line.unitPrice * line.qty;
      const sub =
        line.type === "article" && line.hasPfand
          ? `+ ${money(PFAND)} Pfand separat`
          : line.type === "pfand"
            ? "ausgegeben"
            : line.type === "pfand_return"
              ? "zurückgenommen"
              : "";

      return `
        <li class="cart-item ${line.type === "pfand_return" ? "is-pfand-return" : ""}">
          <div>
            <div class="cart-item-name">${line.name}</div>
            ${sub ? `<div class="cart-item-sub">${sub}</div>` : ""}
          </div>
          <div class="cart-item-controls">
            <button type="button" class="qty-btn" data-qty="${line.key}" data-delta="-1" aria-label="Weniger">−</button>
            <span class="qty">${line.qty}</span>
            <button type="button" class="qty-btn" data-qty="${line.key}" data-delta="1" aria-label="Mehr">+</button>
          </div>
          <div class="cart-item-price">${money(lineTotal)}</div>
        </li>`;
    })
    .join("");
}

function countCartByArticle() {
  const counts = Object.create(null);
  for (const line of state.cart) {
    if (line.type !== "article" || !line.articleId) continue;
    counts[line.articleId] = (counts[line.articleId] || 0) + line.qty;
  }
  return counts;
}

function renderSaleOverview() {
  const counts = countCartByArticle();
  const rows = SOLD_OVERVIEW.map(({ label, ids, tone }) => {
    const qty = ids.reduce((sum, id) => sum + (counts[id] || 0), 0);
    return { label, qty, tone };
  }).filter((row) => row.qty > 0);

  if (!rows.length) {
    els.saleOverview.innerHTML = `<p class="sale-overview-empty">Keine Artikelpositionen</p>`;
    return;
  }

  els.saleOverview.innerHTML = rows
    .map(
      (row) => `
      <div class="sale-overview-item tone-${row.tone}">
        <span class="sale-overview-label">${row.label}</span>
        <strong class="sale-overview-qty">${row.qty}</strong>
      </div>`
    )
    .join("");
}

function setPaymentMethod(method) {
  state.paymentMethod = method === "karte" ? "karte" : "bar";
  document.querySelectorAll(".pay-method").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.method === state.paymentMethod);
  });
  els.cashFields.classList.toggle("is-hidden", state.paymentMethod === "karte");
  if (state.paymentMethod === "karte") {
    els.tenderInput.value = "";
    els.changeAmount.textContent = "—";
  }
}

function openPayModal() {
  const { total } = cartTotals();
  els.payAmount.textContent = money(total);
  renderSaleOverview();
  setPaymentMethod("bar");
  els.tenderInput.value = "";
  els.changeAmount.textContent = "—";

  const suggestions = Array.from(
    new Set(
      [total, Math.ceil(total), 5, 10, 20, 50]
        .filter((n) => n >= total)
        .map((n) => Number(n.toFixed(2)))
    )
  ).slice(0, 6);

  els.tenderGrid.innerHTML = suggestions
    .map(
      (value) => `
      <button type="button" data-tender="${value}">${money(value)}</button>`
    )
    .join("");

  els.payModal.hidden = false;
  if (state.paymentMethod === "bar") els.tenderInput.focus();
}

function closePayModal() {
  els.payModal.hidden = true;
}

function parseEuro(input) {
  const normalized = String(input).trim().replace(/\s/g, "").replace("€", "").replace(",", ".");
  const value = Number(normalized);
  return Number.isFinite(value) ? value : NaN;
}

function updateChange() {
  const total = cartTotals().total;
  const given = parseEuro(els.tenderInput.value);
  if (!Number.isFinite(given)) {
    els.changeAmount.textContent = "—";
    return;
  }
  els.changeAmount.textContent = money(given - total);
}

function completeSale() {
  const totals = cartTotals();
  if (!state.cart.length) return;

  const given = state.paymentMethod === "bar" ? parseEuro(els.tenderInput.value) : totals.total;
  const sale = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    paymentMethod: state.paymentMethod,
    items: state.cart.map((line) => ({
      type: line.type,
      articleId: line.articleId || null,
      name: line.name,
      group: line.group || null,
      unitPrice: line.unitPrice,
      qty: line.qty,
      lineTotal: Number((line.unitPrice * line.qty).toFixed(2)),
    })),
    totals: {
      articles: Number(totals.articles.toFixed(2)),
      pfand: Number(totals.pfand.toFixed(2)),
      total: Number(totals.total.toFixed(2)),
    },
    tender: Number.isFinite(given) ? Number(given.toFixed(2)) : Number(totals.total.toFixed(2)),
    change:
      state.paymentMethod === "bar" && Number.isFinite(given)
        ? Number((given - totals.total).toFixed(2))
        : 0,
  };

  state.sales.unshift(sale);
  state.cart = [];
  save();
  renderCart();
  closePayModal();
  renderAuswertung();
  showToast(`Verkauf gespeichert · ${money(sale.totals.total)}`);
}

function aggregateStats() {
  const articleMap = new Map();
  let revenueArticles = 0;
  let pfandOut = 0;
  let pfandBack = 0;
  let saleCount = state.sales.length;
  let totalBar = 0;
  let totalKarte = 0;

  for (const sale of state.sales) {
    const saleTotal = Number(sale.totals?.total || 0);
    if (sale.paymentMethod === "karte") totalKarte += saleTotal;
    else totalBar += saleTotal;

    for (const item of sale.items) {
      if (item.type === "article") {
        revenueArticles += item.lineTotal;
        const current = articleMap.get(item.articleId) || {
          articleId: item.articleId,
          name: item.name,
          group: item.group,
          qty: 0,
          revenue: 0,
        };
        current.qty += item.qty;
        current.revenue += item.lineTotal;
        articleMap.set(item.articleId, current);
      } else if (item.type === "pfand") {
        pfandOut += item.lineTotal;
      } else if (item.type === "pfand_return") {
        pfandBack += Math.abs(item.lineTotal);
      }
    }
  }

  const rows = [...articleMap.values()].sort((a, b) => b.qty - a.qty);
  const pfandNet = pfandOut - pfandBack;
  const cashTotal = totalBar + totalKarte;

  return {
    saleCount,
    revenueArticles,
    pfandOut,
    pfandBack,
    pfandNet,
    totalBar: Number(totalBar.toFixed(2)),
    totalKarte: Number(totalKarte.toFixed(2)),
    cashTotal: Number(cashTotal.toFixed(2)),
    rows,
  };
}

function renderAuswertung() {
  const stats = aggregateStats();

  els.statsCards.innerHTML = `
    <div class="stat-card"><span>Verkäufe</span><strong>${stats.saleCount}</strong></div>
    <div class="stat-card"><span>Artikelumsatz</span><strong>${money(stats.revenueArticles)}</strong></div>
    <div class="stat-card"><span>Pfand netto</span><strong>${money(stats.pfandNet)}</strong></div>
    <div class="stat-card"><span>Kassenstand Bar</span><strong>${money(stats.totalBar)}</strong></div>
    <div class="stat-card"><span>Kassenstand Karte</span><strong>${money(stats.totalKarte)}</strong></div>
    <div class="stat-card stat-card-total"><span>Gesamtsumme</span><strong>${money(stats.cashTotal)}</strong></div>
  `;

  els.statsBody.innerHTML =
    stats.rows
      .map(
        (row) => `
      <tr>
        <td>${row.name}</td>
        <td>${row.group}</td>
        <td class="num">${row.qty}</td>
        <td class="num">${money(row.revenue)}</td>
      </tr>`
      )
      .join("") +
    `
      <tr>
        <td>Pfand ausgegeben</td>
        <td>Pfand</td>
        <td class="num">${Math.round(stats.pfandOut / PFAND)}</td>
        <td class="num">${money(stats.pfandOut)}</td>
      </tr>
      <tr>
        <td>Pfandrücknahme</td>
        <td>Pfand</td>
        <td class="num">${Math.round(stats.pfandBack / PFAND)}</td>
        <td class="num">−${money(stats.pfandBack)}</td>
      </tr>`;

  els.salesLog.innerHTML = state.sales.slice(0, 30)
    .map((sale) => {
      const time = new Intl.DateTimeFormat("de-DE", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }).format(new Date(sale.createdAt));
      const count = sale.items.reduce((sum, item) => sum + item.qty, 0);
      const method = sale.paymentMethod === "karte" ? "Karte" : "Bar";
      return `
        <li>
          <div>
            <strong>${money(sale.totals.total)}</strong>
            <div class="sale-meta">${time} · ${count} Position${count === 1 ? "" : "en"}</div>
          </div>
          <div class="sale-meta">${method}</div>
        </li>`;
    })
    .join("") || `<li><div class="sale-meta">Noch keine Verkäufe</div></li>`;
}

function exportCsv() {
  const stats = aggregateStats();
  const lines = [
    ["Typ", "Artikel", "Gruppe", "Stück", "Betrag EUR"].join(";"),
    ...stats.rows.map((row) =>
      ["Artikel", row.name, row.group, row.qty, row.revenue.toFixed(2).replace(".", ",")].join(";")
    ),
    ["Pfand", "Pfand ausgegeben", "Pfand", Math.round(stats.pfandOut / PFAND), stats.pfandOut.toFixed(2).replace(".", ",")].join(";"),
    ["Pfand", "Pfandrücknahme", "Pfand", Math.round(stats.pfandBack / PFAND), (-stats.pfandBack).toFixed(2).replace(".", ",")].join(";"),
    [],
    ["Verkäufe", stats.saleCount].join(";"),
    ["Artikelumsatz", stats.revenueArticles.toFixed(2).replace(".", ",")].join(";"),
    ["Pfand netto", stats.pfandNet.toFixed(2).replace(".", ",")].join(";"),
    ["Kassenstand Bar", stats.totalBar.toFixed(2).replace(".", ",")].join(";"),
    ["Kassenstand Karte", stats.totalKarte.toFixed(2).replace(".", ",")].join(";"),
    ["Gesamtsumme", stats.cashTotal.toFixed(2).replace(".", ",")].join(";"),
    [],
    ["Verkauf-ID", "Zeit", "Zahlungsart", "Position", "Typ", "Stück", "Einzelpreis", "Summe"].join(";"),
  ];

  for (const sale of state.sales) {
    for (const item of sale.items) {
      lines.push(
        [
          sale.id,
          sale.createdAt,
          sale.paymentMethod === "karte" ? "Karte" : "Bar",
          item.name,
          item.type,
          item.qty,
          item.unitPrice.toFixed(2).replace(".", ","),
          item.lineTotal.toFixed(2).replace(".", ","),
        ].join(";")
      );
    }
  }

  downloadFile(
    `sommerfest-kasse-${new Date().toISOString().slice(0, 10)}.csv`,
    "\uFEFF" + lines.join("\n"),
    "text/csv;charset=utf-8"
  );
}

function exportJson() {
  downloadFile(
    `sommerfest-kasse-backup-${new Date().toISOString().slice(0, 10)}.json`,
    JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), sales: state.sales }, null, 2),
    "application/json"
  );
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

async function importJson(file) {
  const text = await file.text();
  const data = JSON.parse(text);
  if (!Array.isArray(data.sales)) throw new Error("Ungültiges Backup");
  state.sales = data.sales;
  save();
  renderAuswertung();
  showToast("Backup geladen");
}

function resetDay() {
  const ok = confirm("Alle gespeicherten Verkäufe dieses Geräts wirklich löschen?");
  if (!ok) return;
  state.sales = [];
  save();
  renderAuswertung();
  showToast("Tag zurückgesetzt");
}

function switchView(view) {
  const isKasse = view === "kasse";
  els.viewKasse.classList.toggle("is-visible", isKasse);
  els.viewKasse.hidden = !isKasse;
  els.viewAuswertung.classList.toggle("is-visible", !isKasse);
  els.viewAuswertung.hidden = isKasse;

  document.querySelectorAll(".tab").forEach((tab) => {
    const active = tab.dataset.view === view;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", String(active));
  });

  if (!isKasse) renderAuswertung();
}

function bindEvents() {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => switchView(tab.dataset.view));
  });

  els.products.addEventListener("click", (event) => {
    const btn = event.target.closest(".product");
    if (!btn) return;
    addArticle(btn.dataset.id);
  });

  els.pfandReturn.addEventListener("click", addPfandReturn);

  els.cartList.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-qty]");
    if (!btn) return;
    changeQty(btn.dataset.qty, Number(btn.dataset.delta));
  });

  els.clearCart.addEventListener("click", () => {
    state.cart = [];
    renderCart();
  });

  els.pay.addEventListener("click", openPayModal);

  els.payModal.addEventListener("click", (event) => {
    if (event.target.matches("[data-close-modal]")) closePayModal();
    const methodBtn = event.target.closest("[data-method]");
    if (methodBtn) {
      setPaymentMethod(methodBtn.dataset.method);
      return;
    }
    const tender = event.target.closest("[data-tender]");
    if (tender) {
      els.tenderInput.value = Number(tender.dataset.tender).toFixed(2).replace(".", ",");
      updateChange();
    }
  });

  els.tenderInput.addEventListener("input", updateChange);
  els.confirmPay.addEventListener("click", completeSale);

  document.getElementById("export-csv").addEventListener("click", exportCsv);
  document.getElementById("export-json").addEventListener("click", exportJson);
  document.getElementById("reset-day").addEventListener("click", resetDay);
  document.getElementById("import-json").addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      await importJson(file);
    } catch {
      showToast("Backup ungültig");
    }
    event.target.value = "";
  });
}

function init() {
  load();
  renderProducts();
  renderCart();
  renderAuswertung();
  bindEvents();
  updateClock();
  setInterval(updateClock, 30000);
}

init();
