import {
  KeywordMap,
  ReminderStore,
  ReminderParams,
  ReminderURLMap,
  Reminder,
  UserData,
  UserDataJSON,
  RequestOperation,
  Request,
  DeleteReminderRequest,
  GetReminderFromURLRequest,
  GetRelevantRemindersRequest,
} from './common';
import { UnreachableCaseError } from './utils';
import {
  chromeStorageSyncSet,
  chromeStorageSyncGet,
  chromeStorageSyncClear,
} from './chrome_helpers';
import rawTestData from './testData.json';

const saveLocalDataToStorage = function(
  reminderStore: ReminderStore,
): Promise<unknown> {
  const reminders = reminderStore.values();
  console.log(
    'Saving local data to storage, with the following list of reminders:',
  );
  console.log(reminders);
  const userData = {
    reminders: reminders.map((reminder: Reminder) => reminder.toJSON()),
    currentId: reminderStore.getCurrentId(),
  };
  return chromeStorageSyncSet(userData);
};

const loadDataFromStorage = function(): Promise<UserData> {
  return chromeStorageSyncGet(['reminders', 'currentId'])
    .then(response => {
      const data = response as UserDataJSON;
      const reminders = data.reminders.map((value: string) =>
        Reminder.fromJSON(value),
      );
      return { reminders: reminders, currentId: data.currentId };
    })
    .catch(error => {
      console.log(`Data not found in storage, possible error: ${error}`);
      console.log('Initializing with empty data.');
      return saveLocalDataToStorage(new ReminderStore(0))
        .then(() => {
          console.log(
            'Successfully initialized empty reminder list to local storage.',
          );
          return { reminders: [], currentId: 0 };
        })
        .catch(error => {
          console.log('Unable to save empty user data to local storage.');
          console.log(`Received error message: ${error}`);
          console.log('Resuming with temporary empty user data.');
          return { reminders: [], currentId: 0 };
        });
    });
};

const initializeData = function(
  reminders: Reminder[],
  reminderStore: ReminderStore,
  keywordMap: KeywordMap,
  reminderURLMap: ReminderURLMap,
): void {
  reminders.forEach((reminder, _index) => {
    reminderStore.add(reminder);
    keywordMap.add(reminder);
    reminderURLMap.add(reminder);
  });
};

const initializeDataWithoutIds = function(
  testData: ReminderParams[],
  reminderStore: ReminderStore,
  keywordMap: KeywordMap,
  reminderURLMap: ReminderURLMap,
): void {
  testData.forEach((params, _index) => {
    const reminder = reminderStore.create(params);
    keywordMap.add(reminder);
    reminderURLMap.add(reminder);
  });
};

const deleteReminder = function(
  reminderStore: ReminderStore,
  keywordMap: KeywordMap,
  reminderURLMap: ReminderURLMap,
  reminderId: number,
): void {
  console.log(reminderStore);
  const reminder = reminderStore.remove(reminderId);
  keywordMap.remove(reminder);
  reminderURLMap.remove(reminder);
};

const deleteAllLocalData = function(
  reminderStore: ReminderStore,
  keywordMap: KeywordMap,
  reminderURLMap: ReminderURLMap,
): void {
  reminderStore.clear();
  keywordMap.clear();
  reminderURLMap.clear();
};

/**
 * Handles a request made to obtain a list of relevant reminders given a list of
 * keywords. It uses the keywords provided in `request`, and uses `keywordMap`
 * and `reminderStore` to produce a list of stringified `Reminder`s.
 * It then returns this to the sender using `sendResponse`.
 *
 * @param request the request being handled
 * @param keywordMap reference to keyword map
 * @param reminderStore reference to reminder store
 * @param sendResponse callback function for sending the response message
 */
const handleGetRelevantReminders = function(
  request: GetRelevantRemindersRequest,
  keywordMap: KeywordMap,
  reminderStore: ReminderStore,
  sendResponse: (args?: unknown) => void,
): void {
  const keywords: string[] = request.keywords;

  // Set, not a list, in order to avoid duplicate reminder IDs
  const reminderIds: Set<number> = new Set();

  // Collect all of the reminder IDs related to any of the keywords
  keywords.forEach(keyword => {
    const keywordIds = keywordMap.get(keyword);
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
    const reminder = reminderStore.getReminder(id);
    if (reminder === undefined) {
      throw new Error(`Reminder not found in reminderMap for id: ${id}`);
    }
    console.log(`reminder: ${reminder}`);
    reminderList.push(reminder);
  });

  // Sent out the response (a list of reminders)
  const response = {
    reminders: reminderList,
  };
  console.log('Sending response to getReminderData with data:');
  console.log(response);
  sendResponse(response);
};

/**
 * Handles a request made to add the test data (from `testData.json`) to the
 * user's account. It updates all of the necessary stores, and then saves
 * the changes to Chrome local storage. It responds 'SUCCESS' or 'ERROR'
 * based on whether the save was successful.
 *
 * @param testData list of ReminderParams
 * @param reminderStore reference to reminder store
 * @param keywordMap reference to keyword map
 * @param reminderURLMap reference to reminder URL map
 * @param sendResponse callback function for sending the response message
 */
const handleAddTestData = function(
  testData: ReminderParams[],
  reminderStore: ReminderStore,
  keywordMap: KeywordMap,
  reminderURLMap: ReminderURLMap,
  sendResponse: (args?: unknown) => void,
): void {
  initializeDataWithoutIds(testData, reminderStore, keywordMap, reminderURLMap);
  saveLocalDataToStorage(reminderStore)
    .then(() => {
      console.log('Saved data to sync storage.');
      console.log('Sending response to addTestData: SUCCESS');
      sendResponse('SUCCESS');
    })
    .catch(error => {
      console.error(`Error occurred saving data to sync storage: ${error}`);
      console.log('Sending response to addTestData: ERROR');
      sendResponse('ERROR');
    });
};

/**
 * Handles a request made to delete all of a user's data. It updates all of the
 * necessary stores, and then saves the changes to Chrome local storage
 * It responds 'SUCCESS' or 'ERROR' based on whether the save was successful.
 *
 * @param reminderStore reference to reminder store
 * @param keywordMap reference to keyword map
 * @param reminderURLMap reference to reminder URL map
 * @param sendResponse callback function for sending the response message
 */
const handleDeleteUserData = function(
  reminderStore: ReminderStore,
  keywordMap: KeywordMap,
  reminderURLMap: ReminderURLMap,
  sendResponse: (args?: unknown) => void,
): void {
  deleteAllLocalData(reminderStore, keywordMap, reminderURLMap);
  chromeStorageSyncClear()
    .then(() => {
      console.log('Deleted data and cleared sync storage.');
      console.log('Sending response to deleteTestData: SUCCESS');
      sendResponse('SUCCESS');
    })
    .catch(error => {
      console.error(`Error occured clearing sync storage: ${error}`);
      console.log('Sending response to deleteTestData: ERROR');
      sendResponse('ERROR');
    });
};

/**
 * Handles a request to delete a Reminder with an associated ID.
 * Uses `reminderURLMap` to obtain the ID associated with the URL provided in
 * `request`, and then cross-references with `reminderStore` to get the full
 * `Reminder` object, which is then sent as a response.
 *
 * @param reminderStore reference to reminder store
 * @param reminderURLMap reference to reminder URL map
 * @param sendResponse callback function for sending the response message
 */
const handleDeleteReminder = function(
  request: DeleteReminderRequest,
  reminderStore: ReminderStore,
  keywordMap: KeywordMap,
  reminderURLMap: ReminderURLMap,
  sendResponse: (args?: unknown) => void,
): void {
  deleteReminder(reminderStore, keywordMap, reminderURLMap, request.reminderId);
  saveLocalDataToStorage(reminderStore)
    .then(() => {
      console.log('Deleted item and updated sync storage.');
      console.log('Sending response to deleteReminder: SUCCESS');
      sendResponse('SUCCESS');
    })
    .catch(error => {
      console.error(`Error occured updating sync storage: ${error}`);
      console.log('Sending response to deleteReminder: ERROR');
      sendResponse('ERROR');
    });
};

/**
 * Handles a request to get the Reminder associated with a particular URL.
 * Uses `reminderURLMap` to obtain the ID associated with the URL provided in
 * `request`, and then cross-references with `reminderStore` to get the full
 * `Reminder` object, which is then sent as a response.
 *
 * @param reminderStore reference to reminder store
 * @param reminderURLMap reference to reminder URL map
 * @param sendResponse callback function for sending the response message
 */
const handleGetReminderFromURL = function(
  request: GetReminderFromURLRequest,
  reminderStore: ReminderStore,
  reminderURLMap: ReminderURLMap,
  sendResponse: (args?: unknown) => void,
): void {
  const reminderId = reminderURLMap.get(request.url);
  if (reminderId === undefined) {
    console.log(
      `No reminder found for the URL ${request.url}. Sending "null".`,
    );
    sendResponse('null');
  } else {
    const reminder = reminderStore.getReminder(reminderId);
    if (reminder === null) {
      console.error(
        'Unexpected: reminderID found for URL, but Reminder data not found. Sending "null".',
      );
      sendResponse('null');
    } else {
      console.log(`ReminderID found for URL ${request.url}. Sending reminder.`);
      sendResponse(reminder);
    }
  }
};

/**
 * Initializes a message listener so that the `background.js` script can
 * response to messages sent from other parts of the extension, such as
 * `content_script.js` or `popup.js`.
 *
 * @param reminderStore reference to reminder store
 * @param keywordMap reference to keyword map
 * @param reminderURLMap reference to URL map
 * @param testData a list of test data
 */
const addMessageListener = function(
  reminderStore: ReminderStore,
  keywordMap: KeywordMap,
  reminderURLMap: ReminderURLMap,
  testData: ReminderParams[],
): void {
  chrome.runtime.onMessage.addListener(function(
    request: Request,
    sender,
    sendResponse,
  ) {
    console.log(
      sender.tab
        ? `Received message from a content script: ${sender.tab.url}`
        : 'Received message from the extension.',
    );
    console.log(`Message operation: ${request.operation}`);

    switch (request.operation) {
      case RequestOperation.GetRelevantReminders:
        handleGetRelevantReminders(
          request,
          keywordMap,
          reminderStore,
          sendResponse,
        );
        break;
      case RequestOperation.AddTestData:
        handleAddTestData(
          testData,
          reminderStore,
          keywordMap,
          reminderURLMap,
          sendResponse,
        );
        break;
      case RequestOperation.DeleteUserData:
        handleDeleteUserData(
          reminderStore,
          keywordMap,
          reminderURLMap,
          sendResponse,
        );
        break;
      case RequestOperation.DeleteReminder:
        handleDeleteReminder(
          request,
          reminderStore,
          keywordMap,
          reminderURLMap,
          sendResponse,
        );
        break;
      case RequestOperation.GetReminderFromURL:
        handleGetReminderFromURL(
          request,
          reminderStore,
          reminderURLMap,
          sendResponse,
        );
        break;
      default:
        sendResponse('Error, invalid request operation received.');
        console.error('Error, invalid request operation received.');

        // By adding this custom exception (which takes type 'never' as
        // its argument), the compiler should complain if we ever add a new
        // variant to RequestOperation without adding a case to this switch
        // statement.
        throw new UnreachableCaseError(request);
    }

    // returning 'true' in the chrome.runtime.onMessage.addListener API
    // indicates that we want sendResponse to support asynchronous responses;
    // without this the message port will close too quickly
    return true;
  });
};

// Initialize ReminderStore, KeywordMap, and ReminderURLMap by loading data
// from storage. Then pass all useful data to addMessageListener where all
// of the useful business logic event handlers are created.
loadDataFromStorage().then((data: UserData) => {
  console.log(
    'Extension is being initialized. The following data was retrieved from local storage:',
  );
  console.log(data);
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
