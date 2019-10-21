/**
 * Class: mxPrintPreview
 *
 * Implements printing of a diagram across multiple pages. The following opens
 * a print preview for an existing graph:
 *
 * (code)
 * var preview = new mxPrintPreview(graph);
 * preview.open();
 * (end)
 *
 * Use <mxUtils.getScaleForPageCount> as follows in order to print the graph
 * across a given number of pages:
 *
 * (code)
 * var pageCount = mxUtils.prompt('Enter page count', '1');
 *
 * if (!!pageCount)
 * {
 *   var scale = mxUtils.getScaleForPageCount(pageCount, graph);
 *   var preview = new mxPrintPreview(graph, scale);
 *   preview.open();
 * }
 * (end)
 *
 * Additional pages:
 *
 * To add additional pages before and after the output, <getCoverPages> and
 * <getAppendices> can be used, respectively.
 *
 * (code)
 * var preview = new mxPrintPreview(graph, 1);
 *
 * preview.getCoverPages = function(w, h)
 * {
 *   return [this.renderPage(w, h, 0, 0, mxUtils.bind(this, function(div)
 *   {
 *     div.innerHTML = '<div style="position:relative;margin:4px;">Cover Page</p>'
 *   }))];
 * };
 *
 * preview.getAppendices = function(w, h)
 * {
 *   return [this.renderPage(w, h, 0, 0, mxUtils.bind(this, function(div)
 *   {
 *     div.innerHTML = '<div style="position:relative;margin:4px;">Appendix</p>'
 *   }))];
 * };
 *
 * preview.open();
 * (end)
 *
 * CSS:
 *
 * The CSS from the original page is not carried over to the print preview.
 * To add CSS to the page, use the css argument in the <open> function or
 * override <writeHead> to add the respective link tags as follows:
 *
 * (code)
 * var writeHead = preview.writeHead;
 * preview.writeHead = function(doc, css)
 * {
 *   writeHead.apply(this, arguments);
 *   doc.writeln('<link rel="stylesheet" type="text/css" href="style.css">');
 * };
 * (end)
 *
 * Padding:
 *
 * To add a padding to the page in the preview (but not the print output), use
 * the following code:
 *
 * (code)
 * preview.writeHead = function(doc)
 * {
 *   writeHead.apply(this, arguments);
 *
 *   doc.writeln('<style type="text/css">');
 *   doc.writeln('@media screen {');
 *   doc.writeln('  body > div { padding-top:30px;padding-left:40px;box-sizing:content-box; }');
 *   doc.writeln('}');
 *   doc.writeln('</style>');
 * };
 * (end)
 *
 * Headers:
 *
 * Apart from setting the title argument in the mxPrintPreview constructor you
 * can override <renderPage> as follows to add a header to any page:
 *
 * (code)
 * var oldRenderPage = mxPrintPreview.prototype.renderPage;
 * mxPrintPreview.prototype.renderPage = function(w, h, x, y, content, pageNumber)
 * {
 *   var div = oldRenderPage.apply(this, arguments);
 *
 *   var header = document.createElement('div');
 *   header.style.position = 'absolute';
 *   header.style.top = '0px';
 *   header.style.width = '100%';
 *   header.style.textAlign = 'right';
 *   mxUtils.write(header, 'Your header here');
 *   div.firstChild.appendChild(header);
 *
 *   return div;
 * };
 * (end)
 *
 * The pageNumber argument contains the number of the current page, starting at
 * 1. To display a header on the first page only, check pageNumber and add a
 * vertical offset in the constructor call for the height of the header.
 *
 * Page Format:
 *
 * For landscape printing, use <mxConstants.PAGE_FORMAT_A4_LANDSCAPE> as
 * the pageFormat in <mxUtils.getScaleForPageCount> and <mxPrintPreview>.
 * Keep in mind that one can not set the defaults for the print dialog
 * of the operating system from JavaScript so the user must manually choose
 * a page format that matches this setting.
 *
 * You can try passing the following CSS directive to <open> to set the
 * page format in the print dialog to landscape. However, this CSS
 * directive seems to be ignored in most major browsers, including IE.
 *
 * (code)
 */
import { mxClient } from '../mxClient';
import { mxConstants } from '../util/mxConstants';
import { mxEvent } from '../util/mxEvent';
import { mxPoint } from '../util/mxPoint';
import { mxRectangle } from '../util/mxRectangle';
import { mxUtils } from '../util/mxUtils';
import { mxTemporaryCellStates } from './mxTemporaryCellStates';

export class mxPrintPreview {
  constructor(graph: mxGraph, scale: any, pageFormat: any, border: any, x0: any, y0: any, borderColor: string, title: string, pageSelector: any) {
    this.graph = graph;
    this.scale = (!!scale) ? scale : 1 / graph.pageScale;
    this.border = (!!border) ? border : 0;
    this.pageFormat = mxRectangle.fromRectangle((!!pageFormat) ? pageFormat : graph.pageFormat);
    this.title = (!!title) ? title : 'Printer-friendly version';
    this.x0 = (!!x0) ? x0 : 0;
    this.y0 = (!!y0) ? y0 : 0;
    this.borderColor = borderColor;
    this.pageSelector = (!!pageSelector) ? pageSelector : true;
  }

  graph: mxGraph;
  scale: any;
  border: any;
  pageFormat: any;
  title: string;
  x0: any;
  y0: any;
  borderColor: string;
  pageSelector: any;
  /**
   * Variable: marginTop
   *
   * The margin at the top of the page (number). Default is 0.
   */
  marginTop: number;
  /**
   * Variable: marginBottom
   *
   * The margin at the bottom of the page (number). Default is 0.
   */
  marginBottom: number;
  /**
   * Variable: autoOrigin
   *
   * Specifies if the origin should be automatically computed based on the top,
   * left corner of the actual diagram contents. The required offset will be added
   * to <x0> and <y0> in <open>. Default is true.
   * @example true
   */
  autoOrigin: boolean;
  /**
   * Variable: printOverlays
   *
   * Specifies if overlays should be printed. Default is false.
   */
  printOverlays: boolean;
  /**
   * Variable: printControls
   *
   * Specifies if controls (such as folding icons) should be printed. Default is
   * false.
   */
  printControls: boolean;
  /**
   * Variable: printBackgroundImage
   *
   * Specifies if the background image should be printed. Default is false.
   */
  printBackgroundImage: boolean;
  /**
   * Variable: backgroundColor
   *
   * Holds the color value for the page background color. Default is #ffffff.
   * @example #ffffff
   */
  backgroundColor: string;
  /**
   * Variable: wnd
   *
   * Reference to the preview window.
   */
  wnd: any;
  /**
   * Variable: targetWindow
   *
   * Assign any window here to redirect the rendering in <open>.
   */
  targetWindow: any;
  /**
   * Variable: pageCount
   *
   * Holds the actual number of pages in the preview.
   */
  pageCount: number;
  /**
   * Variable: clipping
   *
   * Specifies is clipping should be used to avoid creating too many cell states
   * in large diagrams. The bounding box of the cells in the original diagram is
   * used if this is enabled. Default is true.
   * @example true
   */
  clipping: boolean;

  /**
   * Function: getWindow
   *
   * Returns <wnd>.
   */
  getWindow(): any {
    return this.wnd;
  }

  /**
   * Function: getDocType
   *
   * Returns the string that should go before the HTML tag in the print preview
   * page. This implementation returns an X-UA meta tag for IE5 in quirks mode,
   * IE8 in IE8 standards mode and edge in IE9 standards mode.
   */
  getDoctype(): any {
    let dt = '';
    if (document.documentMode == 5) {
      dt = '<meta http-equiv="X-UA-Compatible" content="IE=5">';
    } else if (document.documentMode == 8) {
      dt = '<meta http-equiv="X-UA-Compatible" content="IE=8">';
    } else if (document.documentMode > 8) {
      dt = '<!--[if IE]><meta http-equiv="X-UA-Compatible" content="IE=edge"><![endif]-->';
    }
    return dt;
  }

  /**
   * Function: appendGraph
   *
   * Adds the given graph to the existing print preview.
   *
   * Parameters:
   *
   * css - Optional CSS string to be used in the head section.
   * targetWindow - Optional window that should be used for rendering. If
   * this is specified then no HEAD tag, CSS and BODY tag will be written.
   */
  appendGraph(graph: mxGraph, scale: any, x0: any, y0: any, forcePageBreaks: any, keepOpen: any): void {
    this.graph = graph;
    this.scale = (!!scale) ? scale : 1 / graph.pageScale;
    this.x0 = x0;
    this.y0 = y0;
    this.open(null, null, forcePageBreaks, keepOpen);
  }

  /**
   * Function: open
   *
   * Shows the print preview window. The window is created here if it does
   * not exist.
   *
   * Parameters:
   *
   * css - Optional CSS string to be used in the head section.
   * targetWindow - Optional window that should be used for rendering. If
   * this is specified then no HEAD tag, CSS and BODY tag will be written.
   */
  open(css: any, targetWindow: any, forcePageBreaks: any, keepOpen: any): any {
    const previousInitializeOverlay = this.graph.cellRenderer.initializeOverlay;
    let div = undefined;
    try {
      if (this.printOverlays) {
        this.graph.cellRenderer.initializeOverlay = function (state, overlay) {
          overlay.init(state.view.getDrawPane());
        };
      }
      if (this.printControls) {
        this.graph.cellRenderer.initControl = function (state, control, handleEvents, clickHandler) {
          control.dialect = state.view.graph.dialect;
          control.init(state.view.getDrawPane());
        };
      }
      this.wnd = (!!targetWindow) ? targetWindow : this.wnd;
      let isNewWindow = false;
      if (!this.wnd) {
        isNewWindow = true;
        this.wnd = window.open();
      }
      const doc = this.wnd.document;
      if (isNewWindow) {
        const dt = this.getDoctype();
        if (!!dt && dt.length > 0) {
          doc.writeln(dt);
        }
        if (mxClient.IS_VML) {
          doc.writeln('<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">');
        } else {
          if (document.compatMode === 'CSS1Compat') {
            doc.writeln('<!DOCTYPE html>');
          }
          doc.writeln('<html>');
        }
        doc.writeln('<head>');
        this.writeHead(doc, css);
        doc.writeln('</head>');
        doc.writeln('<body class="mxPage">');
      }
      const bounds = this.graph.getGraphBounds().clone();
      const currentScale = this.graph.getView().getScale();
      const sc = currentScale / this.scale;
      const tr = this.graph.getView().getTranslate();
      if (!this.autoOrigin) {
        this.x0 -= tr.x * this.scale;
        this.y0 -= tr.y * this.scale;
        bounds.width += bounds.x;
        bounds.height += bounds.y;
        bounds.x = 0;
        bounds.y = 0;
        this.border = 0;
      }
      const availableWidth = this.pageFormat.width - (this.border * 2);
      const availableHeight = this.pageFormat.height - (this.border * 2);
      this.pageFormat.height += this.marginTop + this.marginBottom;
      bounds.width /= sc;
      bounds.height /= sc;
      const hpages = Math.max(1, Math.ceil((bounds.width + this.x0) / availableWidth));
      const vpages = Math.max(1, Math.ceil((bounds.height + this.y0) / availableHeight));
      this.pageCount = hpages * vpages;
      const writePageSelector = mxUtils.bind(this, function () {
        if (this.pageSelector && (vpages > 1 || hpages > 1)) {
          const table = this.createPageSelector(vpages, hpages);
          doc.body.appendChild(table);
          if (mxClient.IS_IE && !doc.documentMode || doc.documentMode == 5 || doc.documentMode == 8 || doc.documentMode == 7) {
            table.style.position = 'absolute';
            const update = function () {
              table.style.top = ((doc.body.scrollTop || doc.documentElement.scrollTop) + 10) + 'px';
            };
            mxEvent.addListener(this.wnd, 'scroll', function (evt) {
              update();
            });
            mxEvent.addListener(this.wnd, 'resize', function (evt) {
              update();
            });
          }
        }
      });
      const addPage = mxUtils.bind(this, function (div, addBreak) {
        if (!!this.borderColor) {
          div.style.borderColor = this.borderColor;
          div.style.borderStyle = 'solid';
          div.style.borderWidth = '1px';
        }
        div.style.background = this.backgroundColor;
        if (forcePageBreaks || addBreak) {
          div.style.pageBreakAfter = 'always';
        }
        if (isNewWindow && (mxClient.IS_IE || document.documentMode >= 11 || mxClient.IS_EDGE)) {
          doc.writeln(div.outerHTML);
          div.parentNode.removeChild(div);
        } else if (mxClient.IS_IE || document.documentMode >= 11 || mxClient.IS_EDGE) {
          let clone = doc.createElement('div');
          clone.innerHTML = div.outerHTML;
          clone = clone.getElementsByTagName('div')[0];
          doc.body.appendChild(clone);
          div.parentNode.removeChild(div);
        } else {
          div.parentNode.removeChild(div);
          doc.body.appendChild(div);
        }
        if (forcePageBreaks || addBreak) {
          this.addPageBreak(doc);
        }
      });
      const cov = this.getCoverPages(this.pageFormat.width, this.pageFormat.height);
      if (!!cov) {
        for (let i = 0; i < cov.length; i++) {
          addPage(cov[i], true);
        }
      }
      const apx = this.getAppendices(this.pageFormat.width, this.pageFormat.height);
      for (let i = 0; i < vpages; i++) {
        const dy = i * availableHeight / this.scale - this.y0 / this.scale + (bounds.y - tr.y * currentScale) / currentScale;
        for (let j = 0; j < hpages; j++) {
          if (!this.wnd) {
            return null;
          }
          const dx = j * availableWidth / this.scale - this.x0 / this.scale + (bounds.x - tr.x * currentScale) / currentScale;
          const pageNum = i * hpages + j + 1;
          const clip = new mxRectangle(dx, dy, availableWidth, availableHeight);
          div = this.renderPage(this.pageFormat.width, this.pageFormat.height, 0, 0, mxUtils.bind(this, function (div) {
            this.addGraphFragment(-dx, -dy, this.scale, pageNum, div, clip);
            if (this.printBackgroundImage) {
              this.insertBackgroundImage(div, -dx, -dy);
            }
          }), pageNum);
          div.setAttribute('id', 'mxPage-' + pageNum);
          addPage(div, !!apx || i < vpages - 1 || j < hpages - 1);
        }
      }
      if (!!apx) {
        for (let i = 0; i < apx.length; i++) {
          addPage(apx[i], i < apx.length - 1);
        }
      }
      if (isNewWindow && !keepOpen) {
        this.closeDocument();
        writePageSelector();
      }
      this.wnd.focus();
    } catch (e) {
      if (!!div && !!div.parentNode) {
        div.parentNode.removeChild(div);
      }
    } finally {
      this.graph.cellRenderer.initializeOverlay = previousInitializeOverlay;
    }
    return this.wnd;
  }

  /**
   * Function: addPageBreak
   *
   * Adds a page break to the given document.
   */
  addPageBreak(doc: any): void {
    const hr = doc.createElement('hr');
    hr.className = 'mxPageBreak';
    doc.body.appendChild(hr);
  }

  /**
   * Function: closeDocument
   *
   * Writes the closing tags for body and page after calling <writePostfix>.
   */
  closeDocument(): void {
    try {
      if (!!this.wnd && !!this.wnd.document) {
        const doc = this.wnd.document;
        this.writePostfix(doc);
        doc.writeln('</body>');
        doc.writeln('</html>');
        doc.close();
        mxEvent.release(doc.body);
      }
    } catch (e) {
    }
  }

  /**
   * Function: writeHead
   *
   * Writes the HEAD section into the given document, without the opening
   * and closing HEAD tags.
   */
  writeHead(doc: any, css: any): void {
    if (!!this.title) {
      doc.writeln('<title>' + this.title + '</title>');
    }
    if (mxClient.IS_VML) {
      doc.writeln('<style type="text/css">v\\:*{behavior:url(#default#VML)}o\\:*{behavior:url(#default#VML)}</style>');
    }
    mxClient.link('stylesheet', mxClient.basePath + '/css/common.css', doc);
    doc.writeln('<style type="text/css">');
    doc.writeln('@media print {');
    doc.writeln('  * { -webkit-print-color-adjust: exact; }');
    doc.writeln('  table.mxPageSelector { display: none; }');
    doc.writeln('  hr.mxPageBreak { display: none; }');
    doc.writeln('}');
    doc.writeln('@media screen {');
    doc.writeln('  table.mxPageSelector { position: fixed; right: 10px; top: 10px;' + 'font-family: Arial; font-size:10pt; border: solid 1px darkgray;' + 'background: white; border-collapse:collapse; }');
    doc.writeln('  table.mxPageSelector td { border: solid 1px gray; padding:4px; }');
    doc.writeln('  body.mxPage { background: gray; }');
    doc.writeln('}');
    if (!!css) {
      doc.writeln(css);
    }
    doc.writeln('</style>');
  }

  /**
   * Function: writePostfix
   *
   * Called before closing the body of the page. This implementation is empty.
   */
  writePostfix(doc: any): void {
  }

  /**
   * Function: createPageSelector
   *
   * Creates the page selector table.
   */
  createPageSelector(vpages: any, hpages: any): any {
    const doc = this.wnd.document;
    const table = doc.createElement('table');
    table.className = 'mxPageSelector';
    table.setAttribute('border', '0');
    const tbody = doc.createElement('tbody');
    for (let i = 0; i < vpages; i++) {
      const row = doc.createElement('tr');
      for (let j = 0; j < hpages; j++) {
        const pageNum = i * hpages + j + 1;
        const cell = doc.createElement('td');
        const a = doc.createElement('a');
        a.setAttribute('href', '#mxPage-' + pageNum);
        if (mxClient.IS_NS && !mxClient.IS_SF && !mxClient.IS_GC) {
          const js = 'var page = document.getElementById(\'mxPage-' + pageNum + '\');page.scrollIntoView(true);event.preventDefault();';
          a.setAttribute('onclick', js);
        }
        mxUtils.write(a, pageNum, doc);
        cell.appendChild(a);
        row.appendChild(cell);
      }
      tbody.appendChild(row);
    }
    table.appendChild(tbody);
    return table;
  }

  /**
   * Function: renderPage
   *
   * Creates a DIV that prints a single page of the given
   * graph using the given scale and returns the DIV that
   * represents the page.
   *
   * Parameters:
   *
   * w - Width of the page in pixels.
   * h - Height of the page in pixels.
   * dx - Optional horizontal page offset in pixels (used internally).
   * dy - Optional vertical page offset in pixels (used internally).
   * content - Callback that adds the HTML content to the inner div of a page.
   * Takes the inner div as the argument.
   * pageNumber - Integer representing the page number.
   */
  renderPage(w: number, h: number, dx: number, dy: number, content: any, pageNumber: any): any {
    const doc = this.wnd.document;
    let div = document.createElement('div');
    let arg = undefined;
    try {
      if (dx != 0 || dy != 0) {
        div.style.position = 'relative';
        div.style.width = w + 'px';
        div.style.height = h + 'px';
        div.style.pageBreakInside = 'avoid';
        const innerDiv = document.createElement('div');
        innerDiv.style.position = 'relative';
        innerDiv.style.top = this.border + 'px';
        innerDiv.style.left = this.border + 'px';
        innerDiv.style.width = (w - 2 * this.border) + 'px';
        innerDiv.style.height = (h - 2 * this.border) + 'px';
        innerDiv.style.overflow = 'hidden';
        const viewport = document.createElement('div');
        viewport.style.position = 'relative';
        viewport.style.marginLeft = dx + 'px';
        viewport.style.marginTop = dy + 'px';
        if (doc.documentMode == 8) {
          innerDiv.style.position = 'absolute';
          viewport.style.position = 'absolute';
        }
        if (doc.documentMode == 10) {
          viewport.style.width = '100%';
          viewport.style.height = '100%';
        }
        innerDiv.appendChild(viewport);
        div.appendChild(innerDiv);
        document.body.appendChild(div);
        arg = viewport;
      } else {
        div.style.width = w + 'px';
        div.style.height = h + 'px';
        div.style.overflow = 'hidden';
        div.style.pageBreakInside = 'avoid';
        if (doc.documentMode == 8) {
          div.style.position = 'relative';
        }
        const innerDiv = document.createElement('div');
        innerDiv.style.width = (w - 2 * this.border) + 'px';
        innerDiv.style.height = (h - 2 * this.border) + 'px';
        innerDiv.style.overflow = 'hidden';
        if (mxClient.IS_IE && (!doc.documentMode || doc.documentMode == 5 || doc.documentMode == 8 || doc.documentMode == 7)) {
          innerDiv.style.marginTop = this.border + 'px';
          innerDiv.style.marginLeft = this.border + 'px';
        } else {
          innerDiv.style.top = this.border + 'px';
          innerDiv.style.left = this.border + 'px';
        }
        if (this.graph.dialect == mxConstants.DIALECT_VML) {
          innerDiv.style.position = 'absolute';
        }
        div.appendChild(innerDiv);
        document.body.appendChild(div);
        arg = innerDiv;
      }
    } catch (e) {
      div.parentNode.removeChild(div);
      div = undefined;
      throw e;
    }
    content(arg);
    return div;
  }

  /**
   * Function: getRoot
   *
   * Returns the root cell for painting the graph.
   */
  getRoot(): any {
    let root = this.graph.view.currentRoot;
    if (!root) {
      root = this.graph.getModel().getRoot();
    }
    return root;
  }

  /**
   * Function: addGraphFragment
   *
   * Adds a graph fragment to the given div.
   *
   * Parameters:
   *
   * dx - Horizontal translation for the diagram.
   * dy - Vertical translation for the diagram.
   * scale - Scale for the diagram.
   * pageNumber - Number of the page to be rendered.
   * div - Div that contains the output.
   * clip - Contains the clipping rectangle as an <mxRectangle>.
   */
  addGraphFragment(dx: number, dy: number, scale: any, pageNumber: any, div: HTMLElement, clip: any): any {
    const view = this.graph.getView();
    const previousContainer = this.graph.container;
    this.graph.container = div;
    const canvas = view.getCanvas();
    const backgroundPane = view.getBackgroundPane();
    const drawPane = view.getDrawPane();
    const overlayPane = view.getOverlayPane();
    if (this.graph.dialect == mxConstants.DIALECT_SVG) {
      view.createSvg();
      if (!mxClient.NO_FO) {
        const g = view.getDrawPane().parentNode;
        const prev = g.getAttribute('transform');
        g.setAttribute('transformOrigin', '0 0');
        g.setAttribute('transform', 'scale(' + scale + ',' + scale + ')' + 'translate(' + dx + ',' + dy + ')');
        scale = 1;
        dx = 0;
        dy = 0;
      }
    } else if (this.graph.dialect == mxConstants.DIALECT_VML) {
      view.createVml();
    } else {
      view.createHtml();
    }
    const eventsEnabled = view.isEventsEnabled();
    view.setEventsEnabled(false);
    const graphEnabled = this.graph.isEnabled();
    this.graph.setEnabled(false);
    const translate = view.getTranslate();
    view.translate = new mxPoint(dx, dy);
    const redraw = this.graph.cellRenderer.redraw;
    const states = view.states;
    const s = view.scale;
    if (this.clipping) {
      const tempClip = new mxRectangle((clip.x + translate.x) * s, (clip.y + translate.y) * s, clip.width * s / scale, clip.height * s / scale);
      this.graph.cellRenderer.redraw = function (state, force, rendering) {
        if (!!state) {
          const orig = states.get(state.cell);
          if (!!orig) {
            const bbox = view.getBoundingBox(orig, false);
            if (!!bbox && !mxUtils.intersects(tempClip, bbox)) {
            }
          }
        }
        redraw.apply(this, arguments);
      };
    }
    let temp = undefined;
    try {
      const cells = [this.getRoot()];
      temp = new mxTemporaryCellStates(view, scale, cells, null, mxUtils.bind(this, function (state) {
        return this.getLinkForCellState(state);
      }));
    } finally {
      if (mxClient.IS_IE) {
        view.overlayPane.innerHTML = '';
        view.canvas.style.overflow = 'hidden';
        view.canvas.style.position = 'relative';
        view.canvas.style.top = this.marginTop + 'px';
        view.canvas.style.width = clip.width + 'px';
        view.canvas.style.height = clip.height + 'px';
      } else {
        let tmp = div.firstChild;
        while (!!tmp) {
          const next = tmp.nextSibling;
          const name = tmp.nodeName.toLowerCase();
          if (name == 'svg') {
            tmp.style.overflow = 'hidden';
            tmp.style.position = 'relative';
            tmp.style.top = this.marginTop + 'px';
            tmp.setAttribute('width', clip.width);
            tmp.setAttribute('height', clip.height);
            tmp.style.width = '';
            tmp.style.height = '';
          } else if (tmp.style.cursor != 'default' && name != 'div') {
            tmp.parentNode.removeChild(tmp);
          }
          tmp = next;
        }
      }
      if (this.printBackgroundImage) {
        const svgs = div.getElementsByTagName('svg');
        if (svgs.length > 0) {
          svgs[0].style.position = 'absolute';
        }
      }
      view.overlayPane.parentNode.removeChild(view.overlayPane);
      this.graph.setEnabled(graphEnabled);
      this.graph.container = previousContainer;
      this.graph.cellRenderer.redraw = redraw;
      view.canvas = canvas;
      view.backgroundPane = backgroundPane;
      view.drawPane = drawPane;
      view.overlayPane = overlayPane;
      view.translate = translate;
      temp.destroy();
      view.setEventsEnabled(eventsEnabled);
    }
  }

  /**
   * Function: getLinkForCellState
   *
   * Returns the link for the given cell state. This returns null.
   */
  getLinkForCellState(state: any): any {
    return this.graph.getLinkForCell(state.cell);
  }

  /**
   * Function: insertBackgroundImage
   *
   * Inserts the background image into the given div.
   */
  insertBackgroundImage(div: HTMLElement, dx: number, dy: number): void {
    const bg = this.graph.backgroundImage;
    if (!!bg) {
      const img = document.createElement('img');
      img.style.position = 'absolute';
      img.style.marginLeft = Math.round(dx * this.scale) + 'px';
      img.style.marginTop = Math.round(dy * this.scale) + 'px';
      img.setAttribute('width', Math.round(this.scale * bg.width));
      img.setAttribute('height', Math.round(this.scale * bg.height));
      img.src = bg.src;
      div.insertBefore(img, div.firstChild);
    }
  }

  /**
   * Function: getCoverPages
   *
   * Returns the pages to be added before the print output. This returns null.
   */
  getCoverPages(): any {
    return null;
  }

  /**
   * Function: getAppendices
   *
   * Returns the pages to be added after the print output. This returns null.
   */
  getAppendices(): any {
    return null;
  }

  /**
   * Function: print
   *
   * Opens the print preview and shows the print dialog.
   *
   * Parameters:
   *
   * css - Optional CSS string to be used in the head section.
   */
  print(css: any): void {
    const wnd = this.open(css);
    if (!!wnd) {
      wnd.print();
    }
  }

  /**
   * Function: close
   *
   * Closes the print preview window.
   */
  close(): void {
    if (!!this.wnd) {
      this.wnd.close();
      this.wnd = undefined;
    }
  }
}
