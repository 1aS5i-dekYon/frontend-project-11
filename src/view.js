import onChange from 'on-change';

const createEl = (tagName, style = '', text = '') => {
  const element = document.createElement(tagName);
  if (style) element.classList.add(...style);
  if (text) element.innerHTML = text;
  return element;
};

const makeBoxFor = (container, els = '', text = '') => {
  const cardBorder = createEl('div', ['card-border-0']);
  const cardBody = createEl('div', ['card-body']);
  const title = createEl('h2', ['card-title', 'h4'], text);
  const list = createEl('ul', ['list-group', 'border-0', 'rounded-0']);

  list.append(...els);
  cardBody.append(title);
  cardBorder.append(cardBody, list);
  container.replaceChildren(cardBorder);
};

const makePostsBox = (value, text) => {
  const postsList = value.map((post) => {
    const el = createEl('li', [
      'list-group-item', 'd-flex', 'justify-content-between',
      'align-items-start', 'border-0', 'border-end-0',
    ]);

    const link = createEl('a', ['fw-bold']);
    link.setAttribute('data-id', post.postId);
    link.setAttribute('href', post.postLink);
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
    link.textContent = post.titlePost;

    const button = createEl('button', ['btn', 'btn-outline-primary', 'btn-sm']);
    button.setAttribute('type', 'button');
    button.setAttribute('data-id', post.postId);
    button.setAttribute('data-bs-toggle', 'modal');
    button.setAttribute('data-bs-target', '#modal');
    button.textContent = 'Просмотр';

    el.append(link, button);
    return el;
  });
  const containerPosts = document.querySelector('.posts');
  makeBoxFor(containerPosts, postsList, text);
};

const makeFeedsBox = (feeds, text) => {
  const feedsList = feeds.map(({ descriptionFeed, titleFeed }) => {
    const elList = createEl('li', ['list-group-item', 'border-0', 'border-end-0']);
    const titleEl = createEl('h3', ['h6', 'm-0'], titleFeed);
    const descriptionEl = createEl('p', ['m-0', 'small', 'text-black-50'], descriptionFeed);
    elList.append(titleEl, descriptionEl);
    return elList;
  });
  const containerFeeds = document.querySelector('.feeds');
  makeBoxFor(containerFeeds, feedsList, text);
};

const makeSuccessParagraph = (input, p, text) => {
  input.classList.remove('is-invalid');
  input.classList.add('is-valid');
  p.classList.remove('text-danger');
  p.classList.add('text-success');
  p.innerHTML = text;
};
const makeDangerParagraph = (input, p, text) => {
  input.classList.remove('is-valid');
  input.classList.add('is-invalid');
  p.classList.remove('text-success');
  p.classList.add('text-danger');
  p.innerHTML = text;
};
const fillModalEl = (value) => {
  const titleModal = document.querySelector('.modal-title');
  const bodyModal = document.querySelector('.modal-body');
  const buttonLink = document.querySelector('.full-article');

  titleModal.innerHTML = value.titlePost;
  bodyModal.innerHTML = value.descriptionPost;
  buttonLink.href = value.postLink;
};

const hidePost = (id) => {
  const targetPost = document.querySelector(`[data-id='${id}']`);
  targetPost.classList.remove('fw-bold');
  targetPost.classList.add('fw-normal', 'gray');
};

export default (state, i18nextInstance) => onChange(state, (path, value) => {
  const urlInput = document.querySelector('#url-input');
  const p = document.querySelector('.feedback');
  switch (path) {
    case 'process':
      break;
    case 'form.error':
      makeDangerParagraph(urlInput, p, i18nextInstance.t(state.form.error));
      break;
    case 'feeds':
      makeFeedsBox(value, i18nextInstance.t('titleFeeds'));
      makeSuccessParagraph(urlInput, p, i18nextInstance.t('validUrl'));
      break;
    case 'posts':
      makePostsBox(value, i18nextInstance.t('titlePosts'));
      break;
    case 'modal':
      fillModalEl(value);
      break;
    case 'readPostIds':
      hidePost(value.at(-1));
      break;
    default:
      throw new Error('boom');
  }
});
