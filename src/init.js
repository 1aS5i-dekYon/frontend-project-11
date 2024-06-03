import yup, { setLocale } from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import renderRssForm from './view.js';

let lastPostId = 0;
const makePostId = () => {
  lastPostId += 1;
  return lastPostId;
};
let lastFeedId = 0;
const makeFeedId = () => {
  lastFeedId += 1;
  return lastFeedId;
};

const makeFeed = (feedId, doc, url) => {
  const titleFeed = doc.querySelector('title');
  const descriptionFeed = doc.querySelector('description');
  return {
    feedId, titleFeed, descriptionFeed, url,
  };
};
const makePosts = (feedId, doc) => {
  const items = doc.querySelectorAll('item');
  const posts = items.forEach((el) => {
    makePostId();
    const postId = lastPostId;
    const titlePost = el.querySelector('title');
    const descriptionPost = el.querySelector('description');
    return {
      postId, feedId, titlePost, descriptionPost,
    };
  });
  return posts;
};

const getHttpResponseData = (url) => axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${url}`)
  .then((response) => response.data)
  .catch(() => new Error('networkError'));

const getParsedDataRss = (data) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(data, 'application/xml');
  const errorNode = doc.querySelector('parsererror');
  if (errorNode) {
    return new Error('noRSS');
  }
  return doc;
};

export default () => {
  setLocale({
    mixed: {
      default: 'default',
      required: 'empty',
      notOneOf: 'alreadyExists',
    },
    string: { url: 'invalidUrl' },
  });

  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: 'ru',
    debug: true,
    resources: {
      ru: {
        translation: {
          titleFeeds: 'Фиды',
          titlePosts: 'Посты',
          preview: 'Просмотр',
          validUrl: 'RSS успешно загружен',
          errors: {
            invalidUrl: 'Ссылка должна быть валидным URL',
            empty: 'Не должно быть пустым',
            alreadyExists: 'RSS уже существует',
            noRSS: 'Ресурс не содержит валидный RSS',
            networkError: 'Ошибка сети',
            default: 'Неизвестная ошибка. Что-то пошло не так',
          },
        },
      },
    },
  });

  const state = {
    process: '',
    form: {
      fields: { url: '' },
      error: '',
    },
    feeds: [],
    posts: [],
  };

  const watchedState = renderRssForm(state, i18nextInstance);

  const rssForm = document.querySelector('.rss-form');
  rssForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url');

    const loadedFeeds = Object.values(state.feeds).map((item) => item.url);

    const formSchema = yup.string()
      .url()
      .required()
      .notOneOf(loadedFeeds);
    // 'http://feeds.feedburner.com/Archdaily'
    // https://www.aljazeera.com/xml/rss/all.xml
    watchedState.process = 'filling';
    formSchema
      .validate(url)
      .then(() => getHttpResponseData(url))
      .then((data) => getParsedDataRss(data))
      .then((docXML) => {
        // отправляем url  в feed и не паримся, а извлечет посты из него уже Fn с setTimeout!!!
        // все что ниже удалаяем отсюда и пихаем в эту Fn
        makeFeedId();
        const newFeed = makeFeed(lastFeedId, docXML, url);
        const newPosts = makePosts(lastFeedId, docXML);

        watchedState.feeds.push(newFeed);
        watchedState.posts.push(...newPosts);
        // после setTimeout обновляются все ID постов и фидов ...
        // ... (lastFeedId и lastPostId присваиваются нулю)
        // modal создается в начале body и обновляется по клику на новый пост
      })
      .catch((error) => {
        watchedState.form.error = error.message ?? 'default';
      });
  });
};
