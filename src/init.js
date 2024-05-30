import yup, { setLocale } from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import renderRssForm from './view.js';

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
    form: {
      state: 'filling',
      fields: { url: '' },
      error: '',
    },
    modal: {
      title: '',
      description: '',
      link: '',
    },
    feeds: [],
    posts: [],
    readPostIds: new Set(),
  };

  const watchedState = renderRssForm(state, i18nextInstance);

  const rssForm = document.querySelector('.rss-form');
  rssForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url');

    const loadedFeeds = Object.values(state.feeds).map((item) => item.requestUrl);

    const formSchema = yup.string()
      .url()
      .required()
      .notOneOf(loadedFeeds);
    // const url = 'http://feeds.feedburner.com/Archdaily';

    formSchema
      .validate(url)
      .then(() => getHttpResponseData(url))
      .then((data) => {
        // принимаем doc и конфигурим посты и фиды для стейта
        getParsedDataRss(data);
        // каждому посту и фиду свой ID в том числе и для следования канонам нормализации данных
      })
      .catch((error) => {
        watchedState.form.error = error.message ?? 'default';
      });
  });
};
