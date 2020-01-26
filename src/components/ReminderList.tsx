import React from 'react';
import clsx from 'clsx';
import { Reminder } from '../common';
import ReminderItem from './ReminderItem';
import Box from '@material-ui/core/Box';
import Collapse from '@material-ui/core/Collapse';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    reminderListWrapper: {
      marginBottom: '20px',
    },
    reminderListTitle: {
      marginBottom: '15px',
    },
    expand: {
      transform: 'rotate(0deg)',
      float: 'right',
      position: 'relative',
      top: '-10px',
      transition: theme.transitions.create('transform', {
        duration: theme.transitions.duration.shortest,
      }),
    },
    expandOpen: {
      transform: 'rotate(180deg)',
    },
    collapseWrapper: {
      width: '100%',
    },
  }),
);

type ReminderListProps = {
  reminders: Reminder[];
  deleteButtonHandler: (event: React.MouseEvent, reminderId: number) => void;
};

export const ReminderList = function(props: ReminderListProps): JSX.Element {
  const classes = useStyles();
  const { reminders, deleteButtonHandler } = props;

  const [expanded, setExpanded] = React.useState(true);

  function handleExpandClick(): void {
    setExpanded(!expanded);
  }

  const reminderItems = reminders.map(reminder => (
    <ReminderItem
      reminder={reminder}
      key={reminder.id}
      deleteButtonHandler={deleteButtonHandler}
    />
  ));

  return (
    <Box className={classes.reminderListWrapper}>
      <Typography component="h3" className={classes.reminderListTitle}>
        {'Pages you have saved:'}
        <IconButton
          className={clsx(classes.expand, {
            [classes.expandOpen]: expanded,
          })}
          onClick={handleExpandClick}
          aria-expanded={expanded}
          aria-label="Show saved pages"
        >
          <ExpandMoreIcon />
        </IconButton>
      </Typography>
      <Collapse
        in={expanded}
        timeout="auto"
        unmountOnExit
        classes={{
          wrapper: classes.collapseWrapper,
        }}
      >
        {reminderItems}
      </Collapse>
    </Box>
  );
};

export default ReminderList;
