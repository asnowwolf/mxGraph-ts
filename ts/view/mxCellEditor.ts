/**
 * Class: mxCellEditor
 *
 * In-place editor for the graph. To control this editor, use
 * <mxGraph.invokesStopCellEditing>, <mxGraph.enterStopsCellEditing> and
 * <mxGraph.escapeEnabled>. If <mxGraph.enterStopsCellEditing> is true then
 * ctrl-enter or shift-enter can be used to create a linefeed. The F2 and
 * escape keys can always be used to stop editing.
 *
 * To customize the location of the textbox in the graph, override
 * <getEditorBounds> as follows:
 *
 * (code)
 * graph.cellEditor.getEditorBounds = function(state)
 * {
 *   var result = mxCellEditor.prototype.getEditorBounds.apply(this, arguments);
 *
 *   if (this.graph.getModel().isEdge(state.cell))
 *   {
 *     result.x = state.getCenterX() - result.width / 2;
 *     result.y = state.getCenterY() - result.height / 2;
 *   }
 *
 *   return result;
 * };
 * (end)
 *
 * Note that this hook is only called if <autoSize> is false. If <autoSize> is true,
 * then <mxShape.getLabelBounds> is used to compute the current bounds of the textbox.
 *
 * The textarea uses the mxCellEditor CSS class. You can modify this class in
 * your custom CSS. Note: You should modify the CSS after loading the client
 * in the page.
 *
 * Example:
 *
 * To only allow numeric input in the in-place editor, use the following code.
 *
 * (code)
 * var text = graph.cellEditor.textarea;
 *
 * mxEvent.addListener(text, 'keydown', function (evt)
 * {
 *   if (!(evt.keyCode >= 48 && evt.keyCode <= 57) &&
 *       !(evt.keyCode >= 96 && evt.keyCode <= 105))
 *   {
 *     mxEvent.consume(evt);
 *   }
 * });
 * (end)
 *
 * Placeholder:
 *
 * To implement a placeholder for cells without a label, use the
 * <emptyLabelText> variable.
 *
 * Resize in Chrome:
 *
 * Resize of the textarea is disabled by default. If you want to enable
 * this feature extend <init> and set this.textarea.style.resize = ''.
 *
 * To start editing on a key press event, the container of the graph
 * should have focus or a focusable parent should be used to add the
 * key press handler as follows.
 *
 * (code)
 * mxEvent.addListener(graph.container, 'keypress', mxUtils.bind(this, function(evt)
 * {
 *   if (!graph.isEditing() && !graph.isSelectionEmpty() && evt.which !== 0 &&
 *       !mxEvent.isAltDown(evt) && !mxEvent.isControlDown(evt) && !mxEvent.isMetaDown(evt))
 *   {
 *     graph.startEditing();
 *
 *     if (mxClient.IS_FF)
 *     {
 *       graph.cellEditor.textarea.value = String.fromCharCode(evt.which);
 *     }
 *   }
 * }));
 * (end)
 *
 * To allow focus for a DIV, and hence to receive key press events, some browsers
 * require it to have a valid tabindex attribute. In this case the following
 * code may be used to keep the container focused.
 *
 * (code)
 * var graphFireMouseEvent = graph.fireMouseEvent;
 * graph.fireMouseEvent = function(evtName, me, sender)
 * {
 *   if (evtName == mxEvent.MOUSE_DOWN)
 *   {
 *     this.container.focus();
 *   }
 *
 *   graphFireMouseEvent.apply(this, arguments);
 * };
 * (end)
 *
 * Constructor: mxCellEditor
 *
 * Constructs a new in-place editor for the specified graph.
 *
 * Parameters:
 *
 * graph - Reference to the enclosing <mxGraph>.
 */
export class mxCellEditor {
  graph: any;
  zoomHandler: Function;
  changeHandler: Function;
  /**
   * Variable: textarea
   *
   * Holds the DIV that is used for text editing. Note that this may be null before the first
   * edit. Instantiated in <init>.
   */
  textarea: any;
  /**
   * Variable: editingCell
   *
   * Reference to the <mxCell> that is currently being edited.
   */
  editingCell: any;
  /**
   * Variable: trigger
   *
   * Reference to the event that was used to start editing.
   */
  trigger: any;
  /**
   * Variable: modified
   *
   * Specifies if the label has been modified.
   */
  modified: boolean;
  /**
   * Variable: autoSize
   *
   * Specifies if the textarea should be resized while the text is being edited.
   * Default is true.
   * @example true
   */
  autoSize: boolean;
  /**
   * Variable: selectText
   *
   * Specifies if the text should be selected when editing starts. Default is
   * true.
   * @example true
   */
  selectText: boolean;
  /**
   * Variable: emptyLabelText
   *
   * Text to be displayed for empty labels. Default is '' or '<br>' in Firefox as
   * a workaround for the missing cursor bug for empty content editable. This can
   * be set to eg. "[Type Here]" to easier visualize editing of empty labels. The
   * value is only displayed before the first keystroke and is never used as the
   * actual editing value.
   */
  emptyLabelText: any;
  /**
   * Variable: escapeCancelsEditing
   *
   * If true, pressing the escape key will stop editing and not accept the new
   * value. Change this to false to accept the new value on escape, and cancel
   * editing on Shift+Escape instead. Default is true.
   * @example true
   */
  escapeCancelsEditing: boolean;
  /**
   * Variable: textNode
   *
   * Reference to the label DOM node that has been hidden.
   */
  textNode: string;
  /**
   * Variable: zIndex
   *
   * Specifies the zIndex for the textarea. Default is 5.
   * @example 5
   */
  zIndex: number;
  /**
   * Variable: minResize
   *
   * Defines the minimum width and height to be used in <resize>. Default is 0x20px.
   */
  minResize: mxRectangle;
  /**
   * Variable: wordWrapPadding
   *
   * Correction factor for word wrapping width. Default is 2 in quirks, 0 in IE
   * 11 and 1 in all other browsers and modes.
   */
  wordWrapPadding: any;
  /**
   * Variable: blurEnabled
   *
   * If <focusLost> should be called if <textarea> loses the focus. Default is false.
   */
  blurEnabled: boolean;
  /**
   * Variable: initialValue
   *
   * Holds the initial editing value to check if the current value was modified.
   */
  initialValue: any;
  /**
   * Variable: align
   *
   * Holds the current temporary horizontal alignment for the cell style. If this
   * is modified then the current text alignment is changed and the cell style is
   * updated when the value is applied.
   */
  align: any;
  clearOnChange: boolean;
  resizeThread: any;
  bounds: any;
  textDirection: any;

  constructor(graph: any) {
    this.graph = graph;
    this.zoomHandler = mxUtils.bind(this, function () {
      if (this.graph.isEditing()) {
        this.resize();
      }
    });
    this.graph.view.addListener(mxEvent.SCALE, this.zoomHandler);
    this.graph.view.addListener(mxEvent.SCALE_AND_TRANSLATE, this.zoomHandler);
    this.changeHandler = mxUtils.bind(this, function (sender) {
      if (this.editingCell != null && this.graph.getView().getState(this.editingCell) == null) {
        this.stopEditing(true);
      }
    });
    this.graph.getModel().addListener(mxEvent.CHANGE, this.changeHandler);
  }

  /**
   * Function: init
   *
   * Creates the <textarea> and installs the event listeners. The key handler
   * updates the <modified> state.
   */
  init(): void {
    this.textarea = document.createElement('div');
    this.textarea.className = 'mxCellEditor mxPlainTextEditor';
    this.textarea.contentEditable = true;
    if (mxClient.IS_GC) {
      this.textarea.style.minHeight = '1em';
    }
    this.textarea.style.position = ((this.isLegacyEditor())) ? 'absolute' : 'relative';
    this.installListeners(this.textarea);
  }

  /**
   * Function: applyValue
   *
   * Called in <stopEditing> if cancel is false to invoke <mxGraph.labelChanged>.
   */
  applyValue(state: any, value: any): void {
    this.graph.labelChanged(state.cell, value, this.trigger);
  }

  /**
   * Function: setAlign
   *
   * Sets the temporary horizontal alignment for the current editing session.
   */
  setAlign(align: any): void {
    if (this.textarea != null) {
      this.textarea.style.textAlign = align;
    }
    this.align = align;
    this.resize();
  }

  /**
   * Function: getInitialValue
   *
   * Gets the initial editing value for the given cell.
   */
  getInitialValue(state: any, trigger: any): any {
    let result = mxUtils.htmlEntities(this.graph.getEditingValue(state.cell, trigger), false);
    if (!mxClient.IS_QUIRKS && document.documentMode != 8 && document.documentMode != 9 && document.documentMode != 10) {
      result = mxUtils.replaceTrailingNewlines(result, '<div><br></div>');
    }
    return result.replace(/\n/g, '<br>');
  }

  /**
   * Function: getCurrentValue
   *
   * Returns the current editing value.
   */
  getCurrentValue(state: any): any {
    return mxUtils.extractTextWithWhitespace(this.textarea.childNodes);
  }

  /**
   * Function: isCancelEditingKeyEvent
   *
   * Returns true if <escapeCancelsEditing> is true and shift, control and meta
   * are not pressed.
   */
  isCancelEditingKeyEvent(evt: Event): boolean {
    return this.escapeCancelsEditing || mxEvent.isShiftDown(evt) || mxEvent.isControlDown(evt) || mxEvent.isMetaDown(evt);
  }

  /**
   * Function: installListeners
   *
   * Installs listeners for focus, change and standard key event handling.
   */
  installListeners(elt: HTMLElement): void {
    mxEvent.addListener(elt, 'dragstart', mxUtils.bind(this, function (evt) {
      this.graph.stopEditing(false);
      mxEvent.consume(evt);
    }));
    mxEvent.addListener(elt, 'blur', mxUtils.bind(this, function (evt) {
      if (this.blurEnabled) {
        this.focusLost(evt);
      }
    }));
    mxEvent.addListener(elt, 'keydown', mxUtils.bind(this, function (evt) {
      if (!mxEvent.isConsumed(evt)) {
        if (this.isStopEditingEvent(evt)) {
          this.graph.stopEditing(false);
          mxEvent.consume(evt);
        } else if (evt.keyCode == 27) {
          this.graph.stopEditing(this.isCancelEditingKeyEvent(evt));
          mxEvent.consume(evt);
        }
      }
    }));
    const keypressHandler = mxUtils.bind(this, function (evt) {
      if (this.editingCell != null) {
        if (this.clearOnChange && elt.innerHTML == this.getEmptyLabelText() && (!mxClient.IS_FF || (evt.keyCode != 8 && evt.keyCode != 46))) {
          this.clearOnChange = false;
          elt.innerHTML = '';
        }
      }
    });
    mxEvent.addListener(elt, 'keypress', keypressHandler);
    mxEvent.addListener(elt, 'paste', keypressHandler);
    const keyupHandler = mxUtils.bind(this, function (evt) {
      if (this.editingCell != null) {
        if (this.textarea.innerHTML.length == 0 || this.textarea.innerHTML == '<br>') {
          this.textarea.innerHTML = this.getEmptyLabelText();
          this.clearOnChange = this.textarea.innerHTML.length > 0;
        } else {
          this.clearOnChange = false;
        }
      }
    });
    mxEvent.addListener(elt, (!mxClient.IS_IE11 && !mxClient.IS_IE) ? 'input' : 'keyup', keyupHandler);
    mxEvent.addListener(elt, 'cut', keyupHandler);
    mxEvent.addListener(elt, 'paste', keyupHandler);
    const evtName = (!mxClient.IS_IE11 && !mxClient.IS_IE) ? 'input' : 'keydown';
    const resizeHandler = mxUtils.bind(this, function (evt) {
      if (this.editingCell != null && this.autoSize && !mxEvent.isConsumed(evt)) {
        if (this.resizeThread != null) {
          window.clearTimeout(this.resizeThread);
        }
        this.resizeThread = window.setTimeout(mxUtils.bind(this, function () {
          this.resizeThread = null;
          this.resize();
        }), 0);
      }
    });
    mxEvent.addListener(elt, evtName, resizeHandler);
    mxEvent.addListener(window, 'resize', resizeHandler);
    if (document.documentMode >= 9) {
      mxEvent.addListener(elt, 'DOMNodeRemoved', resizeHandler);
      mxEvent.addListener(elt, 'DOMNodeInserted', resizeHandler);
    } else {
      mxEvent.addListener(elt, 'cut', resizeHandler);
      mxEvent.addListener(elt, 'paste', resizeHandler);
    }
  }

  /**
   * Function: isStopEditingEvent
   *
   * Returns true if the given keydown event should stop cell editing. This
   * returns true if F2 is pressed of if <mxGraph.enterStopsCellEditing> is true
   * and enter is pressed without control or shift.
   */
  isStopEditingEvent(evt: Event): boolean {
    return evt.keyCode == 113 || (this.graph.isEnterStopsCellEditing() && evt.keyCode == 13 && !mxEvent.isControlDown(evt) && !mxEvent.isShiftDown(evt));
  }

  /**
   * Function: isEventSource
   *
   * Returns true if this editor is the source for the given native event.
   */
  isEventSource(evt: Event): boolean {
    return mxEvent.getSource(evt) == this.textarea;
  }

  /**
   * Function: resize
   *
   * Returns <modified>.
   */
  resize(): void {
    const state = this.graph.getView().getState(this.editingCell);
    if (state == null) {
      this.stopEditing(true);
    } else if (this.textarea != null) {
      const isEdge = this.graph.getModel().isEdge(state.cell);
      const scale = this.graph.getView().scale;
      let m = null;
      if (!this.autoSize || (state.style[mxConstants.STYLE_OVERFLOW] == 'fill')) {
        this.bounds = this.getEditorBounds(state);
        this.textarea.style.width = Math.round(this.bounds.width / scale) + 'px';
        this.textarea.style.height = Math.round(this.bounds.height / scale) + 'px';
        if (document.documentMode == 8 || mxClient.IS_QUIRKS) {
          this.textarea.style.left = Math.round(this.bounds.x) + 'px';
          this.textarea.style.top = Math.round(this.bounds.y) + 'px';
        } else {
          this.textarea.style.left = Math.max(0, Math.round(this.bounds.x + 1)) + 'px';
          this.textarea.style.top = Math.max(0, Math.round(this.bounds.y + 1)) + 'px';
        }
        if (this.graph.isWrapping(state.cell) && (this.bounds.width >= 2 || this.bounds.height >= 2) && this.textarea.innerHTML != this.getEmptyLabelText()) {
          this.textarea.style.wordWrap = mxConstants.WORD_WRAP;
          this.textarea.style.whiteSpace = 'normal';
          if (state.style[mxConstants.STYLE_OVERFLOW] != 'fill') {
            this.textarea.style.width = Math.round(this.bounds.width / scale) + this.wordWrapPadding + 'px';
          }
        } else {
          this.textarea.style.whiteSpace = 'nowrap';
          if (state.style[mxConstants.STYLE_OVERFLOW] != 'fill') {
            this.textarea.style.width = '';
          }
        }
      } else {
        const lw = mxUtils.getValue(state.style, mxConstants.STYLE_LABEL_WIDTH, null);
        m = (state.text != null && this.align == null) ? state.text.margin : null;
        if (m == null) {
          m = mxUtils.getAlignmentAsPoint(this.align || mxUtils.getValue(state.style, mxConstants.STYLE_ALIGN, mxConstants.ALIGN_CENTER), mxUtils.getValue(state.style, mxConstants.STYLE_VERTICAL_ALIGN, mxConstants.ALIGN_MIDDLE));
        }
        if (isEdge) {
          this.bounds = new mxRectangle(state.absoluteOffset.x, state.absoluteOffset.y, 0, 0);
          if (lw != null) {
            const tmp = (parseFloat(lw) + 2) * scale;
            this.bounds.width = tmp;
            this.bounds.x += m.x * tmp;
          }
        } else {
          let bds = mxRectangle.fromRectangle(state);
          const hpos = mxUtils.getValue(state.style, mxConstants.STYLE_LABEL_POSITION, mxConstants.ALIGN_CENTER);
          const vpos = mxUtils.getValue(state.style, mxConstants.STYLE_VERTICAL_LABEL_POSITION, mxConstants.ALIGN_MIDDLE);
          bds = (state.shape != null && hpos == mxConstants.ALIGN_CENTER && vpos == mxConstants.ALIGN_MIDDLE) ? state.shape.getLabelBounds(bds) : bds;
          if (lw != null) {
            bds.width = parseFloat(lw) * scale;
          }
          if (!state.view.graph.cellRenderer.legacySpacing || state.style[mxConstants.STYLE_OVERFLOW] != 'width') {
            const spacing = parseInt(state.style[mxConstants.STYLE_SPACING] || 2) * scale;
            const spacingTop = (parseInt(state.style[mxConstants.STYLE_SPACING_TOP] || 0) + mxText.prototype.baseSpacingTop) * scale + spacing;
            const spacingRight = (parseInt(state.style[mxConstants.STYLE_SPACING_RIGHT] || 0) + mxText.prototype.baseSpacingRight) * scale + spacing;
            const spacingBottom = (parseInt(state.style[mxConstants.STYLE_SPACING_BOTTOM] || 0) + mxText.prototype.baseSpacingBottom) * scale + spacing;
            const spacingLeft = (parseInt(state.style[mxConstants.STYLE_SPACING_LEFT] || 0) + mxText.prototype.baseSpacingLeft) * scale + spacing;
            const hpos = mxUtils.getValue(state.style, mxConstants.STYLE_LABEL_POSITION, mxConstants.ALIGN_CENTER);
            const vpos = mxUtils.getValue(state.style, mxConstants.STYLE_VERTICAL_LABEL_POSITION, mxConstants.ALIGN_MIDDLE);
            bds = new mxRectangle(bds.x + spacingLeft, bds.y + spacingTop, bds.width - ((hpos == mxConstants.ALIGN_CENTER && lw == null) ? (spacingLeft + spacingRight) : 0), bds.height - ((vpos == mxConstants.ALIGN_MIDDLE) ? (spacingTop + spacingBottom) : 0));
          }
          this.bounds = new mxRectangle(bds.x + state.absoluteOffset.x, bds.y + state.absoluteOffset.y, bds.width, bds.height);
        }
        if (this.graph.isWrapping(state.cell) && (this.bounds.width >= 2 || this.bounds.height >= 2) && this.textarea.innerHTML != this.getEmptyLabelText()) {
          this.textarea.style.wordWrap = mxConstants.WORD_WRAP;
          this.textarea.style.whiteSpace = 'normal';
          const tmp = Math.round(this.bounds.width / ((document.documentMode == 8) ? scale : scale)) + this.wordWrapPadding;
          if (this.textarea.style.position != 'relative') {
            this.textarea.style.width = tmp + 'px';
            if (this.textarea.scrollWidth > tmp) {
              this.textarea.style.width = this.textarea.scrollWidth + 'px';
            }
          } else {
            this.textarea.style.maxWidth = tmp + 'px';
          }
        } else {
          this.textarea.style.whiteSpace = 'nowrap';
          this.textarea.style.width = '';
        }
        if (document.documentMode == 8) {
          this.textarea.style.zoom = '1';
          this.textarea.style.height = 'auto';
        }
        const ow = this.textarea.scrollWidth;
        const oh = this.textarea.scrollHeight;
        if (document.documentMode == 8) {
          this.textarea.style.left = Math.max(0, Math.ceil((this.bounds.x - m.x * (this.bounds.width - (ow + 1) * scale) + ow * (scale - 1) * 0 + (m.x + 0.5) * 2) / scale)) + 'px';
          this.textarea.style.top = Math.max(0, Math.ceil((this.bounds.y - m.y * (this.bounds.height - (oh + 0.5) * scale) + oh * (scale - 1) * 0 + Math.abs(m.y + 0.5) * 1) / scale)) + 'px';
          this.textarea.style.width = Math.round(ow * scale) + 'px';
          this.textarea.style.height = Math.round(oh * scale) + 'px';
        } else if (mxClient.IS_QUIRKS) {
          this.textarea.style.left = Math.max(0, Math.ceil(this.bounds.x - m.x * (this.bounds.width - (ow + 1) * scale) + ow * (scale - 1) * 0 + (m.x + 0.5) * 2)) + 'px';
          this.textarea.style.top = Math.max(0, Math.ceil(this.bounds.y - m.y * (this.bounds.height - (oh + 0.5) * scale) + oh * (scale - 1) * 0 + Math.abs(m.y + 0.5) * 1)) + 'px';
        } else {
          this.textarea.style.left = Math.max(0, Math.round(this.bounds.x - m.x * (this.bounds.width - 2)) + 1) + 'px';
          this.textarea.style.top = Math.max(0, Math.round(this.bounds.y - m.y * (this.bounds.height - 4) + ((m.y == -1) ? 3 : 0)) + 1) + 'px';
        }
      }
      if (mxClient.IS_VML) {
        this.textarea.style.zoom = scale;
      } else {
        mxUtils.setPrefixedStyle(this.textarea.style, 'transformOrigin', '0px 0px');
        mxUtils.setPrefixedStyle(this.textarea.style, 'transform', 'scale(' + scale + ',' + scale + ')' + ((m == null) ? '' : ' translate(' + (m.x * 100) + '%,' + (m.y * 100) + '%)'));
      }
    }
  }

  /**
   * Function: focusLost
   *
   * Called if the textarea has lost focus.
   */
  focusLost(): void {
    this.stopEditing(!this.graph.isInvokesStopCellEditing());
  }

  /**
   * Function: getBackgroundColor
   *
   * Returns the background color for the in-place editor. This implementation
   * always returns null.
   */
  getBackgroundColor(state: any): string {
    return null;
  }

  /**
   * Function: isLegacyEditor
   *
   * Returns true if max-width is not supported or if the SVG root element in
   * in the graph does not have CSS position absolute. In these cases the text
   * editor must use CSS position absolute to avoid an offset but it will have
   * a less accurate line wrapping width during the text editing preview. This
   * implementation returns true for IE8- and quirks mode or if the CSS position
   * of the SVG element is not absolute.
   */
  isLegacyEditor(): boolean {
    if (mxClient.IS_VML) {
      return true;
    } else {
      let absoluteRoot = false;
      if (mxClient.IS_SVG) {
        const root = this.graph.view.getDrawPane().ownerSVGElement;
        if (root != null) {
          absoluteRoot = mxUtils.getCurrentStyle(root).position == 'absolute';
        }
      }
      return !absoluteRoot;
    }
  }

  /**
   * Function: startEditing
   *
   * Starts the editor for the given cell.
   *
   * Parameters:
   *
   * cell - <mxCell> to start editing.
   * trigger - Optional mouse event that triggered the editor.
   */
  startEditing(cell: mxCell, trigger: any): void {
    this.stopEditing(true);
    this.align = null;
    if (this.textarea == null) {
      this.init();
    }
    if (this.graph.tooltipHandler != null) {
      this.graph.tooltipHandler.hideTooltip();
    }
    const state = this.graph.getView().getState(cell);
    if (state != null) {
      const scale = this.graph.getView().scale;
      const size = mxUtils.getValue(state.style, mxConstants.STYLE_FONTSIZE, mxConstants.DEFAULT_FONTSIZE);
      const family = mxUtils.getValue(state.style, mxConstants.STYLE_FONTFAMILY, mxConstants.DEFAULT_FONTFAMILY);
      const color = mxUtils.getValue(state.style, mxConstants.STYLE_FONTCOLOR, 'black');
      const align = mxUtils.getValue(state.style, mxConstants.STYLE_ALIGN, mxConstants.ALIGN_LEFT);
      const bold = (mxUtils.getValue(state.style, mxConstants.STYLE_FONTSTYLE, 0) & mxConstants.FONT_BOLD) == mxConstants.FONT_BOLD;
      const italic = (mxUtils.getValue(state.style, mxConstants.STYLE_FONTSTYLE, 0) & mxConstants.FONT_ITALIC) == mxConstants.FONT_ITALIC;
      const uline = (mxUtils.getValue(state.style, mxConstants.STYLE_FONTSTYLE, 0) & mxConstants.FONT_UNDERLINE) == mxConstants.FONT_UNDERLINE;
      this.textarea.style.lineHeight = (mxConstants.ABSOLUTE_LINE_HEIGHT) ? Math.round(size * mxConstants.LINE_HEIGHT) + 'px' : mxConstants.LINE_HEIGHT;
      this.textarea.style.backgroundColor = this.getBackgroundColor(state);
      this.textarea.style.textDecoration = (uline) ? 'underline' : '';
      this.textarea.style.fontWeight = (bold) ? 'bold' : 'normal';
      this.textarea.style.fontStyle = (italic) ? 'italic' : '';
      this.textarea.style.fontSize = Math.round(size) + 'px';
      this.textarea.style.zIndex = this.zIndex;
      this.textarea.style.fontFamily = family;
      this.textarea.style.textAlign = align;
      this.textarea.style.outline = 'none';
      this.textarea.style.color = color;
      let dir = this.textDirection = mxUtils.getValue(state.style, mxConstants.STYLE_TEXT_DIRECTION, mxConstants.DEFAULT_TEXT_DIRECTION);
      if (dir == mxConstants.TEXT_DIRECTION_AUTO) {
        if (state != null && state.text != null && state.text.dialect != mxConstants.DIALECT_STRICTHTML && !mxUtils.isNode(state.text.value)) {
          dir = state.text.getAutoDirection();
        }
      }
      if (dir == mxConstants.TEXT_DIRECTION_LTR || dir == mxConstants.TEXT_DIRECTION_RTL) {
        this.textarea.setAttribute('dir', dir);
      } else {
        this.textarea.removeAttribute('dir');
      }
      this.textarea.innerHTML = this.getInitialValue(state, trigger) || '';
      this.initialValue = this.textarea.innerHTML;
      if (this.textarea.innerHTML.length == 0 || this.textarea.innerHTML == '<br>') {
        this.textarea.innerHTML = this.getEmptyLabelText();
        this.clearOnChange = true;
      } else {
        this.clearOnChange = this.textarea.innerHTML == this.getEmptyLabelText();
      }
      this.graph.container.appendChild(this.textarea);
      this.editingCell = cell;
      this.trigger = trigger;
      this.textNode = null;
      if (state.text != null && this.isHideLabel(state)) {
        this.textNode = state.text.node;
        this.textNode.style.visibility = 'hidden';
      }
      if (this.autoSize && (this.graph.model.isEdge(state.cell) || state.style[mxConstants.STYLE_OVERFLOW] != 'fill')) {
        window.setTimeout(mxUtils.bind(this, function () {
          this.resize();
        }), 0);
      }
      this.resize();
      try {
        this.textarea.focus();
        if (this.isSelectText() && this.textarea.innerHTML.length > 0 && (this.textarea.innerHTML != this.getEmptyLabelText() || !this.clearOnChange)) {
          document.execCommand('selectAll', false, null);
        }
      } catch (e) {
      }
    }
  }

  /**
   * Function: isSelectText
   *
   * Returns <selectText>.
   */
  isSelectText(): boolean {
    return this.selectText;
  }

  /**
   * Function: isSelectText
   *
   * Returns <selectText>.
   */
  clearSelection(): void {
    let selection = null;
    if (window.getSelection) {
      selection = window.getSelection();
    } else if (document.selection) {
      selection = document.selection;
    }
    if (selection != null) {
      if (selection.empty) {
        selection.empty();
      } else if (selection.removeAllRanges) {
        selection.removeAllRanges();
      }
    }
  }

  /**
   * Function: stopEditing
   *
   * Stops the editor and applies the value if cancel is false.
   */
  stopEditing(cancel: any): void {
    cancel = cancel || false;
    if (this.editingCell != null) {
      if (this.textNode != null) {
        this.textNode.style.visibility = 'visible';
        this.textNode = null;
      }
      const state = (!cancel) ? this.graph.view.getState(this.editingCell) : null;
      const initial = this.initialValue;
      this.initialValue = null;
      this.editingCell = null;
      this.trigger = null;
      this.bounds = null;
      this.textarea.blur();
      this.clearSelection();
      if (this.textarea.parentNode != null) {
        this.textarea.parentNode.removeChild(this.textarea);
      }
      if (this.clearOnChange && this.textarea.innerHTML == this.getEmptyLabelText()) {
        this.textarea.innerHTML = '';
        this.clearOnChange = false;
      }
      if (state != null && (this.textarea.innerHTML != initial || this.align != null)) {
        this.prepareTextarea();
        const value = this.getCurrentValue(state);
        this.graph.getModel().beginUpdate();
        try {
          if (value != null) {
            this.applyValue(state, value);
          }
          if (this.align != null) {
            this.graph.setCellStyles(mxConstants.STYLE_ALIGN, this.align, [state.cell]);
          }
        } finally {
          this.graph.getModel().endUpdate();
        }
      }
      mxEvent.release(this.textarea);
      this.textarea = null;
      this.align = null;
    }
  }

  /**
   * Function: prepareTextarea
   *
   * Prepares the textarea for getting its value in <stopEditing>.
   * This implementation removes the extra trailing linefeed in Firefox.
   */
  prepareTextarea(): void {
    if (this.textarea.lastChild != null && this.textarea.lastChild.nodeName == 'BR') {
      this.textarea.removeChild(this.textarea.lastChild);
    }
  }

  /**
   * Function: isHideLabel
   *
   * Returns true if the label should be hidden while the cell is being
   * edited.
   */
  isHideLabel(state: any): boolean {
    return true;
  }

  /**
   * Function: getMinimumSize
   *
   * Returns the minimum width and height for editing the given state.
   */
  getMinimumSize(state: any): any {
    const scale = this.graph.getView().scale;
    return new mxRectangle(0, 0, (state.text == null) ? 30 : state.text.size * scale + 20, (this.textarea.style.textAlign == 'left') ? 120 : 40);
  }

  /**
   * Function: getEditorBounds
   *
   * Returns the <mxRectangle> that defines the bounds of the editor.
   */
  getEditorBounds(state: any): any {
    const isEdge = this.graph.getModel().isEdge(state.cell);
    const scale = this.graph.getView().scale;
    const minSize = this.getMinimumSize(state);
    const minWidth = minSize.width;
    const minHeight = minSize.height;
    let result = null;
    if (!isEdge && state.view.graph.cellRenderer.legacySpacing && state.style[mxConstants.STYLE_OVERFLOW] == 'fill') {
      result = state.shape.getLabelBounds(mxRectangle.fromRectangle(state));
    } else {
      const spacing = parseInt(state.style[mxConstants.STYLE_SPACING] || 0) * scale;
      const spacingTop = (parseInt(state.style[mxConstants.STYLE_SPACING_TOP] || 0) + mxText.prototype.baseSpacingTop) * scale + spacing;
      const spacingRight = (parseInt(state.style[mxConstants.STYLE_SPACING_RIGHT] || 0) + mxText.prototype.baseSpacingRight) * scale + spacing;
      const spacingBottom = (parseInt(state.style[mxConstants.STYLE_SPACING_BOTTOM] || 0) + mxText.prototype.baseSpacingBottom) * scale + spacing;
      const spacingLeft = (parseInt(state.style[mxConstants.STYLE_SPACING_LEFT] || 0) + mxText.prototype.baseSpacingLeft) * scale + spacing;
      result = new mxRectangle(state.x, state.y, Math.max(minWidth, state.width - spacingLeft - spacingRight), Math.max(minHeight, state.height - spacingTop - spacingBottom));
      const hpos = mxUtils.getValue(state.style, mxConstants.STYLE_LABEL_POSITION, mxConstants.ALIGN_CENTER);
      const vpos = mxUtils.getValue(state.style, mxConstants.STYLE_VERTICAL_LABEL_POSITION, mxConstants.ALIGN_MIDDLE);
      result = (state.shape != null && hpos == mxConstants.ALIGN_CENTER && vpos == mxConstants.ALIGN_MIDDLE) ? state.shape.getLabelBounds(result) : result;
      if (isEdge) {
        result.x = state.absoluteOffset.x;
        result.y = state.absoluteOffset.y;
        if (state.text != null && state.text.boundingBox != null) {
          if (state.text.boundingBox.x > 0) {
            result.x = state.text.boundingBox.x;
          }
          if (state.text.boundingBox.y > 0) {
            result.y = state.text.boundingBox.y;
          }
        }
      } else if (state.text != null && state.text.boundingBox != null) {
        result.x = Math.min(result.x, state.text.boundingBox.x);
        result.y = Math.min(result.y, state.text.boundingBox.y);
      }
      result.x += spacingLeft;
      result.y += spacingTop;
      if (state.text != null && state.text.boundingBox != null) {
        if (!isEdge) {
          result.width = Math.max(result.width, state.text.boundingBox.width);
          result.height = Math.max(result.height, state.text.boundingBox.height);
        } else {
          result.width = Math.max(minWidth, state.text.boundingBox.width);
          result.height = Math.max(minHeight, state.text.boundingBox.height);
        }
      }
      if (this.graph.getModel().isVertex(state.cell)) {
        const horizontal = mxUtils.getValue(state.style, mxConstants.STYLE_LABEL_POSITION, mxConstants.ALIGN_CENTER);
        if (horizontal == mxConstants.ALIGN_LEFT) {
          result.x -= state.width;
        } else if (horizontal == mxConstants.ALIGN_RIGHT) {
          result.x += state.width;
        }
        const vertical = mxUtils.getValue(state.style, mxConstants.STYLE_VERTICAL_LABEL_POSITION, mxConstants.ALIGN_MIDDLE);
        if (vertical == mxConstants.ALIGN_TOP) {
          result.y -= state.height;
        } else if (vertical == mxConstants.ALIGN_BOTTOM) {
          result.y += state.height;
        }
      }
    }
    return new mxRectangle(Math.round(result.x), Math.round(result.y), Math.round(result.width), Math.round(result.height));
  }

  /**
   * Function: getEmptyLabelText
   *
   * Returns the initial label value to be used of the label of the given
   * cell is empty. This label is displayed and cleared on the first keystroke.
   * This implementation returns <emptyLabelText>.
   *
   * Parameters:
   *
   * cell - <mxCell> for which a text for an empty editing box should be
   * returned.
   */
  getEmptyLabelText(cell: mxCell): any {
    return this.emptyLabelText;
  }

  /**
   * Function: getEditingCell
   *
   * Returns the cell that is currently being edited or null if no cell is
   * being edited.
   */
  getEditingCell(): any {
    return this.editingCell;
  }

  /**
   * Function: destroy
   *
   * Destroys the editor and removes all associated resources.
   */
  destroy(): void {
    if (this.textarea != null) {
      mxEvent.release(this.textarea);
      if (this.textarea.parentNode != null) {
        this.textarea.parentNode.removeChild(this.textarea);
      }
      this.textarea = null;
    }
    if (this.changeHandler != null) {
      this.graph.getModel().removeListener(this.changeHandler);
      this.changeHandler = null;
    }
    if (this.zoomHandler) {
      this.graph.view.removeListener(this.zoomHandler);
      this.zoomHandler = null;
    }
  }
}
