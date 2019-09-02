import React from 'react';
import ReactDOM from 'react-dom';
import { Reminder, ReminderStore, KeywordMap,
  ReminderDataResponse } from './common';
import ReminderApp from './components/ReminderApp';
import { chromeRuntimeSendMessage } from './chrome_helpers';

/**
 * Get the search query from the URL of the page.
 * e.g. google.com/search?q=fresh%23cookies
 * */
const getSearchQuery = function(): string {
  const urlParams = new URLSearchParams(document.location.search.substring(1).toLocaleLowerCase());
  const query = urlParams.get('q');
  if (!query) {
    throw new Error('No search query found.');
  }
  return query;
};

const getKeywordsFromQuery = function(query: string): string[] {
  return query.replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').split(' ');
};

const requestReminderData = function(): Promise<ReminderDataResponse> {
  console.log('Sending a request for Reminder data now.');
  return chromeRuntimeSendMessage({ operation: 'getReminderData' }) as
    Promise<ReminderDataResponse>;
};

const injectionPoint = document.createElement('div');

const searchBox = document.getElementById('search');
if (searchBox === null) {
  throw new Error('No div with id "search" found.');
}
if (searchBox.parentNode === null) {
  throw new Error('Search div does not have a parent.');
}
searchBox.parentNode.insertBefore(injectionPoint, searchBox);

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

  console.log(`${reminderIds.size} relevant reminders found.`);
  const reminderList: Reminder[] = [];
  reminderIds.forEach(id => {
    const reminder = reminderStore.data.get(id);
    if (reminder === undefined) {
      throw new Error(`Reminder not found in reminderMap for id: ${id}`);
    }
    console.log(`reminder: ${reminder}`);
    reminderList.push(reminder);
  });

  const reminderApp = <ReminderApp initReminders={reminderList} />;
  ReactDOM.render(reminderApp, injectionPoint, () => console.log('ReminderApp rendered.'));
})
.catch(err => {
  console.log(err);
});
