_ = require 'lodash'
ExprUtils = require("mwater-expressions").ExprUtils

# Builds a tree for selecting table + joins + expr of a scalar expression
# Organizes columns, and follows joins
module.exports = class ScalarExprTreeBuilder
  constructor: (schema, locale) ->
    @schema = schema
    @locale = locale

  # Returns array of 
  # { 
  #   name: name of item, 
  #   desc: description of item, 
  #   value: { table, joins, expr } - partial scalar expression, null if not selectable node
  #   children: function which returns children nodes
  #   initiallyOpen: true if children should display initially
  # }
  # options are:
  #  table: starting table
  #  types: types to limit to 
  #  includeCount: to include an count (null) option that has null expr and name that is "Number of ..." at first table level
  #  initialValue: initial value to flesh out TODO REMOVE
  #  filter: filter regex
  getTree: (options = {}) ->
    return @createTableChildNodes({
      startTable: options.table
      table: options.table
      joins: []
      types: options.types
      idTable: options.idTable
      includeCount: options.includeCount
      initialValue: options.initialValue
      filter: options.filter
      depth: 0
      })

  # Options:
  # startTable: table id that started from
  # table: table id to get nodes for
  # joins: joins for child nodes
  # types: types to limit to 
  # idTable: table to limit to for id type
  # includeCount: to include an count (null) option that has null expr and name that is "Number of ..."
  # initialValue: initial value to flesh out TODO REMOVE
  # filter: filter regex
  # depth: current depth. First level is 0
  createTableChildNodes: (options) ->
    nodes = []
    # Create count node if any joins
    if options.includeCount
      node = {
        name: "Number of #{ExprUtils.localizeString(@schema.getTable(options.table).name, @locale)}"
        value: { table: options.startTable, joins: options.joins, expr: { type: "id", table: options.table } }
      }
      if not options.filter or node.name.match(options.filter)
        nodes.push(node)

    table = @schema.getTable(options.table)
    nodes = nodes.concat(@createNodes(table.contents, options))
    return nodes

  createNodes: (contents, options) ->
    nodes = []

    for item in contents
      do (item) =>
        if item.type == "section"
          # Determine if matches
          name = ExprUtils.localizeString(item.name, @locale)

          matches = not options.filter or name.match(options.filter)

          childOptions = _.extend({}, options)

          # Strip filter if matches to allow all sub-items
          if matches
            childOptions.filter = null

          # Increment depth
          childOptions.depth += 1

          node = {
            name: name
            children: =>
              @createNodes(item.contents, childOptions)
          }

          # If depth is 0 and searching, leave open
          if options.depth == 0 and options.filter
            node.initiallyOpen = true

          # Add if non-empty
          if node.children().length > 0
            nodes.push(node)
        else
          column = @schema.getColumn(options.table, item.id)

          # Gracefully handle missing columns
          if column
            node = @createColumnNode(_.extend(options, column: column))
            if node
              nodes.push(node)

    return nodes

  # Include column, startTable, joins, initialValue, table, types
  createColumnNode: (options) ->
    exprUtils = new ExprUtils(@schema)

    column = options.column

    node = { 
      name: ExprUtils.localizeString(column.name, @locale)
      desc: ExprUtils.localizeString(column.desc, @locale)
    }

    # Determine if matches
    matches = not options.filter or node.name.match(options.filter)

    # If join, add children
    if column.type == "join"
      # Add column to joins
      joins = options.joins.slice()
      joins.push(column.id)
      initVal = options.initialValue
      
      # Single joins have a value of id (if for correct table)
      if column.join.type in ['n-1', '1-1'] and (not options.types or 'id' in options.types) and (not options.idTable or column.join.toTable == options.idTable)
        node.value = { table: options.startTable, joins: joins, expr: { type: "id", table: column.join.toTable } }

      node.children = =>
        # Determine if to include count. True if aggregated
        includeCount = exprUtils.isMultipleJoins(options.startTable, joins)

        # Determine whether to include filter. If matches, do not include filter so that subtree will show
        if not matches
          filter = options.filter

        return @createTableChildNodes({
          startTable: options.startTable
          table: column.join.toTable
          joins: joins
          types: options.types
          includeCount: includeCount
          initialValue: initVal
          filter: filter
          depth: options.depth + 1
        })
        
      # Load children (recursively) if selected node is in this tree
      if initVal and initVal.joins and _.isEqual(initVal.joins.slice(0, joins.length), joins)
        node.initiallyOpen = true

      # If depth is 0 and searching, leave open
      if options.depth == 0 and options.filter
        node.initiallyOpen = true
    else
      if not matches
        return

      fieldExpr = { type: "field", table: options.table, column: column.id }
      if options.types 
        # If aggregated
        if exprUtils.isMultipleJoins(options.startTable, options.joins)
          # Get types that this can become through aggregation
          types = exprUtils.getAggrTypes(fieldExpr)
          # Skip if wrong type
          if _.intersection(types, options.types).length == 0
            return
        else
          # Skip if wrong type
          if column.type not in options.types
            return 

      node.value = { table: options.startTable, joins: options.joins, expr: fieldExpr }

    return node
