import * as React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import PopupContent from './PopupContent';
import PopupNavbar from './PopupNavbar';

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

export const PopupView = function(): JSX.Element {
  const classes = useStyles();
  return (
    <Box className={classes.box}>
      <Typography className={classes.title}>Search Reminders</Typography>
      <Divider variant="middle" className={classes.divider} />
      <PopupContent mode="editing" />
      <PopupNavbar />
    </Box>
  );
}

export default PopupView;
