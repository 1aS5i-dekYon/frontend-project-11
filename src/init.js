import { string, setLocale } from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import displayRssForm from './view.js';

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
  const titleFeed = doc.querySelector('title').textContent;
  const descriptionFeed = doc.querySelector('description').textContent;
  return {
    feedId, titleFeed, descriptionFeed, url,
  };
};
const makePosts = (feedId, doc) => {
  const items = doc.querySelectorAll('item');
  const posts = [];
  items.forEach((el) => {
    makePostId();
    const postId = lastPostId;
    const titlePost = el.querySelector('title').textContent;
    const descriptionPost = el.querySelector('description').textContent;
    const postLink = el.querySelector('link').textContent;
    posts.push({
      postId, feedId, titlePost, descriptionPost, postLink,
    });
  });
  return posts;
};

const getHttpResponseData = (url) => axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${url}`)
  .then((response) => response.data.contents)
  .catch(() => {
    throw new Error('errors.networkError');
  });

const getParsedDataRss = (data) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(data, 'text/xml');
  const errorNode = doc.querySelector('parsererror');
  if (errorNode) {
    console.log(errorNode);
    throw new Error('errors.noRSS');
  }
  return doc;
};

const autoUpdatePosts = (watchedState, feed, timeout = 5000) => {
  const looper = () => {
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
    debug: false,
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
    modal: {
      postLink: '',
      titlePost: '',
      descriptionPost: '',
    },
    feeds: [],
    posts: [],
    readPostIds: [],
  };

  const watchedState = displayRssForm(state, i18nextInstance);

  const containerPosts = document.querySelector('.posts');
  const buttonsPosts = [];

  const rssForm = document.querySelector('.rss-form');
  rssForm.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedState.form.error = '';
    const formData = new FormData(e.target);
    const url = formData.get('url');

    const loadedFeeds = Object.values(watchedState.feeds).map((item) => item.url);
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
        const newFeed = makeFeed(lastFeedId, docXML, url);
        const newPosts = makePosts(lastFeedId, docXML);

        watchedState.feeds.push(newFeed);
        watchedState.posts.push(...newPosts);

        buttonsPosts.push(...containerPosts.querySelectorAll('button'));

        autoUpdatePosts(watchedState, newFeed);
        e.target.reset();
      })
      .catch((error) => {
        watchedState.form.error = error.message ?? 'default';
      });
  });

  containerPosts.addEventListener('click', (e) => {
    if (e.target.dataset.bsTarget === '#modal') {
      const targetPostId = parseInt(e.target.dataset.id, 10);
      const targetPost = watchedState.posts.find((post) => post.postId === targetPostId);
      const {
        titlePost, descriptionPost,
        postLink, postId,
      } = targetPost;

      watchedState.modal = { postLink, titlePost, descriptionPost };
      watchedState.readPostIds.push(postId);
    }
  });
};
