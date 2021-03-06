import React from 'react';
import { useState } from 'react';
import { Reminder, RequestOperation } from '../common';
import { chromeRuntimeSendMessage } from '../chrome_helpers';
import ReminderList from './ReminderList';

type ReminderAppProps = {
  initReminders: Reminder[];
};

export const ReminderApp = (props: ReminderAppProps): JSX.Element | null => {
  const [reminders, setReminders] = useState(props.initReminders);

  const deleteButtonHandler = (reminderId: number): void => {
    // Update the state with a copy of the list with the reminder removed
    const remindersCopy = [...reminders];
    const index = remindersCopy.findIndex(
      (reminder: Reminder): boolean => reminder.id === reminderId,
    );
    if (index === -1) {
      console.error(
        `Error removing reminderId ${reminderId} from reminder list:`,
        reminders,
      );
      return;
    }
    remindersCopy.splice(index, 1);
    setReminders(remindersCopy);
    console.log(`Reminder with id ${reminderId} removed.`);

    // Update the state information in local storage
    chromeRuntimeSendMessage({
      operation: RequestOperation.DeleteReminder,
      reminderId: reminderId,
    })
      .then((response) =>
        console.log(
          `deleteReminder message sent, recieved response: ${response}`,
        ),
      )
      .catch((error) => console.error(error));
  };

  return reminders.length === 0 ? null : (
    <ReminderList
      reminders={reminders}
      deleteButtonHandler={deleteButtonHandler}
    />
  );
};

export default ReminderApp;
