import React from 'react';
import { useState } from 'react';
import KeywordChipInput from './KeywordChipInput';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

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
  },
  button: {
    margin: '8px',
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
  initTitle?: string;
  initDescription?: string;
  initKeywords?: string[];
  initMode: PopupContentMode;
};

const renderEmptyMode = function(): JSX.Element {
  return (
    <Box>
      <Typography component="p">This page is not saved.</Typography>
    </Box>
  );
};

const renderEditingMode = function(
    title: string,
    description: string,
    keywords: string[],
    handleChangeTitle: (event: React.ChangeEvent<HTMLInputElement>) => void,
    handleChangeDescription: (event: React.ChangeEvent<HTMLInputElement>) => void,
    handleAddKeyword: (keyword: string) => void,
    handleDeleteKeyword: (deletedKeyword: string, index: number) => void,
    handleSaveButton: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void,
    handleExitButton: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void,
    classes: Record<string, string>): JSX.Element {
  return (
    <>
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
      <Grid container justify="center">
        <Grid item>
          <Button
            size="small"
            variant="contained"
            aria-label="save"
            className={classes.button}
            onClick={handleSaveButton}
          >
            Save
          </Button>
          <Button
            size="small"
            variant="contained"
            aria-label="exit"
            className={classes.button}
            onClick={handleExitButton}
          >
            Exit
          </Button>
        </Grid>
      </Grid>
    </>
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
  const { initTitle, initDescription, initKeywords, initMode } = props;
  const [title, setTitle] = useState(initTitle);
  const [description, setDescription] = useState(initDescription);
  const [keywords, setKeywords] = useState(initKeywords);
  const [mode, setMode] = useState(initMode);
  const classes = useStyles();

  const handleChangeTitle = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setTitle(event.target.value);
  };

  const handleChangeDescription = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setDescription(event.target.value);
  };

  const handleAddKeyword = (keyword: string): void => {
    if (keywords === undefined) {
      console.error('Unable to add keyword, keywords is undefined.');
    } else {
      setKeywords([...keywords, keyword]);
    }
  };

  const handleDeleteKeyword = (deletedKeyword: string, _index: number): void => {
    if (keywords === undefined) {
      console.error('Unable to delete keyword, keywords is undefined.');
    } else {
      setKeywords(keywords.filter((keyword) => keyword !== deletedKeyword));
    }
  };

  const handleSaveButton = (_event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    // TODO: add actual saving mechanism
    setMode('saved');
  };

  const handleExitButton = (_event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    // TODO: add mechanism for reloading content from saved data
    setMode('saved');
  };

  switch (mode) {
    case 'empty':
      return renderEmptyMode();
    case 'editing':
      if (title === undefined || description === undefined || keywords === undefined) {
        console.error('Error: one or more of title, description, and keywords are undefined.');
        return <Typography component="p">An error has occurred.</Typography>;
      } else {
        return renderEditingMode(title, description, keywords, handleChangeTitle,
          handleChangeDescription, handleAddKeyword, handleDeleteKeyword,
          handleSaveButton, handleExitButton, classes);
      }
    case 'saved':
      if (title === undefined || description === undefined || keywords === undefined) {
        console.error('Error: one or more of title, description, and keywords are undefined.');
        return <Typography component="p">An error has occurred.</Typography>;
      } else {
        return renderSavedMode(title, description, keywords, classes);
      }
    default:
      console.error(`Mode '${mode}' not recognized, defaulting to 'empty'.`);
      return renderEmptyMode();
  }
};

export default PopupContent;
