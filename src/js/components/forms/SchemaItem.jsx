'use strict';

import React from 'react';
import tv4 from 'tv4';

let SchemaItem = React.createClass({

  propTypes: {
    form: React.PropTypes.object,
    name: React.PropTypes.string,
    path: React.PropTypes.string,
    schema: React.PropTypes.object,
    value: React.PropTypes.any,
    parentValue: React.PropTypes.object,
    depth: React.PropTypes.number,
    cols: React.PropTypes.number,
    onChange: React.PropTypes.func,
    error: React.PropTypes.object,
    errors: React.PropTypes.array,
  },

  getInitialState() {
    return {};
  },

  componentWillMount() {
    this.state.error = this.props.error;
  },

  componentWillReceiveProps(props) {
    this.state.error = props.error;
  },

  render() {
    return this._makeItem(this.props.prop);
  },

  /**
   * Make schema item
   */
  _makeItem() {
    let schema = this.props.schema;
    switch (schema.type) {
      case 'string':
        return this._makeString();
      case 'number':
        return this._makeNumber();
      case 'object':
        return this._makeObject();
      case 'array':
        return this._makeArray();
      default:
        throw "Unsupported schema type " + schema.type;
    }
  },

  _makeString() {
    let SchemaText = require('./SchemaText.jsx');
    return <SchemaText {...this.props} onChange={this._didChange} error={this.state.error} />;
  },

  _makeNumber() {
    let SchemaNumber = require('./SchemaNumber.jsx');
    return <SchemaNumber {...this.props} onChange={this._didChange} error={this.state.error} />;
  },

  _makeObject() {
    let SchemaObject = require('./SchemaObject.jsx');
    return <SchemaObject {...this.props} />;
  },

  _makeArray() {
    return <div>NOT YET IMPLEMENTED</div>;
  },

  _validate() {
    if (tv4.validate(this.state.value, this.props.schema)) {
      this.setState({ error: null });
    } else {
      this.setState({ error: tv4.error });
    }
  },

  _didChange(value) {
    let { name, parentValue } = this.props;
    parentValue[name] = value;
    this.state.value = value;
    this._validate();
  },

});

export default SchemaItem;
