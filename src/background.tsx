import {Reminder, ReminderMap, KeywordMap} from './common';

const reminderMap = new ReminderMap();
const keywordMap = new KeywordMap();

const testReminderData = new Array();
testReminderData.push(new Reminder(
  'https://sweets.seriouseats.com/2013/12/the-food-lab-the-best-chocolate-chip-cookies.html',
  'The Science of the Best Chocolate Chip Cookies | The Food Lab | Serious Eats',
  `I've never been able to get a chocolate chip cookie exactly the way I like. I'm talking chocolate cookies that are barely crisp around the edges with a buttery, toffee-like crunch that transitions into a chewy, moist center that bends like caramel, rich with butter and big pockets of melted chocolate. I made it my goal to test each and every element from ingredients to cooking process, leaving no chocolate chip unturned in my quest for the best. 32 pounds of flour, over 100 individual tests, and 1,536 cookies later, I had my answers.`,
  ['chocolate', 'chip', 'cookies', 'cookie', 'dessert', 'bake', 'recipe']
));
testReminderData.push(new Reminder(
  'https://www.delish.com/cooking/recipe-ideas/a24892347/how-to-make-a-smoothie/',
  'Best Triple Berry Smoothie - How to Make a Smoothie',
  'This is the perfect way to make a smoothie from Delish.com.',
  ['smoothie', 'recipe', 'delicious', 'fruit']
))

testReminderData.forEach((reminder, index) => {
  reminderMap.addReminder(reminder);
  keywordMap.addReminder(reminder);
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                'Received message from a content script:' + sender.tab.url :
                'Received message from the extension.');
    if (request.operation === 'getReminderData') {
      console.log('Sending data back to sender.');
      sendResponse({reminderMap: reminderMap.toJSON(),
                    keywordMap: keywordMap.toJSON()});
    }
  }
);
