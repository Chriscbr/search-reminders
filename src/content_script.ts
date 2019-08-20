import {Reminder, ReminderMap, KeywordMap, promisify,
  ReminderDataResponse} from './common';

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
};

const sendRequest = function(data: object) {
  return promisify(chrome.runtime.sendMessage.bind(chrome.runtime), data);
};

const requestReminderData = function(): Promise<ReminderDataResponse> {
  console.log('Sending a request for Reminder data now.');
  return sendRequest({operation: 'getReminderData'}) as
    Promise<ReminderDataResponse>;
};

requestReminderData().then(data => {
  console.log('Reminder data received, processing now.');
  const remindersBox = new RemindersBox();

  const reminderMap = ReminderMap.fromJSON(data.reminderMap);
  const keywordMap = KeywordMap.fromJSON(data.keywordMap);

  const keywords: string[] = getKeywordsFromQuery(getSearchQuery());
  console.log(`Keywords found: ${keywords}`);

  // Set, not a list, in order to avoid duplicate reminder IDs
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

  console.log(`${reminderIds.size} relevant reminders found.`);
  reminderIds.forEach(id => {
    const reminder = reminderMap.data.get(id);
    if (reminder === undefined) {
      throw new Error(`Reminder not found in reminderMap for id: ${id}`);
    }
    console.log(`reminder: ${reminder}`);
    remindersBox.addReminder(reminder);
  });
})
.catch(err => {
  console.log(err);
})
