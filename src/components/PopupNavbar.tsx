import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Settings from '@material-ui/icons/Settings';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles({
  container: {
    padding: '10px',
    position: 'relative',
  },
  version: {
    color: '#555555',
    fontSize: '0.8rem',
    position: 'absolute',
    bottom: '10px',
    left: '10px',
    minWidth: 'max-content',
  },
  grow: {
    flexGrow: 1,
  },
  extendedIcon: {
    marginRight: '5px',
  },
});

/*
 * Note: even though most "navbars" appear at the top or side of a webpage,
 * this one appears at the bottom of the popup.
 */
export const PopupNavbar = (): JSX.Element => {
  const classes = useStyles();
  return (
    <Grid container className={classes.container}>
      <Grid item>
        <Typography component="p" className={classes.version}>
          Version: 0.0.1
        </Typography>
      </Grid>
      <Grid item className={classes.grow} />
      <Grid item>
        <Button
          size="small"
          aria-label="settings"
          onClick={(): void => chrome.runtime.openOptionsPage()}
        >
          <Settings className={classes.extendedIcon} fontSize="small" />
          Settings
        </Button>
      </Grid>
    </Grid>
  );
};

export default PopupNavbar;
