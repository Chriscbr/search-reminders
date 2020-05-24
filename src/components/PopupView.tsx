import React from 'react';
import Async from 'react-async';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import PopupContent from './PopupContent';
import PopupNavbar from './PopupNavbar';
import { Reminder, PageMetadata } from '../common';

const useStyles = makeStyles({
  box: {
    width: '300px',
  },
  titleBox: {
    padding: '10px',
  },
  title: {
    fontSize: '1.25rem',
  },
  innerBox: {
    padding: '10px',
  },
});

type PopupViewProps = {
  getCurrentPageReminder: () => Promise<Reminder | null>;
  getPageMetadata: () => Promise<PageMetadata | null>;
};

export const PopupView = (props: PopupViewProps): JSX.Element => {
  const classes = useStyles();
  const { getCurrentPageReminder, getPageMetadata } = props;

  const requests: () => Promise<[Reminder | null, PageMetadata | null]> = () =>
    Promise.all([getCurrentPageReminder(), getPageMetadata()] as const);

  return (
    <Box className={classes.box}>
      <Box className={classes.titleBox}>
        <Typography className={classes.title}>Search Reminders</Typography>
      </Box>
      <Divider variant="fullWidth" />
      <Async promiseFn={requests}>
        <Async.Loading>
          <Typography component="p">Loading...</Typography>
        </Async.Loading>
        <Async.Fulfilled>
          {([reminder, metadata]: [
            Reminder | null,
            PageMetadata,
          ]): JSX.Element => {
            if (metadata === null) {
              return (
                <Box className={classes.innerBox}>
                  <Typography align="center" component="p">
                    An error has occurred.
                  </Typography>
                </Box>
              );
            }

            if (reminder === null) {
              return (
                <PopupContent
                  initReminderId={null}
                  initMode="empty"
                  pageMetadata={metadata}
                />
              );
            } else {
              return (
                <PopupContent
                  initTitle={reminder.title}
                  initDescription={reminder.description}
                  initKeywords={reminder.keywords}
                  initReminderId={reminder.id}
                  initMode="saved"
                  pageMetadata={metadata}
                />
              );
            }
          }}
        </Async.Fulfilled>
        <Async.Rejected>
          {(error: Error): JSX.Element => {
            console.error(
              `An error occurred loading getCurrentPageReminder data: ${error}`,
            );
            return (
              <Typography component="p">An error has occurred.</Typography>
            );
          }}
        </Async.Rejected>
      </Async>
      <Divider variant="fullWidth" />
      <PopupNavbar />
    </Box>
  );
};

export default PopupView;
