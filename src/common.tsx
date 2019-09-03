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
 * Map from reminder IDs to Reminder objects.
 */
export class ReminderStore {
  data: Map<number, Reminder>;
  currentId: number;

  constructor(startingId: number) {
    this.data = new Map();
    this.currentId = startingId;
  }

  create(reminderParams: ReminderParams): Reminder {
    const { url, title, description, keywords } = { ...reminderParams };
    const reminder = new Reminder(
      this.currentId,
      url,
      title,
      description,
      keywords,
    );
    reminder.id = this.currentId;
    this.data.set(this.currentId++, reminder);
    return reminder;
  }

  add(reminder: Reminder): void {
    const existingReminder = this.data.get(reminder.id);
    if (existingReminder !== undefined) {
      if (!reminder.equalTo(existingReminder)) {
        throw new Error(
          'Tried adding a reminder which conflicts with existing data!' +
            `reminder added: ${reminder}, existing reminder: ${existingReminder}`,
        );
      }
    } else {
      this.data.set(reminder.id, reminder);
    }
  }

  remove(reminderId: number): Reminder {
    const reminder = this.data.get(reminderId);
    if (reminder === undefined) {
      throw new Error(`Reminder ID not found in ReminderStore: ${reminderId}`);
    } else {
      this.data.delete(reminderId);
      return reminder;
    }
  }

  clear(): void {
    this.data.clear();
    this.currentId = 0;
  }
}

/**
 * Map from keywords to Reminder IDs.
 */
export class KeywordMap {
  data: Map<string, Set<number>>;

  constructor() {
    this.data = new Map();
  }

  add(reminder: Reminder): void {
    const reminderId = reminder.id;
    reminder.keywords.forEach(keyword => {
      const keywordIdSet = this.data.get(keyword);
      if (keywordIdSet !== undefined) {
        keywordIdSet.add(reminderId);
      } else {
        this.data.set(keyword, new Set([reminderId]));
      }
    });
  }

  remove(reminder: Reminder): void {
    const reminderId = reminder.id;
    reminder.keywords.forEach(keyword => {
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
}

/**
 * Map from URLs to Reminder IDs.
 */
export class ReminderURLMap {
  data: Map<string, number>;

  constructor() {
    this.data = new Map();
  }

  add(reminder: Reminder): void {
    if (this.data.has(reminder.url)) {
      console.log(
        'Warning: a reminder with this URL has already been added. ' +
          'The reminderId assigned to it is getting replaced.',
      );
    }
    this.data.set(reminder.url, reminder.id);
  }

  remove(reminder: Reminder): void {
    const existingReminder = this.data.get(reminder.url);
    if (existingReminder === undefined) {
      throw new Error(`Reminder not found in ReminderURLMap: ${reminder}`);
    } else {
      this.data.delete(reminder.url);
    }
  }

  clear(): void {
    this.data.clear();
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
