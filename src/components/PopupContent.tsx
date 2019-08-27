import * as React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import CustomChipInput from './CustomChipInput';

const useStyles = makeStyles({
  box: {
    padding: '10px 5px 10px 5px',
  },
  pageTitle: {
    fontSize: '1.1rem',
    lineHeight: '1rem',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    marginBottom: '0.5em',
  },
  pageDescription: {
    fontSize: '0.9rem',
    maxHeight: '3.7rem',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: 3,
    display: '-webkit-box',
    marginBottom: '15px',
  },
  chip: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  }
});

export const PopupContent = function(): JSX.Element {
  const classes = useStyles();
  return (
    <Box className={classes.box}>
      <Typography className={classes.pageTitle}>
        The Science of the Best Chocolate Chip Cookies | The Food Lab | Serious Eats
      </Typography>
      <Typography component="p" className={classes.pageDescription}>
        {`I've never been able to get a chocolate chip cookie exactly the way I like. I'm talking chocolate cookies that are barely crisp around the edges with a buttery, toffee-like crunch that transitions into a chewy, moist center that bends like caramel, rich with butter and big pockets of melted chocolate. I made it my goal to test each and every element from ingredients to cooking process, leaving no chocolate chip unturned in my quest for the best. 32 pounds of flour, over 100 individual tests, and 1,536 cookies later, I had my answers.`}
      </Typography>
      <CustomChipInput />
    </Box>
  );
}

export default PopupContent;
