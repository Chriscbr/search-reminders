interface ReminderParams {
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

  constructor(reminderParams: ReminderParams, id: number) {
    this.validateParams(reminderParams);
    this.id = id;
    this.url = reminderParams.url;
    this.title = reminderParams.title;
    this.description = reminderParams.description;
    this.keywords = reminderParams.keywords;
  }

  private validateParams(params: ReminderParams): void {
    if (params.keywords === null || params.keywords.length < 0) {
      throw new Error('Reminder must have an array of more than 0 keywords.');
    }
    if (new Set(params.keywords).size !== params.keywords.length) {
      throw new Error('Reminder has duplicate keywords.');
    }
  }

  toJSON(): string {
    return JSON.stringify({
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
    return new Reminder({
      url: json.url,
      title: json.title,
      description: json.description,
      keywords: json.keywords},
      json.id
    );
  }

  toString(): string {
    return `Reminder(${this.url}, ${this.title}, ${this.description}, [${this.keywords}]; id=${this.id})`;
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
    const reminder = new Reminder(reminderParams, this.currentId);
    reminder.id = this.currentId;
    this.data.set(this.currentId++, reminder);
    return reminder;
  }

  removeReminder(reminder: Reminder): void {
    if (reminder.id === null) {
      throw new Error('Reminder does not contain an id value.');
    }
    this.data.delete(reminder.id);
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

export const promisify = function(fn: Function, ...params: unknown[]): Promise<unknown> {
  return new Promise((resolve, reject): void => {
    return fn.apply(null, params.concat((result: unknown) => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      return resolve(result);
    }));
  });
};

export type ReminderDataResponse = {
  reminderStore: string;
  keywordMap: string;
};
