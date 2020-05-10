import React from 'react';
import { useState, useEffect } from 'react';
import { Reminder } from '../common';

type SavedRemindersViewProps = {
  getAllReminders: () => Promise<Reminder[] | null>;
};

export const SavedRemindersView = function (
  props: SavedRemindersViewProps,
): JSX.Element | null {
  const [reminders, setReminders] = useState(null as Reminder[] | null);
  const { getAllReminders } = props;

  useEffect(() => {
    (async function (): Promise<void> {
      const response = await getAllReminders();
      setReminders(response);
    })();
  }, []);

  return reminders === null ? null : (
    <ol>
      {reminders.map((reminder: Reminder) => (
        <li key={reminder.id}>{reminder.title}</li>
      ))}
    </ol>
  );
};

export default SavedRemindersView;
