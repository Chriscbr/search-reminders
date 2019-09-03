import {
  KeywordMap,
  ReminderStore,
  ReminderParams,
  ReminderURLMap,
  Reminder,
  UserData,
  UserDataJSON
} from './common';
import { chromeStorageSyncSet, chromeStorageSyncGet } from './chrome_helpers';
import rawTestData from './testData.json';

const loadDataFromStorage = function(): Promise<UserData> {
  return chromeStorageSyncGet(['storedReminderList', 'storedCurrentId'])
    .then((response) => {
      const data = response as UserDataJSON;
      const reminders = data.reminders.map((value: string) => Reminder.fromJSON(value));
      return { reminders: reminders, currentId: data.currentId };
    })
    .catch((error) => {
      console.log(`Data not found in storage, possible error: ${error}`);
      console.log('Initializing with empty data');
      return { reminders: [], currentId: 0 };
    });
};

const initializeData = function(reminders: Reminder[],
                                reminderStore: ReminderStore,
                                keywordMap: KeywordMap,
                                reminderURLMap: ReminderURLMap): void {
  reminders.forEach((reminder, _index) => {
    reminderStore.add(reminder);
    keywordMap.add(reminder);
    reminderURLMap.add(reminder);
  });
};

const initializeDataWithoutIds = function(testData: ReminderParams[],
                                          reminderStore: ReminderStore,
                                          keywordMap: KeywordMap,
                                          reminderURLMap: ReminderURLMap): void {
  testData.forEach((params, _index) => {
    const reminder = reminderStore.create(params);
    keywordMap.add(reminder);
    reminderURLMap.add(reminder);
  });
};

const saveLocalDataToStorage = function(reminderStore: ReminderStore): Promise<unknown> {
  const reminders = [...reminderStore.data.values()];
  console.log('Saving local data to storage, with the following list of reminders:');
  console.log(reminders);
  const userData = {
    reminders: reminders.map((reminder: Reminder) => reminder.toJSON())
  };
  return chromeStorageSyncSet(userData);
};

const deleteReminder = function(reminderStore: ReminderStore,
                                keywordMap: KeywordMap,
                                reminderURLMap: ReminderURLMap,
                                reminderId: number): void {
  console.log(reminderStore);
  const reminder = reminderStore.remove(reminderId);
  keywordMap.remove(reminder);
  reminderURLMap.remove(reminder);
};

const deleteAllLocalData = function(reminderStore: ReminderStore,
                                    keywordMap: KeywordMap,
                                    reminderURLMap: ReminderURLMap): void {
  reminderStore.clear();
  keywordMap.clear();
  reminderURLMap.clear();
};

const addMessageListener = function(reminderStore: ReminderStore,
                                    keywordMap: KeywordMap,
                                    reminderURLMap: ReminderURLMap,
                                    testData: ReminderParams[]): void {
  chrome.runtime.onMessage.addListener(
  
    // TODO: should really assign a type to "request" to document what fields
    // it could contain depending on the query...
    // for some reason TypeScript doesn't seem to care
    function(request, sender, sendResponse) {
      console.log(sender.tab ?
                  `Received message from a content script: ${sender.tab.url}` :
                  'Received message from the extension.');
      console.log(`Message operation: ${request.operation}`);

      if (request.operation === 'requestRelevantReminders') {

        const keywords: string[] = request.keywords;

        // Set, not a list, in order to avoid duplicate reminder IDs
        const reminderIds: Set<number> = new Set();

        // Collect all of the possible reminder IDs related to any of the keywords
        keywords.forEach(keyword => {
          const keywordIds = keywordMap.data.get(keyword);
          if (keywordIds !== undefined) {
            keywordIds.forEach(id => {
              reminderIds.add(id);
            });
          }
        });
        console.log(`${reminderIds.size} relevant reminders found.`);

        // Convert the set of reminder IDs to a list of Reminders
        const reminderList: Reminder[] = [];
        reminderIds.forEach(id => {
          const reminder = reminderStore.data.get(id);
          if (reminder === undefined) {
            throw new Error(`Reminder not found in reminderMap for id: ${id}`);
          }
          console.log(`reminder: ${reminder}`);
          reminderList.push(reminder);
        });

        // Sent out the response (a list of stringified reminders)
        const response = {
          reminders: reminderList.map(reminder => reminder.toJSON())
        };
        console.log('Sending response to getReminderData with data:');
        console.log(response);
        sendResponse(response);

      } else if (request.operation === 'addTestData') {

        initializeDataWithoutIds(testData, reminderStore, keywordMap, reminderURLMap);
        saveLocalDataToStorage(reminderStore)
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

        deleteAllLocalData(reminderStore, keywordMap, reminderURLMap);
        saveLocalDataToStorage(reminderStore)
          .then(() => {
            console.log('Deleted data and updated sync storage.');
            console.log('Sending response to deleteTestData: SUCCESS');
            sendResponse('SUCCESS');
          })
          .catch((error) => {
            console.error(`Error occured updating sync storage: ${error}`);
            console.log('Sending response to deleteTestData: ERROR');
            sendResponse('ERROR');
          });

      } else if (request.operation === 'deleteReminder') {

        deleteReminder(reminderStore, keywordMap, reminderURLMap, request.index);
        saveLocalDataToStorage(reminderStore)
          .then(() => {
            console.log('Deleted item and updated sync storage.');
            console.log('Sending response to deleteReminder: SUCCESS');
            sendResponse('SUCCESS');
          })
          .catch((error) => {
            console.error(`Error occured updating sync storage: ${error}`);
            console.log('Sending response to deleteReminder: ERROR');
            sendResponse('ERROR');
          });

      } else if (request.operation === 'getReminderFromURL') {

        const reminderId = reminderURLMap.data.get(request.url);
        if (reminderId === undefined) {
          console.log(`No reminder found for the URL ${request.url}. Sending "null".`);
          sendResponse('null');
        } else {
          const reminder = reminderStore.data.get(reminderId);
          if (reminder === null) {
            console.error('Unexpected: reminderID found for URL, but Reminder data not found. Sending "null".');
            sendResponse('null');
          } else {
            console.log(`ReminderID found for URL ${request.url}. Sending reminder.`);
            sendResponse(reminder);
          }
        }

      }

      // indicates that we want sendResponse to support asynchronous responses;
      // without this the message port will close too quickly
      return true;
    }
  );
};

// Initialize ReminderStore, KeywordMap, and ReminderURLMap by loading data
// from storage. Then pass all useful data to addMessageListener where all
// of the useful business logic event handlers are created.
loadDataFromStorage().then((data: UserData) => {
  const { reminders, currentId } = data;
  const testData = Array.from(rawTestData) as ReminderParams[];

  // Map<number (id), Reminder>
  const reminderStore = new ReminderStore(currentId);

  // Map<string (keyword), Set<number (id)>>
  const keywordMap = new KeywordMap();

  // Map<string (url), number (id)>
  const reminderURLMap = new ReminderURLMap();

  initializeData(reminders, reminderStore, keywordMap, reminderURLMap);
  addMessageListener(reminderStore, keywordMap, reminderURLMap, testData);
});
