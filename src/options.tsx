import { chromeRuntimeSendMessage } from './chrome_helpers';

const addTestDataButtonHandler = function(): void {
  chromeRuntimeSendMessage({ operation: 'addTestData' })
    .then(() => alert('addTestData message sent!'))
    .catch(() => alert('Error sending addTestData message.'));
};

const deleteSavedDataButtonHandler = function(): void {
  chromeRuntimeSendMessage({ operation: 'addTestData' })
    .then(() => alert('deleteSavedData message sent!'))
    .catch(() => alert('Error sending deleteSavedData message.'));
};

const setupEventListener = function(elemId: string,
                                    event: string,
                                    handler: () => unknown): void {
  const elem = document.getElementById(elemId);
  if (elem === null) {
    throw new Error('Delete data button can\'t be found');
  }
  elem.addEventListener(event, handler);
}

const setupEventListeners = function(): void {
  setupEventListener('addTestData', 'click', addTestDataButtonHandler);
  setupEventListener('deleteSavedData', 'click', deleteSavedDataButtonHandler);
};

setupEventListeners();
