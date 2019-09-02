import React from 'react';
import ReactDOM from 'react-dom';
import PopupView from './components/PopupView';
import { Reminder } from './common';
import { chromeRuntimeSendMessage } from './chrome_helpers';

const requestReminderFromURL = function(url: string): Promise<string> {
  console.log('Sending request getReminderFromURL now.');
  return chromeRuntimeSendMessage({ operation: 'getReminderFromURL', url: url }) as
    Promise<string>;
};

const getCurrentPageReminder = function(): Promise<Reminder | null> {
  const url = window.location.protocol + '//' + window.location.hostname + window.location.pathname;
  return requestReminderFromURL(url).then((response: string) => {
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
