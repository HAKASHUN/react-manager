'use strict';

import React from 'react';
import Router from 'react-router';
import mui from 'material-ui';
import _ from 'lodash';

import AppSubBar from './AppSubBar.jsx';
import FloatingMenu from './FloatingMenu.jsx';
import EndpointStore from '../stores/EndpointStore';
import EndpointAction from '../actions/EndpointAction';
import RowMenu from '../components/RowMenu.jsx';
import SchemaForm from '../components/forms/SchemaForm.jsx';
import i18n from '../i18n';

let { Dialog, FontIcon } = mui;

export default React.createClass({

  mixins: [Router.Navigation],

  getInitialState() {
    return {
      endpoints: EndpointStore.state.endpoints
    };
  },

  componentWillMount() {
    this.dialogCount = 0;
  },

  componentDidMount() {
    EndpointStore.addListener(this._setState);
  },

  componentDidUnmount() {
    EndpointStore.removeListener(this._setState);
  },

  getDialogKey() {
    return "dialog"+(++this.dialogCount);
  },

  schema: {
    type: 'object',
    properties: {
      name: { type: 'string', cols: 4 },
      url: { type: 'string', format: 'url', cols: 8 },
    },
    required: ['name','url'],
  },

  render() {

    let activeEndpoint = EndpointStore.getActiveEndpoint() || {};

    let menuItems = _.map(this.state.endpoints, endpoint => {
      // Get active mark
      let selected = activeEndpoint.url === endpoint.url ?
        <FontIcon className="md-done md-2x" /> : <div />;

      let controlItems = [
        { payload: endpoint, text: 'Edit', iconClassName: 'md-edit md-15x' },
        { payload: endpoint, text: 'Delete', iconClassName: 'md-delete md-15x' },
      ];

      return (
        <div className="endpoints__items__item" key={endpoint.name} onClick={this._didSelect}>
          <div className="endpoints__items__item__mark">{selected}</div>
          <div className="endpoints__items__item__name">{endpoint.name}</div>
          <div className="endpoints__items__item__url">{endpoint.url}</div>
          <RowMenu items={controlItems} onClickItem={this._didClickRowMenu} />
        </div>
      );
    });

    return (
      <div id="main">
        <AppSubBar
          className="mui-dark-theme"
          title="Endpoints"
          zDepth={1}
        />
        <FloatingMenu position="top" onClickAdd={this._didClickAdd} ref="floatingMenu" />
        <div className="endpoints">
          <div className="endpoints__header">
            <div className="endpoints__header__name">Name</div>
            <div className="endpoints__header__url">URL</div>
            <div className="endpoints__header__menu"></div>
          </div>
          <div className="endpoints__items">
            {menuItems}
          </div>
        </div>
        <div id="dialog"></div>
      </div>
    );
  },

  _setState(state) {
    if (this._dialog) {
      this._dialog.dismiss();
      this._dialog = null;
    }
    this.setState({
      endpoints: state.endpoints
    });
  },

  _didClickAdd() {
    this._dialog = React.render(
      <Dialog key={this.getDialogKey()} title={i18n('Add an endpoint')} onDismiss={this._didDismissDialog}>
        <SchemaForm
          schema={this.schema}
          value={{}}
          onSubmit={this._didSubmitAdd}
          onCancel={this._didCancel}
        />
      </Dialog>, document.getElementById("dialog"));
    this._dialog.show();
    this.refs.floatingMenu.rotateIcon(true);
  },

  _didSubmitAdd(endpoint) {
    EndpointAction.addEndpoint(endpoint);
  },

  _didSubmitEdit(endpoint) {
    EndpointAction.updateEndpoint(endpoint);
  },

  _didCancel() {
    this._dialog.dismiss();
    React.unmountComponentAtNode(this._dialog.getDOMNode());
    this._dialog = null;
  },

  _didDismissDialog() {
    this.refs.floatingMenu.rotateIcon(false);
  },

  _didSelect(e) {
    console.log("DID SELECT", e);
  },

  _didClickRowMenu(e, i, item) {
    if (i === 0) {
      // Edit
      this._dialog = React.render(
        <Dialog key={this.getDialogKey()} title={i18n('Edit an endpoint')} onDismiss={this._didDismissDialog}>
          <SchemaForm
            schema={this.schema}
            value={item.payload}
            onSubmit={this._didSubmitEdit}
            onCancel={this._didCancel}
          />
        </Dialog>, document.getElementById("dialog"));
      this._dialog.show();
    }
    if (i === 1) {
      // Remove
      EndpointAction.removeEndpoint(item.payload);
    }
  },

});

