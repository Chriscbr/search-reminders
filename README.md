# TODOs
- Rename things from "reminders" to "saved items" to generalize potential
future uses
- Add unit tests
- Extract test data to separate file
- Add back local storage for saving saved webpage data
- Add feature: on any webpage, click extension and click button to creating a
reminder based on it
    - Add feature: on settings page, click button to add test data
    - Add feature: on settings page, click button to delete all data
- Add local build / deployment instructions
- Add ability on options page to see list of saved pages
- Add animation for when reminder list loads onto page

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
