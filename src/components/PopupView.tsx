import React from 'react';
import Async from 'react-async';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import PopupContent from './PopupContent';
import PopupNavbar from './PopupNavbar';
import { Reminder } from '../common';

const useStyles = makeStyles({
  box: {
    width: '300px',
  },
  title: {
    fontSize: '1.25rem',
  },
  divider: {
    marginTop: '10px',
    marginBottom: '10px',
  },
});

type PopupViewProps = {
  getCurrentPageReminder: () => Promise<Reminder | null>;
}

export const PopupView = function(props: PopupViewProps): JSX.Element {
  const classes = useStyles();
  const { getCurrentPageReminder } = props;

  return (
    <Box className={classes.box}>
      <Typography className={classes.title}>Search Reminders</Typography>
      <Divider variant="middle" className={classes.divider} />
      <Async promiseFn={getCurrentPageReminder}>
        <Async.Loading>
          <Typography component="p">Loading...</Typography>
        </Async.Loading>
        <Async.Fulfilled>
          {(data: Reminder | null): JSX.Element => {
            if (data === null) {
              return <PopupContent initMode="empty" />
            } else {
              return (
                <PopupContent
                  initTitle={data.title}
                  initDescription={data.description}
                  initKeywords={data.keywords}
                  initMode="saved"
                />
              )
            }
          }}
        </Async.Fulfilled>
        <Async.Rejected>
          {(error: Error): JSX.Element => {
            console.error(`An error occurred loading getCurrentPageReminder data: ${error}`);
            return <Typography component="p">An error has occurred.</Typography>;
          }}
        </Async.Rejected>
      </Async>
      <PopupNavbar />
    </Box>
  );
};

export default PopupView;
