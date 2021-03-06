'use strict';

var _ = require('../util/helpers');
var extend = require('lodash/extend');
var Controller = require('../ui/Controller');
var Router = require('../ui/Router');
var omit = require('lodash/omit');
var DocumentationTOC = require('./DocumentationTOC');

// Substance is i18n ready, but by now we did not need it
// Thus, we configure I18n statically as opposed to loading
// language files for the current locale
var I18n = require('../ui/i18n');
I18n.instance.load(require('./i18n/en'));

function DocumentationController(parent, params) {
  Controller.call(this, parent, params);
  this.toc = new DocumentationTOC(this);

  this.handleApplicationKeyCombos = this.handleApplicationKeyCombos.bind(this);
  this.handleActions({
    'switchState': this.switchState,
    'extendState': this.extendState,
    'switchContext': this.switchContext,
    'tocEntrySelected': this.focusNode,
    'focusNode': this.focusNode
  });
}

DocumentationController.Prototype = function() {

  var _super = DocumentationController.super.prototype;

  this.focusNode = function(nodeId) {
    this.extendState({
      nodeId: nodeId
    });
  };

  this._panelPropsFromState = function() {
    var props = omit(this.state, 'contextId');
    props.doc = this.getDocument();
    return props;
  };

  this.setState = function(newState) {
    if (!newState.contextId) {
      newState = extend({}, this.getInitialState(), newState);
    }
    _super.setState.call(this, newState);
  };

  // HACK: For some reasons this.refs.contentPanel disappears after 2nd state update
  // so we work around by caching this.refs.contentPanel.refs.scrollPane
  this.didMount = function() {

    if (this.state.nodeId && this.state.contextId === 'toc') {
      this.refs.contentPanel.scrollTo(this.state.nodeId);
    }
  };

  this.didUpdateState = function() {
    if (this.state.nodeId && this.state.contextId === 'toc') {
      this.refs.contentPanel.scrollTo(this.state.nodeId);
    }
  };

  this.getInitialContext = function() {
    return {
      router: new Router(this)
    };
  };

  // Some things should go into controller
  this.getChildContext = function() {
    var childContext = Controller.prototype.getChildContext.call(this);

    return _.extend(childContext, {
      toc: this.toc,
      i18n: I18n.instance,
    });
  };

  this.getInitialState = function() {
    return {'contextId': 'toc'};
  };

  // Action handlers
  // ---------------

  // handles 'switch-state'
  this.switchState = function(newState, options) {
    options = options || {};
    this.setState(newState);
    if (options.restoreSelection) {
      this.restoreSelection();
    }
  };

  // handles 'switch-context'
  this.switchContext = function(contextId, options) {
    options = options || {};
    this.setState({ contextId: contextId });
    if (options.restoreSelection) {
      this.restoreSelection();
    }
  };

  this.jumpToNode = function(nodeId) {
    this.toc.emit("entry:selected", nodeId);
  };

  this.restoreSelection = function() {
    var surface = this.getSurface('body');
    surface.rerenderDomSelection();
  };

};

Controller.extend(DocumentationController);

module.exports = DocumentationController;