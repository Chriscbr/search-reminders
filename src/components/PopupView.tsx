import React from 'react';
import Async from 'react-async';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import PopupContent from './PopupContent';
import PopupNavbar from './PopupNavbar';
import { Reminder, RequestOperation } from '../common';
import { chromeRuntimeSendMessage } from '../chrome_helpers';

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
});

type PopupViewProps = {
  getCurrentPageReminder: () => Promise<Reminder | null>;
};

export const PopupView = function(props: PopupViewProps): JSX.Element {
  const classes = useStyles();
  const { getCurrentPageReminder } = props;

  return (
    <Box className={classes.box}>
      <Box className={classes.titleBox}>
        <Typography className={classes.title}>Search Reminders</Typography>
      </Box>
      <Divider variant="fullWidth" />
      <Async promiseFn={getCurrentPageReminder}>
        <Async.Loading>
          <Typography component="p">Loading...</Typography>
        </Async.Loading>
        <Async.Fulfilled>
          {(data: Reminder | null): JSX.Element => {
            if (data === null) {
              return <PopupContent initMode="empty" />;
            } else {
              const saveReminder = (
                title: string,
                description: string,
                keywords: string[],
              ): void => {
                chromeRuntimeSendMessage({
                  operation: RequestOperation.UpdateReminder,
                  reminderId: data.id,
                  title: title,
                  description: description,
                  keywords: keywords,
                })
                  .then(response =>
                    console.log(
                      `updateReminder message sent, recieved response: ${response}`,
                    ),
                  )
                  .catch(error =>
                    console.log(
                      `Error sending updateReminder message: ${error}`,
                    ),
                  );
              };

              const deleteReminder = (): void => {
                chromeRuntimeSendMessage({
                  operation: RequestOperation.DeleteReminder,
                  reminderId: data.id,
                })
                  .then(response =>
                    console.log(
                      `deleteReminder message sent, recieved response: ${response}`,
                    ),
                  )
                  .catch(error =>
                    console.log(
                      `Error sending deleteReminder message: ${error}`,
                    ),
                  );
              };

              return (
                <PopupContent
                  initTitle={data.title}
                  initDescription={data.description}
                  initKeywords={data.keywords}
                  initMode="saved"
                  saveReminder={saveReminder}
                  deleteReminder={deleteReminder}
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
