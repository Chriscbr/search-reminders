import React from 'react';
import ReactDOM from 'react-dom';
import { Reminder, RequestOperation } from './common';
import ReminderApp from './components/ReminderApp';
import { chromeRuntimeSendMessage } from './chrome_helpers';

/**
 * Get the search query from the URL of the page.
 * e.g. google.com/search?q=fresh%23cookies
 * */
const getSearchQuery = function (): string {
  const urlParams = new URLSearchParams(
    document.location.search.substring(1).toLocaleLowerCase(),
  );
  const query = urlParams.get('q');
  if (!query) {
    throw new Error('No search query found.');
  }
  return query;
};

/**
 * Parses a query into an array of keywords.
 *
 * Removes all non-alphanumeric characters and mixed whitespace characters.
 * @param query a search query, e.g. "chocolate chip cookies"
 */
const getKeywordsFromQuery = function (query: string): string[] {
  return query
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .split(' ');
};

/**
 * Sends a message to the `background.js` script to obtain a list of relevant
 * Reminders given a sequence of keywords.
 * @param keywords a sequence of keywords
 */
const requestRelevantReminders = function (
  keywords: string[],
): Promise<Reminder[]> {
  console.log('Sending a request for relevant reminders.');
  return chromeRuntimeSendMessage({
    operation: RequestOperation.GetRelevantReminders,
    keywords: keywords,
  }).then((response) => {
    const data = response as { reminders: string[] };
    const reminders = data.reminders.map((value: string) =>
      Reminder.fromJSON(value),
    );
    return reminders;
  });
};

/**
 * Creates and returns the div which app content will be inserted to on the
 * Google search results page.
 *
 * The div is inserted at the beginning of the search results, right before the
 * div called "search" on Google.
 */
const setupInjectionPoint = function (): HTMLDivElement {
  const injectionPoint = document.createElement('div');

  const searchBox = document.getElementById('search');
  if (searchBox === null) {
    throw new Error('No div with id "search" found.');
  }
  if (searchBox.parentNode === null) {
    throw new Error('Search div does not have a parent.');
  }
  searchBox.parentNode.insertBefore(injectionPoint, searchBox);

  return injectionPoint;
};

const injectRemindersList = function (): void {
  const keywords: string[] = getKeywordsFromQuery(getSearchQuery());
  console.log(`Keywords found: ${keywords}`);

  requestRelevantReminders(keywords)
    .then((reminders) => {
      console.log('Reminder data received:', reminders);

      const injectionPoint = setupInjectionPoint();
      const reminderApp = <ReminderApp initReminders={reminders} />;
      ReactDOM.render(reminderApp, injectionPoint, () =>
        console.log('ReminderApp rendered.'),
      );
    })
    .catch((err) => {
      console.log(err);
    });
};

const isGoogleSearchPage = function (): boolean {
  const hostname: string = document.location.hostname;
  const pathname: string = document.location.pathname;

  return hostname === 'www.google.com' && pathname === '/search';
};

// Main driver code
console.log('Content script loaded.');
if (isGoogleSearchPage()) {
  injectRemindersList();
}
