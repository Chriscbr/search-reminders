import * as React from 'react';
import { Reminder } from "../common";
import ReminderItem from './ReminderItem';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import makeStyles from "@material-ui/core/styles/makeStyles";

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
    <Box className={classes.reminderListWrapper}>
      <Typography component="h3" className={classes.reminderListTitle}>
        {"Related saved items:"}
      </Typography>
      {reminderItems}
    </Box>
  );
};

export default ReminderList;
