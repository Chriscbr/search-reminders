import React from 'react';
import { Reminder } from '../common';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import OpenInNew from '@material-ui/icons/OpenInNew';
import Delete from '@material-ui/icons/Delete';
import makeStyles from '@material-ui/core/styles/makeStyles';

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
  extendedIcon: {
    marginRight: '5px',
  },
  grow: {
    flexGrow: 1,
  },
});

type ReminderItemProps = {
  reminder: Reminder;
  deleteButtonHandler: (event: React.MouseEvent, reminderId: number) => void;
};

export const ReminderItem = function(props: ReminderItemProps): JSX.Element {
  const classes = useStyles();
  const { reminder, deleteButtonHandler } = props;

  return (
    <Card className={classes.reminderCard}>
      <CardContent className={classes.reminderCardContent}>
        <Typography
          component="h2"
          className={classes.reminderTitle}
          gutterBottom
        >
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
          onClick={(event): void => deleteButtonHandler(event, reminder.id)}
        >
          <Delete className={classes.extendedIcon} fontSize="small" />
          Delete
        </Button>
      </CardActions>
    </Card>
  );
};

export default ReminderItem;
