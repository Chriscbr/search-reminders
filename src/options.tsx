import React from 'react';
import ReactDOM from 'react-dom';
import { chromeRuntimeSendMessage } from './chrome_helpers';
import { Reminder, RequestOperation } from './common';
import { SavedRemindersView } from './components/SavedRemindersView';

const addTestDataButtonHandler = (): void => {
  chromeRuntimeSendMessage({ operation: RequestOperation.AddTestData })
    .then((response) => {
      if (response === 'SUCCESS') {
        console.log(`addTestData response: ${response}`);
      } else {
        throw new Error(`addTestData response: ${response}`);
      }
    })
    .catch((error) => console.error(error));
};

const deleteSavedDataButtonHandler = (): void => {
  chromeRuntimeSendMessage({ operation: RequestOperation.DeleteUserData })
    .then((response) => {
      if (response === 'SUCCESS') {
        console.log(`deleteSavedData response: ${response}`);
      } else {
        throw new Error(`deleteSavedData response: ${response}`);
      }
    })
    .catch((error) => console.error(error));
};

const setupEventListener = (
  elemId: string,
  event: string,
  handler: () => unknown,
): void => {
  const elem = document.getElementById(elemId);
  if (elem === null) {
    throw new Error("Delete data button can't be found");
  }
  elem.addEventListener(event, handler);
};

const setupEventListeners = (): void => {
  setupEventListener('addTestData', 'click', addTestDataButtonHandler);
  setupEventListener('deleteSavedData', 'click', deleteSavedDataButtonHandler);
};

setupEventListeners();

/**
 * Get a list of all of the reminders the user has saved.
 */
const getAllReminders = (): Promise<Reminder[] | null> => {
  return chromeRuntimeSendMessage({
    operation: RequestOperation.GetAllReminders,
  })
    .then((response) => {
      const data = response as string[];
      return data.map((value: string) => Reminder.fromJSON(value));
    })
    .catch((err) => {
      console.error(err);
      return null;
    });
};

const savedRemindersView = (
  <SavedRemindersView getAllReminders={getAllReminders} />
);

ReactDOM.render(savedRemindersView, document.getElementById('savedPages'));
