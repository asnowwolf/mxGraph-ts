import { mxClient } from '../mxClient';
import { mxEvent } from './mxEvent';
import { mxUtils } from './mxUtils';
import { mxWindow } from './mxWindow';

export let mxLog = {
  consoleName: 'Console', TRACE: false, DEBUG: true, WARN: true, buffer: '', init() {
    if (!mxLog.window && !!document.body) {
      const title = mxLog.consoleName + ' - mxGraph ' + mxClient.VERSION;
      const table = document.createElement('table');
      table.setAttribute('width', '100%');
      table.setAttribute('height', '100%');
      const tbody = document.createElement('tbody');
      let tr = document.createElement('tr');
      const td = document.createElement('td');
      td.style.verticalAlign = 'top';
      mxLog.textarea = document.createElement('textarea');
      mxLog.textarea.setAttribute('wrap', 'off');
      mxLog.textarea.setAttribute('readOnly', 'true');
      mxLog.textarea.style.height = '100%';
      mxLog.textarea.style.resize = 'none';
      mxLog.textarea.value = mxLog.buffer;
      if (mxClient.IS_NS && document.compatMode != 'BackCompat') {
        mxLog.textarea.style.width = '99%';
      } else {
        mxLog.textarea.style.width = '100%';
      }
      td.appendChild(mxLog.textarea);
      tr.appendChild(td);
      tbody.appendChild(tr);
      tr = document.createElement('tr');
      mxLog.td = document.createElement('td');
      mxLog.td.style.verticalAlign = 'top';
      mxLog.td.setAttribute('height', '30px');
      tr.appendChild(mxLog.td);
      tbody.appendChild(tr);
      table.appendChild(tbody);
      mxLog.addButton('Info', function (evt) {
        mxLog.info();
      });
      mxLog.addButton('DOM', function (evt) {
        const content = mxUtils.getInnerHtml(document.body);
        mxLog.debug(content);
      });
      mxLog.addButton('Trace', function (evt) {
        mxLog.TRACE = !mxLog.TRACE;
        if (mxLog.TRACE) {
          mxLog.debug('Tracing enabled');
        } else {
          mxLog.debug('Tracing disabled');
        }
      });
      mxLog.addButton('Copy', function (evt) {
        try {
          mxUtils.copy(mxLog.textarea.value);
        } catch (err) {
          mxUtils.alert(err);
        }
      });
      mxLog.addButton('Show', function (evt) {
        try {
          mxUtils.popup(mxLog.textarea.value);
        } catch (err) {
          mxUtils.alert(err);
        }
      });
      mxLog.addButton('Clear', function (evt) {
        mxLog.textarea.value = '';
      });
      let h = 0;
      let w = 0;
      if (typeof (window.innerWidth) === 'number') {
        h = window.innerHeight;
        w = window.innerWidth;
      } else {
        h = (document.documentElement.clientHeight || document.body.clientHeight);
        w = document.body.clientWidth;
      }
      mxLog.window = new mxWindow(title, table, Math.max(0, w - 320), Math.max(0, h - 210), 300, 160);
      mxLog.window.setMaximizable(true);
      mxLog.window.setScrollable(false);
      mxLog.window.setResizable(true);
      mxLog.window.setClosable(true);
      mxLog.window.destroyOnClose = false;
      if (((mxClient.IS_NS || mxClient.IS_IE) && !mxClient.IS_GC && !mxClient.IS_SF && document.compatMode != 'BackCompat') || document.documentMode == 11) {
        const elt = mxLog.window.getElement();
        const resizeHandler = function (sender, evt) {
          mxLog.textarea.style.height = Math.max(0, elt.offsetHeight - 70) + 'px';
        };
        mxLog.window.addListener(mxEvent.RESIZE_END, resizeHandler);
        mxLog.window.addListener(mxEvent.MAXIMIZE, resizeHandler);
        mxLog.window.addListener(mxEvent.NORMALIZE, resizeHandler);
        mxLog.textarea.style.height = '92px';
      }
    }
  }, info() {
    mxLog.writeln(mxUtils.toString(navigator));
  }, addButton(lab, funct) {
    const button = document.createElement('button');
    mxUtils.write(button, lab);
    mxEvent.addListener(button, 'click', funct);
    mxLog.td.appendChild(button);
  }, isVisible() {
    if (!!mxLog.window) {
      return mxLog.window.isVisible();
    }
    return false;
  }, show() {
    mxLog.setVisible(true);
  }, setVisible(visible) {
    if (!mxLog.window) {
      mxLog.init();
    }
    if (!!mxLog.window) {
      mxLog.window.setVisible(visible);
    }
  }, enter(string) {
    if (mxLog.TRACE) {
      mxLog.writeln('Entering ' + string);
      return new Date().getTime();
    }
  }, leave(string, t0) {
    if (mxLog.TRACE) {
      const dt = (t0 != 0) ? ' (' + (new Date().getTime() - t0) + ' ms)' : '';
      mxLog.writeln('Leaving ' + string + dt);
    }
  }, debug() {
    if (mxLog.DEBUG) {
      mxLog.writeln.apply(this, arguments);
    }
  }, warn() {
    if (mxLog.WARN) {
      mxLog.writeln.apply(this, arguments);
    }
  }, write() {
    let string = '';
    for (let i = 0; i < arguments.length; i++) {
      string += arguments[i];
      if (i < arguments.length - 1) {
        string += ' ';
      }
    }
    if (!!mxLog.textarea) {
      mxLog.textarea.value = mxLog.textarea.value + string;
      if (navigator.userAgent.indexOf('Presto/2.5') >= 0) {
        mxLog.textarea.style.visibility = 'hidden';
        mxLog.textarea.style.visibility = 'visible';
      }
      mxLog.textarea.scrollTop = mxLog.textarea.scrollHeight;
    } else {
      mxLog.buffer += string;
    }
  }, writeln() {
    let string = '';
    for (let i = 0; i < arguments.length; i++) {
      string += arguments[i];
      if (i < arguments.length - 1) {
        string += ' ';
      }
    }
    mxLog.write(string + '\n');
  },
};
