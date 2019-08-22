import * as React from 'react';
import { FunctionComponent } from 'react';
import { Reminder } from './common';
import { makeStyles } from '@material-ui/core/styles';
import { Button, Card, CardActions, CardContent,
  Typography } from '@material-ui/core';

const useStyles = makeStyles({
  reminderCard: {
    marginBottom: '10px',
  },
  reminderCardContent: {
    paddingBottom: 0,
  },
  reminderTitle: {
    fontSize: '1.5rem',
    lineHeight: '1.5rem',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    marginBottom: '0.5em',
  },
  reminderDescription: {
    maxHeight: '4.5rem',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: 3,
    display: '-webkit-box',
  },
});

interface ReminderListProps {
  reminders: Reminder[]
}

interface ReminderList extends FunctionComponent<ReminderListProps> {}

export function ReminderList(props: ReminderListProps) {
  const classes = useStyles();
  const { reminders } = props;
  const reminderItems = reminders.map((reminder) =>
    <ReminderItem reminder={reminder} key={reminder.id!}/>
  );

  return (
    <div>
      <Typography component="h3" gutterBottom>
        {"Related reminders:"}
      </Typography>
      {reminderItems}
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
    <Card className={classes.reminderCard}>
      <CardContent className={classes.reminderCardContent}>
        <Typography component="h2" className={classes.reminderTitle} gutterBottom>
          {reminder.title}
        </Typography>
        <Typography component="p" className={classes.reminderDescription}>
          {reminder.description}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" href={reminder.url}>{"Open"}</Button>
      </CardActions>
    </Card>
  );
}
