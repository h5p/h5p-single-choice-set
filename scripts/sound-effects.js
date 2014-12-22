var H5P = H5P || {};

H5P.SoundEffects = (function ($) {
  SoundEffects = {
    types: [
      'positive-short',
      'negative-short'
    ],
    sounds: [],
    libraryPath: undefined
  };

  SoundEffects.setup = function () {
    SoundEffects.libraryPath = H5PIntegration.getLibraryPath('H5P.SingleChoiceSet-1.0');

    H5P.createjs.Sound.alternateExtensions = ['ogg'];
    H5P.createjs.Sound.on('fileload', function (event) {
      console.log(event);
    });

    for (var i = 0; i < SoundEffects.types.length; i++) {
      var type = SoundEffects.types[i];
      H5P.createjs.Sound.registerSound(SoundEffects.libraryPath + '/sounds/' + type + '.mp3', type);
    }
  };

  SoundEffects.play = function (type) {
    H5P.createjs.Sound.play(type);
  };

  return SoundEffects;
})(H5P.jQuery);
