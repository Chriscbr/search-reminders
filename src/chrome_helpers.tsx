const promisify = function (
  fn: Function,
  ...params: unknown[]
): Promise<unknown> {
  return new Promise((resolve, reject): void =>
    fn.apply(
      null,
      params.concat((result: unknown) => {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError);
        }
        return resolve(result);
      }),
    ),
  );
};

export const chromeRuntimeSendMessageToContentScript = function (
  message: object,
): Promise<unknown> {
  return new Promise((resolve, reject): void => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs[0].id === undefined) {
        return reject('Tab id is undefined.');
      }
      chrome.tabs.sendMessage(tabs[0].id, message, function (response) {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError);
        }
        return resolve(response);
      });
    });
  });
};

export const chromeRuntimeSendMessage = function (
  message: object,
): Promise<unknown> {
  return promisify(chrome.runtime.sendMessage.bind(chrome.runtime), message);
};

export const chromeStorageSyncSet = function (items: object): Promise<unknown> {
  return promisify(chrome.storage.sync.set.bind(chrome.storage.sync), items);
};

export const chromeStorageSyncGet = function (
  keys: string | string[],
): Promise<unknown> {
  return promisify(chrome.storage.sync.get.bind(chrome.storage.sync), keys);
};

export const chromeStorageSyncClear = function (): Promise<unknown> {
  return promisify(chrome.storage.sync.clear.bind(chrome.storage.sync));
};

export const chromeTabsQuery = function (
  query: object,
): Promise<chrome.tabs.Tab[]> {
  return promisify(chrome.tabs.query.bind(chrome.tabs), query) as Promise<
    chrome.tabs.Tab[]
  >;
};
