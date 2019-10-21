import { mxCodec } from '../io/mxCodec';
import { mxCellPath } from '../model/mxCellPath';
import { mxClient } from '../mxClient';
import { mxTemporaryCellStates } from '../view/mxTemporaryCellStates';
import { mxConstants } from './mxConstants';
import { mxDictionary } from './mxDictionary';
import { mxDragSource } from './mxDragSource';
import { mxEffects } from './mxEffects';
import { mxEvent } from './mxEvent';
import { mxLog } from './mxLog';
import { mxObjectIdentity } from './mxObjectIdentity';
import { mxPoint } from './mxPoint';
import { mxRectangle } from './mxRectangle';
import { mxResources } from './mxResources';
import { mxWindow } from './mxWindow';
import { mxXmlRequest } from './mxXmlRequest';

export let mxUtils = {
  errorResource: (mxClient.language != 'none') ? 'error' : '',
  closeResource: (mxClient.language != 'none') ? 'close' : '',
  errorImage: mxClient.imageBasePath + '/error.gif',
  removeCursors(element) {
    if (!!element.style) {
      element.style.cursor = '';
    }
    const children = element.childNodes;
    if (!!children) {
      const childCount = children.length;
      for (let i = 0; i < childCount; i += 1) {
        mxUtils.removeCursors(children[i]);
      }
    }
  },
  getCurrentStyle: function () {
    if (mxClient.IS_IE && (!document.documentMode || document.documentMode < 9)) {
      return function (element) {
        return (!!element) ? element.currentStyle : null;
      };
    } else {
      return function (element) {
        return (!!element) ? window.getComputedStyle(element, '') : null;
      };
    }
  }(),
  parseCssNumber(value) {
    if (value == 'thin') {
      value = '2';
    } else if (value == 'medium') {
      value = '4';
    } else if (value == 'thick') {
      value = '6';
    }
    value = parseFloat(value);
    if (isNaN(value)) {
      value = 0;
    }
    return value;
  },
  setPrefixedStyle: function () {
    let prefix = undefined;
    if (mxClient.IS_OT) {
      prefix = 'O';
    } else if (mxClient.IS_SF || mxClient.IS_GC) {
      prefix = 'Webkit';
    } else if (mxClient.IS_MT) {
      prefix = 'Moz';
    } else if (mxClient.IS_IE && document.documentMode >= 9 && document.documentMode < 10) {
      prefix = 'ms';
    }
    return function (style, name, value) {
      style[name] = value;
      if (!!prefix && name.length > 0) {
        name = prefix + name.substring(0, 1).toUpperCase() + name.substring(1);
        style[name] = value;
      }
    };
  }(),
  hasScrollbars(node) {
    const style = mxUtils.getCurrentStyle(node);
    return !!style && (style.overflow == 'scroll' || style.overflow == 'auto');
  },
  bind(scope, funct) {
    return function () {
      return funct.apply(scope, arguments);
    };
  },
  eval(expr) {
    let result = undefined;
    if (expr.indexOf('function') >= 0) {
      try {
        eval('var _mxJavaScriptExpression=' + expr);
        result = _mxJavaScriptExpression;
        _mxJavaScriptExpression = undefined;
      } catch (e) {
        mxLog.warn(e.message + ' while evaluating ' + expr);
      }
    } else {
      try {
        result = eval(expr);
      } catch (e) {
        mxLog.warn(e.message + ' while evaluating ' + expr);
      }
    }
    return result;
  },
  findNode(node, attr, value) {
    if (node.nodeType == mxConstants.NODETYPE_ELEMENT) {
      const tmp = node.getAttribute(attr);
      if (!!tmp && tmp == value) {
        return node;
      }
    }
    node = node.firstChild;
    while (!!node) {
      const result = mxUtils.findNode(node, attr, value);
      if (!!result) {
        return result;
      }
      node = node.nextSibling;
    }
    return null;
  },
  getFunctionName(f) {
    let str = undefined;
    if (!!f) {
      if (!!f.name) {
        str = f.name;
      } else {
        str = mxUtils.trim(f.toString());
        if (/^function\s/.test(str)) {
          str = mxUtils.ltrim(str.substring(9));
          const idx2 = str.indexOf('(');
          if (idx2 > 0) {
            str = str.substring(0, idx2);
          }
        }
      }
    }
    return str;
  },
  indexOf(array, obj) {
    if (!!array && !!obj) {
      for (let i = 0; i < array.length; i++) {
        if (array[i] == obj) {
          return i;
        }
      }
    }
    return -1;
  },
  forEach(array, fn) {
    if (!!array && !!fn) {
      for (let i = 0; i < array.length; i++) {
        fn(array[i]);
      }
    }
    return array;
  },
  remove(obj, array) {
    let result = undefined;
    if (typeof (array) == 'object') {
      let index = mxUtils.indexOf(array, obj);
      while (index >= 0) {
        array.splice(index, 1);
        result = obj;
        index = mxUtils.indexOf(array, obj);
      }
    }
    for (const key in array) {
      if (array[key] == obj) {
        delete array[key];
        result = obj;
      }
    }
    return result;
  },
  isNode(value, nodeName, attributeName, attributeValue) {
    if (!!value && !isNaN(value.nodeType) && (!nodeName || value.nodeName.toLowerCase() == nodeName.toLowerCase())) {
      return !attributeName || value.getAttribute(attributeName) == attributeValue;
    }
    return false;
  },
  isAncestorNode(ancestor, child) {
    let parent = child;
    while (!!parent) {
      if (parent == ancestor) {
        return true;
      }
      parent = parent.parentNode;
    }
    return false;
  },
  getChildNodes(node, nodeType) {
    nodeType = nodeType || mxConstants.NODETYPE_ELEMENT;
    const children = [];
    let tmp = node.firstChild;
    while (!!tmp) {
      if (tmp.nodeType == nodeType) {
        children.push(tmp);
      }
      tmp = tmp.nextSibling;
    }
    return children;
  },
  importNode(doc, node, allChildren) {
    if (mxClient.IS_IE && (!document.documentMode || document.documentMode < 10)) {
      switch (node.nodeType) {
        case 1: {
          const newNode = doc.createElement(node.nodeName);
          if (node.attributes && node.attributes.length > 0) {
            for (let i = 0; i < node.attributes.length; i++) {
              newNode.setAttribute(node.attributes[i].nodeName, node.getAttribute(node.attributes[i].nodeName));
            }
            if (allChildren && node.childNodes && node.childNodes.length > 0) {
              for (let i = 0; i < node.childNodes.length; i++) {
                newNode.appendChild(mxUtils.importNode(doc, node.childNodes[i], allChildren));
              }
            }
          }
          return newNode;
          break;
        }
        case 3:
        case 4:
        case 8: {
          return doc.createTextNode(node.value);
          break;
        }
      }

    } else {
      return doc.importNode(node, allChildren);
    }
  },
  createXmlDocument() {
    let doc = undefined;
    if (document.implementation && document.implementation.createDocument) {
      doc = document.implementation.createDocument('', '', null);
    } else if (window.ActiveXObject) {
      doc = new ActiveXObject('Microsoft.XMLDOM');
    }
    return doc;
  },
  parseXml: function () {
    if (window.DOMParser) {
      return function (xml) {
        const parser = new DOMParser();
        return parser.parseFromString(xml, 'text/xml');
      };
    } else {
      return function (xml) {
        const result = mxUtils.createXmlDocument();
        result.async = false;
        result.validateOnParse = false;
        result.resolveExternals = false;
        result.loadXML(xml);
        return result;
      };
    }
  }(),
  clearSelection: function () {
    if (document.selection) {
      return function () {
        document.selection.empty();
      };
    } else if (window.getSelection) {
      return function () {
        if (window.getSelection().empty) {
          window.getSelection().empty();
        } else if (window.getSelection().removeAllRanges) {
          window.getSelection().removeAllRanges();
        }
      };
    } else {
      return function () {
      };
    }
  }(),
  getPrettyXml(node, tab, indent) {
    const result = [];
    if (!!node) {
      tab = tab || '  ';
      indent = indent || '';
      if (node.nodeType == mxConstants.NODETYPE_TEXT) {
        const value = mxUtils.trim(mxUtils.getTextContent(node));
        if (value.length > 0) {
          result.push(indent + mxUtils.htmlEntities(value) + '\n');
        }
      } else {
        result.push(indent + '<' + node.nodeName);
        const attrs = node.attributes;
        if (!!attrs) {
          for (let i = 0; i < attrs.length; i++) {
            const val = mxUtils.htmlEntities(attrs[i].value);
            result.push(' ' + attrs[i].nodeName + '="' + val + '"');
          }
        }
        let tmp = node.firstChild;
        if (!!tmp) {
          result.push('>\n');
          while (!!tmp) {
            result.push(mxUtils.getPrettyXml(tmp, tab, indent + tab));
            tmp = tmp.nextSibling;
          }
          result.push(indent + '</' + node.nodeName + '>\n');
        } else {
          result.push('/>\n');
        }
      }
    }
    return result.join('');
  },
  removeWhitespace(node, before) {
    let tmp = (before) ? node.previousSibling : node.nextSibling;
    while (!!tmp && tmp.nodeType == mxConstants.NODETYPE_TEXT) {
      const next = (before) ? tmp.previousSibling : tmp.nextSibling;
      const text = mxUtils.getTextContent(tmp);
      if (mxUtils.trim(text).length == 0) {
        tmp.parentNode.removeChild(tmp);
      }
      tmp = next;
    }
  },
  htmlEntities(s, newline) {
    s = String(s || '');
    s = s.replace(/&/g, '&amp;');
    s = s.replace(/"/g, '&quot;');
    s = s.replace(/\'/g, '&#39;');
    s = s.replace(/</g, '&lt;');
    s = s.replace(/>/g, '&gt;');
    if (!newline || newline) {
      s = s.replace(/\n/g, '&#xa;');
    }
    return s;
  },
  isVml(node) {
    return !!node && node.tagUrn == 'urn:schemas-microsoft-com:vml';
  },
  getXml(node, linefeed) {
    let xml = '';
    if (!!window.XMLSerializer) {
      const xmlSerializer = new XMLSerializer();
      xml = xmlSerializer.serializeToString(node);
    } else if (!!node.xml) {
      xml = node.xml.replace(/\r\n\t[\t]*/g, '').replace(/>\r\n/g, '>').replace(/\r\n/g, '\n');
    }
    linefeed = linefeed || '&#xa;';
    xml = xml.replace(/\n/g, linefeed);
    return xml;
  },
  extractTextWithWhitespace(elems) {
    const blocks = ['BLOCKQUOTE', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'OL', 'P', 'PRE', 'TABLE', 'UL'];
    const ret = [];

    function doExtract(elts) {
      if (elts.length == 1 && (elts[0].nodeName == 'BR' || elts[0].innerHTML == '\n')) {
        return;
      }
      for (let i = 0; i < elts.length; i++) {
        const elem = elts[i];
        if (elem.nodeName == 'BR' || elem.innerHTML == '\n' || ((elts.length == 1 || i == 0) && (elem.nodeName == 'DIV' && elem.innerHTML.toLowerCase() == '<br>'))) {
          ret.push('\n');
        } else {
          if (elem.nodeType === 3 || elem.nodeType === 4) {
            if (elem.nodeValue.length > 0) {
              ret.push(elem.nodeValue);
            }
          } else if (elem.nodeType !== 8 && elem.childNodes.length > 0) {
            doExtract(elem.childNodes);
          }
          if (i < elts.length - 1 && mxUtils.indexOf(blocks, elts[i + 1].nodeName) >= 0) {
            ret.push('\n');
          }
        }
      }
    }

    doExtract(elems);
    return ret.join('');
  },
  replaceTrailingNewlines(str, pattern) {
    let postfix = '';
    while (str.length > 0 && str.charAt(str.length - 1) == '\n') {
      str = str.substring(0, str.length - 1);
      postfix += pattern;
    }
    return str + postfix;
  },
  getTextContent(node) {
    if (mxClient.IS_IE && node.innerText !== undefined) {
      return node.innerText;
    } else {
      return (!!node) ? node[(node.textContent === undefined) ? 'text' : 'textContent'] : '';
    }
  },
  setTextContent(node, text) {
    if (node.innerText !== undefined) {
      node.innerText = text;
    } else {
      node[(node.textContent === undefined) ? 'text' : 'textContent'] = text;
    }
  },
  getInnerHtml: function () {
    if (mxClient.IS_IE) {
      return function (node) {
        if (!!node) {
          return node.innerHTML;
        }
        return '';
      };
    } else {
      return function (node) {
        if (!!node) {
          const serializer = new XMLSerializer();
          return serializer.serializeToString(node);
        }
        return '';
      };
    }
  }(),
  getOuterHtml: function () {
    if (mxClient.IS_IE) {
      return function (node) {
        if (!!node) {
          if (!!node.outerHTML) {
            return node.outerHTML;
          } else {
            const tmp = [];
            tmp.push('<' + node.nodeName);
            const attrs = node.attributes;
            if (!!attrs) {
              for (let i = 0; i < attrs.length; i++) {
                const value = attrs[i].value;
                if (!!value && value.length > 0) {
                  tmp.push(' ');
                  tmp.push(attrs[i].nodeName);
                  tmp.push('="');
                  tmp.push(value);
                  tmp.push('"');
                }
              }
            }
            if (node.innerHTML.length == 0) {
              tmp.push('/>');
            } else {
              tmp.push('>');
              tmp.push(node.innerHTML);
              tmp.push('</' + node.nodeName + '>');
            }
            return tmp.join('');
          }
        }
        return '';
      };
    } else {
      return function (node) {
        if (!!node) {
          const serializer = new XMLSerializer();
          return serializer.serializeToString(node);
        }
        return '';
      };
    }
  }(),
  write(parent, text) {
    const doc = parent.ownerDocument;
    const node = doc.createTextNode(text);
    if (!!parent) {
      parent.appendChild(node);
    }
    return node;
  },
  writeln(parent, text) {
    const doc = parent.ownerDocument;
    const node = doc.createTextNode(text);
    if (!!parent) {
      parent.appendChild(node);
      parent.appendChild(document.createElement('br'));
    }
    return node;
  },
  br(parent, count) {
    count = count || 1;
    let br = undefined;
    for (let i = 0; i < count; i++) {
      if (!!parent) {
        br = parent.ownerDocument.createElement('br');
        parent.appendChild(br);
      }
    }
    return br;
  },
  button(label, funct, doc) {
    doc = (!!doc) ? doc : document;
    const button = doc.createElement('button');
    mxUtils.write(button, label);
    mxEvent.addListener(button, 'click', function (evt) {
      funct(evt);
    });
    return button;
  },
  para(parent, text) {
    const p = document.createElement('p');
    mxUtils.write(p, text);
    if (!!parent) {
      parent.appendChild(p);
    }
    return p;
  },
  addTransparentBackgroundFilter(node) {
    node.style.filter += 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src=\'' + mxClient.imageBasePath + '/transparent.gif\', sizingMethod=\'scale\')';
  },
  linkAction(parent, text, editor, action, pad) {
    return mxUtils.link(parent, text, function () {
      editor.execute(action);
    }, pad);
  },
  linkInvoke(parent, text, editor, functName, arg, pad) {
    return mxUtils.link(parent, text, function () {
      editor[functName](arg);
    }, pad);
  },
  link(parent, text, funct, pad) {
    const a = document.createElement('span');
    a.style.color = 'blue';
    a.style.textDecoration = 'underline';
    a.style.cursor = 'pointer';
    if (!!pad) {
      a.style.paddingLeft = pad + 'px';
    }
    mxEvent.addListener(a, 'click', funct);
    mxUtils.write(a, text);
    if (!!parent) {
      parent.appendChild(a);
    }
    return a;
  },
  getDocumentSize() {
    const b = document.body;
    const d = document.documentElement;
    try {
      return new mxRectangle(0, 0, b.clientWidth || d.clientWidth, Math.max(b.clientHeight || 0, d.clientHeight));
    } catch (e) {
      return new mxRectangle();
    }
  },
  fit(node) {
    const ds = mxUtils.getDocumentSize();
    const left = parseInt(node.offsetLeft);
    const width = parseInt(node.offsetWidth);
    const offset = mxUtils.getDocumentScrollOrigin(node.ownerDocument);
    const sl = offset.x;
    const st = offset.y;
    const b = document.body;
    const d = document.documentElement;
    const right = (sl) + ds.width;
    if (left + width > right) {
      node.style.left = Math.max(sl, right - width) + 'px';
    }
    const top = parseInt(node.offsetTop);
    const height = parseInt(node.offsetHeight);
    const bottom = st + ds.height;
    if (top + height > bottom) {
      node.style.top = Math.max(st, bottom - height) + 'px';
    }
  },
  load(url) {
    const req = new mxXmlRequest(url, null, 'GET', false);
    req.send();
    return req;
  },
  get(url, onload, onerror, binary, timeout, ontimeout) {
    const req = new mxXmlRequest(url, null, 'GET');
    if (!!binary) {
      req.setBinary(binary);
    }
    req.send(onload, onerror, timeout, ontimeout);
    return req;
  },
  getAll(urls, onload, onerror) {
    let remain = urls.length;
    const result = [];
    let errors = 0;
    const err = function () {
      if (errors == 0 && !!onerror) {
        onerror();
      }
      errors++;
    };
    for (let i = 0; i < urls.length; i++) {
      (function (url, index) {
        mxUtils.get(url, function (req) {
          const status = req.getStatus();
          if (status < 200 || status > 299) {
            err();
          } else {
            result[index] = req;
            remain--;
            if (remain == 0) {
              onload(result);
            }
          }
        }, err);
      })(urls[i], i);
    }
    if (remain == 0) {
      onload(result);
    }
  },
  post(url, params, onload, onerror) {
    return new mxXmlRequest(url, params).send(onload, onerror);
  },
  submit(url, params, doc, target) {
    return new mxXmlRequest(url, params).simulate(doc, target);
  },
  loadInto(url, doc, onload) {
    if (mxClient.IS_IE) {
      doc.onreadystatechange = function () {
        if (doc.readyState == 4) {
          onload();
        }
      };
    } else {
      doc.addEventListener('load', onload, false);
    }
    doc.load(url);
  },
  getValue(array, key, defaultValue) {
    let value = (!!array) ? array[key] : null;
    if (!value) {
      value = defaultValue;
    }
    return value;
  },
  getNumber(array, key, defaultValue) {
    let value = (!!array) ? array[key] : null;
    if (!value) {
      value = defaultValue || 0;
    }
    return Number(value);
  },
  getColor(array, key, defaultValue) {
    let value = (!!array) ? array[key] : null;
    if (!value) {
      value = defaultValue;
    } else if (value == mxConstants.NONE) {
      value = undefined;
    }
    return value;
  },
  clone(obj, transients, shallow) {
    shallow = (!!shallow) ? shallow : false;
    let clone = undefined;
    if (!!obj && typeof (obj.constructor) == 'function') {
      clone = new obj.constructor();
      for (const i in obj) {
        if (i != mxObjectIdentity.FIELD_NAME && (!transients || mxUtils.indexOf(transients, i) < 0)) {
          if (!shallow && typeof (obj[i]) == 'object') {
            clone[i] = mxUtils.clone(obj[i]);
          } else {
            clone[i] = obj[i];
          }
        }
      }
    }
    return clone;
  },
  equalPoints(a, b) {
    if ((!a && !!b) || (!!a && !b) || (!!a && !!b && a.length != b.length)) {
      return false;
    } else if (!!a && !!b) {
      for (let i = 0; i < a.length; i++) {
        if (a[i] == b[i] || (a[i] && !a[i].equals(b[i]))) {
          return false;
        }
      }
    }
    return true;
  },
  equalEntries(a, b) {
    if ((!a && !!b) || (!!a && !b) || (!!a && !!b && a.length != b.length)) {
      return false;
    } else if (!!a && !!b) {
      let count = 0;
      for (const key in b) {
        count++;
      }
      for (const key in a) {
        count--;
        if ((!mxUtils.isNaN(a[key]) || !mxUtils.isNaN(b[key])) && a[key] != b[key]) {
          return false;
        }
      }
    }
    return count == 0;
  },
  removeDuplicates(arr) {
    const dict = new mxDictionary();
    const result = [];
    for (let i = 0; i < arr.length; i++) {
      if (!dict.get(arr[i])) {
        result.push(arr[i]);
        dict.put(arr[i], true);
      }
    }
    return result;
  },
  isNaN(value) {
    return typeof (value) == 'number' && isNaN(value);
  },
  extend(ctor, superCtor) {
    const f = function () {
    };
    f.prototype = superCtor.prototype;
    ctor.prototype = new f();
    ctor.prototype.constructor = ctor;
  },
  toString(obj) {
    let output = '';
    for (const i in obj) {
      try {
        if (!obj[i]) {
          output += i + ' = [null]\n';
        } else if (typeof (obj[i]) == 'function') {
          output += i + ' => [Function]\n';
        } else if (typeof (obj[i]) == 'object') {
          const ctor = mxUtils.getFunctionName(obj[i].constructor);
          output += i + ' => [' + ctor + ']\n';
        } else {
          output += i + ' = ' + obj[i] + '\n';
        }
      } catch (e) {
        output += i + '=' + e.message;
      }
    }
    return output;
  },
  toRadians(deg) {
    return Math.PI * deg / 180;
  },
  toDegree(rad) {
    return rad * 180 / Math.PI;
  },
  arcToCurves(x0, y0, r1, r2, angle, largeArcFlag, sweepFlag, x, y) {
    x -= x0;
    y -= y0;
    if (r1 === 0 || r2 === 0) {
      return result;
    }
    const fS = sweepFlag;
    const psai = angle;
    r1 = Math.abs(r1);
    r2 = Math.abs(r2);
    const ctx = -x / 2;
    const cty = -y / 2;
    const cpsi = Math.cos(psai * Math.PI / 180);
    const spsi = Math.sin(psai * Math.PI / 180);
    const rxd = cpsi * ctx + spsi * cty;
    const ryd = -1 * spsi * ctx + cpsi * cty;
    const rxdd = rxd * rxd;
    const rydd = ryd * ryd;
    const r1x = r1 * r1;
    const r2y = r2 * r2;
    const lamda = rxdd / r1x + rydd / r2y;
    let sds;
    if (lamda > 1) {
      r1 = Math.sqrt(lamda) * r1;
      r2 = Math.sqrt(lamda) * r2;
      sds = 0;
    } else {
      let seif = 1;
      if (largeArcFlag === fS) {
        seif = -1;
      }
      sds = seif * Math.sqrt((r1x * r2y - r1x * rydd - r2y * rxdd) / (r1x * rydd + r2y * rxdd));
    }
    const txd = sds * r1 * ryd / r2;
    const tyd = -1 * sds * r2 * rxd / r1;
    const tx = cpsi * txd - spsi * tyd + x / 2;
    const ty = spsi * txd + cpsi * tyd + y / 2;
    let rad = Math.atan2((ryd - tyd) / r2, (rxd - txd) / r1) - Math.atan2(0, 1);
    let s1 = (rad >= 0) ? rad : 2 * Math.PI + rad;
    rad = Math.atan2((-ryd - tyd) / r2, (-rxd - txd) / r1) - Math.atan2((ryd - tyd) / r2, (rxd - txd) / r1);
    let dr = (rad >= 0) ? rad : 2 * Math.PI + rad;
    if (fS == 0 && dr > 0) {
      dr -= 2 * Math.PI;
    } else if (fS != 0 && dr < 0) {
      dr += 2 * Math.PI;
    }
    const sse = dr * 2 / Math.PI;
    const seg = Math.ceil(sse < 0 ? -1 * sse : sse);
    const segr = dr / seg;
    const t = 8 / 3 * Math.sin(segr / 4) * Math.sin(segr / 4) / Math.sin(segr / 2);
    const cpsir1 = cpsi * r1;
    const cpsir2 = cpsi * r2;
    const spsir1 = spsi * r1;
    const spsir2 = spsi * r2;
    let mc = Math.cos(s1);
    let ms = Math.sin(s1);
    let x2 = -t * (cpsir1 * ms + spsir2 * mc);
    let y2 = -t * (spsir1 * ms - cpsir2 * mc);
    let x3 = 0;
    let y3 = 0;
    const result = [];
    for (let n = 0; n < seg; ++n) {
      s1 += segr;
      mc = Math.cos(s1);
      ms = Math.sin(s1);
      x3 = cpsir1 * mc - spsir2 * ms + tx;
      y3 = spsir1 * mc + cpsir2 * ms + ty;
      const dx = -t * (cpsir1 * ms + spsir2 * mc);
      const dy = -t * (spsir1 * ms - cpsir2 * mc);
      const index = n * 6;
      result[index] = Number(x2 + x0);
      result[index + 1] = Number(y2 + y0);
      result[index + 2] = Number(x3 - dx + x0);
      result[index + 3] = Number(y3 - dy + y0);
      result[index + 4] = Number(x3 + x0);
      result[index + 5] = Number(y3 + y0);
      x2 = x3 + dx;
      y2 = y3 + dy;
    }
    return result;
  },
  getBoundingBox(rect, rotation, cx) {
    let result = undefined;
    if (!!rect && !!rotation && rotation != 0) {
      const rad = mxUtils.toRadians(rotation);
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      cx = (!!cx) ? cx : new mxPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
      let p1 = new mxPoint(rect.x, rect.y);
      let p2 = new mxPoint(rect.x + rect.width, rect.y);
      let p3 = new mxPoint(p2.x, rect.y + rect.height);
      let p4 = new mxPoint(rect.x, p3.y);
      p1 = mxUtils.getRotatedPoint(p1, cos, sin, cx);
      p2 = mxUtils.getRotatedPoint(p2, cos, sin, cx);
      p3 = mxUtils.getRotatedPoint(p3, cos, sin, cx);
      p4 = mxUtils.getRotatedPoint(p4, cos, sin, cx);
      result = new mxRectangle(p1.x, p1.y, 0, 0);
      result.add(new mxRectangle(p2.x, p2.y, 0, 0));
      result.add(new mxRectangle(p3.x, p3.y, 0, 0));
      result.add(new mxRectangle(p4.x, p4.y, 0, 0));
    }
    return result;
  },
  getRotatedPoint(pt, cos, sin, c) {
    c = (!!c) ? c : new mxPoint();
    const x = pt.x - c.x;
    const y = pt.y - c.y;
    const x1 = x * cos - y * sin;
    const y1 = y * cos + x * sin;
    return new mxPoint(x1 + c.x, y1 + c.y);
  },
  getPortConstraints(terminal, edge, source, defaultValue) {
    const value = mxUtils.getValue(terminal.style, mxConstants.STYLE_PORT_CONSTRAINT, mxUtils.getValue(edge.style, (source) ? mxConstants.STYLE_SOURCE_PORT_CONSTRAINT : mxConstants.STYLE_TARGET_PORT_CONSTRAINT, null));
    if (!value) {
      return defaultValue;
    } else {
      const directions = value.toString();
      let returnValue = mxConstants.DIRECTION_MASK_NONE;
      const constraintRotationEnabled = mxUtils.getValue(terminal.style, mxConstants.STYLE_PORT_CONSTRAINT_ROTATION, 0);
      let rotation = 0;
      if (constraintRotationEnabled == 1) {
        rotation = mxUtils.getValue(terminal.style, mxConstants.STYLE_ROTATION, 0);
      }
      let quad = 0;
      if (rotation > 45) {
        quad = 1;
        if (rotation >= 135) {
          quad = 2;
        }
      } else if (rotation < -45) {
        quad = 3;
        if (rotation <= -135) {
          quad = 2;
        }
      }
      if (directions.indexOf(mxConstants.DIRECTION_NORTH) >= 0) {
        switch (quad) {
          case 0:
            returnValue |= mxConstants.DIRECTION_MASK_NORTH;
            break;
          case 1:
            returnValue |= mxConstants.DIRECTION_MASK_EAST;
            break;
          case 2:
            returnValue |= mxConstants.DIRECTION_MASK_SOUTH;
            break;
          case 3:
            returnValue |= mxConstants.DIRECTION_MASK_WEST;
            break;
        }
      }
      if (directions.indexOf(mxConstants.DIRECTION_WEST) >= 0) {
        switch (quad) {
          case 0:
            returnValue |= mxConstants.DIRECTION_MASK_WEST;
            break;
          case 1:
            returnValue |= mxConstants.DIRECTION_MASK_NORTH;
            break;
          case 2:
            returnValue |= mxConstants.DIRECTION_MASK_EAST;
            break;
          case 3:
            returnValue |= mxConstants.DIRECTION_MASK_SOUTH;
            break;
        }
      }
      if (directions.indexOf(mxConstants.DIRECTION_SOUTH) >= 0) {
        switch (quad) {
          case 0:
            returnValue |= mxConstants.DIRECTION_MASK_SOUTH;
            break;
          case 1:
            returnValue |= mxConstants.DIRECTION_MASK_WEST;
            break;
          case 2:
            returnValue |= mxConstants.DIRECTION_MASK_NORTH;
            break;
          case 3:
            returnValue |= mxConstants.DIRECTION_MASK_EAST;
            break;
        }
      }
      if (directions.indexOf(mxConstants.DIRECTION_EAST) >= 0) {
        switch (quad) {
          case 0:
            returnValue |= mxConstants.DIRECTION_MASK_EAST;
            break;
          case 1:
            returnValue |= mxConstants.DIRECTION_MASK_SOUTH;
            break;
          case 2:
            returnValue |= mxConstants.DIRECTION_MASK_WEST;
            break;
          case 3:
            returnValue |= mxConstants.DIRECTION_MASK_NORTH;
            break;
        }
      }
      return returnValue;
    }
  },
  reversePortConstraints(constraint) {
    let result = 0;
    result = (constraint & mxConstants.DIRECTION_MASK_WEST) << 3;
    result |= (constraint & mxConstants.DIRECTION_MASK_NORTH) << 1;
    result |= (constraint & mxConstants.DIRECTION_MASK_SOUTH) >> 1;
    result |= (constraint & mxConstants.DIRECTION_MASK_EAST) >> 3;
    return result;
  },
  findNearestSegment(state, x, y) {
    let index = -1;
    if (state.absolutePoints.length > 0) {
      let last = state.absolutePoints[0];
      let min = undefined;
      for (let i = 1; i < state.absolutePoints.length; i++) {
        const current = state.absolutePoints[i];
        const dist = mxUtils.ptSegDistSq(last.x, last.y, current.x, current.y, x, y);
        if (!min || dist < min) {
          min = dist;
          index = i - 1;
        }
        last = current;
      }
    }
    return index;
  },
  getDirectedBounds(rect, m, style, flipH, flipV) {
    const d = mxUtils.getValue(style, mxConstants.STYLE_DIRECTION, mxConstants.DIRECTION_EAST);
    flipH = (!!flipH) ? flipH : mxUtils.getValue(style, mxConstants.STYLE_FLIPH, false);
    flipV = (!!flipV) ? flipV : mxUtils.getValue(style, mxConstants.STYLE_FLIPV, false);
    m.x = Math.round(Math.max(0, Math.min(rect.width, m.x)));
    m.y = Math.round(Math.max(0, Math.min(rect.height, m.y)));
    m.width = Math.round(Math.max(0, Math.min(rect.width, m.width)));
    m.height = Math.round(Math.max(0, Math.min(rect.height, m.height)));
    if ((flipV && (d == mxConstants.DIRECTION_SOUTH || d == mxConstants.DIRECTION_NORTH)) || (flipH && (d == mxConstants.DIRECTION_EAST || d == mxConstants.DIRECTION_WEST))) {
      const tmp = m.x;
      m.x = m.width;
      m.width = tmp;
    }
    if ((flipH && (d == mxConstants.DIRECTION_SOUTH || d == mxConstants.DIRECTION_NORTH)) || (flipV && (d == mxConstants.DIRECTION_EAST || d == mxConstants.DIRECTION_WEST))) {
      const tmp = m.y;
      m.y = m.height;
      m.height = tmp;
    }
    const m2 = mxRectangle.fromRectangle(m);
    if (d == mxConstants.DIRECTION_SOUTH) {
      m2.y = m.x;
      m2.x = m.height;
      m2.width = m.y;
      m2.height = m.width;
    } else if (d == mxConstants.DIRECTION_WEST) {
      m2.y = m.height;
      m2.x = m.width;
      m2.width = m.x;
      m2.height = m.y;
    } else if (d == mxConstants.DIRECTION_NORTH) {
      m2.y = m.width;
      m2.x = m.y;
      m2.width = m.height;
      m2.height = m.x;
    }
    return new mxRectangle(rect.x + m2.x, rect.y + m2.y, rect.width - m2.width - m2.x, rect.height - m2.height - m2.y);
  },
  getPerimeterPoint(pts, center, point) {
    let min = undefined;
    for (let i = 0; i < pts.length - 1; i++) {
      const pt = mxUtils.intersection(pts[i].x, pts[i].y, pts[i + 1].x, pts[i + 1].y, center.x, center.y, point.x, point.y);
      if (!!pt) {
        const dx = point.x - pt.x;
        const dy = point.y - pt.y;
        const ip = { p: pt, distSq: dy * dy + dx * dx };
        if (!!ip && (!min || min.distSq > ip.distSq)) {
          min = ip;
        }
      }
    }
    return (!!min) ? min.p : null;
  },
  rectangleIntersectsSegment(bounds, p1, p2) {
    const top = bounds.y;
    const left = bounds.x;
    const bottom = top + bounds.height;
    const right = left + bounds.width;
    let minX = p1.x;
    let maxX = p2.x;
    if (p1.x > p2.x) {
      minX = p2.x;
      maxX = p1.x;
    }
    if (maxX > right) {
      maxX = right;
    }
    if (minX < left) {
      minX = left;
    }
    if (minX > maxX) {
      return false;
    }
    let minY = p1.y;
    let maxY = p2.y;
    const dx = p2.x - p1.x;
    if (Math.abs(dx) > 1e-7) {
      const a = (p2.y - p1.y) / dx;
      const b = p1.y - a * p1.x;
      minY = a * minX + b;
      maxY = a * maxX + b;
    }
    if (minY > maxY) {
      const tmp = maxY;
      maxY = minY;
      minY = tmp;
    }
    if (maxY > bottom) {
      maxY = bottom;
    }
    if (minY < top) {
      minY = top;
    }
    if (minY > maxY) {
      return false;
    }
    return true;
  },
  contains(bounds, x, y) {
    return (bounds.x <= x && bounds.x + bounds.width >= x && bounds.y <= y && bounds.y + bounds.height >= y);
  },
  intersects(a, b) {
    let tw = a.width;
    let th = a.height;
    let rw = b.width;
    let rh = b.height;
    if (rw <= 0 || rh <= 0 || tw <= 0 || th <= 0) {
      return false;
    }
    const tx = a.x;
    const ty = a.y;
    const rx = b.x;
    const ry = b.y;
    rw += rx;
    rh += ry;
    tw += tx;
    th += ty;
    return ((rw < rx || rw > tx) && (rh < ry || rh > ty) && (tw < tx || tw > rx) && (th < ty || th > ry));
  },
  intersectsHotspot(state, x, y, hotspot, min, max) {
    hotspot = (!!hotspot) ? hotspot : 1;
    min = (!!min) ? min : 0;
    max = (!!max) ? max : 0;
    if (hotspot > 0) {
      let cx = state.getCenterX();
      let cy = state.getCenterY();
      let w = state.width;
      let h = state.height;
      const start = mxUtils.getValue(state.style, mxConstants.STYLE_STARTSIZE) * state.view.scale;
      if (start > 0) {
        if (mxUtils.getValue(state.style, mxConstants.STYLE_HORIZONTAL, true)) {
          cy = state.y + start / 2;
          h = start;
        } else {
          cx = state.x + start / 2;
          w = start;
        }
      }
      w = Math.max(min, w * hotspot);
      h = Math.max(min, h * hotspot);
      if (max > 0) {
        w = Math.min(w, max);
        h = Math.min(h, max);
      }
      const rect = new mxRectangle(cx - w / 2, cy - h / 2, w, h);
      const alpha = mxUtils.toRadians(mxUtils.getValue(state.style, mxConstants.STYLE_ROTATION) || 0);
      if (alpha != 0) {
        const cos = Math.cos(-alpha);
        const sin = Math.sin(-alpha);
        const cx = new mxPoint(state.getCenterX(), state.getCenterY());
        const pt = mxUtils.getRotatedPoint(new mxPoint(x, y), cos, sin, cx);
        x = pt.x;
        y = pt.y;
      }
      return mxUtils.contains(rect, x, y);
    }
    return true;
  },
  getOffset(container, scrollOffset) {
    let offsetLeft = 0;
    let offsetTop = 0;
    let fixed = false;
    let node = container;
    const b = document.body;
    const d = document.documentElement;
    while (!!node && node != b && node != d && !fixed) {
      const style = mxUtils.getCurrentStyle(node);
      if (!!style) {
        fixed = fixed || style.position == 'fixed';
      }
      node = node.parentNode;
    }
    if (!scrollOffset && !fixed) {
      const offset = mxUtils.getDocumentScrollOrigin(container.ownerDocument);
      offsetLeft += offset.x;
      offsetTop += offset.y;
    }
    const r = container.getBoundingClientRect();
    if (!!r) {
      offsetLeft += r.left;
      offsetTop += r.top;
    }
    return new mxPoint(offsetLeft, offsetTop);
  },
  getDocumentScrollOrigin(doc) {
    if (mxClient.IS_QUIRKS) {
      return new mxPoint(doc.body.scrollLeft, doc.body.scrollTop);
    } else {
      const wnd = doc.defaultView || doc.parentWindow;
      const x = (!!wnd && window.pageXOffset !== undefined) ? window.pageXOffset : (document.documentElement || document.body.parentNode || document.body).scrollLeft;
      const y = (!!wnd && window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
      return new mxPoint(x, y);
    }
  },
  getScrollOrigin(node, includeAncestors, includeDocument) {
    includeAncestors = (!!includeAncestors) ? includeAncestors : false;
    includeDocument = (!!includeDocument) ? includeDocument : true;
    const doc = (!!node) ? node.ownerDocument : document;
    const b = doc.body;
    const d = doc.documentElement;
    const result = new mxPoint();
    let fixed = false;
    while (!!node && node != b && node != d) {
      if (!isNaN(node.scrollLeft) && !isNaN(node.scrollTop)) {
        result.x += node.scrollLeft;
        result.y += node.scrollTop;
      }
      const style = mxUtils.getCurrentStyle(node);
      if (!!style) {
        fixed = fixed || style.position == 'fixed';
      }
      node = (includeAncestors) ? node.parentNode : null;
    }
    if (!fixed && includeDocument) {
      const origin = mxUtils.getDocumentScrollOrigin(doc);
      result.x += origin.x;
      result.y += origin.y;
    }
    return result;
  },
  convertPoint(container, x, y) {
    const origin = mxUtils.getScrollOrigin(container, false);
    const offset = mxUtils.getOffset(container);
    offset.x -= origin.x;
    offset.y -= origin.y;
    return new mxPoint(x - offset.x, y - offset.y);
  },
  ltrim(str, chars) {
    chars = chars || '\\s';
    return (!!str) ? str.replace(new RegExp('^[' + chars + ']+', 'g'), '') : null;
  },
  rtrim(str, chars) {
    chars = chars || '\\s';
    return (!!str) ? str.replace(new RegExp('[' + chars + ']+$', 'g'), '') : null;
  },
  trim(str, chars) {
    return mxUtils.ltrim(mxUtils.rtrim(str, chars), chars);
  },
  isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n) && (typeof (n) != 'string' || n.toLowerCase().indexOf('0x') < 0);
  },
  isInteger(n) {
    return String(parseInt(n)) === String(n);
  },
  mod(n, m) {
    return ((n % m) + m) % m;
  },
  intersection(x0, y0, x1, y1, x2, y2, x3, y3) {
    const denom = ((y3 - y2) * (x1 - x0)) - ((x3 - x2) * (y1 - y0));
    const nume_a = ((x3 - x2) * (y0 - y2)) - ((y3 - y2) * (x0 - x2));
    const nume_b = ((x1 - x0) * (y0 - y2)) - ((y1 - y0) * (x0 - x2));
    const ua = nume_a / denom;
    const ub = nume_b / denom;
    if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
      const x = x0 + ua * (x1 - x0);
      const y = y0 + ua * (y1 - y0);
      return new mxPoint(x, y);
    }
    return null;
  },
  ptSegDistSq(x1, y1, x2, y2, px, py) {
    x2 -= x1;
    y2 -= y1;
    px -= x1;
    py -= y1;
    let dotprod = px * x2 + py * y2;
    let projlenSq;
    if (dotprod <= 0) {
      projlenSq = 0;
    } else {
      px = x2 - px;
      py = y2 - py;
      dotprod = px * x2 + py * y2;
      if (dotprod <= 0) {
        projlenSq = 0;
      } else {
        projlenSq = dotprod * dotprod / (x2 * x2 + y2 * y2);
      }
    }
    let lenSq = px * px + py * py - projlenSq;
    if (lenSq < 0) {
      lenSq = 0;
    }
    return lenSq;
  },
  ptLineDist(x1, y1, x2, y2, px, py) {
    return Math.abs((y2 - y1) * px - (x2 - x1) * py + x2 * y1 - y2 * x1) / Math.sqrt((y2 - y1) * (y2 - y1) + (x2 - x1) * (x2 - x1));
  },
  relativeCcw(x1, y1, x2, y2, px, py) {
    x2 -= x1;
    y2 -= y1;
    px -= x1;
    py -= y1;
    let ccw = px * y2 - py * x2;
    if (ccw == 0) {
      ccw = px * x2 + py * y2;
      if (ccw > 0) {
        px -= x2;
        py -= y2;
        ccw = px * x2 + py * y2;
        if (ccw < 0) {
          ccw = 0;
        }
      }
    }
    return (ccw < 0) ? -1 : ((ccw > 0) ? 1 : 0);
  },
  animateChanges(graph, changes) {
    mxEffects.animateChanges.apply(this, arguments);
  },
  cascadeOpacity(graph, cell, opacity) {
    mxEffects.cascadeOpacity.apply(this, arguments);
  },
  fadeOut(node, from, remove, step, delay, isEnabled) {
    mxEffects.fadeOut.apply(this, arguments);
  },
  setOpacity(node, value) {
    if (mxUtils.isVml(node)) {
      if (value >= 100) {
        node.style.filter = '';
      } else {
        node.style.filter = 'alpha(opacity=' + (value / 5) + ')';
      }
    } else if (mxClient.IS_IE && (typeof (document.documentMode) === 'undefined' || document.documentMode < 9)) {
      if (value >= 100) {
        node.style.filter = '';
      } else {
        node.style.filter = 'alpha(opacity=' + value + ')';
      }
    } else {
      node.style.opacity = (value / 100);
    }
  },
  createImage(src) {
    let imageNode = undefined;
    if (mxClient.IS_IE6 && document.compatMode != 'CSS1Compat') {
      imageNode = document.createElement(mxClient.VML_PREFIX + ':image');
      imageNode.setAttribute('src', src);
      imageNode.style.borderStyle = 'none';
    } else {
      imageNode = document.createElement('img');
      imageNode.setAttribute('src', src);
      imageNode.setAttribute('border', '0');
    }
    return imageNode;
  },
  sortCells(cells, ascending) {
    ascending = (!!ascending) ? ascending : true;
    const lookup = new mxDictionary();
    cells.sort(function (o1, o2) {
      let p1 = lookup.get(o1);
      if (!p1) {
        p1 = mxCellPath.create(o1).split(mxCellPath.PATH_SEPARATOR);
        lookup.put(o1, p1);
      }
      let p2 = lookup.get(o2);
      if (!p2) {
        p2 = mxCellPath.create(o2).split(mxCellPath.PATH_SEPARATOR);
        lookup.put(o2, p2);
      }
      const comp = mxCellPath.compare(p1, p2);
      return (comp == 0) ? 0 : (((comp > 0) == ascending) ? 1 : -1);
    });
    return cells;
  },
  getStylename(style) {
    if (!!style) {
      const pairs = style.split(';');
      const stylename = pairs[0];
      if (stylename.indexOf('=') < 0) {
        return stylename;
      }
    }
    return '';
  },
  getStylenames(style) {
    const result = [];
    if (!!style) {
      const pairs = style.split(';');
      for (let i = 0; i < pairs.length; i++) {
        if (pairs[i].indexOf('=') < 0) {
          result.push(pairs[i]);
        }
      }
    }
    return result;
  },
  indexOfStylename(style, stylename) {
    if (!!style && !!stylename) {
      const tokens = style.split(';');
      let pos = 0;
      for (let i = 0; i < tokens.length; i++) {
        if (tokens[i] == stylename) {
          return pos;
        }
        pos += tokens[i].length + 1;
      }
    }
    return -1;
  },
  addStylename(style, stylename) {
    if (mxUtils.indexOfStylename(style, stylename) < 0) {
      if (!style) {
        style = '';
      } else if (style.length > 0 && style.charAt(style.length - 1) != ';') {
        style += ';';
      }
      style += stylename;
    }
    return style;
  },
  removeStylename(style, stylename) {
    const result = [];
    if (!!style) {
      const tokens = style.split(';');
      for (let i = 0; i < tokens.length; i++) {
        if (tokens[i] != stylename) {
          result.push(tokens[i]);
        }
      }
    }
    return result.join(';');
  },
  removeAllStylenames(style) {
    const result = [];
    if (!!style) {
      const tokens = style.split(';');
      for (let i = 0; i < tokens.length; i++) {
        if (tokens[i].indexOf('=') >= 0) {
          result.push(tokens[i]);
        }
      }
    }
    return result.join(';');
  },
  setCellStyles(model, cells, key, value) {
    if (!!cells && cells.length > 0) {
      model.beginUpdate();
      try {
        for (let i = 0; i < cells.length; i++) {
          if (cells[i]) {
            const style = mxUtils.setStyle(model.getStyle(cells[i]), key, value);
            model.setStyle(cells[i], style);
          }
        }
      } finally {
        model.endUpdate();
      }
    }
  },
  setStyle(style, key, value) {
    const isValue = !!value && (typeof (value.length) == 'undefined' || value.length > 0);
    if (!style || style.length == 0) {
      if (isValue) {
        style = key + '=' + value + ';';
      }
    } else {
      if (style.substring(0, key.length + 1) == key + '=') {
        const next = style.indexOf(';');
        if (isValue) {
          style = key + '=' + value + ((next < 0) ? ';' : style.substring(next));
        } else {
          style = (next < 0 || next == style.length - 1) ? '' : style.substring(next + 1);
        }
      } else {
        const index = style.indexOf(';' + key + '=');
        if (index < 0) {
          if (isValue) {
            const sep = (style.charAt(style.length - 1) == ';') ? '' : ';';
            style = style + sep + key + '=' + value + ';';
          }
        } else {
          const next = style.indexOf(';', index + 1);
          if (isValue) {
            style = style.substring(0, index + 1) + key + '=' + value + ((next < 0) ? ';' : style.substring(next));
          } else {
            style = style.substring(0, index) + ((next < 0) ? ';' : style.substring(next));
          }
        }
      }
    }
    return style;
  },
  setCellStyleFlags(model, cells, key, flag, value) {
    if (!!cells && cells.length > 0) {
      model.beginUpdate();
      try {
        for (let i = 0; i < cells.length; i++) {
          if (cells[i]) {
            const style = mxUtils.setStyleFlag(model.getStyle(cells[i]), key, flag, value);
            model.setStyle(cells[i], style);
          }
        }
      } finally {
        model.endUpdate();
      }
    }
  },
  setStyleFlag(style, key, flag, value) {
    if (!style || style.length == 0) {
      if (value || !value) {
        style = key + '=' + flag;
      } else {
        style = key + '=0';
      }
    } else {
      const index = style.indexOf(key + '=');
      if (index < 0) {
        const sep = (style.charAt(style.length - 1) == ';') ? '' : ';';
        if (value || !value) {
          style = style + sep + key + '=' + flag;
        } else {
          style = style + sep + key + '=0';
        }
      } else {
        const cont = style.indexOf(';', index);
        let tmp = '';
        if (cont < 0) {
          tmp = style.substring(index + key.length + 1);
        } else {
          tmp = style.substring(index + key.length + 1, cont);
        }
        if (!value) {
          tmp = parseInt(tmp) ^ flag;
        } else if (value) {
          tmp = parseInt(tmp) | flag;
        } else {
          tmp = parseInt(tmp) & ~flag;
        }
        style = style.substring(0, index) + key + '=' + tmp + ((cont >= 0) ? style.substring(cont) : '');
      }
    }
    return style;
  },
  getAlignmentAsPoint(align, valign) {
    let dx = 0;
    let dy = 0;
    if (align == mxConstants.ALIGN_CENTER) {
      dx = -0.5;
    } else if (align == mxConstants.ALIGN_RIGHT) {
      dx = -1;
    }
    if (valign == mxConstants.ALIGN_MIDDLE) {
      dy = -0.5;
    } else if (valign == mxConstants.ALIGN_BOTTOM) {
      dy = -1;
    }
    return new mxPoint(dx, dy);
  },
  getSizeForString(text, fontSize, fontFamily, textWidth) {
    fontSize = (!!fontSize) ? fontSize : mxConstants.DEFAULT_FONTSIZE;
    fontFamily = (!!fontFamily) ? fontFamily : mxConstants.DEFAULT_FONTFAMILY;
    const div = document.createElement('div');
    div.style.fontFamily = fontFamily;
    div.style.fontSize = Math.round(fontSize) + 'px';
    div.style.lineHeight = Math.round(fontSize * mxConstants.LINE_HEIGHT) + 'px';
    div.style.position = 'absolute';
    div.style.visibility = 'hidden';
    div.style.display = (mxClient.IS_QUIRKS) ? 'inline' : 'inline-block';
    div.style.zoom = '1';
    if (!!textWidth) {
      div.style.width = textWidth + 'px';
      div.style.whiteSpace = 'normal';
    } else {
      div.style.whiteSpace = 'nowrap';
    }
    div.innerHTML = text;
    document.body.appendChild(div);
    const size = new mxRectangle(0, 0, div.offsetWidth, div.offsetHeight);
    document.body.removeChild(div);
    return size;
  },
  getViewXml(graph, scale, cells, x0, y0) {
    x0 = (!!x0) ? x0 : 0;
    y0 = (!!y0) ? y0 : 0;
    scale = (!!scale) ? scale : 1;
    if (!cells) {
      const model = graph.getModel();
      cells = [model.getRoot()];
    }
    const view = graph.getView();
    let result = undefined;
    const eventsEnabled = view.isEventsEnabled();
    view.setEventsEnabled(false);
    const drawPane = view.drawPane;
    const overlayPane = view.overlayPane;
    if (graph.dialect == mxConstants.DIALECT_SVG) {
      view.drawPane = document.createElementNS(mxConstants.NS_SVG, 'g');
      view.canvas.appendChild(view.drawPane);
      view.overlayPane = document.createElementNS(mxConstants.NS_SVG, 'g');
      view.canvas.appendChild(view.overlayPane);
    } else {
      view.drawPane = view.drawPane.cloneNode(false);
      view.canvas.appendChild(view.drawPane);
      view.overlayPane = view.overlayPane.cloneNode(false);
      view.canvas.appendChild(view.overlayPane);
    }
    const translate = view.getTranslate();
    view.translate = new mxPoint(x0, y0);
    const temp = new mxTemporaryCellStates(graph.getView(), scale, cells);
    try {
      const enc = new mxCodec();
      result = enc.encode(graph.getView());
    } finally {
      temp.destroy();
      view.translate = translate;
      view.canvas.removeChild(view.drawPane);
      view.canvas.removeChild(view.overlayPane);
      view.drawPane = drawPane;
      view.overlayPane = overlayPane;
      view.setEventsEnabled(eventsEnabled);
    }
    return result;
  },
  getScaleForPageCount(pageCount, graph, pageFormat, border) {
    if (pageCount < 1) {
      return 1;
    }
    pageFormat = (!!pageFormat) ? pageFormat : mxConstants.PAGE_FORMAT_A4_PORTRAIT;
    border = (!!border) ? border : 0;
    const availablePageWidth = pageFormat.width - (border * 2);
    const availablePageHeight = pageFormat.height - (border * 2);
    const graphBounds = graph.getGraphBounds().clone();
    const sc = graph.getView().getScale();
    graphBounds.width /= sc;
    graphBounds.height /= sc;
    const graphWidth = graphBounds.width;
    const graphHeight = graphBounds.height;
    let scale = 1;
    const pageFormatAspectRatio = availablePageWidth / availablePageHeight;
    const graphAspectRatio = graphWidth / graphHeight;
    const pagesAspectRatio = graphAspectRatio / pageFormatAspectRatio;
    const pageRoot = Math.sqrt(pageCount);
    const pagesAspectRatioSqrt = Math.sqrt(pagesAspectRatio);
    let numRowPages = pageRoot * pagesAspectRatioSqrt;
    let numColumnPages = pageRoot / pagesAspectRatioSqrt;
    if (numRowPages < 1 && numColumnPages > pageCount) {
      const scaleChange = numColumnPages / pageCount;
      numColumnPages = pageCount;
      numRowPages /= scaleChange;
    }
    if (numColumnPages < 1 && numRowPages > pageCount) {
      const scaleChange = numRowPages / pageCount;
      numRowPages = pageCount;
      numColumnPages /= scaleChange;
    }
    let currentTotalPages = Math.ceil(numRowPages) * Math.ceil(numColumnPages);
    let numLoops = 0;
    while (currentTotalPages > pageCount) {
      let roundRowDownProportion = Math.floor(numRowPages) / numRowPages;
      let roundColumnDownProportion = Math.floor(numColumnPages) / numColumnPages;
      if (roundRowDownProportion == 1) {
        roundRowDownProportion = Math.floor(numRowPages - 1) / numRowPages;
      }
      if (roundColumnDownProportion == 1) {
        roundColumnDownProportion = Math.floor(numColumnPages - 1) / numColumnPages;
      }
      let scaleChange = 1;
      if (roundRowDownProportion > roundColumnDownProportion) {
        scaleChange = roundRowDownProportion;
      } else {
        scaleChange = roundColumnDownProportion;
      }
      numRowPages = numRowPages * scaleChange;
      numColumnPages = numColumnPages * scaleChange;
      currentTotalPages = Math.ceil(numRowPages) * Math.ceil(numColumnPages);
      numLoops++;
      if (numLoops > 10) {
        break;
      }
    }
    const posterWidth = availablePageWidth * numRowPages;
    scale = posterWidth / graphWidth;
    return scale * 0.99999;
  },
  show(graph, doc, x0, y0, w, h) {
    x0 = (!!x0) ? x0 : 0;
    y0 = (!!y0) ? y0 : 0;
    if (!doc) {
      const wnd = window.open();
      doc = wnd.document;
    } else {
      doc.open();
    }
    if (document.documentMode == 9) {
      doc.writeln('<!--[if IE]><meta http-equiv="X-UA-Compatible" content="IE=9"><![endif]-->');
    }
    const bounds = graph.getGraphBounds();
    const dx = Math.ceil(x0 - bounds.x);
    const dy = Math.ceil(y0 - bounds.y);
    if (!w) {
      w = Math.ceil(bounds.width + x0) + Math.ceil(Math.ceil(bounds.x) - bounds.x);
    }
    if (!h) {
      h = Math.ceil(bounds.height + y0) + Math.ceil(Math.ceil(bounds.y) - bounds.y);
    }
    if (mxClient.IS_IE || document.documentMode == 11) {
      let html = '<html><head>';
      const base = document.getElementsByTagName('base');
      for (let i = 0; i < base.length; i++) {
        html += base[i].outerHTML;
      }
      html += '<style>';
      for (let i = 0; i < document.styleSheets.length; i++) {
        try {
          html += document.styleSheets[i].cssText;
        } catch (e) {
        }
      }
      html += '</style></head><body style="margin:0px;">';
      html += '<div style="position:absolute;overflow:hidden;width:' + w + 'px;height:' + h + 'px;"><div style="position:relative;left:' + dx + 'px;top:' + dy + 'px;">';
      html += graph.container.innerHTML;
      html += '</div></div></body><html>';
      doc.writeln(html);
      doc.close();
    } else {
      doc.writeln('<html><head>');
      const base = document.getElementsByTagName('base');
      for (let i = 0; i < base.length; i++) {
        doc.writeln(mxUtils.getOuterHtml(base[i]));
      }
      const links = document.getElementsByTagName('link');
      for (let i = 0; i < links.length; i++) {
        doc.writeln(mxUtils.getOuterHtml(links[i]));
      }
      const styles = document.getElementsByTagName('style');
      for (let i = 0; i < styles.length; i++) {
        doc.writeln(mxUtils.getOuterHtml(styles[i]));
      }
      doc.writeln('</head><body style="margin:0px;"></body></html>');
      doc.close();
      const outer = doc.createElement('div');
      outer.position = 'absolute';
      outer.overflow = 'hidden';
      outer.style.width = w + 'px';
      outer.style.height = h + 'px';
      const div = doc.createElement('div');
      div.style.position = 'absolute';
      div.style.left = dx + 'px';
      div.style.top = dy + 'px';
      let node = graph.container.firstChild;
      let svg = undefined;
      while (!!node) {
        const clone = node.cloneNode(true);
        if (node == graph.view.drawPane.ownerSVGElement) {
          outer.appendChild(clone);
          svg = clone;
        } else {
          div.appendChild(clone);
        }
        node = node.nextSibling;
      }
      doc.body.appendChild(outer);
      if (!!div.firstChild) {
        doc.body.appendChild(div);
      }
      if (!!svg) {
        svg.style.minWidth = '';
        svg.style.minHeight = '';
        svg.firstChild.setAttribute('transform', 'translate(' + dx + ',' + dy + ')');
      }
    }
    mxUtils.removeCursors(doc.body);
    return doc;
  },
  printScreen(graph) {
    const wnd = window.open();
    const bounds = graph.getGraphBounds();
    mxUtils.show(graph, wnd.document);
    const print = function () {
      wnd.focus();
      wnd.print();
      wnd.close();
    };
    if (mxClient.IS_GC) {
      wnd.setTimeout(print, 500);
    } else {
      print();
    }
  },
  popup(content, isInternalWindow) {
    if (isInternalWindow) {
      const div = document.createElement('div');
      div.style.overflow = 'scroll';
      div.style.width = '636px';
      div.style.height = '460px';
      const pre = document.createElement('pre');
      pre.innerHTML = mxUtils.htmlEntities(content, false).replace(/\n/g, '<br>').replace(/ /g, '&nbsp;');
      div.appendChild(pre);
      const w = document.body.clientWidth;
      const h = Math.max(document.body.clientHeight || 0, document.documentElement.clientHeight);
      const wnd = new mxWindow('Popup Window', div, w / 2 - 320, h / 2 - 240, 640, 480, false, true);
      wnd.setClosable(true);
      wnd.setVisible(true);
    } else {
      if (mxClient.IS_NS) {
        const wnd = window.open();
        wnd.document.writeln('<pre>' + mxUtils.htmlEntities(content) + '</pre');
        wnd.document.close();
      } else {
        const wnd = window.open();
        const pre = wnd.document.createElement('pre');
        pre.innerHTML = mxUtils.htmlEntities(content, false).replace(/\n/g, '<br>').replace(/ /g, '&nbsp;');
        wnd.document.body.appendChild(pre);
      }
    }
  },
  alert(message) {
    alert(message);
  },
  prompt(message, defaultValue) {
    return prompt(message, (!!defaultValue) ? defaultValue : '');
  },
  confirm(message) {
    return confirm(message);
  },
  error(message, width, close, icon) {
    const div = document.createElement('div');
    div.style.padding = '20px';
    const img = document.createElement('img');
    img.setAttribute('src', icon || mxUtils.errorImage);
    img.setAttribute('valign', 'bottom');
    img.style.verticalAlign = 'middle';
    div.appendChild(img);
    div.appendChild(document.createTextNode('\u00A0'));
    div.appendChild(document.createTextNode('\u00A0'));
    div.appendChild(document.createTextNode('\u00A0'));
    mxUtils.write(div, message);
    const w = document.body.clientWidth;
    const h = (document.body.clientHeight || document.documentElement.clientHeight);
    const warn = new mxWindow(mxResources.get(mxUtils.errorResource) || mxUtils.errorResource, div, (w - width) / 2, h / 4, width, null, false, true);
    if (close) {
      mxUtils.br(div);
      const tmp = document.createElement('p');
      const button = document.createElement('button');
      if (mxClient.IS_IE) {
        button.style.cssText = 'float:right';
      } else {
        button.setAttribute('style', 'float:right');
      }
      mxEvent.addListener(button, 'click', function (evt) {
        warn.destroy();
      });
      mxUtils.write(button, mxResources.get(mxUtils.closeResource) || mxUtils.closeResource);
      tmp.appendChild(button);
      div.appendChild(tmp);
      mxUtils.br(div);
      warn.setClosable(true);
    }
    warn.setVisible(true);
    return warn;
  },
  makeDraggable(element, graphF, funct, dragElement, dx, dy, autoscroll, scalePreview, highlightDropTargets, getDropTarget) {
    const dragSource = new mxDragSource(element, funct);
    dragSource.dragOffset = new mxPoint((!!dx) ? dx : 0, (!!dy) ? dy : mxConstants.TOOLTIP_VERTICAL_OFFSET);
    dragSource.autoscroll = autoscroll;
    dragSource.setGuidesEnabled(false);
    if (!!highlightDropTargets) {
      dragSource.highlightDropTargets = highlightDropTargets;
    }
    if (!!getDropTarget) {
      dragSource.getDropTarget = getDropTarget;
    }
    dragSource.getGraphForEvent = function (evt) {
      return (typeof (graphF) == 'function') ? graphF(evt) : graphF;
    };
    if (!!dragElement) {
      dragSource.createDragElement = function () {
        return dragElement.cloneNode(true);
      };
      if (scalePreview) {
        dragSource.createPreviewElement = function (graph) {
          const elt = dragElement.cloneNode(true);
          const w = parseInt(elt.style.width);
          const h = parseInt(elt.style.height);
          elt.style.width = Math.round(w * graph.view.scale) + 'px';
          elt.style.height = Math.round(h * graph.view.scale) + 'px';
          return elt;
        };
      }
    }
    return dragSource;
  },
};
