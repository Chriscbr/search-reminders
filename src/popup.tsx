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
const getCurrentPageReminder = async (): Promise<
  [string | null, Reminder | null]
> => {
  const tabs = await chromeTabsQuery({ active: true, lastFocusedWindow: true });
  const url = tabs[0].url;
  if (url === undefined) {
    return [null, null];
  }
  console.log(`Sending request getReminderFromURL with url: ${url}.`);
  const response = (await chromeRuntimeSendMessage({
    operation: RequestOperation.GetReminderFromURL,
    url: url,
  })) as string;
  console.log(`Received getReminderFromURL response: ${response}`);
  if (response === 'null') {
    return [url, null];
  } else {
    return [url, Reminder.fromJSON(response)];
  }
};

/**
 * Get the metadata associated with the current page.
 *
 * Obtains page metadata by sending a message to `content_script.js`, which
 * responds with a `PageMetadata` object.
 */
const getPageMetadata = async (): Promise<PageMetadata> => {
  console.log('Sending request getPageMetadata to content scripts.');
  const pageMetadata = (await chromeRuntimeSendMessageToContentScript({
    operation: RequestOperation.GetPageMetadata,
  })) as PageMetadata;
  console.log('Received getPageMetdata response:', pageMetadata);
  return pageMetadata;
};

const popupView = (
  <PopupView
    getCurrentPageReminder={getCurrentPageReminder}
    getPageMetadata={getPageMetadata}
  />
);
ReactDOM.render(popupView, document.getElementById('popupWrapper'));
