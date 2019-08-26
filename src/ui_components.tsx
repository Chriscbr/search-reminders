import * as React from 'react';
import { Reminder } from './common';
import OpenInNew from '@material-ui/icons/OpenInNew';
import Delete from '@material-ui/icons/Delete';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';

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
  extendedIcon: {
    marginRight: '5px',
  },
  grow: {
    flexGrow: 1,
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
        <Button
            size="small"
            href={reminder.url}
            target="_blank"
            aria-label="open"
          >
          <OpenInNew className={classes.extendedIcon} fontSize="small" />
          Open
        </Button>
        <div className={classes.grow}></div>
        <Button
            size="small"
            aria-label="open"
          >
          <Delete className={classes.extendedIcon} fontSize="small" />
          Remove
        </Button>
      </CardActions>
    </Card>
  );
}
