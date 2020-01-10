## Set up local development

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
$ npm install
```

If there are any build issues, consider trying to emulate the builds made using
Travis CI [here](https://travis-ci.org/Chriscbr/search-reminders/builds/).

### Build for deployment

```
$ npm run build
```
Build will be output to the `/dist` folder. To load the extension, go to
`chrome://extensions/`, enable **Developer mode** (button in the top-right), and
click **Load unpacked extension**. Select the project's `/dist` folder.

### Build for development

```
$ npm run watch
```
This will build the code, and update the build output whenever you make changes
to files. You will still need to update the extension in Chrome whenever you
want to test changes, by clicking on the refresh button on
`chrome://extensions`.


## TODOs
- Rename things from "reminders" to "saved items" to generalize potential
future uses
- Add unit tests (probably use Jest)
- Add integration tests of some sort?
- Add feature: on any webpage, click extension and click button to creating a
reminder based on it
  - Make saved item descriptions editable
  - Allow users to add search keywords
- Add ability on options page to see list of saved pages
- Handle duplicate webpages (create another hashmap?) / prevent duplicates, or
even remind the user if there is another page with a similar URL?
- Add animation for when reminder list loads onto page
- Support different search engines, like DuckDuckGo
- Improve logging infrastructure? Enable/disable logging with a setting?
- Read about Redux, and evaluate if it would be useful for this project
- Update extension icons
- Look into code splitting to improve bundle sizes?
<https://reactjs.org/docs/code-splitting.html>
- Add "Hide" or "Close" button to the right side of "Pages you have saved"
- Consider adding some kind of different background, or accent of some kind
using CSS to distinguish extension information from regular Google search
results
- Should automatically lowercase keywords that are added to a saved item
- Consider combining ReminderMap, ReminderURLMap, and KeywordMap into some
general object that can be referred to, since in most cases they act as a
general entity where all should be updated together, etc.

## Project structure

```
├── README.md               - This file you are reading.
├── dist                    - The build output, which can be loaded into Chrome
├── node_modules            - Stores dependency code during development
├── package-lock.json       - Dependency metadata
├── package.json            - General metadata and dependency list
├── .eslintrc.js            - Settings for the ESLint tool
├── .eslintignore           - List of files/directories for ESLint to ignore
├── .prettierrc.js          - Settings for Prettier (automatic code formatting)
├── .travis.yml             - Settings for Travis (automatic CI/CD / testing)
├── tsconfig.json           - Settings for compiling TypeScript to JavaScript
├── public                  - Non-JS assets used by the extension
│   ├── images              - Icons and such
│   ├── manifest.json       - Chrome extension metadata information
│   ├── options.html        - HTML layout for options page
│   └── popup.html          - HTML layout for popup
├── src                     - Source code
│   ├── components/         - Folder containing all React components
│   ├── background.tsx      - Code that runs in the background and stores data
│   ├── chrome_helpers.tsx  - Wrapper functions for Chrome APIs
│   ├── common.tsx          - Code that is shared between modules
│   ├── content_script.tsx  - Code that gets injected to google.com/search
│   ├── options.tsx         - Code that runs on the options page
│   ├── popup.tsx           - Code that runs on the popup
│   ├── testData.json       - Test data
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

## Debugging notes
To see what's inside Chrome local storage for the app, open the developer
console (Ctrl + Shift + I) from the extension's background or options pages,
and run the following snippet:

```
chrome.storage.sync.get(function(result){console.log(result)})
```
