import React from 'react';
import ReactDOM from 'react-dom';
import PopupView from './components/PopupView';
import { Reminder } from './common';
import { chromeRuntimeSendMessage, chromeTabsQuery } from './chrome_helpers';
import 'typeface-roboto';

const requestReminderFromURL = function(url: string): Promise<string> {
  console.log(`Sending request getReminderFromURL with url: ${url}.`);
  return chromeRuntimeSendMessage({ operation: 'getReminderFromURL', url: url }) as
    Promise<string>;
};

const getCurrentPageReminder = function(): Promise<Reminder | null> {
  return chromeTabsQuery({'active': true, 'lastFocusedWindow': true})
    .then((tabs: chrome.tabs.Tab[]) => {
      const url = tabs[0].url;
      if (url === undefined) {
        throw new Error('No URL found for current tab.');
      }
      return requestReminderFromURL(url);
    })
    .then((response: string) => {
      console.log(`Received getReminderFromURL response: ${response}`);
      if (response === 'null') {
        return null;
      } else {
        return Reminder.fromJSON(response);
      }
    }).catch(err => {
      console.log(err);
      return null;
    });
};

const popupView = <PopupView getCurrentPageReminder={getCurrentPageReminder} />;
ReactDOM.render(popupView, document.getElementById('popupWrapper'));
