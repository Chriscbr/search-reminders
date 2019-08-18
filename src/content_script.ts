class RemindersBox {
  box: Node;
  constructor() {
    this.box = this.initBox();
  }

  initBox() {
    const remindersDiv = document.createElement('div');
    remindersDiv.className = 'remindersDiv';

    const searchBox = document.getElementById('search');
    if (searchBox === null) {
      throw new Error('No div with id "search" found.');
    }
    searchBox.parentElement!.insertBefore(remindersDiv, searchBox);

    return remindersDiv;
  }

  addReminder(reminder: Reminder) {
    const reminderBox = document.createElement('div');
    reminderBox.className = 'remindersDiv';
    reminderBox.innerHTML = reminder.title;
    this.box.appendChild(reminderBox);
  }
}

const getSearchQuery = function() {
  const urlParams = new URLSearchParams(document.location.search.substring(1));
  if (!urlParams.has('q')) {
    throw new Error('No search query found.');
  }
  return urlParams.get('q')!;
};

const getKeywordsFromQuery = function(query: string) {
  return query.replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').split(' ');
}

const promisify = function(fn: any, ...params: any[]) {
  return new Promise((resolve, reject) => {
    return fn.apply(null, params.concat((result: any) => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      return resolve(result);
    }));
  });
};

const getStorageItems = function(param: string) {
  // classic JavaScript binding weirdness here
  return promisify(chrome.storage.local.get.bind(chrome.storage.local), param);
};

Promise.all([getStorageItems('reminderMap'), getStorageItems('keywordMap')])
  .then(values => {
    const remindersBox = new RemindersBox();
    const reminderMap = (values[0] as ReminderMap);
    const keywordMap = (values[1] as KeywordMap);
    const keywords: string[] = getKeywordsFromQuery(getSearchQuery());
    let reminderIds: Set<number> = new Set();

    // collect all of the possible reminder IDs related to any of the keywords
    keywords.forEach(keyword => {
      if (keywordMap.data.has(keyword)) {
        keywordMap.data.get(keyword)!.forEach(id => {
          reminderIds.add(id);
        });
        reminderIds = keywordMap.data.get(keyword)!;
      }
    });

    reminderIds.forEach(id => {
      const reminder = reminderMap.data.get(id);
      if (reminder === undefined) {
        throw new Error(`Reminder not found in reminderMap for id: ${id}`);
      }
      remindersBox.addReminder(reminder);
    });
  })
  .catch(err => {
    console.log(err)
  });
