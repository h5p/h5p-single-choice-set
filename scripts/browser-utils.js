var H5P = H5P || {};

H5P.BrowserUtils = (function ($) {

  BrowserUtils = {};

  BrowserUtils.transitionEndEventNames = {
    'WebkitTransition': 'webkitTransitionEnd',
    'transition':       'transitionend',
    'MozTransition':    'transitionend',
    'OTransition':      'oTransitionEnd',
    'msTransition':     'MSTransitionEnd'
  };

  BrowserUtils.cache = [];

  BrowserUtils.getVendorPropertyName = function (prop) {

    if (BrowserUtils.cache[prop] !== undefined) {
      return BrowserUtils.cache[prop];
    }

    var div = document.createElement('div');

    // Handle unprefixed versions (FF16+, for example)
    if (prop in div.style) {
      BrowserUtils.cache[prop] = prop;
    }
    else {
      var prefixes = ['Moz', 'Webkit', 'O', 'ms'];
      var prop_ = prop.charAt(0).toUpperCase() + prop.substr(1);

      if (prop in div.style) {
        BrowserUtils.cache[prop] = prop;
      }
      else {
        for (var i=0; i<prefixes.length; ++i) {
          var vendorProp = prefixes[i] + prop_;
          if (vendorProp in div.style) {
            BrowserUtils.cache[prop] = vendorProp;
            break;
          }
        }
      }
    }

    return BrowserUtils.cache[prop];
  };

  BrowserUtils.getTransitionEndEventName = function () {
    return BrowserUtils.transitionEndEventNames[BrowserUtils.getVendorPropertyName('transition')] || undefined;
  };

  BrowserUtils.onTransitionEnd = function ($element, callback, timeout) {
    // Fallback on 1 second if transition event is not supported/triggered
    timeout = timeout || 1000;
    var callbackCalled = false;

    var doCallback = function () {
      if (callbackCalled) {
        return;
      }
      callbackCalled = true;
      clearTimeout(timer);
      callback();
    };

    var timer = setTimeout(function () {
      doCallback();
    }, timeout);

    $element.on(BrowserUtils.getTransitionEndEventName(), function() {
      doCallback();
    });
  };

  BrowserUtils.isTouchDevice = function () {
    try {
      document.createEvent("TouchEvent");
      return true;
    }
    catch (e) {
      return false;
    }
  };

  return BrowserUtils;
})(H5P.jQuery);
