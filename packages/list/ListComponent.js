'use strict';

var Component = require('../../ui/Component');
var $$ = Component.$$;
var ListHtmlConverter = require('./ListHTMLConverter');
var ListItemComponent = require('./ListItemComponent');

var ListComponent = Component.extend({

  displayName: "ListComponent",

  initialize: function() {
    var node = this.props.node;
    node.connect(this, {'items:changed': this.onItemsChanged});
    node.connect(this, {'ordered:changed': this.onOrderChanged});

    this.handleActions({
      'rerenderList': this.rerender,
    });
  },

  dispose: function() {
	var doc = this.props.node.getDocument();
    doc.getEventProxy('path').disconnect(this.props.node);
    this.props.node.disconnect(this);
  },

  render: function() {
    var elem = ListHtmlConverter.render(this.props.node, {
      createListElement: function(list) {
        var tagName = list.ordered ? 'ol' : 'ul';
        return $$(tagName)
          .attr('data-id', list.id);
      },
      renderListItem: function(item) {
        return $$(ListItemComponent, {node: item});
      }
    });
    return $$('div').addClass('sc-list').append(elem);
  },

  onItemsChanged: function() {
    this.rerender();
  },

  onOrderChanged: function() {
    this.rerender();
  }

});

module.exports = ListComponent;
