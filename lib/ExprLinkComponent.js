var ExprLinkComponent, ExprUtils, H, LinkComponent, LiteralExprStringComponent, PropTypes, R, React, SelectExprModalComponent, _,
  boundMethodCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } };

PropTypes = require('prop-types');

_ = require('lodash');

React = require('react');

R = React.createElement;

H = React.DOM;

SelectExprModalComponent = require('./SelectExprModalComponent');

LinkComponent = require('./LinkComponent');

ExprUtils = require("mwater-expressions").ExprUtils;

LiteralExprStringComponent = require('./LiteralExprStringComponent');

// Allows user to select an expression or display an existing one. Shows as a link
module.exports = ExprLinkComponent = (function() {
  class ExprLinkComponent extends React.Component {
    constructor(props) {
      super(props);
      // Opens the editor modal
      this.showModal = this.showModal.bind(this);
      this.handleClick = this.handleClick.bind(this);
      // Display placeholder if no value
      this.renderNone = this.renderNone.bind(this);
      
      // Display summary if field
      this.renderField = this.renderField.bind(this);
      this.renderLiteral = this.renderLiteral.bind(this);
      this.state = {
        modalVisible: false
      };
    }

    showModal() {
      boundMethodCheck(this, ExprLinkComponent);
      return this.setState({
        modalVisible: true
      });
    }

    handleClick() {
      boundMethodCheck(this, ExprLinkComponent);
      return this.setState({
        modalVisible: true
      });
    }

    renderNone() {
      boundMethodCheck(this, ExprLinkComponent);
      return H.a({
        onClick: this.handleClick,
        style: {
          cursor: "pointer",
          fontStyle: "italic",
          color: "#478"
        }
      }, this.props.placeholder);
    }

    renderField() {
      var exprUtils;
      boundMethodCheck(this, ExprLinkComponent);
      exprUtils = new ExprUtils(this.props.schema);
      return R(LinkComponent, {
        dropdownItems: [
          {
            id: "edit",
            name: [
              H.i({
                className: "fa fa-pencil text-muted"
              }),
              " Edit"
            ]
          },
          {
            id: "remove",
            name: [
              H.i({
                className: "fa fa-remove text-muted"
              }),
              " Remove"
            ]
          }
        ],
        onDropdownItemClicked: ((id) => {
          if (id === "edit") {
            return this.setState({
              modalVisible: true
            });
          } else {
            return this.props.onChange(null);
          }
        })
      }, exprUtils.summarizeExpr(this.props.value));
    }

    renderLiteral() {
      boundMethodCheck(this, ExprLinkComponent);
      return R(LinkComponent, {
        dropdownItems: [
          {
            id: "edit",
            name: [
              H.i({
                className: "fa fa-pencil text-muted"
              }),
              " Edit"
            ]
          },
          {
            id: "remove",
            name: [
              H.i({
                className: "fa fa-remove text-muted"
              }),
              " Remove"
            ]
          }
        ],
        onDropdownItemClicked: ((id) => {
          if (id === "edit") {
            return this.setState({
              modalVisible: true
            });
          } else {
            return this.props.onChange(null);
          }
        })
      }, R(LiteralExprStringComponent, {
        schema: this.props.schema,
        dataSource: this.props.dataSource,
        value: this.props.value,
        enumValues: this.props.enumValues
      }));
    }

    render() {
      var initialMode, ref;
      initialMode = this.props.initialMode;
      // Override if already has value
      if (this.props.value) {
        if ((ref = this.props.value.type) === "field" || ref === "scalar") {
          initialMode = "field";
        } else if (this.props.value.type === "literal") {
          initialMode = "literal";
        } else {
          initialMode = "formula";
        }
      }
      return H.div(null, this.state.modalVisible ? R(SelectExprModalComponent, {
        schema: this.props.schema,
        dataSource: this.props.dataSource,
        table: this.props.table,
        value: this.props.value,
        types: this.props.types,
        enumValues: this.props.enumValues,
        idTable: this.props.idTable,
        initialMode: initialMode,
        allowCase: this.props.allowCase,
        aggrStatuses: this.props.aggrStatuses,
        refExpr: this.props.refExpr,
        onCancel: () => {
          return this.setState({
            modalVisible: false
          });
        },
        onSelect: (expr) => {
          this.setState({
            modalVisible: false
          });
          return this.props.onChange(expr);
        }
      }) : void 0, !this.props.value ? this.renderNone() : this.props.value.type === "field" ? this.renderField() : this.props.value.type === "literal" ? this.renderLiteral() : void 0);
    }

  };

  ExprLinkComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired, // Data source to use to get values
    table: PropTypes.string.isRequired, // Current table
    value: PropTypes.object, // Current expression value
    onChange: PropTypes.func, // Called with new expression
    
    // Props to narrow down choices
    types: PropTypes.array, // If specified, the types (value type) of expression required. e.g. ["boolean"]
    enumValues: PropTypes.array, // Array of { id:, name: } of enum values that can be selected. Only when type = "enum"
    idTable: PropTypes.string, // If specified the table from which id-type expressions must come
    initialMode: PropTypes.oneOf([
      'field',
      'formula',
      'literal' // Initial mode. Default field
    ]),
    allowCase: PropTypes.bool, // Allow case statements
    aggrStatuses: PropTypes.array, // statuses of aggregation to allow. list of "individual", "literal", "aggregate". Default: ["individual", "literal"]
    refExpr: PropTypes.object, // expression to get values for (used for literals). This is primarily for text fields to allow easy selecting of literal values
    placeholder: PropTypes.string // Placeholder text (default Select...)
  };

  ExprLinkComponent.contextTypes = {
    locale: PropTypes.string // e.g. "en"
  };

  ExprLinkComponent.defaultProps = {
    placeholder: "Select...",
    initialMode: "field",
    aggrStatuses: ['individual', 'literal']
  };

  return ExprLinkComponent;

}).call(this);
