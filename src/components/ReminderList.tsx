import * as React from 'react';
import { Reminder } from "../common";
import ReminderItem from './ReminderItem';
import makeStyles from "@material-ui/core/styles/makeStyles";
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles({
  reminderListWrapper: {
    marginBottom: '20px',
  },
  reminderListTitle: {
    marginBottom: '15px',
  },
});

type ReminderListProps = {
  reminders: Reminder[];
  deleteButtonHandler: (event: React.MouseEvent, reminderId: number) => void;
};

export const ReminderList = function(props: ReminderListProps): JSX.Element {
  const classes = useStyles();
  const { reminders, deleteButtonHandler } = props;

  const reminderItems = reminders.map((reminder) =>
    <ReminderItem
      reminder={reminder}
      key={reminder.id}
      deleteButtonHandler={deleteButtonHandler}
    />
  );

  return (
    <div className={classes.reminderListWrapper}>
      <Typography component="h3" className={classes.reminderListTitle}>
        {"Related saved items:"}
      </Typography>
      {reminderItems}
    </div>
  );
};

export default ReminderList;
