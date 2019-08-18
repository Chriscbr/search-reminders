class RemindersBox {
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

const promisify = function(fn) {
  const args = Array.prototype.slice.call(arguments).slice(1);
  return new Promise((resolve, reject) => {
    return fn.apply(null, args.concat(result => {
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

    const reminderMap = values[0];
    const keywordMap = values[1];
    const keywords = getKeywordsFromQuery(getSearchQuery());
    let reminderIds = null;
    keywords.forEach(keyword => {
      if (keywordMap.has(keyword)) {
        reminderIds = keywordMap.get(keyword);
      }
    })
    if (reminderIds !== null) {
      reminderIds.forEach(key => {
        const reminder = reminderMap.get(key);
        remindersBox.addReminder(reminder);
      });
    }
  })
  .catch(err => {
    console.log(err)
  });
