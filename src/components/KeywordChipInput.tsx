import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import ChipInput from 'material-ui-chip-input';
import Chip from '@material-ui/core/Chip';

const useStyles = makeStyles({
  chip: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    margin: '0 8px 0 0',
  },
});

type KeywordChipInputProps = {
  keywords: string[];
  disabled?: boolean;
  handleAddKeyword?: (keyword: string) => void;
  handleDeleteKeyword?: (deletedKeyword: string, index: number) => void;
}

export const KeywordChipInput = function(props: KeywordChipInputProps): JSX.Element {
  const { keywords, disabled, handleAddKeyword, handleDeleteKeyword } = props;
  const classes = useStyles();

  return (
    <ChipInput
      value={keywords}
      onAdd={handleAddKeyword}
      onDelete={handleDeleteKeyword}
      variant='filled'
      label='Keywords'
      disabled={disabled}
      classes={{ chip: classes.chip }}
      fullWidth
      chipRenderer={(
        {
          value,
          handleDelete,
          className
        },
        key
      ): JSX.Element => (
        <Chip
          key={key}
          className={className}
          size='small'
          onDelete={disabled ? undefined : handleDelete}
          label={value}
        />
      )}
    />
  );
};

KeywordChipInput.defaultProps = {
  disabled: false,
  // handleAddKeyword and handleDeleteKeyword will be left as undefined
  // if they are not provided as parameters
};

export default KeywordChipInput;
