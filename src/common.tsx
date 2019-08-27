import { deserialize, serialize, Type } from 'class-transformer';
import 'reflect-metadata';

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

  @Type(() => String)
  keywords: string[];

  /**
   * Use Reminder.from() to initialize, in order to guarantee parameter
   * validation occurs.
   */
  constructor(id: number,
              url: string,
              title: string,
              description: string,
              keywords: string[]) {
    this.id = id;
    this.url = url;
    this.title = title;
    this.description = description;
    this.keywords = keywords;
  }

  from(id: number,
       url: string,
       title: string,
       description: string,
       keywords: string[]): Reminder {
    const reminder = new Reminder(id, url, title, description, keywords);
    reminder.validateParams();
    return reminder;
  }

  private validateParams(): void {
    if (this.keywords === undefined || this.keywords.length < 0) {
      throw new Error('Reminder must have an array of more than 0 keywords.');
    }
    if (new Set(this.keywords).size !== this.keywords.length) {
      throw new Error('Reminder has duplicate keywords.');
    }
  }

  toJSON(): string {
    return serialize(this);
  }

  static fromJSON(jsonStr: string): Reminder {
    return deserialize(Reminder, jsonStr);
  }

  toString(): string {
    return `Reminder(${this.id}, ${this.url}, ${this.title}, ` +
      `${this.description}, [${this.keywords}])`;
  }
}

/**
 * Map from random IDs to Reminder objects.
 */
export class ReminderStore {

  @Type(() => Reminder)
  data: Map<string, Reminder>;

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
    this.data.set(this.currentId.toString(), reminder);
    this.currentId++;
    return reminder;
  }

  remove(reminderId: number): Reminder {
    const reminder = this.data.get(reminderId.toString());
    if (reminder === undefined) {
      throw new Error(`Invalid reminderId: ${reminderId}`);
    } else {
      this.data.delete(reminderId.toString());
      return reminder;
    }
  }

  clear(): void {
    this.data.clear();
    this.currentId = 0;
  }

  toJSON(): string {
    return serialize(this);
  }

  static fromJSON(jsonStr: string): ReminderStore {
    return deserialize(ReminderStore, jsonStr);
  }
} 

/**
 * Map from keywords to Reminder IDs.
 */
export class KeywordMap {

  // even though this annotation doesn't seem to work correctly (the entries
  // after deserializing are still arrays, not sets), if we don't include
  // this annotation then it won't even be deserialized into a proper map
  @Type(() => Set)
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
    return serialize(this);
  }

  static fromJSON(jsonStr: string): KeywordMap {
    const keyboardMap = deserialize(KeywordMap, jsonStr);

    // the class-transformer package providing the serialization functions is
    // a bit limited, so we are manually converting entries into sets ourselves
    keyboardMap.data.forEach((values, key, map): void => {
      map.set(key, new Set(values));
    })
    return keyboardMap;
  }
}

export type ReminderDataResponse = {
  reminderStore: string;
  keywordMap: string;
};
