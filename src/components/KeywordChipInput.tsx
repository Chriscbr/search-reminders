import * as React from 'react';
import { useState } from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import ChipInput from 'material-ui-chip-input';
import Chip from '@material-ui/core/Chip';

const useStyles = makeStyles({
  chip: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
});

type KeywordChipInputProps = {
  initKeywords: string[];
  disabled?: boolean;
}

export const KeywordChipInput = function(props: KeywordChipInputProps): JSX.Element {
  const [keywords, setKeywords] = useState(props.initKeywords);
  const classes = useStyles();

  const handleAddKeyword = (keyword: string): void => {
    setKeywords([...keywords, keyword])
  };

  const handleDeleteKeyword = (deletedKeyword: string, _index: number): void => {
    setKeywords(keywords.filter((keyword) => keyword !== deletedKeyword));
  }

  return (
    <ChipInput
      value={keywords}
      onAdd={(keyword): void => handleAddKeyword(keyword)}
      onDelete={(keyword, index): void => handleDeleteKeyword(keyword, index)}
      variant='filled'
      label='Keywords'
      disabled={props.disabled}
      classes={{ chip: classes.chip }}
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
};

KeywordChipInput.defaultProps = {
  disabled: false,
};

export default KeywordChipInput;
