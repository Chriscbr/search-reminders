import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Reminder, ReminderStore, KeywordMap, promisify,
  ReminderDataResponse} from './common';
import {ReminderList} from './ui_components';

const getSearchQuery = function(): string {
  const urlParams = new URLSearchParams(document.location.search.substring(1));
  const query = urlParams.get('q');
  if (!query) {
    throw new Error('No search query found.');
  }
  return query;
};

const getKeywordsFromQuery = function(query: string): string[] {
  return query.replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').split(' ');
};

const sendRequest = function(data: object): Promise<unknown> {
  return promisify(chrome.runtime.sendMessage.bind(chrome.runtime), data);
};

const requestReminderData = function(): Promise<ReminderDataResponse> {
  console.log('Sending a request for Reminder data now.');
  return sendRequest({operation: 'getReminderData'}) as
    Promise<ReminderDataResponse>;
};

const reminderList: Reminder[] = [];

const remindersDiv = document.createElement('div');

const searchBox = document.getElementById('search');
if (searchBox === null) {
  throw new Error('No div with id "search" found.');
}
if (searchBox.parentNode === null) {
  throw new Error('Search div does not have a parent.');
}
searchBox.parentNode.insertBefore(remindersDiv, searchBox);

let reminderListView = <ReminderList reminders={reminderList} />;
ReactDOM.render(reminderListView, remindersDiv, () => console.log('rendered first'));

requestReminderData().then(data => {
  console.log('Reminder data received, processing now.');

  const reminderStore = ReminderStore.fromJSON(data.reminderStore);
  const keywordMap = KeywordMap.fromJSON(data.keywordMap);

  const keywords: string[] = getKeywordsFromQuery(getSearchQuery());
  console.log(`Keywords found: ${keywords}`);

  // Set, not a list, in order to avoid duplicate reminder IDs
  let reminderIds: Set<number> = new Set();

  // collect all of the possible reminder IDs related to any of the keywords
  keywords.forEach(keyword => {
    const keywordId = keywordMap.data.get(keyword);
    if (keywordId !== undefined) {
      keywordId.forEach(id => {
        reminderIds.add(id);
      });
      reminderIds = keywordId;
    }
  });

  // TODO: keys in reminders are null for some reason

  console.log(`${reminderIds.size} relevant reminders found.`);
  reminderIds.forEach(id => {
    const reminder = reminderStore.data.get(id);
    if (reminder === undefined) {
      throw new Error(`Reminder not found in reminderMap for id: ${id}`);
    }
    console.log(`reminder: ${reminder}`);
    reminderList.push(reminder);
  });

  reminderListView = <ReminderList reminders={reminderList}></ReminderList>
  ReactDOM.render(reminderListView, remindersDiv, () => console.log('rendered second'));
})
.catch(err => {
  console.log(err);
});
