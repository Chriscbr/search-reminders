# Set up local development

Install the latest npm and nvm. As of current writing:
```
$ node --version
v12.9.1
$ npm --version
6.10.2
```

Clone this project, and then install all needed packages from the root directory of this project: 
```
$ git clone https://github.com/Chriscbr/search-reminders.git
$ npm run install
```

If there are any build issues, consider trying to emulate the builds made using
Travis CI [here](https://travis-ci.org/Chriscbr/search-reminders/builds/).

## Build for deployment

```
$ npm run build
```
Build will be output to the `/dist` folder. To load the extension, go to
`chrome://extensions/`, enable **Developer mode** (button in the top-right), and
click **Load unpacked extension**. Select the project's `/dist` folder.

## Build for development

```
$ npm run watch
```
This will build the code, and update the build output whenever you make changes
to files. You will still need to update the extension in Chrome whenever you
want to test changes, by clicking on the refresh button on
`chrome://extensions`.


# TODOs
- Refactor data flow to minimize computation / complexity of transferring the
ReminderStore, KeywordMap, and/or the ReminderURLMap/Helper with serialization
  - Store all data in chrome local storage as just a list of reminders, which
  can then be processed into the necessary fast data structures when the
  extension's background page is loaded
  - content_script and popup can both get the data they need just by
  message passing with the background process
- Improve logging...?
- Rename things from "reminders" to "saved items" to generalize potential
future uses
- Add unit tests
- Refactor content_script.js
- ~~Add JSON serialization using different library (e.g. classValidator)~~
  - I don't think there are any good serialization libraries that are
  lightweight and support the kind of nested data structures I'd like. 
  - "serialize-javascript" supports serializing almost anything, but it
  unnecessarily includes method information, and to deserialize you have to use
  eval, which is necessarily dangeorus.
  - "class-transformer" provides a very nice syntax, but it created huge bundles
  (possibly avoidable with more research - not sure), and it did not support
  complex structures like `Map<K, Set<V>>` natively.
- Add feature: on any webpage, click extension and click button to creating a
reminder based on it
  - Make saved item descriptions editable
  - Allow users to add search keywords
- Add ability on options page to see list of saved pages
- Handle duplicate webpages (create another hashmap?) / prevent duplicates from
occurring in the reminder store
- Add animation for when reminder list loads onto page
- Support different search engines, like DuckDuckGo
- Read about Redux, and evaluate if it would be useful for this project
- Update extension icons

# Project structure

```
├── README.md               - This file you are reading.
├── dist                    - The build output, which can be loaded into Chrome
├── node_modules            - Stores dependency code during development
├── package-lock.json       - Dependency metadata
├── package.json            - General metadata and dependency list
├── public                  - Non-JS assets used by the extension
│   ├── images              - Icons and such
│   ├── manifest.json       - Chrome extension metadata information
│   ├── options.html        - HTML layout for options page
│   └── popup.html          - HTML layout for popup
├── src                     - Source code
│   ├── background.tsx      - Code that runs in the background and stores data
│   ├── chrome_helpers.tsx  - Wrapper functions for Chrome APIs
│   ├── common.tsx          - Code that is shared between modules
│   ├── content_script.tsx  - Code that gets injected to google.com/search
│   ├── options.tsx         - Code that runs on the options page
│   ├── popup.tsx           - Code that runs on the popup
│   ├── testData.json       - Test data
│   └── ui_components.tsx   - React components
├── tsconfig.json           - Settings for compiling TypeScript to JavaScript
└── webpack                 - Settings for bundling all files into an extension
    ├── webpack.common.js   - General bundling settings
    ├── webpack.dev.js      - Bundling settings for "watch" script
    └── webpack.prod.js     - Bundling settings for "build" script
```

# Data flow
- `background.js` is the "master" process, in the sense that it is the only
script that updates and retrieves user data from the
[Chrome Sync Storage Area](https://developer.chrome.com/extensions/storage).
- All other pages (`popup.html`, `options.html`, and the injected script
`content_script.js`) communicate with `background.js` via
[message passing](https://developer.chrome.com/extensions/messaging) in order
to update or receive data.

# Debugging notes
To see what's inside Chrome local storage for the app, open the developer
console (Ctrl + Shift + I) from the extension's background or options pages,
and run the following snippet:

```
chrome.storage.sync.get(function(result){console.log(result)})
```
