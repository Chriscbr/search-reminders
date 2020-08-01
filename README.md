# search-reminders

## Set up local development

Install the latest npm and nvm. As of current writing:

```bash
$ node --version
v14.5.0
$ npm --version
6.14.5
```

Clone this project, and then install all needed packages from the root directory
of this project:

```bash
git clone https://github.com/Chriscbr/search-reminders.git
npm install
```

If there are any build issues, consider trying to emulate the builds made using
Travis CI [here](https://travis-ci.org/Chriscbr/search-reminders/builds/).

### Build for deployment

```bash
npm run build
```

Build will be output to the `/dist` folder. To load the extension, go to
`chrome://extensions/`, enable **Developer mode** (button in the top-right), and
click **Load unpacked extension**. Select the project's `/dist` folder.

### Build for development

```bash
npm run watch
```

This will build the code, and update the build output whenever you make changes
to files. You will still need to update the extension in Chrome whenever you
want to test changes, by clicking on the refresh button on
`chrome://extensions`.

## TODOs

- [High]: Add ability on options page to see list of saved pages
- [Med]: Add debug mode which enables/disables logging functions (independent
  of whether built in dev mode or not)
- [Med]: Put components into different subdirectories
- [Med]: Rename things from "reminders" to "saved items" to generalize
  potential future uses
- [Med]: Add unit tests (probably use Jest)
- [Med]: Add integration tests of some sort?
- [Med]: Support different search engines, like DuckDuckGo
- [Med]: Hide reminder list on Google search results page if you are not on the
  first page of results
- [Med]: Read about Redux, and evaluate if it would be useful for this project
- [Low]: Look into code splitting to improve bundle sizes? (see
  <https://reactjs.org/docs/code-splitting.html>)
- [Med]: Consider combining ReminderMap, ReminderURLMap, and KeywordMap into
  some general object that can be referred to, since in most cases they act as
  a general entity where all should be updated together, etc.
- [Med]: Add URL similarity feature so when trying to add a change, the popup
  shows if there are already pages that have been saved with a similar URL (in
  case the URL happens to be changing?) - or perhaps an option when adding a URL
  to remove the URL parameters if desired (see
  <https://stackoverflow.com/questions/6257463/how-to-get-the-url-without-any-parameters-in-javascript>)
- [Med]: Add support for other browsers (start with Firefox?)
- [Med]: Add support for Safari (requires Apple Developer Program membership)
- [Med]: Decide on uniform way to handle keywords/tags? Can these be multiple
  words? Possibly should modify get_metadata script to automatically separate
  phrases into individual words. Or allow phrases (requires more logic).
- [Low]: Consider adding some kind of different background, or accent of some
  kind using CSS to distinguish extension information from regular Google search
  results
- [Low]: UI Bug: After creating a new reminder, saving it will cause the word
  "Keywords" to be crossed out. Possibly could be fixed by forcing some kind of
  UI refresh?

## Moving to redux

I think this could simplify things, especially if I can use some kind of
middleware to automatically sync state with local storage. The main challenges
are:

1. syncing state with local storage
2. syncing state between background.js and popup.js and content_script.js

It might not be entirely necessary, but I've been meaning to try Redux, so I
don't mind using this project as a test ground. Some possible options:

- <https://www.npmjs.com/package/webext-redux>
- <https://www.npmjs.com/package/redux-localstorage-simple>
- <https://www.npmjs.com/package/redux-persist> with <https://www.npmjs.com/package/redux-persist-webextension-storage>

## Project structure

```markdown
├── README.md               - This file you are reading.
├── dist                    - The build output, which can be loaded into Chrome
├── node_modules            - Stores dependency code during development
├── package.json            - General metadata and dependency list
├── package-lock.json       - Dependency metadata (do not manually edit)
├── .eslintrc.js            - Settings for the ESLint tool
├── .eslintignore           - List of files/directories for ESLint to ignore
├── .prettierrc.js          - Settings for Prettier (automatic code formatting)
├── .prettierignore         - List of files/directories for Prettier to ignore
├── .travis.yml             - Settings for Travis (automatic CI/CD / testing)
├── tsconfig.json           - Settings for compiling TypeScript to JavaScript
├── public                  - Non-JS assets used by the extension
│   ├── images              - Icons and such
│   ├── manifest.json       - Chrome extension metadata information
│   ├── options.html        - HTML layout for options page
│   └── popup.html          - HTML layout for popup
├── src                     - Source code
│   ├── components/         - Folder containing all React components
│   ├── background.tsx      - Code that runs in the background and stores data
│   ├── chrome_helpers.tsx  - Wrapper functions for Chrome APIs
│   ├── common.tsx          - Code that is shared between modules
│   ├── content_script.tsx  - Code that gets injected to google.com/search
│   ├── get_metadata.tsx    - Code that gets injected to all pages
│   ├── options.tsx         - Code that runs on the options page
│   ├── popup.tsx           - Code that runs on the popup
│   ├── utils.tsx           - Helper functions
│   ├── testData.json       - Test data
└── webpack                 - Settings for bundling all files into an extension
    ├── webpack.common.js   - General bundling settings
    ├── webpack.dev.js      - Bundling settings for "watch" script
    └── webpack.prod.js     - Bundling settings for "build" script
```

## Architecture

- `background.js` is the "master" process, in the sense that it is the core
  script which updates and retrieves user data from the
  [Chrome Sync Storage Area](https://developer.chrome.com/extensions/storage).
- All other pages (`popup.html`, `options.html`, and the injected script
  `content_script.js`) communicate with `background.js` via
  [message passing](https://developer.chrome.com/extensions/messaging) in order
  to update or receive data.
- To obtain metadata about the page (such as the page's title, and its
  description or tags), `get_metadata.js` is injected to each page when the tab
  is selected. This allows `popup.js` to send a message to content scripts on
  the tab to get the metadata information if the user wishes to create a
  reminder.

## Debugging notes

To see what's inside Chrome local storage for the app, open the developer
console (Ctrl + Shift + I) from the extension's background or options pages, and
run the following snippet:

```javascript
chrome.storage.sync.get((result) => {
  console.log(result);
});
```

## Libraries

I've chosen to use React for mostly simple reasons - to invest more time
learning how to architect code in the framework (since it is fairly common in
the current web), and because it does an effective job at allowing me to
organize the functions of most of the dynamic features of this extension.
Also, I wished to write this extension in TypeScript (for similar reasons),
and there is fairly solid support for React in TypeScript today.

Material-UI is currently used just because it appears to be a commonly used
React-TypeScript supporting UI framework that achieves the design goals I want,
which are namely to have the extention's dynamic content to fit with the Google
Search results page. I'm also making used of material-ui-chip-input, a third
party extension that adds an important "chip" component that I use.

Snowball is a word stemming library. I've chosen it just because of the very
little bloat I think it should add to the project. I'm only using it to perform
a single feature, so I should be able to fairly easily hot-swap it with another
word stemming library if needed. The only downside is this library does not
natively provide TypeScript type annotations. It also doesn't handle all word
stemming perfectly (ex. happy and happiness both get converted to "happi", but
not "happier"), but it's good enough to provide a measurable improvement to the
search features.

## Icons

Notebook icon made by [Freepik](https://www.flaticon.com/authors/freepik) from
<https://www.flaticon.com/>.
