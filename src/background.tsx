import {ReminderStore, KeywordMap} from './common';

const reminderStore = new ReminderStore();
const keywordMap = new KeywordMap();

const testReminderData = [
  {
    url: 'https://sweets.seriouseats.com/2013/12/the-food-lab-the-best-chocolate-chip-cookies.html',
    title: 'The Science of the Best Chocolate Chip Cookies | The Food Lab | Serious Eats',
    description: `I've never been able to get a chocolate chip cookie exactly the way I like. I'm talking chocolate cookies that are barely crisp around the edges with a buttery, toffee-like crunch that transitions into a chewy, moist center that bends like caramel, rich with butter and big pockets of melted chocolate. I made it my goal to test each and every element from ingredients to cooking process, leaving no chocolate chip unturned in my quest for the best. 32 pounds of flour, over 100 individual tests, and 1,536 cookies later, I had my answers.`,
    keywords: ['chocolate', 'chip', 'cookies', 'cookie', 'dessert', 'bake', 'recipe']
  },
  {
    url: 'https://www.delish.com/cooking/recipe-ideas/a24892347/how-to-make-a-smoothie/',
    title: 'Best Triple Berry Smoothie - How to Make a Smoothie',
    description: 'This is the perfect way to make a smoothie from Delish.com.',
    keywords: ['smoothie', 'recipe', 'delicious', 'fruit']
  }
];

testReminderData.forEach((params, _index) => {
  const reminder = reminderStore.create(params);
  keywordMap.add(reminder);
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                'Received message from a content script:' + sender.tab.url :
                'Received message from the extension.');
    if (request.operation === 'getReminderData') {
      console.log('Sending data back to sender.');
      sendResponse({reminderMap: reminderStore.toJSON(),
                    keywordMap: keywordMap.toJSON()});
    }
  }
);
