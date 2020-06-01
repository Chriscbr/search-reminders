import Snowball from 'snowball';

export class UnreachableCaseError extends Error {
  constructor(val: never) {
    super(`Unreachable case: ${val}`);
  }
}

/**
 * Obtains a list of words stems given a list of words.
 * @param words an array of words
 */
export const collectWordStems = (words: string[]): string[] => {
  const stemmer = new Snowball('English');
  const stems: string[] = [];
  words.forEach((word) => {
    // We want to avoid performing word stemming on ill-defined words
    // as well as multi-word phrases
    if (word === undefined || word === '' || word.includes(' ')) return;
    stemmer.setCurrent(word);
    stemmer.stem();
    const stem = stemmer.getCurrent();
    if (stem !== undefined && stem !== '') stems.push(stem);
  });
  return stems;
};
