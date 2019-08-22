import * as React from 'react';
import {ReactElement} from 'react';
import * as ReactDOM from 'react-dom';
import {Reminder, ReminderMap, KeywordMap, promisify,
  ReminderDataResponse} from './common';
import {ReminderList, ReminderItem} from './ui_components';

console.log('hooray!');

class RemindersBox {
  box: Node;
  constructor() {
    this.box = this.initBox();
  }

  initBox() {
    const remindersDiv = document.createElement('div');
    remindersDiv.className = 'remindersDiv';

    const searchBox = document.getElementById('search');
    if (searchBox === null) {
      throw new Error('No div with id "search" found.');
    }
    searchBox.parentElement!.insertBefore(remindersDiv, searchBox);

    return remindersDiv;
  }

  addReminder(reminder: Reminder) {
    const reminderBox = document.createElement('div');
    reminderBox.className = 'remindersDiv';
    reminderBox.innerHTML = reminder.title;
    this.box.appendChild(reminderBox);
  }
}

const getSearchQuery = function() {
  const urlParams = new URLSearchParams(document.location.search.substring(1));
  if (!urlParams.has('q')) {
    throw new Error('No search query found.');
  }
  return urlParams.get('q')!;
};

const getKeywordsFromQuery = function(query: string) {
  return query.replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').split(' ');
};

const sendRequest = function(data: object) {
  return promisify(chrome.runtime.sendMessage.bind(chrome.runtime), data);
};

const requestReminderData = function(): Promise<ReminderDataResponse> {
  console.log('Sending a request for Reminder data now.');
  return sendRequest({operation: 'getReminderData'}) as
    Promise<ReminderDataResponse>;
};

// requestReminderData().then(data => {
//   console.log('Reminder data received, processing now.');
//   const remindersBox = new RemindersBox();

//   const reminderMap = ReminderMap.fromJSON(data.reminderMap);
//   const keywordMap = KeywordMap.fromJSON(data.keywordMap);

//   const keywords: string[] = getKeywordsFromQuery(getSearchQuery());
//   console.log(`Keywords found: ${keywords}`);

//   // Set, not a list, in order to avoid duplicate reminder IDs
//   let reminderIds: Set<number> = new Set();

//   // collect all of the possible reminder IDs related to any of the keywords
//   keywords.forEach(keyword => {
//     if (keywordMap.data.has(keyword)) {
//       keywordMap.data.get(keyword)!.forEach(id => {
//         reminderIds.add(id);
//       });
//       reminderIds = keywordMap.data.get(keyword)!;
//     }
//   });

//   console.log(`${reminderIds.size} relevant reminders found.`);
//   reminderIds.forEach(id => {
//     const reminder = reminderMap.data.get(id);
//     if (reminder === undefined) {
//       throw new Error(`Reminder not found in reminderMap for id: ${id}`);
//     }
//     console.log(`reminder: ${reminder}`);
//     remindersBox.addReminder(reminder);
//   });
// })
// .catch(err => {
//   console.log(err);
// });

const remindersDiv = document.createElement('div');
remindersDiv.className = 'remindersDiv';

const searchBox = document.getElementById('search');
if (searchBox === null) {
  throw new Error('No div with id "search" found.');
}
searchBox.parentElement!.insertBefore(remindersDiv, searchBox);

console.log(ReactDOM);

// const foo = <ReminderItem></ReminderItem> as ReminderItem[]

const reminderList: ReactElement = (
  <ReminderList>
    <ReminderItem reminder={new Reminder(
  'https://sweets.seriouseats.com/2013/12/the-food-lab-the-best-chocolate-chip-cookies.html',
  'The Science of the Best Chocolate Chip Cookies | The Food Lab | Serious Eats',
  `I've never been able to get a chocolate chip cookie exactly the way I like. I'm talking chocolate cookies that are barely crisp around the edges with a buttery, toffee-like crunch that transitions into a chewy, moist center that bends like caramel, rich with butter and big pockets of melted chocolate. I made it my goal to test each and every element from ingredients to cooking process, leaving no chocolate chip unturned in my quest for the best. 32 pounds of flour, over 100 individual tests, and 1,536 cookies later, I had my answers.`,
  ['chocolate', 'chip', 'cookies', 'cookie', 'dessert', 'bake', 'recipe']
)} />
    <ReminderItem reminder={new Reminder(
  'https://www.delish.com/cooking/recipe-ideas/a24892347/how-to-make-a-smoothie/',
  'Best Triple Berry Smoothie - How to Make a Smoothie',
  'This is the perfect way to make a smoothie from Delish.com.',
  ['smoothie', 'recipe', 'delicious', 'fruit']
)} />
  </ReminderList>
);

ReactDOM.render(
  reminderList,
  remindersDiv,
  () => { console.log('hello!'); }
);
console.log('we did it');