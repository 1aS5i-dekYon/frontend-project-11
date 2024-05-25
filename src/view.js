import onChange from 'on-change';

const render = (path, value) => {
  // в зависимости от результата валидации выводит рамку инпута
  const urlInput = document.querySelector('#url-input');
  if (path === 'error') {
    urlInput.classList.add('is-invalid');
    console.log(value);
  }
};

export default (state) => onChange(state, render);
