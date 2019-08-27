import * as React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Settings from '@material-ui/icons/Settings';

const useStyles = makeStyles({
  grow: {
    flexGrow: 1
  },
  extendedIcon: {
    marginRight: '5px',
  },
});

export const PopupNavbar = function(): JSX.Element {
  const classes = useStyles();
  return (
    <Grid container>
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
}

export default PopupNavbar;
