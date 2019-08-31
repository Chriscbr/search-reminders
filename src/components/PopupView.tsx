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
      <PopupContent
        initTitle="The Science of the Best Chocolate Chip Cookies | The Food Lab | Serious Eats"
        initDescription={`I've never been able to get a chocolate chip cookie exactly the way I like. I'm talking chocolate cookies that are barely crisp around the edges with a buttery, toffee-like crunch that transitions into a chewy, moist center that bends like caramel, rich with butter and big pockets of melted chocolate. I made it my goal to test each and every element from ingredients to cooking process, leaving no chocolate chip unturned in my quest for the best. 32 pounds of flour, over 100 individual tests, and 1,536 cookies later, I had my answers.`}
        initKeywords={['cookie', 'recipe']}
        mode="editing"
      />
      <PopupNavbar />
    </Box>
  );
};

export default PopupView;
