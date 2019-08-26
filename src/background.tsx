import { KeywordMap, ReminderDataResponse, ReminderStore,
  ReminderParams } from './common';
import { chromeStorageSyncSet, chromeStorageSyncGet } from './chrome_helpers';
import rawTestData from './testData.json';

const loadDataFromStorage = function(): Promise<{ reminderStore: ReminderStore;
                                                  keywordMap: KeywordMap; }> {
  return chromeStorageSyncGet(['storedReminderStore', 'storedKeywordMap'])
    .then((response) => {
      const data = response as ReminderDataResponse;
      const reminderStore = ReminderStore.fromJSON(data.reminderStore);
      const keywordMap = KeywordMap.fromJSON(data.keywordMap);
      return {reminderStore: reminderStore, keywordMap: keywordMap};
    })
    .catch((error) => {
      console.log(`Data not found in storage, possible error: ${error}`);
      console.log('Initializing with empty data');
      return {reminderStore: new ReminderStore(), keywordMap: new KeywordMap()};
    });
}

const addTestData = function(testData: ReminderParams[],
                             reminderStore: ReminderStore,
                             keywordMap: KeywordMap): void {
  testData.forEach((params, _index) => {
    const reminder = reminderStore.create(params);
    keywordMap.add(reminder);
  });
}

const saveLocalDataToStorage = function(reminderStore: ReminderStore,
                                        keywordMap: KeywordMap): Promise<unknown> {
  console.log('Saving local data to storage, with the following reminderStore and keywordMap:');
  console.log(reminderStore);
  console.log(keywordMap);
  const userData: ReminderDataResponse = {
    reminderStore: reminderStore.toJSON(),
    keywordMap: keywordMap.toJSON()
  };
  return chromeStorageSyncSet(userData);
}

const deleteAllLocalData = function(reminderStore: ReminderStore,
                                    keywordMap: KeywordMap): void {
  reminderStore.clear();
  keywordMap.clear();
};

const addMessageListener = function(reminderStore: ReminderStore,
                                    keywordMap: KeywordMap,
                                    testData: ReminderParams[]): void {
  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      console.log(sender.tab ?
                  `Received message from a content script: ${sender.tab.url}` :
                  'Received message from the extension.');
      console.log(`Message operation: ${request.operation}`);

      if (request.operation === 'getReminderData') {

        const response: ReminderDataResponse = {
          reminderStore: reminderStore.toJSON(),
          keywordMap: keywordMap.toJSON()
        };
        console.log('Sending response to getReminderData with data:');
        console.log(response);
        sendResponse(response);

      } else if (request.operation === 'addTestData') {

        addTestData(testData, reminderStore, keywordMap);
        saveLocalDataToStorage(reminderStore, keywordMap)
          .then(() => {
            console.log('Saved data to sync storage.');
            console.log('Sending response to addTestData: SUCCESS');
            sendResponse('SUCCESS');
          })
          .catch((error) => {
            console.error(`Error occurred saving data to sync storage: ${error}`);
            console.log('Sending response to addTestData: ERROR');
            sendResponse('ERROR');
          });

      } else if (request.operation === 'deleteSavedData') {

        deleteAllLocalData(reminderStore, keywordMap);
        saveLocalDataToStorage(reminderStore, keywordMap)
          .then(() => {
            console.log('Deleted data and updated sync storage.');
            console.log('Sending response to deleteTestData: SUCCESS');
            sendResponse('SUCCESS');
          })
          .catch((error) => {
            console.error(`Error occured deleting saved data: ${error}`);
            console.log('Sending response to deleteTestData: ERROR');
            sendResponse('ERROR');
          });

      }

      // indicates that we want sendResponse to support asynchronous responses;
      // without this the message port will close too quickly
      return true;
    }
  );
}

// Initialize ReminderStore and KeywordMap by loading data from storage
loadDataFromStorage().then(data => {
  const testData = Array.from(rawTestData) as ReminderParams[];
  const { reminderStore, keywordMap } = data;
  addMessageListener(reminderStore, keywordMap, testData);
});
