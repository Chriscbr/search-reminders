export interface ReminderParams {
  url: string;
  title: string;
  description: string;
  keywords: string[];
}

export class Reminder {
  id: number;
  url: string;
  title: string;
  description: string;
  keywords: string[];

  constructor(id: number, url: string, title: string, description: string, keywords: string[]) {
    this.id = id;
    this.url = url;
    this.title = title;
    this.description = description;
    this.keywords = keywords;
    this.validateParams();
  }

  private validateParams(): void {
    if (this.keywords === null || this.keywords.length < 0) {
      throw new Error('Reminder must have an array of more than 0 keywords.');
    }
    if (new Set(this.keywords).size !== this.keywords.length) {
      throw new Error('Reminder has duplicate keywords.');
    }
  }

  toJSON(): string {
    return JSON.stringify({
      id: this.id,
      url: this.url,
      title: this.title,
      description: this.description,
      keywords: this.keywords
    });
  }

  static fromJSON(jsonStr: string): Reminder {
    const json: {
      id: number;
      url: string;
      title: string;
      description: string;
      keywords: string[];
    } = JSON.parse(jsonStr);
    return new Reminder(
      json.id,
      json.url,
      json.title,
      json.description,
      json.keywords,
    );
  }

  toString(): string {
    return `Reminder(${this.id}, ${this.url}, ${this.title}, ${this.description}, [${this.keywords}])`;
  }
}

/**
 * Map from random IDs to Reminder objects.
 */
export class ReminderStore {
  data: Map<number, Reminder>;
  currentId: number;

  constructor() {
    this.data = new Map();
    this.currentId = 0;
  }

  create(reminderParams: ReminderParams): Reminder {
    const {url, title, description, keywords} = {...reminderParams};
    const reminder = new Reminder(
      this.currentId, url, title, description, keywords);
    reminder.id = this.currentId;
    this.data.set(this.currentId++, reminder);
    return reminder;
  }

  remove(reminderId: number): Reminder {
    const reminder = this.data.get(reminderId);
    if (reminder === undefined) {
      throw new Error(`Invalid reminderId: ${reminderId}`);
    } else {
      this.data.delete(reminderId);
      return reminder;
    }
  }

  clear(): void {
    this.data.clear();
    this.currentId = 0;
  }

  toJSON(): string {
    return JSON.stringify([this.currentId,
      [...this.data].map((value: [number, Reminder]) => {
        return [value[0], value[1].toJSON()];
    })]);
  }

  static fromJSON(jsonStr: string): ReminderStore {
    const json: [
      number,
      [number, string][]
    ] = JSON.parse(jsonStr);
    const reminderStore = new ReminderStore();
    reminderStore.currentId = json[0];
    reminderStore.data = new Map(json[1].map(pair => {
      return [pair[0], Reminder.fromJSON(pair[1])];
    }));
    return reminderStore;
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

  add(reminder: Reminder): void {
    if (reminder.id === null) {
      throw new Error('Reminder does not contain an id value.');
    }
    const reminderId = reminder.id;
    reminder.keywords.forEach((keyword) => {
      const keywordIdSet = this.data.get(keyword);
      if (keywordIdSet !== undefined) {
        keywordIdSet.add(reminderId);
      } else {
        this.data.set(keyword, new Set([reminderId]));
      }
    });
  }

  remove(reminder: Reminder): void {
    if (reminder.id === null) {
      throw new Error('Reminder does not contain an id value.');
    }
    const reminderId = reminder.id;
    reminder.keywords.forEach((keyword) => {
      const keywordIdSet = this.data.get(keyword);
      if (keywordIdSet !== undefined) {
        keywordIdSet.delete(reminderId);
        if (keywordIdSet.size === 0) {
          this.data.delete(keyword);
        }
      } else {
        throw new Error(`KeywordMap does not have ${keyword} as a key.`);
      }
    });
  }

  clear(): void {
    this.data.clear();
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

// TODO: rename this variable?
export type ReminderDataResponse = {
  reminderStore: string;
  keywordMap: string;
};
