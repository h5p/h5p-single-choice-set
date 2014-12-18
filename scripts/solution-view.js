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
    this.$solutionView.show();

    BrowserUtils.onTransitionEnd(self.$solutionView, function () {
      self.populate();

      var height = self.$choices.outerHeight();
      var marginTop = (self.$solutionView.outerHeight()-height)/2;
      self.$choices.css({
        'margin-top': (marginTop > 0 ? marginTop : 0) + 'px'
      });
    }, 600);

    setTimeout(function () {
      self.$solutionView.css({
        width: '100%',
        height: '100%',
        left: 0,
        top: 0,
        'background': 'rgba(0,0,0,0.8)'
      });
    }, 1);

    $(document).on('keyup', function (event) {
      if (event.keyCode === 27) {
        self.hide();
        $(document).off('keyup');
      }
    });

    self.$solutionView.on('click', function (event) {
      self.hide();
      self.$solutionView.off('click');
    });
  };

  SolutionView.prototype.hide = function () {
    this.$choices.remove();
    this.$solutionView.hide();
    this.$solutionView.css({
      background: 'rgb(100,152,254)'
    });
  };

  SolutionView.prototype.populate = function () {
    var self = this;
    self.$choices = $('<div>', {
      'class': 'h5p-sc-solution-choices'
    });
    this.choices.forEach(function (choice) {
      console.log(choice);
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

    self.$choices.on('click', function(){
      return false;
    });
  };

  return SolutionView;
})(H5P.jQuery, H5P.BrowserUtils);
