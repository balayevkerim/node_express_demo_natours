export const showAlert = (type, message) => {
  hideAlert();
  const divEl = `<div class='alert alert--${type}'>${message}</div>`;

  document.querySelector('body').insertAdjacentHTML('afterbegin', divEl);

  setTimeout(() => {
    hideAlert();
  }, 3000);
};

export const hideAlert = () => {
  const el = document.querySelector('.alert');
  if (el) el.parentElement.removeChild(el);
};
