// eslint-disable-next-line @typescript-eslint/ban-types
const promisify = (fn: Function, ...params: unknown[]): Promise<unknown> =>
  new Promise((resolve, reject): void => {
    fn.apply(
      null,
      params.concat((result: unknown) => {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError);
        }
        return resolve(result);
      }),
    );
  });

export const chromeRuntimeSendMessageToContentScript = (
  message: Record<string, unknown>,
): Promise<unknown> =>
  new Promise((resolve, reject): void => {
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

export const chromeRuntimeSendMessage = (
  message: Record<string, unknown>,
): Promise<unknown> =>
  promisify(chrome.runtime.sendMessage.bind(chrome.runtime), message);

export const chromeStorageSyncSet = (
  items: Record<string, unknown>,
): Promise<unknown> =>
  promisify(chrome.storage.sync.set.bind(chrome.storage.sync), items);

export const chromeStorageSyncGet = (
  keys: string | string[],
): Promise<unknown> =>
  promisify(chrome.storage.sync.get.bind(chrome.storage.sync), keys);

export const chromeStorageSyncClear = (): Promise<unknown> =>
  promisify(chrome.storage.sync.clear.bind(chrome.storage.sync));

export const chromeTabsQuery = (
  query: Record<string, unknown>,
): Promise<chrome.tabs.Tab[]> =>
  promisify(chrome.tabs.query.bind(chrome.tabs), query) as Promise<
    chrome.tabs.Tab[]
  >;
