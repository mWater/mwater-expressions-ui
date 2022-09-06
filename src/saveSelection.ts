// Gets the offset of a node within another node. Text nodes are counted a n where n is the length. Entering (or passing) an element is one offset. Exiting is 0.
 function getNodeOffset(start: any, dest: any) {
  var offset = 0

  var node = start
  var stack = []

  while (true) {
    if (node === dest) {
      return offset
    }

    // Go into children
    if (node.firstChild) {
      // Going into first one doesn't count
      if (node !== start) offset += 1
      stack.push(node)
      node = node.firstChild
    }
    // If can go to next sibling
    else if (stack.length > 0 && node.nextSibling) {
      // If text, count length (plus 1)
      if (node.nodeType === 3) offset += node.nodeValue.length + 1
      else offset += 1

      node = node.nextSibling
    } else {
      // If text, count length
      if (node.nodeType === 3) offset += node.nodeValue.length + 1
      else offset += 1

      // No children or siblings, move up stack
      while (true) {
        if (stack.length <= 1) return offset

        var next = stack.pop()

        // Go to sibling
        if (next.nextSibling) {
          node = next.nextSibling
          break
        }
      }
    }
  }
}

// Calculate the total offsets of a node
function calculateNodeOffset(node: any) {
  var offset = 0

  // If text, count length
  if (node.nodeType === 3) offset += node.nodeValue.length + 1
  else offset += 1

  if (node.childNodes) {
    for (var i = 0; i < node.childNodes.length; i++) {
      offset += calculateNodeOffset(node.childNodes[i])
    }
  }

  return offset
}

// Determine total offset length from returned offset from ranges
function totalOffsets(parentNode: any, offset: any) {
  if (parentNode.nodeType == 3) return offset

  if (parentNode.nodeType == 1) {
    var total = 0
    // Get child nodes
    for (var i = 0; i < offset; i++) {
      total += calculateNodeOffset(parentNode.childNodes[i])
    }
    return total
  }

  return 0
}

function getNodeAndOffsetAt(start: any, offset: any) {
  var node = start
  var stack = []

  while (true) {
    // If arrived
    if (offset <= 0) return { node: node, offset: 0 }

    // If will be within current text node
    if (node.nodeType == 3 && offset <= node.nodeValue.length)
      return { node: node, offset: Math.min(offset, node.nodeValue.length) }

    // Go into children (first one doesn't count)
    if (node.firstChild) {
      if (node !== start) offset -= 1
      stack.push(node)
      node = node.firstChild
    }
    // If can go to next sibling
    else if (stack.length > 0 && node.nextSibling) {
      // If text, count length
      if (node.nodeType === 3) offset -= node.nodeValue.length + 1
      else offset -= 1

      node = node.nextSibling
    } else {
      // No children or siblings, move up stack
      while (true) {
        if (stack.length <= 1) {
          // No more options, use current node
          if (node.nodeType == 3) return { node: node, offset: Math.min(offset, node.nodeValue.length) }
          else return { node: node, offset: 0 }
        }

        var next = stack.pop()

        // Go to sibling
        if (next.nextSibling) {
          // If text, count length
          if (node.nodeType === 3) offset -= node.nodeValue.length + 1
          else offset -= 1

          node = next.nextSibling
          break
        }
      }
    }
  }
}

export function save(containerEl: any) {
  // Get range
  var selection = window.getSelection()!
  if (selection.rangeCount > 0) {
    var range = selection.getRangeAt(0)
    return {
      start: getNodeOffset(containerEl, range.startContainer) + totalOffsets(range.startContainer, range.startOffset),
      end: getNodeOffset(containerEl, range.endContainer) + totalOffsets(range.endContainer, range.endOffset)
    }
  } else return null
}

export function restore(containerEl: any, savedSel: any) {
  if (!savedSel) return

  var range = document.createRange()

  var startNodeOffset, endNodeOffset
  startNodeOffset = getNodeAndOffsetAt(containerEl, savedSel.start)
  endNodeOffset = getNodeAndOffsetAt(containerEl, savedSel.end)

  range.setStart(startNodeOffset.node, startNodeOffset.offset)
  range.setEnd(endNodeOffset.node, endNodeOffset.offset)

  var sel = window.getSelection()!
  sel.removeAllRanges()
  sel.addRange(range)
}
