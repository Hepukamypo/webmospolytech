document.addEventListener('DOMContentLoaded', async function() {
    // --- 1. ЗАГРУЗКА ДАННЫХ С СЕРВЕРА ---
    let dishes;
    try {
        const response = await fetch('https://edu.std-900.ist.mospolytech.ru/labs/api/dishes');
        if (!response.ok) throw new Error('Сервер не ответил');
        const data = await response.json();
        // Приводим категории к нужному виду
        dishes = data.map(item => ({
            ...item,
            category: item.category === 'main-course' ? 'main' : 
                      item.category === 'salad' ? 'starter' : item.category,
            image: item.image.trim()
        }));
    } catch (error) {
        console.error('Ошибка загрузки:', error);
        alert('Ошибка загрузки меню!');
        return;
    }

    // --- 2. ПЕРЕМЕННЫЕ ---
    const selectedDishes = {
        soup: null, main: null, starter: null, drink: null, dessert: null
    };
    const totalContainer = document.getElementById('total-container');

    // --- 3. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---
    function getCategoryTitle(cat) {
        return cat === 'soup' ? 'Суп' :
               cat === 'main' ? 'Главное блюдо' :
               cat === 'starter' ? 'Салат/стартер' :
               cat === 'drink' ? 'Напиток' : 'Десерт';
    }

    function displayNoDish(cat) {
        const el = document.getElementById(`${cat}-container`);
        el.innerHTML = `<h4>${getCategoryTitle(cat)}</h4><span class="no-dish">Блюдо не выбрано</span>`;
        selectedDishes[cat] = null;
        calculateTotal();
    }

    function displayDish(dish) {
        const el = document.getElementById(`${dish.category}-container`);
        el.innerHTML = `<h4>${getCategoryTitle(dish.category)}</h4>
            <div class="selected-dish">
                <span class="dish-name">${dish.name}</span>
                <span class="dish-price">${dish.price}₽</span>
            </div>`;
        selectedDishes[dish.category] = dish;
        calculateTotal();
    }

    function calculateTotal() {
        const total = Object.values(selectedDishes)
            .filter(d => d)
            .reduce((sum, d) => sum + d.price, 0);
        totalContainer.style.display = total ? 'block' : 'none';
        totalContainer.innerHTML = `<strong>Стоимость заказа: ${total}₽</strong>`;
    }

    // --- 4. ОТОБРАЖЕНИЕ БЛЮД ---
    function renderDishes(category, kind = null) {
        const grid = document.querySelector(`.dishes-section:nth-of-type(${
            category === 'soup' ? 1 : 
            category === 'main' ? 2 : 
            category === 'starter' ? 3 : 
            category === 'drink' ? 4 : 5
        }) .dishes-grid`);
        
        grid.innerHTML = '';
        const filtered = dishes.filter(d => 
            d.category === category && (kind === null || d.kind === kind)
        );
        
        filtered.forEach(d => {
            const card = document.createElement('div');
            card.className = 'dish-card';
            card.innerHTML = `
                <img src="${d.image}" alt="${d.name}" class="dish-image">
                <p class="dish-price">${d.price}₽</p>
                <p class="dish-name">${d.name}</p>
                <p class="dish-weight">${d.count}</p>
                <button type="button" class="dish-button">Добавить</button>
            `;
            card.onclick = () => displayDish(d);
            grid.appendChild(card);
        });
    }

    // --- 5. ФИЛЬТРЫ ---
    function setupFilters() {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.onclick = function() {
                const section = this.closest('.dishes-section');
                const catIndex = [...document.querySelectorAll('.dishes-section')].indexOf(section) + 1;
                const category = [null, 'soup', 'main', 'starter', 'drink', 'dessert'][catIndex];
                const kind = this.getAttribute('data-kind');
                
                // Сброс активных кнопок
                section.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                // Установка активной (если не была активной)
                if (!this.classList.contains('active')) {
                    this.classList.add('active');
                    renderDishes(category, kind);
                } else {
                    renderDishes(category, null);
                }
            };
        });
    }

    // --- 6. ВАЛИДАЦИЯ ---
    function validate() {
        const { soup, main, starter, drink } = selectedDishes;
        if (!soup && !main && !starter && !drink) return ['Ничего не выбрано', 'Ничего не выбрано. Выберите блюда для заказа'];
        if (!drink) return ['Выберите напиток', 'Выбраны все необходимые блюда, кроме напитка'];
        if (soup && !main && !starter) return ['Выберите главное блюдо/салат/стартер', 'Выбран суп, но не выбраны главное блюдо/салат/стартер'];
        if (starter && !soup && !main) return ['Выберите суп или главное блюдо', 'Выбран салат/стартер, но не выбраны суп/главное блюдо'];
        if ((!soup && !starter) && drink && !main) return ['Выберите главное блюдо', 'Выбран напиток/десерт, но не выбрано главное блюдо'];
        return null;
    }

    function showNotification(title, msg) {
        document.querySelectorAll('.notification-overlay').forEach(el => el.remove());
        const overlay = document.createElement('div');
        overlay.className = 'notification-overlay';
        overlay.innerHTML = `
            <div class="notification-box">
                <h3 class="notification-title">${title}</h3>
                <p class="notification-message">${msg}</p>
                <button class="notification-button">Окей 👍</button>
            </div>
        `;
        overlay.querySelector('button').onclick = () => overlay.remove();
        document.body.appendChild(overlay);
    }

    // --- 7. ИНИЦИАЛИЗАЦИЯ ---
    ['soup', 'main', 'starter', 'drink', 'dessert'].forEach(cat => displayNoDish(cat));
    ['soup', 'main', 'starter', 'drink', 'dessert'].forEach(cat => renderDishes(cat));
    setupFilters();

    // --- 8. ФОРМА ---
    const form = document.querySelector('.order-form');
    if (form) {
        form.onreset = () => ['soup', 'main', 'starter', 'drink', 'dessert'].forEach(cat => displayNoDish(cat));
        form.onsubmit = (e) => {
            e.preventDefault();
            const error = validate();
            if (error) {
                showNotification(error[0], error[1]);
            } else {
                form.submit();
            }
        };
    }
});