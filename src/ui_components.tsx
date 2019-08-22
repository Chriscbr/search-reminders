import * as React from 'react';
import { FunctionComponent, ReactNode } from 'react';
import { Reminder } from './common';
import { makeStyles } from '@material-ui/core/styles';
import { Button, Card, CardActions, CardContent,
  Typography } from '@material-ui/core';

const useStyles = makeStyles({
  listTitle: {
    fontSize: 14
  },
  reminderTitle: {
    fontSize: 12,
  },
  reminderDescription: {
    fontSize: 10,
  },
});

interface ReminderListProps {
  children?: ReactNode
}

interface ReminderList extends FunctionComponent<ReminderListProps> {}

export function ReminderList(props: ReminderListProps) {
  const classes = useStyles();

  return (
    <div>
      <Typography className={classes.listTitle}>{"Related reminders:"}</Typography>
      {props.children}
    </div>
  );
}

// using 'Omit' will ensure there are no children to a ReminderItem
interface ReminderItemProps {
  reminder: Reminder
}

interface ReminderItem extends FunctionComponent<ReminderItemProps> {}

export function ReminderItem(props: ReminderItemProps) {
  const classes = useStyles();
  const { reminder } = props;
  return (
    <Card>
      <CardContent>
        <Typography className={classes.reminderTitle} gutterBottom>
          {reminder.title}
        </Typography>
        <Typography className={classes.reminderDescription}>
          {reminder.description}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" href={reminder.url}>{"Open"}</Button>
      </CardActions>
    </Card>
  );
}
