class RemindersBox {
  box: Node;
  constructor() {
    this.box = this.initBox();
  }

  initBox() {
    const remindersDiv = document.createElement('div');
    remindersDiv.className = 'remindersDiv';

    const searchBox = document.getElementById('search');
    searchBox.parentElement.insertBefore(remindersDiv, searchBox);

    return remindersDiv;
  }

  addReminder(reminder) {
    const reminderBox = document.createElement('div');
    reminderBox.className = 'remindersDiv';
    reminderBox.innerHTML = reminder.title;
    this.box.appendChild(reminderBox);
  }
}

const getSearchQuery = function() {
  const urlParams = new URLSearchParams(document.location.search.substring(1));
  return urlParams.get('q');
};

const getKeywordsFromQuery = function(query) {
  return query.replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').split(' ');
}

const promisify = function(fn, ...params) {
  return new Promise((resolve, reject) => {
    return fn.apply(null, params.concat(result => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      return resolve(result);
    }));
  });
};

const getStorageItems = function(param) {
  // classic JavaScript binding weirdness here
  return promisify(chrome.storage.local.get.bind(chrome.storage.local), param);
};

Promise.all([getStorageItems('reminderMap'), getStorageItems('keywordMap')])
  .then(values => {
    const remindersBox = new RemindersBox();

    const reminderMap = (values[0] as ReminderMap);
    const keywordMap = (values[1] as KeywordMap);
    const keywords = getKeywordsFromQuery(getSearchQuery());
    let reminderIds = null;
    keywords.forEach(keyword => {
      if (keywordMap.data.has(keyword)) {
        reminderIds = keywordMap.data.get(keyword);
      }
    })
    if (reminderIds !== null) {
      reminderIds.forEach(key => {
        const reminder = reminderMap.data.get(key);
        remindersBox.addReminder(reminder);
      });
    }
  })
  .catch(err => {
    console.log(err)
  });
