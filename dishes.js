const API_URL = "https://edu.std-900.ist.mospolytech.ru/labs/api/dishes";

window.DISHES = [];

async function loadDishes() {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`Ошибка загрузки блюд: ${response.status}`);
    }

    const data = await response.json();
    window.DISHES = data;
    document.dispatchEvent(new CustomEvent("dishes:loaded"));
  } catch (error) {
    console.error(error);
    alert("Не удалось загрузить меню. Попробуйте позже.");
  }
}

loadDishes();