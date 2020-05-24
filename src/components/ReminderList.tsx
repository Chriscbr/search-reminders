import React from 'react';
import { useState } from 'react';
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
      // This is a hack to ensure that the containers stay at their maximum
      // width even during the dropdown transitions.
      '& MuiCollapse-container': {
        width: '100%',
      },
    },
    reminderListTitle: {
      marginBottom: '15px',
    },
    expand: {
      transform: 'rotate(0deg)',
      float: 'right',
      position: 'relative',
      top: '-15px',
      transition: theme.transitions.create('transform', {
        duration: theme.transitions.duration.shortest,
      }),
    },
    expandOpen: {
      transform: 'rotate(180deg)',
    },
    maxWidth: {
      width: '100%',
    },
  }),
);

type ReminderListProps = {
  reminders: Reminder[];
  deleteButtonHandler: (reminderId: number) => void;
};

export const ReminderList = (props: ReminderListProps): JSX.Element => {
  const { reminders, deleteButtonHandler } = props;
  const classes = useStyles();
  const [expanded, setExpanded] = useState(true);

  const handleExpandClick = (): void => {
    setExpanded(!expanded);
  };

  const reminderItems = reminders.map((reminder) => (
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
          wrapper: classes.maxWidth,
          wrapperInner: classes.maxWidth,
          container: classes.maxWidth,
        }}
      >
        {reminderItems}
      </Collapse>
    </Box>
  );
};

export default ReminderList;
