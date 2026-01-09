document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY = "greenbowl_order";

  const orderState = {
    soup: null,
    main: null,
    drink: null,
    starter: null,
    dessert: null
  };

  const CATEGORY_MAP = {
    soup: "soup",
    "main-course": "main",
    salad: "starter",
    drink: "drink",
    dessert: "dessert"
  };

  const container = document.getElementById("checkout-panel-container");
  if (!container) return;

  const checkoutPanel = document.createElement("div");
  checkoutPanel.className = "checkout-panel";
  checkoutPanel.innerHTML = `
    <div class="checkout-total">
      <p>Итого: <strong class="total-sum">0 ₽</strong></p>
      <a href="checkout.html" class="checkout-btn">Перейти к оформлению</a>
    </div>
  `;
  container.appendChild(checkoutPanel);

  checkoutPanel.style.position = "sticky";
  checkoutPanel.style.bottom = "0";
  checkoutPanel.style.background = "#fff";
  checkoutPanel.style.padding = "20px";
  checkoutPanel.style.borderTop = "1px solid #ddd";
  checkoutPanel.style.boxShadow = "0 -4px 12px rgba(0,0,0,0.1)";
  checkoutPanel.style.textAlign = "right";
  checkoutPanel.style.display = "none";
  checkoutPanel.style.zIndex = "10";

  const totalSumEl = checkoutPanel.querySelector(".total-sum");
  const checkoutBtn = checkoutPanel.querySelector(".checkout-btn");
  checkoutBtn.style.display = "inline-block";
  checkoutBtn.style.padding = "12px 32px";
  checkoutBtn.style.background = "#ccc";
  checkoutBtn.style.color = "#fff";
  checkoutBtn.style.textDecoration = "none";
  checkoutBtn.style.borderRadius = "8px";
  checkoutBtn.style.fontWeight = "600";

  function findDishByKeyword(keyword) {
    return window.DISHES?.find(d => d.keyword === keyword) || null;
  }

  function saveOrder() {
    const keywords = {
      soup: orderState.soup?.keyword || null,
      main: orderState.main?.keyword || null,
      starter: orderState.starter?.keyword || null,
      drink: orderState.drink?.keyword || null,
      dessert: orderState.dessert?.keyword || null
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(keywords));
  }

  function loadOrder() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      const keywords = JSON.parse(saved);
      Object.keys(keywords).forEach(cat => {
        if (keywords[cat]) {
          const dish = findDishByKeyword(keywords[cat]);
          if (dish) orderState[cat] = dish;
        }
      });
    } catch (e) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  function isValidCombo() {
    const s = !!orderState.soup;
    const m = !!orderState.main;
    const st = !!orderState.starter;
    const d = !!orderState.drink;
    return [s && m && st && d, s && m && d, s && st && d, m && st && d, m && d].some(Boolean);
  }

  function updateCheckoutPanel() {
    const sum = Object.values(orderState).reduce((acc, dish) => acc + (dish?.price || 0), 0);
    totalSumEl.textContent = `${sum} ₽`;

    const hasDishes = sum > 0;
    const valid = isValidCombo();

    checkoutPanel.style.display = hasDishes ? "block" : "none";
    checkoutBtn.style.background = valid ? "#3E5C41" : "#ccc";
    checkoutBtn.style.pointerEvents = valid ? "auto" : "none";
    checkoutBtn.href = valid ? "checkout.html" : "#";
  }

  function setActiveCard(category, keyword) {
    const selectors = {
      soup: "#soups .dish-grid",
      main: "#mains .dish-grid",
      drink: "#drinks .dish-grid",
      starter: "#starters .dish-grid",
      dessert: "#desserts .dish-grid"
    };
    const grid = document.querySelector(selectors[category]);
    if (!grid) return;

    grid.querySelectorAll(".dish-card").forEach(card => {
      const active = card.dataset.dish === keyword;
      card.classList.toggle("dish-card--selected", active);
      card.style.border = active ? "3px solid #3E5C41" : "";
    });
  }

  loadOrder();

  Object.entries(orderState).forEach(([cat, dish]) => {
    if (dish) setActiveCard(cat, dish.keyword);
  });

  updateCheckoutPanel();

  document.addEventListener("click", e => {
    const card = e.target.closest(".dish-card");
    if (!card) return;

    const keyword = card.dataset.dish;
    const dish = findDishByKeyword(keyword);
    if (!dish) return;

    const key = CATEGORY_MAP[dish.category];
    if (!key) return;

    if (orderState[key]?.keyword === keyword) {
      orderState[key] = null;
    } else {
      orderState[key] = dish;
    }

    setActiveCard(key, orderState[key]?.keyword || null);
    saveOrder();
    updateCheckoutPanel();
  });

  document.addEventListener("click", e => {
    const filterBtn = e.target.closest(".filter-btn");
    if (!filterBtn) return;

    const container = filterBtn.closest(".dish-filters");
    const kind = filterBtn.dataset.kind;
    const grid = container.nextElementSibling;

    container.querySelectorAll(".filter-btn").forEach(btn => btn.classList.toggle("active", btn === filterBtn));

    grid.querySelectorAll(".dish-card").forEach(card => {
      const cardKind = card.dataset.kind;
      card.style.display = (kind === "all" || cardKind === kind) ? "" : "none";
    });
  });
});