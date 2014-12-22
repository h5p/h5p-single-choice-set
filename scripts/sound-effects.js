var H5P = H5P || {};

H5P.SoundEffects = (function ($) {
  SoundEffects = {
    types: [
      'positive-short',
      'negative-short'
    ],
    sounds: [],
    libraryPath: undefined,
    muted: false
  };

  SoundEffects.setup = function () {
    if (!H5P.createjs.Sound.initializeDefaultPlugins()) {
      return false;
    }

    SoundEffects.libraryPath = H5PIntegration.getLibraryPath('H5P.SingleChoiceSet-1.0');
    H5P.createjs.Sound.alternateExtensions = ['mp3'];
    for (var i = 0; i < SoundEffects.types.length; i++) {
      var type = SoundEffects.types[i];
      H5P.createjs.Sound.registerSound(SoundEffects.libraryPath + '/sounds/' + type + '.ogg', type);
    }

    return true;
  };

  SoundEffects.play = function (type, delay) {
    if (SoundEffects.muted === false) {
      delay = delay || 0;
      var player = H5P.createjs.Sound.play(type, H5P.createjs.Sound.INTERRUPT_NONE, delay, 0, false, 1);
    }
  };

  SoundEffects.mute = function () {
    SoundEffects.muted = true;
  };

  SoundEffects.unmute = function () {
    SoundEffects.muted = false;
  };

  return SoundEffects;
})(H5P.jQuery);
