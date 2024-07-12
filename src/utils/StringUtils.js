// Function to get initials given a name
export function getInitials(name) {
  const names = name?.split(' ')?.filter((name) => name.trim() !== '');
  const initials = names?.map((name) => name.charAt(0).toUpperCase());
  return initials?.join('')?.slice(0, 2); // NOTE: Only get the first two letters
}

// Function to process steps from the chatbot responses, e.g., [1], [2], [3]
export function processStep(text) {
  let lastStep = 0;
  const text_ = text?.replaceAll(/\[(\d+)\]/g, (match, number) => {
    lastStep = Math.max(lastStep, parseInt(number, 10));
    return ''; // Return the original match to preserve it in the text
  });

  return { step: lastStep, text: text_ };
}

// Function to process suggestions from the chatbot responses, e.g., %shoes%, %sneakers%
export function processSuggestions(text) {
  const suggestions = [];
  const text_ = text.replace(/%([^%]+)%/g, (match, word) => {
    suggestions.push(word);
    return word; // Return the original match to preserve it in the text
  });

  return { suggestions, text: text_ };
}

// Function that replaces single newlines with double newlines
export const formatNewLines = (text) => {
  return text?.replaceAll('/(?<!\n)\n(?!\n)/g', '\n\n');
};

// Function that formats new lines for Markdown -- see https://stackoverflow.com/questions/69026492/adding-multiple-line-break-in-react-markdown
export const formatMarkdownNewLines = (text) => {
  return text?.replaceAll('\n', '&nbsp; \n\n');
};
