import * as React from 'react';
import { useState } from 'react';
import { Reminder } from './common';
import { chromeRuntimeSendMessage } from './chrome_helpers';
import ReminderList from './components/ReminderList';

type ReminderAppProps = {
  initReminders: Reminder[];
}

export function ReminderApp(props: ReminderAppProps): JSX.Element | null {
  const [reminders, setReminders] = useState(props.initReminders);
  const deleteButtonHandler = (event: React.MouseEvent, reminderId: number): void => {

    // update the state first
    const remindersCopy = [...reminders];
    const index = remindersCopy.findIndex(
      (reminder: Reminder): boolean => reminder.id === reminderId);
    if (index === -1) {
      console.error(`Error removing reminderId ${reminderId} from reminder list:`);
      console.error(reminders);
    }
    remindersCopy.splice(index, 1);
    setReminders(remindersCopy);
    console.log(`Reminder with id ${reminderId} removed.`);

    // update the copy in local storage
    chromeRuntimeSendMessage({ operation: 'deleteReminder', index: index })
      .then((response) => console.log(`deleteReminder message send, recieved response: ${response}`))
      .catch((error) => console.log(`Error sending deleteReminder message: ${error}`));
  }
  if (reminders.length === 0) return null;

  return (
    <ReminderList
      reminders={reminders}
      deleteButtonHandler={deleteButtonHandler}
    />
  );
}
