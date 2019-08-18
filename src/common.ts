export class Reminder {
  id: number | null;
  url: string;
  title: string;
  description: string;
  keywords: string[];

  constructor(url: string, title: string, description: string,
      keywords: string[]) {
    this.id = null;
    this.url = url;
    this.title = title;
    this.description = description;
    this.keywords = keywords;
  }

  toJSON(): string {
    return JSON.stringify({
      url: this.url,
      title: this.title,
      description: this.description,
      keywords: this.keywords
    });
  }

  static fromJSON(jsonStr: string) {
    const json: {
      url: string,
      title: string,
      description: string,
      keywords: string[]
    } = JSON.parse(jsonStr);
    return new Reminder(json.url, json.title, json.description, json.keywords);
  }
}

/**
 * Map from random IDs to Reminder objects.
 */
export class ReminderMap {
  data: Map<number, Reminder>;
  currentId: number;

  constructor() {
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

  private validateNewReminder(reminder: Reminder) {
    if (reminder.keywords === null || reminder.keywords.length < 0) {
      throw new Error('Reminder must have an array of more than 0 keywords.');
    }
    if (reminder.id !== null) {
      throw new Error('Reminder should not already have an ID assigned.');
    }
    if (new Set(reminder.keywords).size !== reminder.keywords.length) {
      throw new Error('Reminder has duplicate keywords.');
    }
  }

  toJSON(): string {
    return JSON.stringify([this.currentId,
      [...this.data].map((value: [number, Reminder]) => {
        return [value[0], value[1].toJSON()];
    })]);
  }

  static fromJSON(jsonStr: string): ReminderMap {
    const json: [
      number,
      [number, string][]
    ] = JSON.parse(jsonStr);
    const reminderMap = new ReminderMap();
    reminderMap.currentId = json[0];
    reminderMap.data = new Map(json[1].map(pair => {
      return [pair[0], Reminder.fromJSON(pair[1])];
    }));
    return reminderMap;
  }
} 

/**
 * Map from keywords to Reminder IDs.
 */
export class KeywordMap {
  data: Map<string, Set<number>>

  constructor() {
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
        throw new Error(`KeywordMap does not have ${keyword} as a key.`);
      }
    });
  }

  toJSON(): string {
    return JSON.stringify([...this.data].map((value: [string, Set<number>]) => {
      return [value[0], Array.from(value[1])];
    }));
  }

  static fromJSON(jsonStr: string): KeywordMap {
    const json: [string, number[]][] = JSON.parse(jsonStr);
    const keywordMap = new KeywordMap();
    keywordMap.data = new Map(json.map((value: [string, number[]]) => {
      return [value[0], new Set(value[1])];
    }));
    return keywordMap;
  }
}

export const promisify = function(fn: any, ...params: any[]) {
  return new Promise((resolve, reject) => {
    return fn.apply(null, params.concat((result: any) => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      return resolve(result);
    }));
  });
};

export type ReminderDataResponse = {
  reminderMap: string,
  keywordMap: string
};
