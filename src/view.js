import onChange from 'on-change';

const makeSuccessParagraph = (input, p, text) => {
  input.classList.remove('is-invalid');
  input.classList.add('is-valid');
  p.innerHTML = text;
};
const makeDangerParagraph = (input, p, text) => {
  input.classList.remove('is-valid');
  input.classList.add('is-invalid');
  p.innerHTML = text;
};

export default (state, i18nextInstance) => onChange(state, (path) => {
  // в зависимости от результата валидации выводит рамку инпута
  const urlInput = document.querySelector('#url-input');
  const p = document.querySelector('.feedback');

  switch (path) {
    case 'form.error':
      makeDangerParagraph(urlInput, p, i18nextInstance.t(state[path]));
      break;

    case 'feeds':
      makeSuccessParagraph(urlInput, p, i18nextInstance.t(state.validUrl));
      break;

    default:
      throw new Error('boom');
  }
});
