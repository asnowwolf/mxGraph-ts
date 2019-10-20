import { mxClient } from '../mxClient';
import { mxMouseEvent } from './mxMouseEvent';

export let mxEvent = {
  addListener: function () {
    const updateListenerList = function (element, eventName, funct) {
      if (element.mxListenerList == null) {
        element.mxListenerList = [];
      }
      const entry = { name: eventName, f: funct };
      element.mxListenerList.push(entry);
    };
    if (window.addEventListener) {
      return function (element, eventName, funct) {
        element.addEventListener(eventName, funct, false);
        updateListenerList(element, eventName, funct);
      };
    } else {
      return function (element, eventName, funct) {
        element.attachEvent('on' + eventName, funct);
        updateListenerList(element, eventName, funct);
      };
    }
  }(),
  removeListener: function () {
    const updateListener = function (element, eventName, funct) {
      if (element.mxListenerList != null) {
        const listenerCount = element.mxListenerList.length;
        for (let i = 0; i < listenerCount; i++) {
          const entry = element.mxListenerList[i];
          if (entry.f == funct) {
            element.mxListenerList.splice(i, 1);
            break;
          }
        }
        if (element.mxListenerList.length == 0) {
          element.mxListenerList = null;
        }
      }
    };
    if (window.removeEventListener) {
      return function (element, eventName, funct) {
        element.removeEventListener(eventName, funct, false);
        updateListener(element, eventName, funct);
      };
    } else {
      return function (element, eventName, funct) {
        element.detachEvent('on' + eventName, funct);
        updateListener(element, eventName, funct);
      };
    }
  }(),
  removeAllListeners(element) {
    const list = element.mxListenerList;
    if (list != null) {
      while (list.length > 0) {
        const entry = list[0];
        mxEvent.removeListener(element, entry.name, entry.f);
      }
    }
  },
  addGestureListeners(node, startListener, moveListener, endListener) {
    if (startListener != null) {
      mxEvent.addListener(node, (mxClient.IS_POINTER) ? 'pointerdown' : 'mousedown', startListener);
    }
    if (moveListener != null) {
      mxEvent.addListener(node, (mxClient.IS_POINTER) ? 'pointermove' : 'mousemove', moveListener);
    }
    if (endListener != null) {
      mxEvent.addListener(node, (mxClient.IS_POINTER) ? 'pointerup' : 'mouseup', endListener);
    }
    if (!mxClient.IS_POINTER && mxClient.IS_TOUCH) {
      if (startListener != null) {
        mxEvent.addListener(node, 'touchstart', startListener);
      }
      if (moveListener != null) {
        mxEvent.addListener(node, 'touchmove', moveListener);
      }
      if (endListener != null) {
        mxEvent.addListener(node, 'touchend', endListener);
      }
    }
  },
  removeGestureListeners(node, startListener, moveListener, endListener) {
    if (startListener != null) {
      mxEvent.removeListener(node, (mxClient.IS_POINTER) ? 'pointerdown' : 'mousedown', startListener);
    }
    if (moveListener != null) {
      mxEvent.removeListener(node, (mxClient.IS_POINTER) ? 'pointermove' : 'mousemove', moveListener);
    }
    if (endListener != null) {
      mxEvent.removeListener(node, (mxClient.IS_POINTER) ? 'pointerup' : 'mouseup', endListener);
    }
    if (!mxClient.IS_POINTER && mxClient.IS_TOUCH) {
      if (startListener != null) {
        mxEvent.removeListener(node, 'touchstart', startListener);
      }
      if (moveListener != null) {
        mxEvent.removeListener(node, 'touchmove', moveListener);
      }
      if (endListener != null) {
        mxEvent.removeListener(node, 'touchend', endListener);
      }
    }
  },
  redirectMouseEvents(node, graph, state, down, move, up, dblClick) {
    const getState = function (evt) {
      return (typeof (state) == 'function') ? state(evt) : state;
    };
    mxEvent.addGestureListeners(node, function (evt) {
      if (down != null) {
        down(evt);
      } else if (!mxEvent.isConsumed(evt)) {
        graph.fireMouseEvent(mxEvent.MOUSE_DOWN, new mxMouseEvent(evt, getState(evt)));
      }
    }, function (evt) {
      if (move != null) {
        move(evt);
      } else if (!mxEvent.isConsumed(evt)) {
        graph.fireMouseEvent(mxEvent.MOUSE_MOVE, new mxMouseEvent(evt, getState(evt)));
      }
    }, function (evt) {
      if (up != null) {
        up(evt);
      } else if (!mxEvent.isConsumed(evt)) {
        graph.fireMouseEvent(mxEvent.MOUSE_UP, new mxMouseEvent(evt, getState(evt)));
      }
    });
    mxEvent.addListener(node, 'dblclick', function (evt) {
      if (dblClick != null) {
        dblClick(evt);
      } else if (!mxEvent.isConsumed(evt)) {
        const tmp = getState(evt);
        graph.dblClick(evt, (tmp != null) ? tmp.cell : null);
      }
    });
  },
  release(element) {
    try {
      if (element != null) {
        mxEvent.removeAllListeners(element);
        const children = element.childNodes;
        if (children != null) {
          const childCount = children.length;
          for (let i = 0; i < childCount; i += 1) {
            mxEvent.release(children[i]);
          }
        }
      }
    } catch (e) {
    }
  },
  addMouseWheelListener(funct, target) {
    if (funct != null) {
      const wheelHandler = function (evt) {
        if (evt == null) {
          evt = window.event;
        }
        let delta = 0;
        if (mxClient.IS_FF) {
          delta = -evt.detail / 2;
        } else {
          delta = evt.wheelDelta / 120;
        }
        if (delta != 0) {
          funct(evt, delta > 0);
        }
      };
      if (mxClient.IS_NS && document.documentMode == null) {
        const eventName = (mxClient.IS_SF || mxClient.IS_GC) ? 'mousewheel' : 'DOMMouseScroll';
        mxEvent.addListener((mxClient.IS_GC && target != null) ? target : window, eventName, wheelHandler);
      } else {
        mxEvent.addListener(document, 'mousewheel', wheelHandler);
      }
    }
  },
  disableContextMenu(element) {
    mxEvent.addListener(element, 'contextmenu', function (evt) {
      if (evt.preventDefault) {
        evt.preventDefault();
      }
      return false;
    });
  },
  getSource(evt) {
    return (evt.srcElement != null) ? evt.srcElement : evt.target;
  },
  isConsumed(evt) {
    return evt.isConsumed != null && evt.isConsumed;
  },
  isTouchEvent(evt) {
    return (evt.pointerType != null) ? (evt.pointerType == 'touch' || evt.pointerType === evt.MSPOINTER_TYPE_TOUCH) : ((evt.mozInputSource != null) ? evt.mozInputSource == 5 : evt.type.indexOf('touch') == 0);
  },
  isPenEvent(evt) {
    return (evt.pointerType != null) ? (evt.pointerType == 'pen' || evt.pointerType === evt.MSPOINTER_TYPE_PEN) : ((evt.mozInputSource != null) ? evt.mozInputSource == 2 : evt.type.indexOf('pen') == 0);
  },
  isMultiTouchEvent(evt) {
    return (evt.type != null && evt.type.indexOf('touch') == 0 && evt.touches != null && evt.touches.length > 1);
  },
  isMouseEvent(evt) {
    return (evt.pointerType != null) ? (evt.pointerType == 'mouse' || evt.pointerType === evt.MSPOINTER_TYPE_MOUSE) : ((evt.mozInputSource != null) ? evt.mozInputSource == 1 : evt.type.indexOf('mouse') == 0);
  },
  isLeftMouseButton(evt) {
    if ('buttons' in evt && (evt.type == 'mousedown' || evt.type == 'mousemove')) {
      return evt.buttons == 1;
    } else if ('which' in evt) {
      return evt.which === 1;
    } else {
      return evt.button === 1;
    }
  },
  isMiddleMouseButton(evt) {
    if ('which' in evt) {
      return evt.which === 2;
    } else {
      return evt.button === 4;
    }
  },
  isRightMouseButton(evt) {
    if ('which' in evt) {
      return evt.which === 3;
    } else {
      return evt.button === 2;
    }
  },
  isPopupTrigger(evt) {
    return mxEvent.isRightMouseButton(evt) || (mxClient.IS_MAC && mxEvent.isControlDown(evt) && !mxEvent.isShiftDown(evt) && !mxEvent.isMetaDown(evt) && !mxEvent.isAltDown(evt));
  },
  isShiftDown(evt) {
    return (evt != null) ? evt.shiftKey : false;
  },
  isAltDown(evt) {
    return (evt != null) ? evt.altKey : false;
  },
  isControlDown(evt) {
    return (evt != null) ? evt.ctrlKey : false;
  },
  isMetaDown(evt) {
    return (evt != null) ? evt.metaKey : false;
  },
  getMainEvent(e) {
    if ((e.type == 'touchstart' || e.type == 'touchmove') && e.touches != null && e.touches[0] != null) {
      e = e.touches[0];
    } else if (e.type == 'touchend' && e.changedTouches != null && e.changedTouches[0] != null) {
      e = e.changedTouches[0];
    }
    return e;
  },
  getClientX(e) {
    return mxEvent.getMainEvent(e).clientX;
  },
  getClientY(e) {
    return mxEvent.getMainEvent(e).clientY;
  },
  consume(evt, preventDefault = true, stopPropagation = true) {
    if (preventDefault) {
      if (evt.preventDefault) {
        if (stopPropagation) {
          evt.stopPropagation();
        }
        evt.preventDefault();
      } else if (stopPropagation) {
        evt.cancelBubble = true;
      }
    }
    evt.isConsumed = true;
    if (!evt.preventDefault) {
      evt.returnValue = false;
    }
  },
  LABEL_HANDLE: -1,
  ROTATION_HANDLE: -2,
  CUSTOM_HANDLE: -100,
  VIRTUAL_HANDLE: -100000,
  MOUSE_DOWN: 'mouseDown',
  MOUSE_MOVE: 'mouseMove',
  MOUSE_UP: 'mouseUp',
  ACTIVATE: 'activate',
  RESIZE_START: 'resizeStart',
  RESIZE: 'resize',
  RESIZE_END: 'resizeEnd',
  MOVE_START: 'moveStart',
  MOVE: 'move',
  MOVE_END: 'moveEnd',
  PAN_START: 'panStart',
  PAN: 'pan',
  PAN_END: 'panEnd',
  MINIMIZE: 'minimize',
  NORMALIZE: 'normalize',
  MAXIMIZE: 'maximize',
  HIDE: 'hide',
  SHOW: 'show',
  CLOSE: 'close',
  DESTROY: 'destroy',
  REFRESH: 'refresh',
  SIZE: 'size',
  SELECT: 'select',
  FIRED: 'fired',
  FIRE_MOUSE_EVENT: 'fireMouseEvent',
  GESTURE: 'gesture',
  TAP_AND_HOLD: 'tapAndHold',
  GET: 'get',
  RECEIVE: 'receive',
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  SUSPEND: 'suspend',
  RESUME: 'resume',
  MARK: 'mark',
  ROOT: 'root',
  POST: 'post',
  OPEN: 'open',
  SAVE: 'save',
  BEFORE_ADD_VERTEX: 'beforeAddVertex',
  ADD_VERTEX: 'addVertex',
  AFTER_ADD_VERTEX: 'afterAddVertex',
  DONE: 'done',
  EXECUTE: 'execute',
  EXECUTED: 'executed',
  BEGIN_UPDATE: 'beginUpdate',
  START_EDIT: 'startEdit',
  END_UPDATE: 'endUpdate',
  END_EDIT: 'endEdit',
  BEFORE_UNDO: 'beforeUndo',
  UNDO: 'undo',
  REDO: 'redo',
  CHANGE: 'change',
  NOTIFY: 'notify',
  LAYOUT_CELLS: 'layoutCells',
  CLICK: 'click',
  SCALE: 'scale',
  TRANSLATE: 'translate',
  SCALE_AND_TRANSLATE: 'scaleAndTranslate',
  UP: 'up',
  DOWN: 'down',
  ADD: 'add',
  REMOVE: 'remove',
  CLEAR: 'clear',
  ADD_CELLS: 'addCells',
  CELLS_ADDED: 'cellsAdded',
  MOVE_CELLS: 'moveCells',
  CELLS_MOVED: 'cellsMoved',
  RESIZE_CELLS: 'resizeCells',
  CELLS_RESIZED: 'cellsResized',
  TOGGLE_CELLS: 'toggleCells',
  CELLS_TOGGLED: 'cellsToggled',
  ORDER_CELLS: 'orderCells',
  CELLS_ORDERED: 'cellsOrdered',
  REMOVE_CELLS: 'removeCells',
  CELLS_REMOVED: 'cellsRemoved',
  GROUP_CELLS: 'groupCells',
  UNGROUP_CELLS: 'ungroupCells',
  REMOVE_CELLS_FROM_PARENT: 'removeCellsFromParent',
  FOLD_CELLS: 'foldCells',
  CELLS_FOLDED: 'cellsFolded',
  ALIGN_CELLS: 'alignCells',
  LABEL_CHANGED: 'labelChanged',
  CONNECT_CELL: 'connectCell',
  CELL_CONNECTED: 'cellConnected',
  SPLIT_EDGE: 'splitEdge',
  FLIP_EDGE: 'flipEdge',
  START_EDITING: 'startEditing',
  EDITING_STARTED: 'editingStarted',
  EDITING_STOPPED: 'editingStopped',
  ADD_OVERLAY: 'addOverlay',
  REMOVE_OVERLAY: 'removeOverlay',
  UPDATE_CELL_SIZE: 'updateCellSize',
  ESCAPE: 'escape',
  DOUBLE_CLICK: 'doubleClick',
  START: 'start',
  RESET: 'reset',
};
