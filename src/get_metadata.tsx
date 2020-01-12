import { PageMetadata, RequestOperation } from './common';

interface MetaTag extends Element {
  content: string;
}

/**
 * Creates a message listener for handling `GetPageMetadata` requests.
 */
const addMessageListener = function(): void {
  chrome.runtime.onMessage.addListener(function(
    request,
    _sender,
    sendResponse,
  ) {
    if (request.operation === RequestOperation.GetPageMetadata) {
      console.log('Received message GetPageMetadata, handling now.');
      const title = document.title;
      const url = document.URL;

      const descriptionTag: MetaTag | null = document.head.querySelector(
        '[name~=description][content]',
      );
      const description: string = descriptionTag?.content || '';

      const keywordsTag: MetaTag | null = document.head.querySelector(
        '[name~=keywords][content]',
      );
      const keywords: string[] = keywordsTag?.content.split(',') || [];

      console.log(`Generated title: ${title}`);
      console.log(`Generated URL: ${url}`);
      console.log(`Generated description: ${description}`);
      console.log(`Generated keywords: ${keywords}`);

      const response: PageMetadata = {
        title: title,
        url: url,
        description: description,
        keywords: keywords,
      };
      console.log(`Sending data back to sender:`);
      console.log(response);
      sendResponse(response);
    } else {
      console.log(`Unknown request received: ${request.operation}. Ignoring.`);
    }
    return true;
  });
  console.log('GetPageMetadata listener successfully added.');
};

console.log('get_metadata script loaded.');
addMessageListener();
