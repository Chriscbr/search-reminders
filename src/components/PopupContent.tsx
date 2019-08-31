import React from 'react';
import { useState } from 'react';
import KeywordChipInput from './KeywordChipInput';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles({
  box: {
    padding: '0px 5px 10px 5px',
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
  descriptionTextField: {
    marginTop: '10px',
    marginBottom: '10px',
  },
  chip: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  }
});

/**
 * empty - The webpage is not recognized as an existing reminder/saved item.
 *   The popup shows a button to the user which will let them create a reminder.
 * editing - The webpage reminder data is shown, with all fields editable
 *   by the user. A save button is available.
 * saved - The webpage is recognized as a reminder/saved item, and fields are
 *   not editable. An edit button is available.
 */
type PopupContentMode = 'empty' | 'editing' | 'saved';

type PopupContentProps = {
  initTitle: string;
  initDescription: string;
  initKeywords: string[];
  mode: PopupContentMode;
};

const renderEmptyMode = function(): JSX.Element {
  return <Box></Box>;
};

const renderEditingMode = function(
    title: string,
    description: string,
    keywords: string[],
    handleChangeTitle: (event: React.ChangeEvent<HTMLInputElement>) => void,
    handleChangeDescription: (event: React.ChangeEvent<HTMLInputElement>) => void,
    handleAddKeyword: (keyword: string) => void,
    handleDeleteKeyword: (deletedKeyword: string, index: number) => void,
    classes: Record<string, string>): JSX.Element {
  return (
    <Box className={classes.box}>
      <TextField
        label="Title"
        value={title}
        onChange={handleChangeTitle}
        variant="filled"
        fullWidth
      />
      <TextField
        label="Description"
        value={description}
        onChange={handleChangeDescription}
        variant="filled"
        className={classes.descriptionTextField}
        multiline
        rows="4"
        fullWidth
      />
      <KeywordChipInput
        keywords={keywords}
        handleAddKeyword={handleAddKeyword}
        handleDeleteKeyword={handleDeleteKeyword}
      />
    </Box>
  );
};

const renderSavedMode = function(
    title: string,
    description: string,
    keywords: string[],
    classes: Record<string, string>): JSX.Element {
  return (
    <Box className={classes.box}>
      <Typography className={classes.pageTitle}>
        {title}
      </Typography>
      <Typography component="p" className={classes.pageDescription}>
        {description}
      </Typography>
      <KeywordChipInput keywords={keywords} disabled={true} />
    </Box>
  );
};

export const PopupContent = function(props: PopupContentProps): JSX.Element {
  const { initTitle, initDescription, initKeywords, mode } = props;
  const [title, setTitle] = useState(initTitle);
  const [description, setDescription] = useState(initDescription);
  const [keywords, setKeywords] = useState(initKeywords);
  const classes = useStyles();

  const handleChangeTitle = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setTitle(event.target.value);
  };

  const handleChangeDescription = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setDescription(event.target.value);
  };

  const handleAddKeyword = (keyword: string): void => {
    setKeywords([...keywords, keyword]);
  };

  const handleDeleteKeyword = (deletedKeyword: string, _index: number): void => {
    setKeywords(keywords.filter((keyword) => keyword !== deletedKeyword));
  };

  switch (mode) {
    case 'empty':
      return renderEmptyMode();
    case 'editing':
      return renderEditingMode(title, description, keywords, handleChangeTitle,
        handleChangeDescription, handleAddKeyword, handleDeleteKeyword, classes);
    case 'saved':
      return renderSavedMode(title, description, keywords, classes);
    default:
      console.error(`Mode '${mode}' not recognized, defaulting to 'empty'.`);
      return renderEmptyMode();
  }
};

export default PopupContent;
