_ = require 'lodash'
ExprUtils = require("mwater-expressions").ExprUtils

# Builds a tree for selecting table + joins + expr of a scalar expression
# Organizes columns, and follows joins
module.exports = class ScalarExprTreeBuilder
  constructor: (schema, locale) ->
    @schema = schema
    @locale = locale
    @exprUtils = new ExprUtils(@schema)

  # Returns array of 
  # { 
  #   name: name of item, 
  #   desc: description of item, 
  #   value: { table, joins, expr } - partial scalar expression, null if not selectable node
  #   children: function which returns children nodes
  #   initiallyOpen: true if children should display initially
  #   childrenType: "section", "join"
  # }
  # options are:
  #  table: starting table
  #  types: types to limit to 
  #  idTable: id type table to limit to
  #  includeAggr: to include aggregate expressions, including an count() option that has name that is "Number of ..." at first table level
  #  initialValue: initial value to flesh out TODO REMOVE
  #  filter: filter regex
  getTree: (options = {}) ->
    return @createTableChildNodes({
      startTable: options.table
      table: options.table
      joins: []
      types: options.types
      idTable: options.idTable
      includeAggr: options.includeAggr
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
  # includeAggr: to include an count() option that has and name that is "Number of ..."
  # initialValue: initial value to flesh out TODO REMOVE
  # filter: filter regex
  # depth: current depth. First level is 0
  createTableChildNodes: (options) ->
    nodes = []
    # Create self (id) type if id type allowed and idTable matches
    if not options.includeAggr and options.idTable == options.table and (not options.types or "id" in options.types)
      node = {
        name: ExprUtils.localizeString(@schema.getTable(options.table).name, @locale)
        desc: ExprUtils.localizeString(@schema.getTable(options.table).desc, @locale) 
        value: { table: options.startTable, joins: options.joins, expr: { type: "id", table: options.table } }
      }
      if not options.filter or node.name.match(options.filter)
        nodes.push(node)

    table = @schema.getTable(options.table)
    nodes = nodes.concat(@createNodes(table.contents, options))

    # TODO keep?
    # # Add unique id if not including count
    # if not options.includeAggr and not options.types or "id" in options.types
    #   nodes.push({ name: "Unique ID", value: { table: options.table, joins: options.joins, expr: { type: "id", table: options.table } } })

    # Create count node if any joins
    if options.includeAggr
      node = {
        name: "Number of #{ExprUtils.localizeString(@schema.getTable(options.table).name, @locale)}"
        value: { table: options.startTable, joins: options.joins, expr: { type: "op", op: "count", table: options.table, exprs: [] }}
      }
      if not options.filter or node.name.match(options.filter)
        nodes.push(node)

    return nodes

  createNodes: (contents, options) ->
    nodes = []

    for item in contents
      do (item) =>
        if item.type == "section"
          # Avoid if deprecated
          if not item.deprecated
            # Determine if matches
            name = ExprUtils.localizeString(item.name, @locale)
            desc = ExprUtils.localizeString(item.desc, @locale)

            matches = not options.filter or name.match(options.filter) or (desc and desc.match(options.filter))

            childOptions = _.extend({}, options)

            # Strip filter if matches to allow all sub-items
            if matches
              childOptions.filter = null

            # Increment depth
            childOptions.depth += 1

            node = {
              name: name
              desc: desc
              children: =>
                @createNodes(item.contents, childOptions)
              childrenType: "section"
            }

            # If empty, do not show
            if node.children().length > 0
              # # If depth is 0 and searching and doesn't match, leave open
              # if options.depth < 1 and options.filter and not matches
              node.initiallyOpen = true

              if not options.filter
                nodes.push(node)
              else if matches
                nodes.push(node)
              else if options.depth < 1 and node.children().length > 0
                nodes.push(node)
        else
          # Gracefully handle deprecated columns
          if not item.deprecated
            node = @createColumnNode(_.extend(options, column: item))
            if node
              nodes.push(node)

    return nodes

  # Include column, startTable, joins, initialValue, table, types
  createColumnNode: (options) ->
    column = options.column

    node = { 
      name: ExprUtils.localizeString(column.name, @locale)
      desc: ExprUtils.localizeString(column.desc, @locale)
    }

    # Determine if matches
    matches = not options.filter or node.name.match(options.filter) or (node.desc and node.desc.match(options.filter))

    # If join, add children
    if column.type == "join"
      # Add column to joins
      joins = options.joins.slice()
      joins.push(column.id)
      initVal = options.initialValue
      
      # Single joins have a value of id (if for correct table)
      if column.join.type in ['n-1', '1-1'] and (not options.types or 'id' in options.types) and (not options.idTable or column.join.toTable == options.idTable)
        node.value = { table: options.startTable, joins: options.joins, expr: { type: "field", table: options.table, column: column.id } }
      # Multiple joins have a value of id[] (if for correct table)
      if column.join.type in ['n-n', '1-n'] and (not options.types or 'id[]' in options.types) and (not options.idTable or column.join.toTable == options.idTable)
        node.value = { table: options.startTable, joins: options.joins, expr: { type: "field", table: options.table, column: column.id } }

      node.children = =>
        # Determine if to include count. True if aggregated
        includeAggr = @exprUtils.isMultipleJoins(options.startTable, joins)

        # Determine whether to include filter. If matches, do not include filter so that subtree will show
        if not matches
          filter = options.filter
        else 
          filter = null

        return @createTableChildNodes({
          startTable: options.startTable
          table: column.join.toTable
          joins: joins
          types: options.types
          includeAggr: includeAggr
          initialValue: initVal
          filter: filter
          depth: options.depth + 1
        })
        
      # Load children (recursively) if selected node is in this tree
      if initVal and initVal.joins and _.isEqual(initVal.joins.slice(0, joins.length), joins)
        node.initiallyOpen = true

      # If depth is 0 and searching, leave open
      if options.depth < 1 and options.filter and not matches
        node.initiallyOpen = true

      node.childrenType = "join"

      if not options.filter
        return node
      else if matches
        return node
      else if options.depth < 1 and node.children().length > 0
        return node
      return null
    else
      if not matches
        return

      fieldExpr = { type: "field", table: options.table, column: column.id }

      # Skip if aggregate and not aggr allowed
      if not @exprUtils.isMultipleJoins(options.startTable, options.joins) and @exprUtils.getExprAggrStatus(fieldExpr) == "aggregate" and not options.includeAggr
        return

      if options.types 
        # If aggregated
        if @exprUtils.isMultipleJoins(options.startTable, options.joins)
          # Get types that this can become through aggregation
          types = @exprUtils.getAggrTypes(fieldExpr)
          # Skip if wrong type
          if _.intersection(types, options.types).length == 0
            return
        else
          if @exprUtils.getExprType(fieldExpr) not in options.types
            return 

      node.value = { table: options.startTable, joins: options.joins, expr: fieldExpr }

    return node
