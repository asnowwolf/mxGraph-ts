/**
 * Class: mxKeyHandler
 *
 * Event handler that listens to keystroke events. This is not a singleton,
 * however, it is normally only required once if the target is the document
 * element (default).
 *
 * This handler installs a key event listener in the topmost DOM node and
 * processes all events that originate from descandants of <mxGraph.container>
 * or from the topmost DOM node. The latter means that all unhandled keystrokes
 * are handled by this object regardless of the focused state of the <graph>.
 *
 * Example:
 *
 * The following example creates a key handler that listens to the delete key
 * (46) and deletes the selection cells if the graph is enabled.
 *
 * (code)
 * var keyHandler = new mxKeyHandler(graph);
 * keyHandler.bindKey(46, function(evt)
 * {
 *   if (graph.isEnabled())
 *   {
 *     graph.removeCells();
 *   }
 * });
 * (end)
 *
 * Keycodes:
 *
 * See http://tinyurl.com/yp8jgl or http://tinyurl.com/229yqw for a list of
 * keycodes or install a key event listener into the document element and print
 * the key codes of the respective events to the console.
 *
 * To support the Command key and the Control key on the Mac, the following
 * code can be used.
 *
 * (code)
 * keyHandler.getFunction = function(evt)
 * {
 *   if (!!evt)
 *   {
 *     return (mxEvent.isControlDown(evt) || (mxClient.IS_MAC && evt.metaKey)) ? this.controlKeys[evt.keyCode] : this.normalKeys[evt.keyCode];
 *   }
 *
 *   return null;
 * };
 * (end)
 *
 * Constructor: mxKeyHandler
 *
 * Constructs an event handler that executes functions bound to specific
 * keystrokes.
 *
 * Parameters:
 *
 * graph - Reference to the associated <mxGraph>.
 * target - Optional reference to the event target. If null, the document
 * element is used as the event target, that is, the object where the key
 * event listener is installed.
 */
import { mxClient } from '../mxClient';
import { mxEvent } from '../util/mxEvent';
import { mxUtils } from '../util/mxUtils';
import { mxGraph } from '../view/mxGraph';

export class mxKeyHandler {
  constructor(public graph: mxGraph, public target: HTMLElement | null = document.documentElement) {
    this.normalKeys = [];
    this.shiftKeys = [];
    this.controlKeys = [];
    this.controlShiftKeys = [];
    this.keydownHandler = (evt) => {
      this.keyDown(evt);
    };
    mxEvent.addListener(this.target, 'keydown', this.keydownHandler);
    if (mxClient.IS_IE) {
      mxEvent.addListener(window, 'unload', () => {
        this.destroy();
      });
    }
  }

  normalKeys: any[];
  shiftKeys: any[];
  controlKeys: any[];
  controlShiftKeys: any[];
  keydownHandler: ((event: KeyboardEvent) => void) | null;
  /**
   * Variable: enabled
   *
   * Specifies if events are handled. Default is true.
   * @example true
   */
  enabled = true;

  /**
   * Function: isEnabled
   *
   * Returns true if events are handled. This implementation returns
   * <enabled>.
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Function: setEnabled
   *
   * Enables or disables event handling by updating <enabled>.
   *
   * Parameters:
   *
   * enabled - Boolean that specifies the new enabled state.
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Function: bindKey
   *
   * Binds the specified keycode to the given function. This binding is used
   * if the control key is not pressed.
   *
   * Parameters:
   *
   * code - Integer that specifies the keycode.
   * funct - JavaScript function that takes the key event as an argument.
   */
  bindKey(code: any, funct: Function): void {
    this.normalKeys[code] = funct;
  }

  /**
   * Function: bindShiftKey
   *
   * Binds the specified keycode to the given function. This binding is used
   * if the shift key is pressed.
   *
   * Parameters:
   *
   * code - Integer that specifies the keycode.
   * funct - JavaScript function that takes the key event as an argument.
   */
  bindShiftKey(code: any, funct: Function): void {
    this.shiftKeys[code] = funct;
  }

  /**
   * Function: bindControlKey
   *
   * Binds the specified keycode to the given function. This binding is used
   * if the control key is pressed.
   *
   * Parameters:
   *
   * code - Integer that specifies the keycode.
   * funct - JavaScript function that takes the key event as an argument.
   */
  bindControlKey(code: any, funct: Function): void {
    this.controlKeys[code] = funct;
  }

  /**
   * Function: bindControlShiftKey
   *
   * Binds the specified keycode to the given function. This binding is used
   * if the control and shift key are pressed.
   *
   * Parameters:
   *
   * code - Integer that specifies the keycode.
   * funct - JavaScript function that takes the key event as an argument.
   */
  bindControlShiftKey(code: any, funct: Function): void {
    this.controlShiftKeys[code] = funct;
  }

  /**
   * Function: isControlDown
   *
   * Returns true if the control key is pressed. This uses <mxEvent.isControlDown>.
   *
   * Parameters:
   *
   * evt - Key event whose control key pressed state should be returned.
   */
  isControlDown(evt: Event): boolean {
    return mxEvent.isControlDown(evt);
  }

  /**
   * Function: getFunction
   *
   * Returns the function associated with the given key event or null if no
   * function is associated with the given event.
   *
   * Parameters:
   *
   * evt - Key event whose associated function should be returned.
   */
  getFunction(evt: KeyboardEvent): any {
    if (!!evt && !mxEvent.isAltDown(evt)) {
      if (this.isControlDown(evt)) {
        if (mxEvent.isShiftDown(evt)) {
          return this.controlShiftKeys[evt.keyCode];
        } else {
          return this.controlKeys[evt.keyCode];
        }
      } else {
        if (mxEvent.isShiftDown(evt)) {
          return this.shiftKeys[evt.keyCode];
        } else {
          return this.normalKeys[evt.keyCode];
        }
      }
    }
    return null;
  }

  /**
   * Function: isGraphEvent
   *
   * Returns true if the event should be processed by this handler, that is,
   * if the event source is either the target, one of its direct children, a
   * descendant of the <mxGraph.container>, or the <mxGraph.cellEditor> of the
   * <graph>.
   *
   * Parameters:
   *
   * evt - Key event that represents the keystroke.
   */
  isGraphEvent(evt: Event): boolean {
    const source = mxEvent.getSource(evt);
    if ((source == this.target || source.parentNode == this.target) || (!!this.graph.cellEditor && this.graph.cellEditor.isEventSource(evt))) {
      return true;
    }
    return mxUtils.isAncestorNode(this.graph.container, source);
  }

  /**
   * Function: keyDown
   *
   * Handles the event by invoking the function bound to the respective keystroke
   * if <isEnabledForEvent> returns true for the given event and if
   * <isEventIgnored> returns false, except for escape for which
   * <isEventIgnored> is not invoked.
   *
   * Parameters:
   *
   * evt - Key event that represents the keystroke.
   */
  keyDown(evt: KeyboardEvent): void {
    if (this.isEnabledForEvent(evt)) {
      if (evt.keyCode == 27) {
        this.escape(evt);
      } else if (!this.isEventIgnored(evt)) {
        const boundFunction = this.getFunction(evt);
        if (!!boundFunction) {
          boundFunction(evt);
          mxEvent.consume(evt);
        }
      }
    }
  }

  /**
   * Function: isEnabledForEvent
   *
   * Returns true if the given event should be handled. <isEventIgnored> is
   * called later if the event is not an escape key stroke, in which case
   * <escape> is called. This implementation returns true if <isEnabled>
   * returns true for both, this handler and <graph>, if the event is not
   * consumed and if <isGraphEvent> returns true.
   *
   * Parameters:
   *
   * evt - Key event that represents the keystroke.
   */
  isEnabledForEvent(evt: Event): boolean {
    return (this.graph.isEnabled() && !mxEvent.isConsumed(evt) && this.isGraphEvent(evt) && this.isEnabled());
  }

  /**
   * Function: isEventIgnored
   *
   * Returns true if the given keystroke should be ignored. This returns
   * graph.isEditing().
   *
   * Parameters:
   *
   * evt - Key event that represents the keystroke.
   */
  isEventIgnored(evt: Event): boolean {
    return this.graph.isEditing();
  }

  /**
   * Function: escape
   *
   * Hook to process ESCAPE keystrokes. This implementation invokes
   * <mxGraph.stopEditing> to cancel the current editing, connecting
   * and/or other ongoing modifications.
   *
   * Parameters:
   *
   * evt - Key event that represents the keystroke. Possible keycode in this
   * case is 27 (ESCAPE).
   */
  escape(evt: Event): void {
    if (this.graph.isEscapeEnabled()) {
      this.graph.escape(evt);
    }
  }

  /**
   * Function: destroy
   *
   * Destroys the handler and all its references into the DOM. This does
   * normally not need to be called, it is called automatically when the
   * window unloads (in IE).
   */
  destroy(): void {
    if (!!this.target && !!this.keydownHandler) {
      mxEvent.removeListener(this.target, 'keydown', this.keydownHandler);
      this.keydownHandler = undefined;
    }
    this.target = undefined;
  }
}
