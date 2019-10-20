export let mxClient = {
  VERSION: '@MXGRAPH-VERSION@',
  IS_IE: navigator.userAgent.indexOf('MSIE') >= 0,
  IS_IE6: navigator.userAgent.indexOf('MSIE 6') >= 0,
  IS_IE11: !!navigator.userAgent.match(/Trident\/7\./),
  IS_EDGE: !!navigator.userAgent.match(/Edge\//),
  IS_QUIRKS: navigator.userAgent.indexOf('MSIE') >= 0 && (document.documentMode == null || document.documentMode == 5),
  IS_EM: 'spellcheck' in document.createElement('textarea') && document.documentMode == 8,
  VML_PREFIX: 'v',
  OFFICE_PREFIX: 'o',
  IS_NS: navigator.userAgent.indexOf('Mozilla/') >= 0 && navigator.userAgent.indexOf('MSIE') < 0 && navigator.userAgent.indexOf('Edge/') < 0,
  IS_OP: navigator.userAgent.indexOf('Opera/') >= 0 || navigator.userAgent.indexOf('OPR/') >= 0,
  IS_OT: navigator.userAgent.indexOf('Presto/') >= 0 && navigator.userAgent.indexOf('Presto/2.4.') < 0 && navigator.userAgent.indexOf('Presto/2.3.') < 0 && navigator.userAgent.indexOf('Presto/2.2.') < 0 && navigator.userAgent.indexOf('Presto/2.1.') < 0 && navigator.userAgent.indexOf('Presto/2.0.') < 0 && navigator.userAgent.indexOf('Presto/1.') < 0,
  IS_SF: navigator.userAgent.indexOf('AppleWebKit/') >= 0 && navigator.userAgent.indexOf('Chrome/') < 0 && navigator.userAgent.indexOf('Edge/') < 0,
  IS_IOS: (navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false),
  IS_GC: navigator.userAgent.indexOf('Chrome/') >= 0 && navigator.userAgent.indexOf('Edge/') < 0,
  IS_CHROMEAPP: window.chrome != null && chrome.app != null && chrome.app.runtime != null,
  IS_FF: navigator.userAgent.indexOf('Firefox/') >= 0,
  IS_MT: (navigator.userAgent.indexOf('Firefox/') >= 0 && navigator.userAgent.indexOf('Firefox/1.') < 0 && navigator.userAgent.indexOf('Firefox/2.') < 0) || (navigator.userAgent.indexOf('Iceweasel/') >= 0 && navigator.userAgent.indexOf('Iceweasel/1.') < 0 && navigator.userAgent.indexOf('Iceweasel/2.') < 0) || (navigator.userAgent.indexOf('SeaMonkey/') >= 0 && navigator.userAgent.indexOf('SeaMonkey/1.') < 0) || (navigator.userAgent.indexOf('Iceape/') >= 0 && navigator.userAgent.indexOf('Iceape/1.') < 0),
  IS_VML: navigator.appName.toUpperCase() == 'MICROSOFT INTERNET EXPLORER',
  IS_SVG: navigator.appName.toUpperCase() != 'MICROSOFT INTERNET EXPLORER',
  NO_FO: !document.createElementNS || document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject') != '[object SVGForeignObjectElement]' || navigator.userAgent.indexOf('Opera/') >= 0,
  IS_WIN: navigator.appVersion.indexOf('Win') > 0,
  IS_MAC: navigator.appVersion.indexOf('Mac') > 0,
  IS_CHROMEOS: /\bCrOS\b/.test(navigator.userAgent),
  IS_TOUCH: 'ontouchstart' in document.documentElement,
  IS_POINTER: window.PointerEvent != null && !(navigator.appVersion.indexOf('Mac') > 0),
  IS_LOCAL: document.location.href.indexOf('http://') < 0 && document.location.href.indexOf('https://') < 0,
  defaultBundles: [],
  isBrowserSupported() {
    return mxClient.IS_VML || mxClient.IS_SVG;
  },
  link(rel, href, doc, id) {
    doc = doc || document;
    if (mxClient.IS_IE6) {
      doc.write('<link rel="' + rel + '" href="' + href + '" charset="UTF-8" type="text/css"/>');
    } else {
      const link = doc.createElement('link');
      link.setAttribute('rel', rel);
      link.setAttribute('href', href);
      link.setAttribute('charset', 'UTF-8');
      link.setAttribute('type', 'text/css');
      if (id) {
        link.setAttribute('id', id);
      }
      const head = doc.getElementsByTagName('head')[0];
      head.appendChild(link);
    }
  },
  loadResources(fn, lan) {
    let pending = mxClient.defaultBundles.length;

    function callback() {
      if (--pending == 0) {
        fn();
      }
    }

    for (let i = 0; i < mxClient.defaultBundles.length; i++) {
      mxResources.add(mxClient.defaultBundles[i], lan, callback);
    }
  },
  include(src) {
    document.write('<script src="' + src + '"></script>');
  },
};
export let mxLoadResources = true;
export let mxForceIncludes = false;
export let mxResourceExtension = '.txt';
export let mxLoadStylesheets = true;
export let mxBasePath = mxBasePath.substring(0, mxBasePath.length - 1);
export let mxImageBasePath = mxImageBasePath.substring(0, mxImageBasePath.length - 1);
