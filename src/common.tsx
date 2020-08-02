import { collectWordStems } from './stemming';

/**
 * A collection of parameters that can be used to create a `Reminder`.
 * Unlike the `Reminder` class, a `ReminderParam` has no `id` associated, and
 * likewise has no behavior associated (for conversion to/from JSON, parameter
 * validation, etc.)
 */
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

  constructor(
    id: number,
    url: string,
    title: string,
    description: string,
    keywords: string[],
  ) {
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

  // I'm not sure if I really trust JavaScript's default equality checking, so
  // might as well implement this to be clear what values we are checking for
  equalTo(other: Reminder): boolean {
    if (this === other) return true;
    return typeof this === typeof other && this.toJSON() === other.toJSON();
  }

  toJSON(): string {
    return JSON.stringify({
      id: this.id,
      url: this.url,
      title: this.title,
      description: this.description,
      keywords: this.keywords,
    });
  }

  static fromJSON(jsonStr: string): Reminder {
    const json = JSON.parse(jsonStr) as {
      id: number;
      url: string;
      title: string;
      description: string;
      keywords: string[];
    };
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
 * Map from reminder IDs to Reminder objects.
 */
export class ReminderStore {
  _data: Map<number, Reminder>;
  _currentId: number;

  constructor(startingId: number) {
    this._data = new Map<number, Reminder>();
    this._currentId = startingId;
  }

  create(reminderParams: ReminderParams): Reminder {
    const { url, title, description, keywords } = { ...reminderParams };
    const reminder = new Reminder(
      this._currentId,
      url,
      title,
      description,
      keywords,
    );
    this._data.set(this._currentId, reminder);
    this._currentId++;
    return reminder;
  }

  add(reminder: Reminder): void {
    const existingReminder = this._data.get(reminder.id);
    if (existingReminder !== undefined) {
      if (!reminder.equalTo(existingReminder)) {
        throw new Error(
          'Tried adding a reminder which conflicts with existing data!' +
            `reminder added: ${reminder}, existing reminder: ${existingReminder}`,
        );
      }
    } else {
      this._data.set(reminder.id, reminder);
    }
  }

  update(
    id: number,
    url: string,
    title: string,
    description: string,
    keywords: string[],
  ): Reminder {
    const reminder = this._data.get(id);
    if (reminder === undefined) {
      throw new Error(`Reminder ID not found in ReminderStore: ${id}`);
    }
    reminder.url = url;
    reminder.title = title;
    reminder.description = description;
    reminder.keywords = keywords;
    return reminder;
  }

  remove(reminderId: number): Reminder {
    const reminder = this._data.get(reminderId);
    if (reminder === undefined) {
      throw new Error(`Reminder ID not found in ReminderStore: ${reminderId}`);
    } else {
      this._data.delete(reminderId);
      return reminder;
    }
  }

  values(): Reminder[] {
    return [...this._data.values()];
  }

  getReminder(reminderId: number): Reminder | undefined {
    return this._data.get(reminderId);
  }

  getCurrentId(): number {
    return this._currentId;
  }

  clear(): void {
    this._data.clear();
    this._currentId = 0;
  }
}

/**
 * Map from keywords (and keyword stems) to Reminder IDs.
 *
 * Note: this map is not an ultimate source of truth for whether keywords
 * are associated with reminders, since additional pseudo-keywords (such as
 * word stems) are also included as keys. To determine if a keyword is actually
 * associated with a Reminder, you must look up that Reminder in the
 * ReminderStore.
 */
export class KeywordMap {
  _data: Map<string, Set<number>>;

  constructor() {
    this._data = new Map<string, Set<number>>();
  }

  add(reminder: Reminder): void {
    const reminderId = reminder.id;
    const baseKeywords = reminder.keywords;
    const keywordStems = collectWordStems(baseKeywords);
    [...baseKeywords, ...keywordStems].forEach((keyword) => {
      const keywordIdSet = this._data.get(keyword);
      if (keywordIdSet !== undefined) {
        keywordIdSet.add(reminderId);
      } else {
        this._data.set(keyword, new Set([reminderId]));
      }
    });
  }

  /**
   * Updates the keyword map given a reminder's ID and lists of added and
   * removed keywords.
   *
   * Precondition: addedKeywords and removedKeywords have no words in common.
   *
   * @param reminderId the reminder's ID
   * @param addedKeywords keywords that were added
   * @param removedKeywords keywords that were removed
   */
  update(
    reminderId: number,
    addedKeywords: string[],
    removedKeywords: string[],
  ): void {
    const addedKeywordStems = collectWordStems(addedKeywords);
    [...addedKeywords, ...addedKeywordStems].forEach((keyword) => {
      const keywordIdSet = this._data.get(keyword);
      if (keywordIdSet !== undefined) {
        keywordIdSet.add(reminderId);
      } else {
        this._data.set(keyword, new Set([reminderId]));
      }
    });

    const removedKeywordStems = collectWordStems(removedKeywords);
    [...removedKeywords, ...removedKeywordStems].forEach((keyword) => {
      const keywordIdSet = this._data.get(keyword);
      if (keywordIdSet !== undefined) {
        keywordIdSet.delete(reminderId);
      } else {
        console.log(
          `Warning: tried removing association from keyword ${keyword} to reminder ${reminderId}, but this keyword is not in the map.`,
        );
      }
    });
  }

  remove(reminder: Reminder): void {
    const reminderId = reminder.id;
    const baseKeywords = reminder.keywords;
    const keywordStems = collectWordStems(baseKeywords);
    [...baseKeywords, ...keywordStems].forEach((keyword) => {
      const keywordIdSet = this._data.get(keyword);
      if (keywordIdSet !== undefined) {
        keywordIdSet.delete(reminderId);
        if (keywordIdSet.size === 0) {
          this._data.delete(keyword);
        }
      } else {
        throw new Error(`KeywordMap does not have ${keyword} as a key.`);
      }
    });
  }

  get(keyword: string): Set<number> | undefined {
    return this._data.get(keyword);
  }

  clear(): void {
    this._data.clear();
  }
}

/**
 * Map from URLs to Reminder IDs.
 */
export class ReminderURLMap {
  _data: Map<string, number>;

  constructor() {
    this._data = new Map<string, number>();
  }

  add(reminder: Reminder): void {
    if (this._data.has(reminder.url)) {
      console.log(
        'Warning: a reminder with this URL has already been added. ' +
          'The reminderId assigned to it is getting replaced.',
      );
    }
    this._data.set(reminder.url, reminder.id);
  }

  remove(reminder: Reminder): void {
    const existingReminder = this._data.get(reminder.url);
    if (existingReminder === undefined) {
      throw new Error(`Reminder not found in ReminderURLMap: ${reminder}`);
    } else {
      this._data.delete(reminder.url);
    }
  }

  get(url: string): number | undefined {
    return this._data.get(url);
  }

  clear(): void {
    this._data.clear();
  }
}

export type UserData = {
  reminders: Reminder[]; // array of Reminder objects
  currentId: number; // number that new reminder IDs should start at
};

export type UserDataJSON = {
  reminders: string[];
  currentId: number;
};

export type PageMetadata = {
  title: string;
  url: string;
  description: string;
  keywords: string[];
};

export const enum RequestOperation {
  AddTestData = 'AddTestData',
  DeleteUserData = 'DeleteUserData',
  SaveReminder = 'SaveReminder',
  DeleteReminder = 'DeleteReminder',
  GetReminderFromURL = 'GetReminderFromURL',
  GetRemindersByKeywords = 'GetRemindersByKeywords',
  GetAllReminders = 'GetAllReminders',
  GetPageMetadata = 'GetPageMetadata',
}

// This pattern is known as the 'discriminated union';
// see https://www.typescriptlang.org/docs/handbook/advanced-types.html#discriminated-unions
export type Request =
  | AddTestDataRequest
  | DeleteUserDataRequest
  | SaveReminderRequest
  | DeleteReminderRequest
  | GetReminderFromURLRequest
  | GetRemindersByKeywordsRequest
  | GetAllRemindersRequest
  | GetPageMetadataRequest;

export interface RequestInterface {
  operation: RequestOperation;
}

export interface AddTestDataRequest extends RequestInterface {
  operation: RequestOperation.AddTestData;
}

export interface DeleteUserDataRequest extends RequestInterface {
  operation: RequestOperation.DeleteUserData;
}

// It's possible we could make some of these fields optional, it just depends
// on the needs of the API really
export interface SaveReminderRequest extends RequestInterface {
  operation: RequestOperation.SaveReminder;
  reminderId: number | null;
  url: string;
  title: string;
  description: string;
  keywords: string[];
}

export interface DeleteReminderRequest extends RequestInterface {
  operation: RequestOperation.DeleteReminder;
  reminderId: number;
}

export interface GetReminderFromURLRequest extends RequestInterface {
  operation: RequestOperation.GetReminderFromURL;
  url: string;
}

export interface GetRemindersByKeywordsRequest extends RequestInterface {
  operation: RequestOperation.GetRemindersByKeywords;
  keywords: string[];
}

export interface GetAllRemindersRequest extends RequestInterface {
  operation: RequestOperation.GetAllReminders;
}

export interface GetPageMetadataRequest extends RequestInterface {
  operation: RequestOperation.GetPageMetadata;
}
