// Минимальный JavaScript: открытие/закрытие модального окна и
// сообщение об отправке формы. Вся вёрстка и оформление — в HTML/CSS.

const dialog = document.getElementById('order-dialog');

// Открываем модальное окно по кнопкам «Заказать» / «Быстрая заявка».
document.querySelectorAll('[data-product]').forEach((button) => {
  button.addEventListener('click', () => {
    const select = dialog.querySelector('select[name="product"]');
    select.value = button.dataset.product;
    dialog.showModal();
  });
});

if (dialog) {
  // Кнопки закрытия.
  dialog.querySelectorAll('[data-dialog-close]').forEach((button) => {
    button.addEventListener('click', () => dialog.close());
  });

  // Клик по затемнённому фону тоже закрывает окно.
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) {
      dialog.close();
    }
  });
}

// На странице заявки подставляем товар из адреса: order.html?product=Aurora%2075
const productParam = new URLSearchParams(window.location.search).get('product');
const pageSelect = document.querySelector('main select[name="product"]');
if (productParam && pageSelect) {
  pageSelect.value = productParam;
}

// Обработка отправки всех форм (backend пока не подключён).
document.querySelectorAll('.order-form').forEach((form) => {
  const status = form.querySelector('.order-form__status');

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    status.hidden = true;

    let valid = true;
    Array.from(form.elements).forEach((element) => {
      if (!element.willValidate) return;
      if (element.checkValidity()) {
        element.removeAttribute('aria-invalid');
      } else {
        element.setAttribute('aria-invalid', 'true');
        valid = false;
      }
    });

    if (!valid) {
      form.reportValidity();
      return;
    }

    form.reset();
    status.hidden = false;

    // В модальном окне даём прочитать сообщение и закрываем окно.
    if (dialog && dialog.contains(form)) {
      setTimeout(() => {
        dialog.close();
        status.hidden = true;
      }, 1800);
    }
  });
});
