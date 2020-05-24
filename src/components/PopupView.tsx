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
  getCurrentPageReminder: () => Promise<[string | null, Reminder | null]>;
  getPageMetadata: () => Promise<PageMetadata | null>;
};

/*
So for some background on how this was designed, the main constraints for the
popup box is that

1) We need to get the current page URL in order to query the
background_script to see if the current page is reminder or not. This needs to
happen before the popup loads. Even if there isn't a reminder associated with
the page, we will still need the URL for the lifetime of the popup in case a
reminder is created and saved.
2) We need to get the current page information in order to pre-fill the
'create reminder' form with an automatically generated title, description, etc.

The URL can be obtained several ways, but nonetheless it has to be done
asynchronously through the chrome runtime APIs, hence our use of react-async
in this module. For convenience, we combine the operations of getting the page
URL and getting any associated Reminder is combined into a single asynchronous
call.

Getting the page metadata is more tricky, since it requires injecting a script
into the page which can then read the DOM / look at the necessary <meta> tags
within the page as needed. Most of this is handled within `background.tsx`.

However, the mistake I originally made was deferring the popup from loading
until both of these requests were made. The problem is that the get_metadata
script will only load after the DOM is fully loaded - which may occur much
after the user clicks the extension API. Hence, we have changed this so the
getPageMetadata function-promise is only called once the user actually tries
to click the "create new reminder" button. If the page hasn't finished loading,
instead of adding complex logic for some kind of loading state, we simply
give the user a form with blank fields so they can directly enter reminder
information themselves (a better user experience than having to wait for
a possibly very slow page to load).
*/

export const PopupView = (props: PopupViewProps): JSX.Element => {
  const classes = useStyles();
  const { getCurrentPageReminder, getPageMetadata } = props;

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
          {(data: [string | null, Reminder | null]): JSX.Element => {
            const [url, reminder] = data;
            if (url === null) {
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
                  initURL={url}
                  getPageMetadata={getPageMetadata}
                />
              );
            } else {
              return (
                <PopupContent
                  initTitle={reminder.title}
                  initDescription={reminder.description}
                  initKeywords={reminder.keywords}
                  initReminderId={reminder.id}
                  initURL={url}
                  initMode="saved"
                  getPageMetadata={getPageMetadata}
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
              <Typography align="center" component="p">
                An error has occurred.
              </Typography>
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
