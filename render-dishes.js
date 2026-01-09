document.addEventListener("dishes:loaded", () => {
  const containers = {
  soup: document.querySelector("#soups .dish-grid"),
  "main-course": document.querySelector("#mains .dish-grid"),
  salad: document.querySelector("#starters .dish-grid"),
  drink: document.querySelector("#drinks .dish-grid"),
  dessert: document.querySelector("#desserts .dish-grid")
};


  Object.values(containers).forEach(c => c && (c.innerHTML = ""));

  const byCategory = {
    soup: window.DISHES.filter(d => d.category === "soup"),
    "main-course": window.DISHES.filter(d => d.category === "main-course"),
    salad: window.DISHES.filter(d => d.category === "salad"),
    drink: window.DISHES.filter(d => d.category === "drink"),
    dessert: window.DISHES.filter(d => d.category === "dessert")
  };


  Object.values(byCategory).forEach(arr =>
    arr.sort((a, b) => a.name.localeCompare(b.name, "ru"))
  );

  function makeCard(dish) {
    const card = document.createElement("div");
    card.className = "dish-card";
    card.dataset.dish = dish.keyword;
    card.dataset.kind = dish.kind;
    card.tabIndex = 0;

	card.innerHTML = `
      <img src="${dish.image}" alt="${dish.name}">
      <p class="dish-price">${dish.price} ₽</p>
      <p class="dish-name">${dish.name}</p>
      <p class="dish-weight">${dish.count}</p>
      <button class="add-btn" type="button">добавить</button>
    `;

    return card;
  }

  Object.keys(byCategory).forEach(cat => {
    const container = containers[cat];
    if (container) {
      byCategory[cat].forEach(dish =>
        container.appendChild(makeCard(dish))
      );
    }
  });


  document.dispatchEvent(new CustomEvent("dishes:rendered"));
});