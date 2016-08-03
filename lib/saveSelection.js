// Gets the offset of a node within another node. Text nodes are counted a n where n is the length. Entering (or passing) an element is one offset. Exiting is 0.
getNodeOffset = function(start, dest) {
  var offset = 0;

  var node = start;
  var stack = [];

  while (true) {
    if (node === dest) {
      return offset;
    }

    // Go into children
    if (node.firstChild) {
      offset += 1;
      stack.push(node);
      node = node.firstChild;
    }
    // If can go to next sibling
    else if (stack.length > 0 && node.nextSibling) {
      // If text, count length (plus 1)
      if (node.nodeType === 3)
        offset += node.nodeValue.length + 1;
      else
        offset += 1;

      node = node.nextSibling;
    }
    else {
      // If text, count length
      if (node.nodeType === 3)
        offset += node.nodeValue.length + 1;
      else
        offset += 1;

      // No children or siblings, move up stack
      while (true) {
        if (stack.length <= 1)
          return offset;

        node = stack.pop();

        // Go to sibling
        if (node.nextSibling) {
          node = node.nextSibling;
          break;
        }
      }
    }
  }
}

getNodeAndOffsetAt = function(start, offset) {
  var node = start;
  var stack = [];

  while (true) {
    // If arrived
    if (offset <= 0)
      return { node: node, offset: offset };

    // If will be within current text node
    if (node.nodeType == 3 && (offset <= node.nodeValue.length))
      return { node: node, offset: offset };

    // Go into children
    if (node.firstChild) {
      offset -= 1;
      stack.push(node);
      node = node.firstChild;
    }
    // If can go to next sibling
    else if (stack.length > 0 && node.nextSibling) {
      // If text, count length
      if (node.nodeType === 3)
        offset -= node.nodeValue.length + 1;
      else
        offset -= 1;

      node = node.nextSibling;
    }
    else {
      // If text, count length
      if (node.nodeType === 3)
        offset -= node.nodeValue.length + 1;
      else
        offset -= 1;

      // No children or siblings, move up stack
      while (true) {
        if (stack.length <= 1)
          return { node: node, offset: offset };

        node = stack.pop();

        // Go to sibling
        if (node.nextSibling) {
          node = node.nextSibling;
          break;
        }
      }
    }
  }
}

exports.save = function(containerEl) {
  // Get range
  var range = window.getSelection().getRangeAt(0);
  return { start: getNodeOffset(containerEl, range.startContainer) + range.startOffset, end: getNodeOffset(containerEl, range.endContainer) + range.endOffset };
}
 
exports.restore = function(containerEl, savedSel) {
  range = document.createRange();

  var startNodeOffset, endNodeOffset;
  startNodeOffset = getNodeAndOffsetAt(containerEl, savedSel.start);
  endNodeOffset = getNodeAndOffsetAt(containerEl, savedSel.end);

  range.setStart(startNodeOffset.node, startNodeOffset.offset);
  range.setEnd(endNodeOffset.node, endNodeOffset.offset);

  var sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}

