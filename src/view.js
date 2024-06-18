import onChange from 'on-change';
import { makeBoxFor, makeFeedsEls, makePostsEls } from './utils/utils-view.js';

const displayInterfaceLng = (elements, i18nextInstance) => {
  elements.init.readCompletelyEl.textContent = i18nextInstance.t('elsInit.readCompletely');
  elements.init.close.textContent = i18nextInstance.t('elsInit.close');
  elements.init.projectTitle.textContent = i18nextInstance.t('elsInit.projectTitle');
  elements.init.startRead.textContent = i18nextInstance.t('elsInit.startRead');
  elements.init.labelRss.textContent = i18nextInstance.t('elsInit.placeholder');
  elements.init.addButton.textContent = i18nextInstance.t('elsInit.add');
  elements.init.exampleRss.textContent = i18nextInstance.t('elsInit.exampleRss');
};

const makeSuccessParagraph = (elements, text) => {
  elements.urlInput.classList.remove('is-invalid');
  elements.urlInput.classList.add('is-valid');
  elements.feedback.classList.remove('text-danger');
  elements.feedback.classList.add('text-success');
  elements.feedback.innerHTML = text;
};

const makeDangerParagraph = (elements, text) => {
  elements.urlInput.classList.remove('is-valid');
  elements.urlInput.classList.add('is-invalid');
  elements.feedback.classList.remove('text-success');
  elements.feedback.classList.add('text-danger');
  elements.feedback.innerHTML = text;
};

const proccessActions = {
  initialization: (elements, i18nextInstance) => displayInterfaceLng(elements, i18nextInstance),
  somethingElse: '',
};

const displayFeeds = (feedsEls, i18nextInstance, feeds) => {
  const feedsList = makeFeedsEls(feeds);
  const cardBorderFeeds = makeBoxFor(feedsList, i18nextInstance.t('titleFeeds'));
  feedsEls.replaceChildren(cardBorderFeeds);
};

const displayPosts = (postsEls, i18nextInstance, posts, readPostIds) => {
  const postsList = makePostsEls(posts, readPostIds, i18nextInstance.t('preview'));
  const cardBorderPosts = makeBoxFor(postsList, i18nextInstance.t('titlePosts'));
  postsEls.replaceChildren(cardBorderPosts);
};

export default (state, elements, i18nextInstance) => onChange(state, (path, value) => {
  switch (path) {
    case 'process':
      proccessActions[value](elements, i18nextInstance);
      break;
    case 'form.error':
      makeDangerParagraph(elements, i18nextInstance.t(state.form.error));
      break;

    case 'feeds':
      displayFeeds(elements.feeds, i18nextInstance, value);
      makeSuccessParagraph(elements, i18nextInstance.t('validUrl'));
      break;

    case 'posts':
      displayPosts(elements.posts, i18nextInstance, value, state.readPostIds);
      break;

    case 'modal':
      elements.modal.title.innerHTML = value.titlePost;
      elements.modal.body.innerHTML = value.descriptionPost;
      elements.modal.buttonLink.href = value.postLink;
      break;

    case 'readPostIds':
      displayPosts(elements.posts, i18nextInstance, state.posts, state.readPostIds);
      break;

    default:
      throw new Error('errorSwitchConstruction');
  }
});
