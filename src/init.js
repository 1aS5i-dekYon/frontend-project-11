import { string, setLocale } from 'yup';
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
  //
  console.log(doc, 123);
  //
  const titleFeed = doc.querySelector('title').textContent;
  const descriptionFeed = doc.querySelector('description').textContent;
  return {
    feedId, titleFeed, descriptionFeed, url,
  };
};
const makePosts = (feedId, doc) => {
  const items = doc.querySelectorAll('item');
  console.log(items);
  const posts = [];
  items.forEach((el) => {
    makePostId();
    const postId = lastPostId;
    const titlePost = el.querySelector('title').textContent;
    const descriptionPost = el.querySelector('description').textContent;
    const postLink = el.querySelector('link').textContent;
    console.log(titlePost, descriptionPost, postId, postLink);
    posts.push({
      postId, feedId, titlePost, descriptionPost, postLink,
    });
  });
  console.log(posts, 'in makePosts');
  return posts;
};

const getHttpResponseData = (url) => axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${url}`)
  .then((response) => response.data.contents)
  .catch(() => new Error('errors.networkError'));

const getParsedDataRss = (data) => {
  const parser = new DOMParser();
  console.log(data, 'data before');
  const doc = parser.parseFromString(data, 'text/xml');
  console.log(doc, 'parsing');
  const errorNode = doc.querySelector('parsererror');
  if (errorNode) {
    return new Error('errors.noRSS');
  }
  return doc;
};

const autoUpdatePosts = (watchedState, feed, timeout = 5000) => {
  const looper = () => {
    // сделать промис из парсера
    getHttpResponseData(feed.url)
      .then((data) => getParsedDataRss(data))
      .then((doc) => {
        const postsUrls = watchedState.posts
          .filter((post) => feed.feedId === post.feedId)
          .map(({ link }) => link);
        const items = doc.querySelectorAll('item');
        const newItems = [];
        items.forEach(({ link }) => {
          if (!postsUrls.includes(link)) newItems.push(link);
        });

        if (newItems.length > 0) {
          const posts = makePosts(feed.feedId, items);
          watchedState.posts.push(...posts);
        }
      })
      .catch(console.log)
      .finally(() => {
        setTimeout(looper, timeout);
      });
  };
  setTimeout(looper, timeout);
};

export default () => {
  setLocale({
    mixed: {
      default: 'errors.default',
      required: 'errors.empty',
      notOneOf: 'errors.alreadyExists',
    },
    string: { url: 'errors.invalidUrl' },
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
    const formSchema = string()
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
        makeFeedId();
        console.log('before makeFeed');
        const newFeed = makeFeed(lastFeedId, docXML, url);
        console.log('after makeFeed and before makePosts');
        const newPosts = makePosts(lastFeedId, docXML);
        console.log(newPosts);
        console.log('after makePosts');
        watchedState.feeds.push(newFeed);
        console.log('after push newFeed');
        watchedState.posts.push(...newPosts);
        console.log('after push newPosts');
        autoUpdatePosts(watchedState, newFeed);
      })
      .catch((error) => {
        console.log(error.message, 'error.message');
        watchedState.form.error = error.message ?? 'default';
      });
  });
};
