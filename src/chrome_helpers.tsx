const promisify = (fn: Function, ...params: unknown[]): Promise<unknown> => {
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

export const chromeRuntimeSendMessageToContentScript = (
  message: object,
): Promise<unknown> => {
  return new Promise((resolve, reject): void => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0].id === undefined) {
        return reject('Tab id is undefined.');
      }
      chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError);
        }
        return resolve(response);
      });
    });
  });
};

export const chromeRuntimeSendMessage = (message: object): Promise<unknown> => {
  return promisify(chrome.runtime.sendMessage.bind(chrome.runtime), message);
};

export const chromeStorageSyncSet = (items: object): Promise<unknown> => {
  return promisify(chrome.storage.sync.set.bind(chrome.storage.sync), items);
};

export const chromeStorageSyncGet = (
  keys: string | string[],
): Promise<unknown> => {
  return promisify(chrome.storage.sync.get.bind(chrome.storage.sync), keys);
};

export const chromeStorageSyncClear = (): Promise<unknown> => {
  return promisify(chrome.storage.sync.clear.bind(chrome.storage.sync));
};

export const chromeTabsQuery = (query: object): Promise<chrome.tabs.Tab[]> => {
  return promisify(chrome.tabs.query.bind(chrome.tabs), query) as Promise<
    chrome.tabs.Tab[]
  >;
};
