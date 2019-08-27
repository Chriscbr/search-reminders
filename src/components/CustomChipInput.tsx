import * as React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import ChipInput from 'material-ui-chip-input';
import Chip from '@material-ui/core/Chip';

const useStyles = makeStyles({
  chip: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
});

export const CustomChipInput = function(): JSX.Element {
  const classes = useStyles();
  return (
    <ChipInput
      variant='filled'
      label='Keywords'
      classes={{
        chip: classes.chip
      }}
      fullWidth
      chipRenderer={(
        {
          value,
          handleClick,
          handleDelete,
          className
        },
        key
      ): JSX.Element => (
        <Chip
          key={key}
          className={className}
          size='small'
          onClick={handleClick}
          onDelete={handleDelete}
          label={value}
        />
      )}
    />
  );
}

export default CustomChipInput;
