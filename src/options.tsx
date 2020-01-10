import { chromeRuntimeSendMessage } from './chrome_helpers';
import { RequestOperation } from './common';

const addTestDataButtonHandler = function(): void {
  chromeRuntimeSendMessage({ operation: RequestOperation.AddTestData })
    .then(response => {
      if (response === 'SUCCESS') {
        console.log(`addTestData response: ${response}`);
      } else {
        throw new Error(`addTestData response: ${response}`);
      }
    })
    .catch(error => {
      console.log(`Error during communication with addTestData: ${error}`);
    });
};

const deleteSavedDataButtonHandler = function(): void {
  chromeRuntimeSendMessage({ operation: RequestOperation.DeleteUserData })
    .then(response => {
      if (response === 'SUCCESS') {
        console.log(`deleteSavedData response: ${response}`);
      } else {
        throw new Error(`deleteSavedData response: ${response}`);
      }
    })
    .catch(error => {
      console.log(`Error during communication with deleteSavedData: ${error}`);
    });
};

const setupEventListener = function(
  elemId: string,
  event: string,
  handler: () => unknown,
): void {
  const elem = document.getElementById(elemId);
  if (elem === null) {
    throw new Error("Delete data button can't be found");
  }
  elem.addEventListener(event, handler);
};

const setupEventListeners = function(): void {
  setupEventListener('addTestData', 'click', addTestDataButtonHandler);
  setupEventListener('deleteSavedData', 'click', deleteSavedDataButtonHandler);
};

setupEventListeners();
