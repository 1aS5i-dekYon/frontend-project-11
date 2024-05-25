import yup, { ValidationError } from 'yup';
import renderRssForm from './view.js';

export default () => {
  const state = { catalog: { feeds: [], error: null } };

  const watchedState = renderRssForm(state);

  const rssForm = document.querySelector('.rss-form');
  rssForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url');

    console.log(url, '[url]');
    // отсюда yup... изменяет состояние и все что находится внутри закидывает в обработчик!!!
    const loadedFeeds = Object.values(state.catalog.feeds).map((item) => item.requestUrl);

    const formSchema = yup.object().shape({
      inputValue: yup.string()
        .url()
        .required()
        .notOneOf(loadedFeeds),
    });
    // const url = 'http://feeds.feedburner.com/Archdaily';

    formSchema
      .validate({ inputValue: url })
      .then(() => {
        console.log('[ok]', url);
        watchedState.catalog.feeds.push(url);
      })
      .catch((error) => {
        console.log('[error]', error);
        watchedState.error = ValidationError;
      });

  // ...досюда yup
  });
};
