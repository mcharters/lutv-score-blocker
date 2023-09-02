// create a regex that matches scores in the format of 1-0
var scoreRegex = /\d+-\d+/;
// a regex that matches two names followed by a colon
var quoteRegex = /^([A-Za-z]+ [A-Za-z]+):(.*)/;

var whitelist = [
  'Match Preview',
  'Starts in',
  'Extended Highlights',
  'Match Action',
];

var blacklist = [
  'win',
  'victory',
  'triumph',
  'success',
  'conquest',
  'achievement',
  'gain',
  'loss',
  'lose',
  'lost',
  'defeat',
  'failure',
  'surrender',
  'beating',
  'rout',
  'setback',
  'whipping',
  'drubbing',
  'thrashing',
  'collapse',
  'licking',
  'upset',
  'trouncing',
  'flop',
  'draw',
  'tie',
  'deadlock',
  'stalemate',
  'standoff',
];

let regexs = new Map();
for (let word of blacklist) {
  // We want a global, case-insensitive replacement.
  // @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp
  regexs.set(word, new RegExp('\\b' + word + '\\b', 'gi'));
}

/**
 * Substitutes emojis into text nodes.
 * If the node contains more than just text (ex: it has child nodes),
 * call replaceText() on each of its children.
 *
 * @param  {Node} node    - The target DOM Node.
 * @return {void}         - Note: the emoji substitution is done inline.
 */
function replaceText (node) {
  // Setting textContent on a node removes all of its children and replaces
  // them with a single text node. Since we don't want to alter the DOM aside
  // from substituting text, we only substitute on single text nodes.
  // @see https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent
  if (node.nodeType === Node.TEXT_NODE) {
    // This node only contains text.
    // @see https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType.

    // Skip textarea nodes due to the potential for accidental submission
    // of substituted emoji where none was intended.
    if (node.parentNode &&
        node.parentNode.nodeName === 'TEXTAREA') {
      return;
    }

    // remove scores and quotes from content
    var content = node.textContent;

    // see if the content matches quoteRegex and replace unless it's in the whitelist
    if (quoteRegex.test(content)) {
      var match = quoteRegex.exec(content);
      console.log(match[1]);
      if (whitelist.indexOf(match[1]) === -1) {
          content = content.replace(quoteRegex, '$1: 🙊');
      }
    }
    content = content.replace(scoreRegex, '🙈');

    // replace all the words in the blacklist
    for (let [_, regex] of regexs) {
      content = content.replace(regex, '🙉');
    }

    node.textContent = content;
  }
  else {
    // This node contains more than just text, call replaceText() on each
    // of its children.
    for (let i = 0; i < node.childNodes.length; i++) {
      replaceText(node.childNodes[i]);
    }    
  }
}

// Start the recursion from the body tag.
replaceText(document.body);

// Now monitor the DOM for additions and substitute emoji into new nodes.
// @see https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver.
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.addedNodes && mutation.addedNodes.length > 0) {
      // This DOM change was new nodes being added. Run our substitution
      // algorithm on each newly added node.
      for (let i = 0; i < mutation.addedNodes.length; i++) {
        const newNode = mutation.addedNodes[i];
        replaceText(newNode);
      }
    }
  });
});
observer.observe(document.body, {
  childList: true,
  subtree: true
});