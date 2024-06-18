const createEl = (tagName, style = '', text = '') => {
  const element = document.createElement(tagName);
  if (style) element.classList.add(...style);
  if (text) element.innerHTML = text;
  return element;
};

const makeBoxFor = (els = '', text = '') => {
  const cardBorder = createEl('div', ['card-border-0']);
  const cardBody = createEl('div', ['card-body']);
  const title = createEl('h2', ['card-title', 'h4'], text);
  const list = createEl('ul', ['list-group', 'border-0', 'rounded-0']);

  list.append(...els);
  cardBody.append(title);
  cardBorder.append(cardBody, list);
  return cardBorder;
};

const makePostsEls = (posts, readPostIds, buttonName = '') => {
  const postsList = posts.map((post) => {
    const el = createEl('li', [
      'list-group-item', 'd-flex', 'justify-content-between',
      'align-items-start', 'border-0', 'border-end-0'
    ]);

    const linkStyle = readPostIds.has(post.postId) ? 'fw-normal' : 'fw-bold';
    const link = createEl('a', [linkStyle]);
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
    button.textContent = buttonName;

    el.append(link, button);
    return el;
  });
  return postsList;
};

const makeFeedsEls = (feeds) => {
  const feedsList = feeds.map(({ descriptionFeed, titleFeed }) => {
    const elList = createEl('li', ['list-group-item', 'border-0', 'border-end-0']);
    const titleEl = createEl('h3', ['h6', 'm-0'], titleFeed);
    const descriptionEl = createEl('p', ['m-0', 'small', 'text-black-50'], descriptionFeed);
    elList.append(titleEl, descriptionEl);
    return elList;
  });
  return feedsList;
};

export { makeBoxFor, makeFeedsEls, makePostsEls };
