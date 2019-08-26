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
- Rename things from "reminders" to "saved items" to generalize potential
future uses
- Add unit tests
- Refactor content_script.js
- Add JSON serialization using different library (e.g. classValidator)
- Add feature: on any webpage, click extension and click button to creating a
reminder based on it
- Add local build / deployment instructions
- Add ability on options page to see list of saved pages
- Handle duplicate webpages (create another hashmap?) / prevent duplicates from
occurring in the reminder store
- Add animation for when reminder list loads onto page
- Support different search engines, like DuckDuckGo
- Update extension icons

# Project structure

TODO

# Data flow
- `background.js` is the "master" process, in the sense that it is the only script that
updates and retrieves user data from the
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
