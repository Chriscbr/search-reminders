import * as React from 'react';
import { Reminder } from './common';
import { makeStyles } from '@material-ui/core/styles';
import { Button, Card, CardActions, CardContent,
  Typography } from '@material-ui/core';

const useStyles = makeStyles({
  reminderListWrapper: {
    marginBottom: '20px',
  },
  reminderListTitle: {
    marginBottom: '15px',
  },
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

type ReminderListProps = { reminders: Reminder[] };

export function ReminderList(props: ReminderListProps): JSX.Element | null {
  const classes = useStyles();
  const { reminders } = props;
  const reminderItems = reminders.map((reminder) =>
    <ReminderItem reminder={reminder} key={reminder.id}/>
  );
  if (reminders.length === 0) return null;

  return (
    <div className={classes.reminderListWrapper}>
      <Typography component="h3" className={classes.reminderListTitle}>
        {"Related saved items:"}
      </Typography>
      {reminderItems}
    </div>
  );
}

type ReminderItemProps = { reminder: Reminder };

export function ReminderItem(props: ReminderItemProps): JSX.Element {
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
