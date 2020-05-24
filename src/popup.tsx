import React from 'react';
import ReactDOM from 'react-dom';
import PopupView from './components/PopupView';
import { Reminder, RequestOperation, PageMetadata } from './common';
import {
  chromeRuntimeSendMessage,
  chromeRuntimeSendMessageToContentScript,
  chromeTabsQuery,
} from './chrome_helpers';
import 'typeface-roboto';

/**
 * Get the Reminder (if any) associated with the current page.
 *
 * Obtains the current page (active tab) URL using the chrome.tabs API,
 * and upon success sends a request to `background.js` to request the
 * `Reminder` data associated with the URL.
 *
 * @param url the URL of the current page (active tab)
 */
const getCurrentPageReminder = (): Promise<Reminder | null> => {
  return chromeTabsQuery({ active: true, lastFocusedWindow: true })
    .then((tabs: chrome.tabs.Tab[]) => {
      const url = tabs[0].url;
      if (url === undefined) {
        throw new Error('No URL found for current tab.');
      }
      console.log(`Sending request getReminderFromURL with url: ${url}.`);
      return chromeRuntimeSendMessage({
        operation: RequestOperation.GetReminderFromURL,
        url: url,
      }) as Promise<string>;
    })
    .then((response: string) => {
      console.log(`Received getReminderFromURL response: ${response}`);
      if (response === 'null') {
        return null;
      } else {
        return Reminder.fromJSON(response);
      }
    })
    .catch((err) => {
      console.error(err);
      return null;
    });
};

/**
 * Get the metadata associated with the current page.
 *
 * Obtains page metadata by sending a message to `content_script.js`, which
 * responds with a `PageMetadata` object.
 */
const getPageMetadata = (): Promise<PageMetadata | null> => {
  console.log(`Sending request getPageMetadata to content scripts.`);
  return chromeRuntimeSendMessageToContentScript({
    operation: RequestOperation.GetPageMetadata,
  })
    .then((response) => {
      console.log(`Received getPageMetdata response:`);
      console.log(response);
      return response as PageMetadata;
    })
    .catch((error) => {
      console.error(error);
      return null;
    });
};

const popupView = (
  <PopupView
    getCurrentPageReminder={getCurrentPageReminder}
    getPageMetadata={getPageMetadata}
  />
);
ReactDOM.render(popupView, document.getElementById('popupWrapper'));
