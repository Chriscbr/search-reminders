class Reminder {
  id: number | null;
  url: string;
  title: string;
  description: string;
  keywords: string[];
  constructor(url: string, title: string, description: string, keywords: string[]) {
    this.id = null;
    this.url = url;
    this.title = title;
    this.description = description;
    this.keywords = keywords;
  }
}

/**
 * Map from random IDs to Reminder objects.
 */
class ReminderMap {
  data: Map<number, Reminder>;
  currentId: number;
  constructor() {
    // Map(number, Reminder)
    this.data = new Map();
    this.currentId = 0;
  }

  addReminder(reminder: Reminder) {
    this.validateNewReminder(reminder);
    reminder.id = this.currentId;
    this.data.set(this.currentId, reminder);
  }

  removeReminder(reminder: Reminder) {
    if (reminder.id === null) {
      throw new Error('Reminder does not contain an id value.');
    }
    this.data.delete(reminder.id);
  }

  // private
  validateNewReminder(reminder: Reminder) {
    if (reminder.keywords === null || reminder.keywords.length < 0) {
      throw new Error('Reminder must have an array of more than 0 keywords.');
    }
    if (reminder.id !== null) {
      throw new Error('Reminder should not have an ID before adding it to a ReminderMap');
    }
    if (new Set(reminder.keywords).size !== reminder.keywords.length) {
      throw new Error('Reminder has duplicate keywords.');
    }
  }
}

/**
 * Map from keywords to Reminder IDs.
 */
class KeywordMap {
  data: Map<string, Set<number>>
  constructor() {
    // Map(String, Set(number))
    this.data = new Map();
  }

  addReminder(reminder: Reminder) {
    if (reminder.id === null) {
      throw new Error('Reminder does not contain an id value.');
    }
    reminder.keywords.forEach((keyword) => {
      if (this.data.has(keyword)) {
        this.data.get(keyword)!.add(reminder.id!);
      } else {
        this.data.set(keyword, new Set([reminder.id!]));
      }
    });
  }

  removeReminder(reminder: Reminder) {
    if (reminder.id === null) {
      throw new Error('Reminder does not contain an id value.');
    }
    reminder.keywords.forEach((keyword) => {
      if (this.data.has(keyword)) {
        this.data.get(keyword)!.delete(reminder.id!);
        if (this.data.get(keyword)!.size === 0) {
          this.data.delete(keyword);
        }
      } else {
        throw new Error(`KeywordMap does not have ${keyword} as a key in the map.`);
      }
    });
  }
}

const reminderMap = new ReminderMap();
const keywordMap = new KeywordMap();

const testReminderData = new Array();
testReminderData.push(new Reminder(
  'https://sweets.seriouseats.com/2013/12/the-food-lab-the-best-chocolate-chip-cookies.html',
  'The Science of the Best Chocolate Chip Cookies | The Food Lab | Serious Eats',
  `I've never been able to get a chocolate chip cookie exactly the way I like. I'm talking chocolate cookies that are barely crisp around the edges with a buttery, toffee-like crunch that transitions into a chewy, moist center that bends like caramel, rich with butter and big pockets of melted chocolate. I made it my goal to test each and every element from ingredients to cooking process, leaving no chocolate chip unturned in my quest for the best. 32 pounds of flour, over 100 individual tests, and 1,536 cookies later, I had my answers.`,
  ['chocolate', 'chip', 'cookies', 'cookie', 'dessert', 'bake']
));

testReminderData.forEach((reminder, index) => {
  reminderMap.addReminder(reminder);
  keywordMap.addReminder(reminder);
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
      reminderMap: reminderMap, 
      keywordMap: keywordMap,
    }, () => {
    console.log("Test data saved into storage.");
  });
});