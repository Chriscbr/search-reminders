import * as React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Settings from '@material-ui/icons/Settings';

const useStyles = makeStyles({
  box: {
    width: '300px'
  },
  grow: {
    flexGrow: 1
  },
  extendedIcon: {
    marginRight: '5px',
  },
});

export const PopupView = function(): JSX.Element {
  const classes = useStyles();
  return (
    <Box className={classes.box}>
      <p>Hello world!</p>
      <form>
        
      </form>
      <Grid container>
        <Grid item className={classes.grow} />
        <Grid item>
          <Button
              size="small"
              aria-label="open"
              onClick={(): void => chrome.runtime.openOptionsPage()}
            >
            <Settings className={classes.extendedIcon} fontSize="small" />
            Settings
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}

export default PopupView;
