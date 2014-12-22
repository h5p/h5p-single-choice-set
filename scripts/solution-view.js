var H5P = H5P || {};

H5P.SingleChoiceSolutionView = (function ($, BrowserUtils) {
  /**
  * Constructor function.
  */
  function SolutionView (choices){
    this.choices = choices;

    this.$solutionView = $('<div>', {
      'class': 'h5p-sc-solution-view'
    });
  }

  SolutionView.prototype.appendTo = function ($container) {
    this.$solutionView.appendTo($container);
  };

  SolutionView.prototype.show = function () {
    var self = this;

    self.populate();
    this.$solutionView.show();

    setTimeout(function () {
      self.$solutionView.css({
        width: '100%',
        height: '100%',
        left: 0,
        top: 0,
        'background': 'rgba(0,0,0,0.8)'
      });

      var height = self.$choices.outerHeight();
      var marginTop = (self.$solutionView.outerHeight()-height)/2;
      self.$choices.css({
        'margin-top': (marginTop > 0 ? marginTop : 0) + 'px'
      });
    }, 1);

    $(document).on('keyup', function (event) {
      if (event.keyCode === 27) {
        self.hide();
        $(document).off('keyup');
      }
    });

    self.$solutionView.on('click.solutionView', function (event) {
      self.hide();
      self.$solutionView.off('click.solutionView');
    });
  };

  SolutionView.prototype.hide = function () {
    var self = this;

    this.$choices.css({'margin-top': self.$solutionView.height() + 'px'});
    this.$solutionView.css({background: 'transparent'});

    BrowserUtils.onTransitionEnd(self.$solutionView, function () {
      self.$choices.remove();
      self.$solutionView.hide();
    }, 1200);
  };

  SolutionView.prototype.populate = function () {
    var self = this;
    self.$choices = $('<div>', {
      'class': 'h5p-sc-solution-choices',
      css: {
        'margin-top': self.$solutionView.height() + 'px'
      }
    });
    this.choices.forEach(function (choice) {
      self.$choices.append($('<div>', {
        'class': 'h5p-sc-solution-question',
        text: choice.question
      }));
      self.$choices.append($('<div>', {
        'class': 'h5p-sc-solution-answer',
        text: choice.answers[0]
      }));
    });
    self.$choices.appendTo(this.$solutionView);

    /* To avoid closing the popup when trying to select text */
    self.$choices.on('click', function(){
      return false;
    });
  };

  return SolutionView;
})(H5P.jQuery, H5P.BrowserUtils);
