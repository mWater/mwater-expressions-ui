import { Column, Schema, DataSource, Section } from 'mwater-expressions'
import React, { ReactNode } from 'react'

export default class PropertyListComponent extends React.Component<{
  /** # array of properties */
  properties: (Column | Section)[]
  
  onChange: (properties: (Column | Section)[]) => void

  /** schema of all data. Needed for idType and expr features */
  schema?: Schema
  
  /** data source. Needed for expr feature */
  dataSource?: DataSource
  
  /** Table that properties are of. Not required if table feature is on */
  table?: string
  
  /** Ids of tables to include when using table feature */
  tableIds?: string[]
  
  /** Function to generate the ID of the property */
  propertyIdGenerator?: () => string

  // /** List of all property ids to prevent duplicates. Do not set directly! */
  // allPropertyIds?: arrayOf(PropTypes.string.isRequired)  
  
  /* Array of features to be enabled apart from the defaults. Features are:
  * sql: include raw SQL editor
  * idField: show id field for properties
  * uniqueCode: allow uniqueCode flag on properties
  * idType: allow id-type fields
  * joinType: allow join-type fields
  * code: show code of properties
  * expr: allow fields with expr set
  * conditionExpr: allow fields to set a condition expression if they are conditionally displayed
  * section: allow adding sections
  * table: each property contains table
  * unique: allow unique flag on properties
  */
  features?: ("sql" | "idField" | "uniqueCode" | "idType" | "joinType" | "code" | "expr" | "conditionExpr" | "section" | "table" | "unique")[]

  /** function that returns the UI of the roles, called with a single argument, the array containing roles */
  createRoleDisplayElem?: (roles: any[]) => ReactNode
  
  /** function that returns the UI of the roles for editing, gets passed two arguments
   * 1. the array containing roles
   * 2. The callback function that should be called when the roles change */
  createRoleEditElem?: (roles: any[], onChange: (roles: any[]) => void) => ReactNode
}> {}
