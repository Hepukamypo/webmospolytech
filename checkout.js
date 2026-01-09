const API_KEY = "043f7d68-3cee-44dd-9ba1-bfed45a44f99";
const ORDERS_API = "https://edu.std-900.ist.mospolytech.ru/labs/api/orders";
const STORAGE_KEY = "greenbowl_order";

document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("dishes:loaded", () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      document.getElementById("order-content").style.display = "none";
      document.getElementById("empty-order").style.display = "block";
      return;
    }

    let keywords;
    try {
      keywords = JSON.parse(saved);
    } catch (e) {
      localStorage.removeItem(STORAGE_KEY);
      document.getElementById("order-content").style.display = "none";
      document.getElementById("empty-order").style.display = "block";
      return;
    }

    const hasSelection = Object.values(keywords).some(v => v !== null);
    if (!hasSelection) {
      document.getElementById("order-content").style.display = "none";
      document.getElementById("empty-order").style.display = "block";
      return;
    }

    const grid = document.getElementById("order-dishes-grid");
    const summary = document.getElementById("order-summary");
    let total = 0;

    summary.innerHTML = `
      <div class="order-items">
        <div class="order-item order-soup"><p class="order-item-title">Суп</p><p class="order-item-content muted">блюдо не выбрано</p></div>
        <div class="order-item order-main"><p class="order-item-title">Главное блюдо</p><p class="order-item-content muted">блюдо не выбрано</p></div>
        <div class="order-item order-starter"><p class="order-item-title">Салат / стартер</p><p class="order-item-content muted">ничего не выбрано</p></div>
        <div class="order-item order-dessert"><p class="order-item-title">Десерт</p><p class="order-item-content muted">ничего не выбрано</p></div>
        <div class="order-item order-drink"><p class="order-item-title">Напиток</p><p class="order-item-content muted">напиток не выбран</p></div>
      </div>
      <div class="order-total" style="margin-top:16px;">
        <p class="order-total-title">Стоимость заказа</p>
        <p class="order-total-sum" style="font-size:28px;font-weight:700;">0 ₽</p>
      </div>
    `;

    const totalEl = summary.querySelector(".order-total-sum");

    Object.entries(keywords).forEach(([cat, kw]) => {
      if (kw) {
        const dish = window.DISHES.find(d => d.keyword === kw);
        if (dish) {
          const card = document.createElement("div");
          card.className = "dish-card";
          
         
          card.innerHTML = `
            <img src="${dish.image}" alt="${dish.name}">
            <p class="dish-price">${dish.price} ₽</p>
            <p class="dish-name">${dish.name}</p>
            <p class="dish-weight">${dish.count}</p>
            <button type="button" class="remove-btn">удалить</button>
          `;
          card.querySelector(".remove-btn").addEventListener("click", () => {
            keywords[cat] = null;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(keywords));
            location.reload();
          });
          grid.appendChild(card);

          const itemEl = summary.querySelector(`.order-${cat} .order-item-content`);
          itemEl.classList.remove("muted");
          itemEl.innerHTML = `<strong>${dish.name}</strong><br><span class="small">${dish.count}</span> — <span class="price">${dish.price} ₽</span>`;

          total += dish.price;
        }
      }
    });

    totalEl.textContent = `${total} ₽`;

    const form = document.getElementById("order-form");
    const modal = document.getElementById("validation-modal");
    const modalMsg = document.getElementById("modal-message");

    function showModal(text) {
      modalMsg.textContent = text;
      modal.classList.add("show");
    }

    document.querySelector(".modal-ok-btn").addEventListener("click", () => modal.classList.remove("show"));
    modal.addEventListener("click", e => { if (e.target === modal) modal.classList.remove("show"); });

    function isValidCombo() {
      const s = !!keywords.soup;
      const m = !!keywords.main;
      const st = !!keywords.starter;
      const d = !!keywords.drink;
      return [s && m && st && d, s && m && d, s && st && d, m && st && d, m && d].some(Boolean);
    }

    form.addEventListener("submit", async e => {
      e.preventDefault();

      if (!isValidCombo()) {
        showModal("выбранный набор блюд не соответствует доступным вариантам ланча");
        return;
      }

      const fd = new FormData(form);

      const data = {
        full_name: fd.get("full_name").trim(),
        email: fd.get("email").trim(),
        phone: fd.get("phone").trim(),
        delivery_address: fd.get("delivery_address").trim(),
        delivery_type: fd.get("delivery_type") === "asap" ? "now" : "by_time",
        comment: fd.get("comment")?.trim() || "",
        subscribe: !!fd.get("subscribe"),
        soup_id: keywords.soup ? window.DISHES.find(d => d.keyword === keywords.soup).id : null,
        main_course_id: keywords.main ? window.DISHES.find(d => d.keyword === keywords.main).id : null,
        salad_id: keywords.starter ? window.DISHES.find(d => d.keyword === keywords.starter).id : null,
        drink_id: keywords.drink ? window.DISHES.find(d => d.keyword === keywords.drink).id : null,
        dessert_id: keywords.dessert ? window.DISHES.find(d => d.keyword === keywords.dessert).id : null
      };

      if (data.delivery_type === "by_time") {
        data.delivery_time = fd.get("delivery_time");
        if (!data.delivery_time) {
          showModal("Укажите точное время доставки");
          return;
        }
      }

      try {
        const resp = await fetch(`${ORDERS_API}?api_key=${API_KEY}`, {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify(data)
        });
		
        if (!resp.ok) {
          const err = await resp.json();
          throw new Error(err.error || "Ошибка сервера");
        }

        alert("Заказ успешно оформлен!");
        localStorage.removeItem(STORAGE_KEY);
        location.href = "index.html";
      } catch (err) {
        showModal("Ошибка отправки заказа: " + err.message);
      }
    });
  });
});