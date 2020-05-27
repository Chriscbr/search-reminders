import React from 'react';
import { useState } from 'react';
import KeywordChipInput from './KeywordChipInput';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { PageMetadata, RequestOperation } from '../common';
import { UnreachableCaseError } from '../utils';
import { chromeRuntimeSendMessage } from '../chrome_helpers';

const useStyles = makeStyles({
  box: {
    padding: '10px',
  },
  boxMiddle: {
    padding: '10px 10px 0 10px',
  },
  buttonSpacing: {
    padding: '5px',
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
  },
  createButton: {
    marginTop: '8px',
  },
});

/**
 * Description of popup content modes:
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
  initReminderId: number | null;
  initURL: string;
  initMode: PopupContentMode;
  getPageMetadata: () => Promise<PageMetadata>;
};

const renderEmptyMode = (
  handleCreateButton: () => Promise<void>,
  classes: Record<string, string>,
): JSX.Element => (
  <Box className={classes.box}>
    <Typography align="center" component="p">
      This page is not currently saved.
    </Typography>
    <Grid
      container
      spacing={0}
      direction="column"
      alignItems="center"
      justify="center"
      className={classes.createButton}
    >
      <Button variant="contained" onClick={handleCreateButton}>
        Create a Reminder
      </Button>
    </Grid>
  </Box>
);

const renderEditingMode = (
  title: string,
  description: string,
  keywords: string[],
  handleChangeTitle: (event: React.ChangeEvent<HTMLInputElement>) => void,
  handleChangeDescription: (event: React.ChangeEvent<HTMLInputElement>) => void,
  handleAddKeyword: (keyword: string) => void,
  handleDeleteKeyword: (deletedKeyword: string, index: number) => void,
  handleSaveButton: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => void,
  handleExitButton: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => void,
  classes: Record<string, string>,
): JSX.Element => (
  <>
    <Box className={classes.boxMiddle}>
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
    <Grid container justify="center" className={classes.buttonSpacing}>
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

const renderSavedMode = (
  title: string,
  description: string,
  keywords: string[],
  handleEditButton: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => void,
  handleDeleteButton: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => void,
  classes: Record<string, string>,
): JSX.Element => (
  <>
    <Box className={classes.boxMiddle}>
      <Typography className={classes.pageTitle}>{title}</Typography>
      <Typography component="p" className={classes.pageDescription}>
        {description}
      </Typography>
      <KeywordChipInput keywords={keywords} disabled={true} />
    </Box>
    <Grid container justify="center" className={classes.buttonSpacing}>
      <Grid item>
        <Button
          size="small"
          variant="contained"
          aria-label="edit"
          className={classes.button}
          onClick={handleEditButton}
        >
          Edit
        </Button>
        <Button
          size="small"
          variant="contained"
          aria-label="delete"
          className={classes.button}
          onClick={handleDeleteButton}
        >
          Delete
        </Button>
      </Grid>
    </Grid>
  </>
);

export const PopupContent = (props: PopupContentProps): JSX.Element => {
  const {
    initTitle,
    initDescription,
    initKeywords,
    initReminderId,
    initURL,
    initMode,
    getPageMetadata,
  } = props;

  // State variables for values that are displayed in the popup
  const [title, setTitle] = useState(initTitle);
  const [description, setDescription] = useState(initDescription);
  const [keywords, setKeywords] = useState(initKeywords);
  const [reminderId, setReminderId] = useState(initReminderId);
  const [url] = useState(initURL);
  const [mode, setMode] = useState(initMode);

  // State variables for temporarily retaining the original
  // values during editing mode (in case the user selects 'exit')
  const [tempTitle, setTempTitle] = useState(initTitle);
  const [tempDescription, setTempDescription] = useState(initDescription);
  const [tempKeywords, setTempKeywords] = useState(initKeywords);
  const classes = useStyles();

  const saveReminder = (
    title: string,
    description: string,
    keywords: string[],
  ): void => {
    chromeRuntimeSendMessage({
      operation: RequestOperation.SaveReminder,
      reminderId: reminderId,
      url: url,
      title: title,
      description: description,
      keywords: keywords,
    })
      .then((response) => {
        console.log(
          `saveReminder message sent, recieved response: ${response}`,
        );
        const newReminderId = parseInt(response as string);
        if (Number.isInteger(newReminderId)) {
          setReminderId(newReminderId);
        } else {
          console.log('Response was not an integer, returning null.');
        }
      })
      .catch((error) => console.error(error));
  };

  const deleteReminder = (): void => {
    if (reminderId === null) {
      console.error('Cannot delete reminder, the reminderId stored is null.');
      return;
    }
    chromeRuntimeSendMessage({
      operation: RequestOperation.DeleteReminder,
      reminderId: reminderId,
    })
      .then((response) =>
        console.log(
          `deleteReminder message sent, recieved response: ${response}`,
        ),
      )
      .catch((error) => console.error(error));
  };

  const handleCreateButton = async (): Promise<void> => {
    // There's at least a dozen ways this control flow could have been written
    // (e.g. by extending the await with .catch(() => null)) perhaps).
    // I think this one is the cleanest, even though I think I would prefer
    // the try..catch to only be wrapping the single await operation that
    // can fail - but I suppose it's a matter of taste.
    try {
      const pageMetadata = await getPageMetadata();
      setTitle(pageMetadata.title);
      setDescription(pageMetadata.description);
      setKeywords(pageMetadata.keywords);
    } catch {
      console.log('An error getting page metadata.');
      setTitle('');
      setDescription('');
      setKeywords([]);
    }
    setMode('editing');
  };

  const handleChangeTitle = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    setTitle(event.target.value);
  };

  const handleChangeDescription = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    setDescription(event.target.value);
  };

  const handleAddKeyword = (keyword: string): void => {
    if (keywords === undefined) {
      console.error('Unable to add keyword, keywords is undefined.');
    } else {
      setKeywords([...keywords, keyword.toLocaleLowerCase()]);
    }
  };

  const handleDeleteKeyword = (
    deletedKeyword: string,
    _index: number,
  ): void => {
    if (keywords === undefined) {
      console.error('Unable to delete keyword, keywords is undefined.');
    } else {
      setKeywords(keywords.filter((keyword) => keyword !== deletedKeyword));
    }
  };

  const handleSaveButton = (): void => {
    if (
      title === undefined ||
      description === undefined ||
      keywords === undefined
    ) {
      console.error(
        'Unable to save reminder, title, description, or keywords fields are undefined.',
      );
    } else {
      saveReminder(title, description, keywords);
      setTempTitle(title);
      setTempDescription(description);
      setTempKeywords(keywords);
      setMode('saved');
    }
  };

  const handleExitButton = (): void => {
    // Two cases: the user is exiting after attempting to create a reminder
    // (first branch), and the user is exiting after attempting to edit the
    // reminder (second branch).
    if (
      tempTitle === undefined ||
      tempDescription === undefined ||
      tempKeywords === undefined
    ) {
      setMode('empty');
    } else {
      setTitle(tempTitle);
      setDescription(tempDescription);
      setKeywords(tempKeywords);
      setMode('saved');
    }
  };

  const handleEditButton = (): void => {
    setMode('editing');
  };

  const handleDeleteButton = (): void => {
    deleteReminder();
    setMode('empty');
  };

  switch (mode) {
    case 'empty':
      return renderEmptyMode(handleCreateButton, classes);
    case 'editing':
      if (
        title === undefined ||
        description === undefined ||
        keywords === undefined
      ) {
        console.error(
          'Error: one or more of title, description, and keywords are undefined.',
        );
        return <Typography component="p">An error has occurred.</Typography>;
      } else {
        return renderEditingMode(
          title,
          description,
          keywords,
          handleChangeTitle,
          handleChangeDescription,
          handleAddKeyword,
          handleDeleteKeyword,
          handleSaveButton,
          handleExitButton,
          classes,
        );
      }
    case 'saved':
      if (
        title === undefined ||
        description === undefined ||
        keywords === undefined
      ) {
        console.error(
          'Error: one or more of title, description, and keywords are undefined.',
        );
        return <Typography component="p">An error has occurred.</Typography>;
      } else {
        return renderSavedMode(
          title,
          description,
          keywords,
          handleEditButton,
          handleDeleteButton,
          classes,
        );
      }
    default:
      console.error(`Mode '${mode}' not recognized.`);
      throw new UnreachableCaseError(mode);
  }
};

export default PopupContent;
