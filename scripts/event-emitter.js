var H5P = H5P || {};

H5P.SingleChoiceEventEmitter = (function () {

  function EventEmitter() {
    console.log('EventEmitter constructor');
    this.listeners = {};
  }

  EventEmitter.prototype.on = function(type, listener) {
    if (typeof listener === 'function') {
      if (this.listeners[type] === undefined) {
        this.listeners[type] = [];
      }
      this.listeners[type].push(listener);
    }
  };

  EventEmitter.prototype.off = function (type, listener) {
    if (this.listeners[type] !== undefined) {
      var removeIndex = listeners[type].indexOf(listener);
      if (removeIndex) {
        listeners[type].splice(removeIndex, 1);
      }
    }
  };

  EventEmitter.prototype.trigger = function (type, event) {
    if (event === null) {
      event = {};
    }

    if (this.listeners[type] !== undefined) {
      for (var i = 0; i < this.listeners[type].length; i++) {
        this.listeners[type][i](event);
      }
    }
  };

  return EventEmitter;
})();
