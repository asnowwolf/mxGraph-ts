export let mxResources = {
  resources: {},
  extension: mxResourceExtension,
  resourcesEncoded: false,
  loadDefaultBundle: true,
  loadSpecialBundle: true,
  isLanguageSupported(lan) {
    if (mxClient.languages != null) {
      return mxUtils.indexOf(mxClient.languages, lan) >= 0;
    }
    return true;
  },
  getDefaultBundle(basename, lan) {
    if (mxResources.loadDefaultBundle || !mxResources.isLanguageSupported(lan)) {
      return basename + mxResources.extension;
    } else {
      return null;
    }
  },
  getSpecialBundle(basename, lan) {
    if (mxClient.languages == null || !this.isLanguageSupported(lan)) {
      const dash = lan.indexOf('-');
      if (dash > 0) {
        lan = lan.substring(0, dash);
      }
    }
    if (mxResources.loadSpecialBundle && mxResources.isLanguageSupported(lan) && lan != mxClient.defaultLanguage) {
      return basename + '_' + lan + mxResources.extension;
    } else {
      return null;
    }
  },
  add(basename, lan, callback) {
    lan = (lan != null) ? lan : ((mxClient.language != null) ? mxClient.language.toLowerCase() : mxConstants.NONE);
    if (lan != mxConstants.NONE) {
      const defaultBundle = mxResources.getDefaultBundle(basename, lan);
      const specialBundle = mxResources.getSpecialBundle(basename, lan);
      const loadSpecialBundle = function () {
        if (specialBundle != null) {
          if (callback) {
            mxUtils.get(specialBundle, function (req) {
              mxResources.parse(req.getText());
              callback();
            }, function () {
              callback();
            });
          } else {
            try {
              const req = mxUtils.load(specialBundle);
              if (req.isReady()) {
                mxResources.parse(req.getText());
              }
            } catch (e) {
            }
          }
        } else if (callback != null) {
          callback();
        }
      };
      if (defaultBundle != null) {
        if (callback) {
          mxUtils.get(defaultBundle, function (req) {
            mxResources.parse(req.getText());
            loadSpecialBundle();
          }, function () {
            loadSpecialBundle();
          });
        } else {
          try {
            const req = mxUtils.load(defaultBundle);
            if (req.isReady()) {
              mxResources.parse(req.getText());
            }
            loadSpecialBundle();
          } catch (e) {
          }
        }
      } else {
        loadSpecialBundle();
      }
    }
  },
  parse(text) {
    if (text != null) {
      const lines = text.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].charAt(0) != '#') {
          const index = lines[i].indexOf('=');
          if (index > 0) {
            const key = lines[i].substring(0, index);
            let idx = lines[i].length;
            if (lines[i].charCodeAt(idx - 1) == 13) {
              idx--;
            }
            let value = lines[i].substring(index + 1, idx);
            if (this.resourcesEncoded) {
              value = value.replace(/\\(?=u[a-fA-F\d]{4})/g, '%');
              mxResources.resources[key] = unescape(value);
            } else {
              mxResources.resources[key] = value;
            }
          }
        }
      }
    }
  },
  get(key, params, defaultValue) {
    let value = mxResources.resources[key];
    if (value == null) {
      value = defaultValue;
    }
    if (value != null && params != null) {
      value = mxResources.replacePlaceholders(value, params);
    }
    return value;
  },
  replacePlaceholders(value, params) {
    const result = [];
    let index = null;
    for (let i = 0; i < value.length; i++) {
      const c = value.charAt(i);
      if (c == '{') {
        index = '';
      } else if (index != null && c == '}') {
        index = parseInt(index) - 1;
        if (index >= 0 && index < params.length) {
          result.push(params[index]);
        }
        index = null;
      } else if (index != null) {
        index += c;
      } else {
        result.push(c);
      }
    }
    return result.join('');
  },
  loadResources(callback) {
    mxResources.add(mxClient.basePath + '/resources/editor', null, function () {
      mxResources.add(mxClient.basePath + '/resources/graph', null, callback);
    });
  },
};
