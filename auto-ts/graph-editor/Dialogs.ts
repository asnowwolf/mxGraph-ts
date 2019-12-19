/**
 * Copyright (c) 2006-2012, JGraph Ltd
 */
/**
 * Constructs a new open dialog.
 * @class
 */
export class OpenDialog {
  constructor() {
    var iframe = document.createElement();
    iframe.style.backgroundColor =;
    iframe.allowTransparency =;
    iframe.style.borderStyle =;
    iframe.style.borderWidth =;
    iframe.style.overflow =;
    iframe.frameBorder =;
    var dx = (mxClient.IS_VML && (document.documentMode == null || document.documentMode <)) ? :;
    iframe.setAttribute(, (((Editor.useLocalStorage) ? :) + dx) +);
    iframe.setAttribute(, (((Editor.useLocalStorage) ? :) + dx) +);
    iframe.setAttribute(, OPEN_FORM);
    this.container = iframe;
  }

  /**
   Creates function to apply value
   */
  presetColors = [, , , , , , , , , , , , , , , , , , , , , , ];
  /**
   Creates function to apply value
   */
  defaultColors = [, , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , ];

  /**
   Creates function to apply value
   */
  createApplyFunction() {
    return mxUtils.bind(this, function (color) {
      var graph = this.editorUi.editor.graph;
      graph.getModel().beginUpdate();
      try {
        graph.setCellStyles(this.currentColorKey, color);
        this.editorUi.fireEvent(new mxEventObject(, , [this.currentColorKey], , [color], , graph.getSelectionCells()));
      } finally {
        graph.getModel().endUpdate();
      }
    });
  }

  /**
   undefined
   */
  recentColors = [];

  /**
   Adds recent color for later use.
   */
  addRecentColor(color, max) {
    if (color != null) {
      mxUtils.remove(color, ColorDialog.recentColors);
      ColorDialog.recentColors.splice(, , color);
      if (ColorDialog.recentColors.length >= max) {
        ColorDialog.recentColors.pop();
      }
    }
  }

  /**
   Adds recent color for later use.
   */
  resetRecentColors() {
    ColorDialog.recentColors = [];
  }

  /**
   undefined
   */
  filenameHelpLink = null;

  /**
   undefined
   */
  createTypeHint(ui, nameInput, hints) {
    var hint = document.createElement();
    hint.style.cssText =;
    mxUtils.setOpacity(hint);
    var nameChanged = function () {
      hint.setAttribute(, Editor.helpImage);
      hint.setAttribute(, mxResources.get());
      for (var i =; i < hints.length; i++) {
        if (hints[i].ext.length > && nameInput.value.substring(nameInput.value.length - hints[i].ext.length -) == +hints[i].ext) {
          hint.setAttribute(, mxClient.imageBasePath +);
          hint.setAttribute(, mxResources.get(hints[i].title));
          break;
        }
      }
    };
    mxEvent.addListener(nameInput, , nameChanged);
    mxEvent.addListener(nameInput, , nameChanged);
    mxEvent.addListener(hint, , function (evt) {
      var title = hint.getAttribute();
      if (hint.getAttribute() == Editor.helpImage) {
        ui.editor.graph.openLink(FilenameDialog.filenameHelpLink);
      } else if (title !=) {
        ui.showError(null, title, mxResources.get(), function () {
          ui.editor.graph.openLink(FilenameDialog.filenameHelpLink);
        }, null, mxResources.get(), null, null, null ,);
      }
      mxEvent.consume(evt);
    });
    nameChanged();
    return hint;
  }

  /**
   undefined
   */
  showNewWindowOption = true;
  /**
   Remembers last value for border.
   */
  lastBorderValue =;
  /**
   Global switches for the export dialog.
   */
  showGifOption = true;
  /**
   Global switches for the export dialog.
   */
  showXmlOption = true;

  /**
   Hook for getting the export format. Returns null for the default
   intermediate XML export format or a function that returns the
   parameter and value to be used in the request in the form
   key=value, where value should be URL encoded.
   */
  exportFile(editorUi, name, format, bg, s, b, dpi) {
    var graph = editorUi.editor.graph;
    if (format ==) {
      ExportDialog.saveLocalFile(editorUi, mxUtils.getXml(editorUi.editor.getGraphXml()), name, format);
    } else if (format ==) {
      ExportDialog.saveLocalFile(editorUi, mxUtils.getXml(graph.getSvg(bg, s, b)), name, format);
    } else {
      var bounds = graph.getGraphBounds();
      var xmlDoc = mxUtils.createXmlDocument();
      var root = xmlDoc.createElement();
      xmlDoc.appendChild(root);
      var xmlCanvas = new mxXmlCanvas2D(root);
      xmlCanvas.translate(Math.floor((b / s - bounds.x) / graph.view.scale), Math.floor((b / s - bounds.y) / graph.view.scale));
      xmlCanvas.scale(s / graph.view.scale);
      var imgExport = new mxImageExport();
      imgExport.drawState(graph.getView().getState(graph.model.root), xmlCanvas);
      var param = +encodeURIComponent(mxUtils.getXml(root));
      var w = Math.ceil(bounds.width * s / graph.view.scale + * b);
      var h = Math.ceil(bounds.height * s / graph.view.scale + * b);
      if (param.length <= MAX_REQUEST_SIZE && w * h < MAX_AREA) {
        editorUi.hideDialog();
        var req = new mxXmlRequest(EXPORT_URL, +format + +encodeURIComponent(name) + +((bg != null) ? bg :) + +w + +h + +param + +dpi);
        req.simulate(document);
      } else {
        mxUtils.alert(mxResources.get());
      }
    }
  }

  /**
   Hook for getting the export format. Returns null for the default
   intermediate XML export format or a function that returns the
   parameter and value to be used in the request in the form
   key=value, where value should be URL encoded.
   */
  saveLocalFile(editorUi, data, filename, format) {
    if (data.length < MAX_REQUEST_SIZE) {
      editorUi.hideDialog();
      var req = new mxXmlRequest(SAVE_URL, +encodeURIComponent(data) + +encodeURIComponent(filename) + +format);
      req.simulate(document);
    } else {
      mxUtils.alert(mxResources.get());
      mxUtils.popup(xml);
    }
  }

  /**
   Optional help link.
   */
  getDisplayIdForCell(ui, cell) {
    var id = null;
    if (ui.editor.graph.getModel().getParent(cell) != null) {
      id = cell.getId();
    }
    return id;
  }

  /**
   Optional help link.
   */
  placeholderHelpLink = null;
}

/**
 * Constructs a new color dialog.
 * @class
 */
export class ColorDialog {
  constructor(editorUi, color, apply, cancelFn) {
    this.editorUi = editorUi;
    var input = document.createElement();
    input.style.marginBottom =;
    input.style.width =;
    if (mxClient.IS_IE) {
      input.style.marginTop =;
      document.body.appendChild(input);
    }
    this.init = function () {
      if (!mxClient.IS_TOUCH) {
        input.focus();
      }
    };
    var picker = new jscolor.color(input);
    picker.pickerOnfocus = false;
    picker.showPicker();
    var div = document.createElement();
    jscolor.picker.box.style.position =;
    jscolor.picker.box.style.width =;
    jscolor.picker.box.style.height =;
    jscolor.picker.box.style.paddingBottom =;
    div.appendChild(jscolor.picker.box);
    var center = document.createElement();

    function createRecentColorTable() {
      var table = addPresets((ColorDialog.recentColors.length ==) ? [] : ColorDialog.recentColors, , , true);
      table.style.marginBottom =;
      return table;
    }
    ;

    function addPresets(presets, rowLength, defaultColor, addResetOption) {
      rowLength = (rowLength != null) ? rowLength :;
      var table = document.createElement();
      table.style.borderCollapse =;
      table.setAttribute(,);
      table.style.marginBottom =;
      table.style.cellSpacing =;
      var tbody = document.createElement();
      table.appendChild(tbody);
      var rows = presets.length / rowLength;
      for (var row =; row < rows; row++) {
        var tr = document.createElement();
        for (var i =; i < rowLength; i++) {
          (function (clr) {
            var td = document.createElement();
            td.style.border =;
            td.style.padding =;
            td.style.width =;
            td.style.height =;
            if (clr == null) {
              clr = defaultColor;
            }
            if (clr ==) {
              td.style.background = +Dialog.prototype.noColorImage +;
            } else {
              td.style.backgroundColor = +clr;
            }
            tr.appendChild(td);
            if (clr != null) {
              td.style.cursor =;
              mxEvent.addListener(td, , function () {
                if (clr ==) {
                  picker.fromString();
                  input.value =;
                } else {
                  picker.fromString(clr);
                }
              });
            }
          })(presets[row * rowLength + i]);
        }
        tbody.appendChild(tr);
      }
      if (addResetOption) {
        var td = document.createElement();
        td.setAttribute(, mxResources.get());
        td.style.border =;
        td.style.padding =;
        td.style.width =;
        td.style.height =;
        td.style.backgroundImage = +Dialog.prototype.closeImage +;
        td.style.backgroundPosition =;
        td.style.backgroundRepeat =;
        td.style.cursor =;
        tr.appendChild(td);
        mxEvent.addListener(td, , function () {
          ColorDialog.resetRecentColors();
          table.parentNode.replaceChild(createRecentColorTable(), table);
        });
      }
      center.appendChild(table);
      return table;
    }
    ;
    div.appendChild(input);
    mxUtils.br(div);
    createRecentColorTable();
    var table = addPresets(this.presetColors);
    table.style.marginBottom =;
    table = addPresets(this.defaultColors);
    table.style.marginBottom =;
    div.appendChild(center);
    var buttons = document.createElement();
    buttons.style.textAlign =;
    buttons.style.whiteSpace =;
    var cancelBtn = mxUtils.button(mxResources.get(), function () {
      editorUi.hideDialog();
      if (cancelFn != null) {
        cancelFn();
      }
    });
    cancelBtn.className =;
    if (editorUi.editor.cancelFirst) {
      buttons.appendChild(cancelBtn);
    }
    var applyFunction = (apply != null) ? apply : this.createApplyFunction();
    var applyBtn = mxUtils.button(mxResources.get(), function () {
      var color = input.value;
      if (.
      test(color);
    )
      {
        ColorDialog.addRecentColor(color);
        if (color != && color.charAt() !=) {
          color = +color;
        }
        applyFunction(color);
        editorUi.hideDialog();
      }
    else
      {
        editorUi.handleError({ message: mxResources.get() });
      }
    });
    applyBtn.className =;
    buttons.appendChild(applyBtn);
    if (!editorUi.editor.cancelFirst) {
      buttons.appendChild(cancelBtn);
    }
    if (color != null) {
      if (color ==) {
        picker.fromString();
        input.value =;
      } else {
        picker.fromString(color);
      }
    }
    div.appendChild(buttons);
    this.picker = picker;
    this.colorInput = input;
    mxEvent.addListener(div, , function (e) {
      if (e.keyCode ==) {
        editorUi.hideDialog();
        if (cancelFn != null) {
          cancelFn();
        }
        mxEvent.consume(e);
      }
    });
    this.container = div;
  }

  /**
   Creates function to apply value
   */
  presetColors = [, , , , , , , , , , , , , , , , , , , , , , ];
  /**
   Creates function to apply value
   */
  defaultColors = [, , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , ];

  /**
   Creates function to apply value
   */
  createApplyFunction() {
    return mxUtils.bind(this, function (color) {
      var graph = this.editorUi.editor.graph;
      graph.getModel().beginUpdate();
      try {
        graph.setCellStyles(this.currentColorKey, color);
        this.editorUi.fireEvent(new mxEventObject(, , [this.currentColorKey], , [color], , graph.getSelectionCells()));
      } finally {
        graph.getModel().endUpdate();
      }
    });
  }

  /**
   undefined
   */
  recentColors = [];

  /**
   Adds recent color for later use.
   */
  addRecentColor(color, max) {
    if (color != null) {
      mxUtils.remove(color, ColorDialog.recentColors);
      ColorDialog.recentColors.splice(, , color);
      if (ColorDialog.recentColors.length >= max) {
        ColorDialog.recentColors.pop();
      }
    }
  }

  /**
   Adds recent color for later use.
   */
  resetRecentColors() {
    ColorDialog.recentColors = [];
  }

  /**
   undefined
   */
  filenameHelpLink = null;

  /**
   undefined
   */
  createTypeHint(ui, nameInput, hints) {
    var hint = document.createElement();
    hint.style.cssText =;
    mxUtils.setOpacity(hint);
    var nameChanged = function () {
      hint.setAttribute(, Editor.helpImage);
      hint.setAttribute(, mxResources.get());
      for (var i =; i < hints.length; i++) {
        if (hints[i].ext.length > && nameInput.value.substring(nameInput.value.length - hints[i].ext.length -) == +hints[i].ext) {
          hint.setAttribute(, mxClient.imageBasePath +);
          hint.setAttribute(, mxResources.get(hints[i].title));
          break;
        }
      }
    };
    mxEvent.addListener(nameInput, , nameChanged);
    mxEvent.addListener(nameInput, , nameChanged);
    mxEvent.addListener(hint, , function (evt) {
      var title = hint.getAttribute();
      if (hint.getAttribute() == Editor.helpImage) {
        ui.editor.graph.openLink(FilenameDialog.filenameHelpLink);
      } else if (title !=) {
        ui.showError(null, title, mxResources.get(), function () {
          ui.editor.graph.openLink(FilenameDialog.filenameHelpLink);
        }, null, mxResources.get(), null, null, null ,);
      }
      mxEvent.consume(evt);
    });
    nameChanged();
    return hint;
  }

  /**
   undefined
   */
  showNewWindowOption = true;
  /**
   Remembers last value for border.
   */
  lastBorderValue =;
  /**
   Global switches for the export dialog.
   */
  showGifOption = true;
  /**
   Global switches for the export dialog.
   */
  showXmlOption = true;

  /**
   Hook for getting the export format. Returns null for the default
   intermediate XML export format or a function that returns the
   parameter and value to be used in the request in the form
   key=value, where value should be URL encoded.
   */
  exportFile(editorUi, name, format, bg, s, b, dpi) {
    var graph = editorUi.editor.graph;
    if (format ==) {
      ExportDialog.saveLocalFile(editorUi, mxUtils.getXml(editorUi.editor.getGraphXml()), name, format);
    } else if (format ==) {
      ExportDialog.saveLocalFile(editorUi, mxUtils.getXml(graph.getSvg(bg, s, b)), name, format);
    } else {
      var bounds = graph.getGraphBounds();
      var xmlDoc = mxUtils.createXmlDocument();
      var root = xmlDoc.createElement();
      xmlDoc.appendChild(root);
      var xmlCanvas = new mxXmlCanvas2D(root);
      xmlCanvas.translate(Math.floor((b / s - bounds.x) / graph.view.scale), Math.floor((b / s - bounds.y) / graph.view.scale));
      xmlCanvas.scale(s / graph.view.scale);
      var imgExport = new mxImageExport();
      imgExport.drawState(graph.getView().getState(graph.model.root), xmlCanvas);
      var param = +encodeURIComponent(mxUtils.getXml(root));
      var w = Math.ceil(bounds.width * s / graph.view.scale + * b);
      var h = Math.ceil(bounds.height * s / graph.view.scale + * b);
      if (param.length <= MAX_REQUEST_SIZE && w * h < MAX_AREA) {
        editorUi.hideDialog();
        var req = new mxXmlRequest(EXPORT_URL, +format + +encodeURIComponent(name) + +((bg != null) ? bg :) + +w + +h + +param + +dpi);
        req.simulate(document);
      } else {
        mxUtils.alert(mxResources.get());
      }
    }
  }

  /**
   Hook for getting the export format. Returns null for the default
   intermediate XML export format or a function that returns the
   parameter and value to be used in the request in the form
   key=value, where value should be URL encoded.
   */
  saveLocalFile(editorUi, data, filename, format) {
    if (data.length < MAX_REQUEST_SIZE) {
      editorUi.hideDialog();
      var req = new mxXmlRequest(SAVE_URL, +encodeURIComponent(data) + +encodeURIComponent(filename) + +format);
      req.simulate(document);
    } else {
      mxUtils.alert(mxResources.get());
      mxUtils.popup(xml);
    }
  }

  /**
   Optional help link.
   */
  getDisplayIdForCell(ui, cell) {
    var id = null;
    if (ui.editor.graph.getModel().getParent(cell) != null) {
      id = cell.getId();
    }
    return id;
  }

  /**
   Optional help link.
   */
  placeholderHelpLink = null;
}

/**
 * Creates function to apply value
 */
ColorDialog.prototype.presetColors = ['E6D0DE', 'CDA2BE', 'B5739D', 'E1D5E7', 'C3ABD0', 'A680B8', 'D4E1F5', 'A9C4EB', '7EA6E0', 'D5E8D4', '9AC7BF', '67AB9F', 'D5E8D4', 'B9E0A5', '97D077', 'FFF2CC', 'FFE599', 'FFD966', 'FFF4C3', 'FFCE9F', 'FFB570', 'F8CECC', 'F19C99', 'EA6B66'];

/**
 * Creates function to apply value
 */
ColorDialog.prototype.defaultColors = ['none', 'FFFFFF', 'E6E6E6', 'CCCCCC', 'B3B3B3', '999999', '808080', '666666', '4D4D4D', '333333', '1A1A1A', '000000', 'FFCCCC', 'FFE6CC', 'FFFFCC', 'E6FFCC', 'CCFFCC', 'CCFFE6', 'CCFFFF', 'CCE5FF', 'CCCCFF', 'E5CCFF', 'FFCCFF', 'FFCCE6',
  'FF9999', 'FFCC99', 'FFFF99', 'CCFF99', '99FF99', '99FFCC', '99FFFF', '99CCFF', '9999FF', 'CC99FF', 'FF99FF', 'FF99CC', 'FF6666', 'FFB366', 'FFFF66', 'B3FF66', '66FF66', '66FFB3', '66FFFF', '66B2FF', '6666FF', 'B266FF', 'FF66FF', 'FF66B3', 'FF3333', 'FF9933', 'FFFF33',
  '99FF33', '33FF33', '33FF99', '33FFFF', '3399FF', '3333FF', '9933FF', 'FF33FF', 'FF3399', 'FF0000', 'FF8000', 'FFFF00', '80FF00', '00FF00', '00FF80', '00FFFF', '007FFF', '0000FF', '7F00FF', 'FF00FF', 'FF0080', 'CC0000', 'CC6600', 'CCCC00', '66CC00', '00CC00', '00CC66',
  '00CCCC', '0066CC', '0000CC', '6600CC', 'CC00CC', 'CC0066', '990000', '994C00', '999900', '4D9900', '009900', '00994D', '009999', '004C99', '000099', '4C0099', '990099', '99004D', '660000', '663300', '666600', '336600', '006600', '006633', '006666', '003366', '000066',
  '330066', '660066', '660033', '330000', '331A00', '333300', '1A3300', '003300', '00331A', '003333', '001933', '000033', '190033', '330033', '33001A'];

/**
 * Creates function to apply value
 * @returns {function}
 */
ColorDialog.prototype.createApplyFunction = function () {
  return mxUtils.bind(this, function (color) {
    var graph = this.editorUi.editor.graph;

    graph.getModel().beginUpdate();
    try {
      graph.setCellStyles(this.currentColorKey, color);
      this.editorUi.fireEvent(new mxEventObject('styleChanged', 'keys', [this.currentColorKey],
          'values', [color], 'cells', graph.getSelectionCells()));
    } finally {
      graph.getModel().endUpdate();
    }
  });
};

/**
 * @type {Array.<string>}
 */
ColorDialog.recentColors = [];

/**
 * Adds recent color for later use.
 * @param color {string}
 * @param max {number}
 */
ColorDialog.addRecentColor = function (color, max) {
  if (color != null) {
    mxUtils.remove(color, ColorDialog.recentColors);
    ColorDialog.recentColors.splice(0, 0, color);

    if (ColorDialog.recentColors.length >= max) {
      ColorDialog.recentColors.pop();
    }
  }
};

/**
 * Adds recent color for later use.
 */
ColorDialog.resetRecentColors = function () {
  ColorDialog.recentColors = [];
};

/**
 * Constructs a new about dialog.
 * @class
 */
export class AboutDialog {
  constructor(editorUi) {
    var div = document.createElement();
    div.setAttribute(,);
    var h3 = document.createElement();
    mxUtils.write(h3, mxResources.get() +);
    div.appendChild(h3);
    var img = document.createElement();
    img.style.border =;
    img.setAttribute(,);
    img.setAttribute(,);
    img.setAttribute(, IMAGE_PATH +);
    div.appendChild(img);
    mxUtils.br(div);
    mxUtils.write(div, +mxClient.VERSION);
    mxUtils.br(div);
    var link = document.createElement();
    link.setAttribute(,);
    link.setAttribute(,);
    mxUtils.write(link);
    div.appendChild(link);
    mxUtils.br(div);
    mxUtils.br(div);
    var closeBtn = mxUtils.button(mxResources.get(), function () {
      editorUi.hideDialog();
    });
    closeBtn.className =;
    div.appendChild(closeBtn);
    this.container = div;
  }

  /**
   Creates function to apply value
   */
  presetColors = [, , , , , , , , , , , , , , , , , , , , , , ];
  /**
   Creates function to apply value
   */
  defaultColors = [, , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , ];

  /**
   Creates function to apply value
   */
  createApplyFunction() {
    return mxUtils.bind(this, function (color) {
      var graph = this.editorUi.editor.graph;
      graph.getModel().beginUpdate();
      try {
        graph.setCellStyles(this.currentColorKey, color);
        this.editorUi.fireEvent(new mxEventObject(, , [this.currentColorKey], , [color], , graph.getSelectionCells()));
      } finally {
        graph.getModel().endUpdate();
      }
    });
  }

  /**
   undefined
   */
  recentColors = [];

  /**
   Adds recent color for later use.
   */
  addRecentColor(color, max) {
    if (color != null) {
      mxUtils.remove(color, ColorDialog.recentColors);
      ColorDialog.recentColors.splice(, , color);
      if (ColorDialog.recentColors.length >= max) {
        ColorDialog.recentColors.pop();
      }
    }
  }

  /**
   Adds recent color for later use.
   */
  resetRecentColors() {
    ColorDialog.recentColors = [];
  }

  /**
   undefined
   */
  filenameHelpLink = null;

  /**
   undefined
   */
  createTypeHint(ui, nameInput, hints) {
    var hint = document.createElement();
    hint.style.cssText =;
    mxUtils.setOpacity(hint);
    var nameChanged = function () {
      hint.setAttribute(, Editor.helpImage);
      hint.setAttribute(, mxResources.get());
      for (var i =; i < hints.length; i++) {
        if (hints[i].ext.length > && nameInput.value.substring(nameInput.value.length - hints[i].ext.length -) == +hints[i].ext) {
          hint.setAttribute(, mxClient.imageBasePath +);
          hint.setAttribute(, mxResources.get(hints[i].title));
          break;
        }
      }
    };
    mxEvent.addListener(nameInput, , nameChanged);
    mxEvent.addListener(nameInput, , nameChanged);
    mxEvent.addListener(hint, , function (evt) {
      var title = hint.getAttribute();
      if (hint.getAttribute() == Editor.helpImage) {
        ui.editor.graph.openLink(FilenameDialog.filenameHelpLink);
      } else if (title !=) {
        ui.showError(null, title, mxResources.get(), function () {
          ui.editor.graph.openLink(FilenameDialog.filenameHelpLink);
        }, null, mxResources.get(), null, null, null ,);
      }
      mxEvent.consume(evt);
    });
    nameChanged();
    return hint;
  }

  /**
   undefined
   */
  showNewWindowOption = true;
  /**
   Remembers last value for border.
   */
  lastBorderValue =;
  /**
   Global switches for the export dialog.
   */
  showGifOption = true;
  /**
   Global switches for the export dialog.
   */
  showXmlOption = true;

  /**
   Hook for getting the export format. Returns null for the default
   intermediate XML export format or a function that returns the
   parameter and value to be used in the request in the form
   key=value, where value should be URL encoded.
   */
  exportFile(editorUi, name, format, bg, s, b, dpi) {
    var graph = editorUi.editor.graph;
    if (format ==) {
      ExportDialog.saveLocalFile(editorUi, mxUtils.getXml(editorUi.editor.getGraphXml()), name, format);
    } else if (format ==) {
      ExportDialog.saveLocalFile(editorUi, mxUtils.getXml(graph.getSvg(bg, s, b)), name, format);
    } else {
      var bounds = graph.getGraphBounds();
      var xmlDoc = mxUtils.createXmlDocument();
      var root = xmlDoc.createElement();
      xmlDoc.appendChild(root);
      var xmlCanvas = new mxXmlCanvas2D(root);
      xmlCanvas.translate(Math.floor((b / s - bounds.x) / graph.view.scale), Math.floor((b / s - bounds.y) / graph.view.scale));
      xmlCanvas.scale(s / graph.view.scale);
      var imgExport = new mxImageExport();
      imgExport.drawState(graph.getView().getState(graph.model.root), xmlCanvas);
      var param = +encodeURIComponent(mxUtils.getXml(root));
      var w = Math.ceil(bounds.width * s / graph.view.scale + * b);
      var h = Math.ceil(bounds.height * s / graph.view.scale + * b);
      if (param.length <= MAX_REQUEST_SIZE && w * h < MAX_AREA) {
        editorUi.hideDialog();
        var req = new mxXmlRequest(EXPORT_URL, +format + +encodeURIComponent(name) + +((bg != null) ? bg :) + +w + +h + +param + +dpi);
        req.simulate(document);
      } else {
        mxUtils.alert(mxResources.get());
      }
    }
  }

  /**
   Hook for getting the export format. Returns null for the default
   intermediate XML export format or a function that returns the
   parameter and value to be used in the request in the form
   key=value, where value should be URL encoded.
   */
  saveLocalFile(editorUi, data, filename, format) {
    if (data.length < MAX_REQUEST_SIZE) {
      editorUi.hideDialog();
      var req = new mxXmlRequest(SAVE_URL, +encodeURIComponent(data) + +encodeURIComponent(filename) + +format);
      req.simulate(document);
    } else {
      mxUtils.alert(mxResources.get());
      mxUtils.popup(xml);
    }
  }

  /**
   Optional help link.
   */
  getDisplayIdForCell(ui, cell) {
    var id = null;
    if (ui.editor.graph.getModel().getParent(cell) != null) {
      id = cell.getId();
    }
    return id;
  }

  /**
   Optional help link.
   */
  placeholderHelpLink = null;
}

/**
 * Constructs a new filename dialog.
 * @class
 */
export class FilenameDialog {
  constructor(editorUi, filename, buttonText, fn, label, validateFn, content, helpLink, closeOnBtn, cancelFn, hints, w) {
    closeOnBtn = (closeOnBtn != null) ? closeOnBtn : true;
    var row, td;
    var table = document.createElement();
    var tbody = document.createElement();
    table.style.marginTop =;
    row = document.createElement();
    td = document.createElement();
    td.style.whiteSpace =;
    td.style.fontSize =;
    td.style.width =;
    mxUtils.write(td, (label || mxResources.get()) +);
    row.appendChild(td);
    var nameInput = document.createElement();
    nameInput.setAttribute(, filename ||);
    nameInput.style.marginLeft =;
    nameInput.style.width = (w != null) ? w + :;
    var genericBtn = mxUtils.button(buttonText, function () {
      if (validateFn == null || validateFn(nameInput.value)) {
        if (closeOnBtn) {
          editorUi.hideDialog();
        }
        fn(nameInput.value);
      }
    });
    genericBtn.className =;
    this.init = function () {
      if (label == null && content != null) {
        return;
      }
      nameInput.focus();
      if (mxClient.IS_GC || mxClient.IS_FF || document.documentMode >= || mxClient.IS_QUIRKS) {
        nameInput.select();
      } else {
        document.execCommand(, false, null);
      }
      if (Graph.fileSupport) {
        var dlg = table.parentNode;
        if (dlg != null) {
          var graph = editorUi.editor.graph;
          var dropElt = null;
          mxEvent.addListener(dlg, , function (evt) {
            if (dropElt != null) {
              dropElt.style.backgroundColor =;
              dropElt = null;
            }
            evt.stopPropagation();
            evt.preventDefault();
          });
          mxEvent.addListener(dlg, , mxUtils.bind(this, function (evt) {
            if (dropElt == null && (!mxClient.IS_IE || document.documentMode >)) {
              dropElt = nameInput;
              dropElt.style.backgroundColor =;
            }
            evt.stopPropagation();
            evt.preventDefault();
          }));
          mxEvent.addListener(dlg, , mxUtils.bind(this, function (evt) {
            if (dropElt != null) {
              dropElt.style.backgroundColor =;
              dropElt = null;
            }
            if (mxUtils.indexOf(evt.dataTransfer.types) >=) {
              nameInput.value = decodeURIComponent(evt.dataTransfer.getData());
              genericBtn.click();
            }
            evt.stopPropagation();
            evt.preventDefault();
          }));
        }
      }
    };
    td = document.createElement();
    td.style.whiteSpace =;
    td.appendChild(nameInput);
    row.appendChild(td);
    if (label != null || content == null) {
      tbody.appendChild(row);
      if (hints != null) {
        td.appendChild(FilenameDialog.createTypeHint(editorUi, nameInput, hints));
      }
    }
    if (content != null) {
      row = document.createElement();
      td = document.createElement();
      td.colSpan =;
      td.appendChild(content);
      row.appendChild(td);
      tbody.appendChild(row);
    }
    row = document.createElement();
    td = document.createElement();
    td.colSpan =;
    td.style.paddingTop =;
    td.style.whiteSpace =;
    td.setAttribute(,);
    var cancelBtn = mxUtils.button(mxResources.get(), function () {
      editorUi.hideDialog();
      if (cancelFn != null) {
        cancelFn();
      }
    });
    cancelBtn.className =;
    if (editorUi.editor.cancelFirst) {
      td.appendChild(cancelBtn);
    }
    if (helpLink != null) {
      var helpBtn = mxUtils.button(mxResources.get(), function () {
        editorUi.editor.graph.openLink(helpLink);
      });
      helpBtn.className =;
      td.appendChild(helpBtn);
    }
    mxEvent.addListener(nameInput, , function (e) {
      if (e.keyCode ==) {
        genericBtn.click();
      }
    });
    td.appendChild(genericBtn);
    if (!editorUi.editor.cancelFirst) {
      td.appendChild(cancelBtn);
    }
    row.appendChild(td);
    tbody.appendChild(row);
    table.appendChild(tbody);
    this.container = table;
  }

  /**
   Creates function to apply value
   */
  presetColors = [, , , , , , , , , , , , , , , , , , , , , , ];
  /**
   Creates function to apply value
   */
  defaultColors = [, , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , ];

  /**
   Creates function to apply value
   */
  createApplyFunction() {
    return mxUtils.bind(this, function (color) {
      var graph = this.editorUi.editor.graph;
      graph.getModel().beginUpdate();
      try {
        graph.setCellStyles(this.currentColorKey, color);
        this.editorUi.fireEvent(new mxEventObject(, , [this.currentColorKey], , [color], , graph.getSelectionCells()));
      } finally {
        graph.getModel().endUpdate();
      }
    });
  }

  /**
   undefined
   */
  recentColors = [];

  /**
   Adds recent color for later use.
   */
  addRecentColor(color, max) {
    if (color != null) {
      mxUtils.remove(color, ColorDialog.recentColors);
      ColorDialog.recentColors.splice(, , color);
      if (ColorDialog.recentColors.length >= max) {
        ColorDialog.recentColors.pop();
      }
    }
  }

  /**
   Adds recent color for later use.
   */
  resetRecentColors() {
    ColorDialog.recentColors = [];
  }

  /**
   undefined
   */
  filenameHelpLink = null;

  /**
   undefined
   */
  createTypeHint(ui, nameInput, hints) {
    var hint = document.createElement();
    hint.style.cssText =;
    mxUtils.setOpacity(hint);
    var nameChanged = function () {
      hint.setAttribute(, Editor.helpImage);
      hint.setAttribute(, mxResources.get());
      for (var i =; i < hints.length; i++) {
        if (hints[i].ext.length > && nameInput.value.substring(nameInput.value.length - hints[i].ext.length -) == +hints[i].ext) {
          hint.setAttribute(, mxClient.imageBasePath +);
          hint.setAttribute(, mxResources.get(hints[i].title));
          break;
        }
      }
    };
    mxEvent.addListener(nameInput, , nameChanged);
    mxEvent.addListener(nameInput, , nameChanged);
    mxEvent.addListener(hint, , function (evt) {
      var title = hint.getAttribute();
      if (hint.getAttribute() == Editor.helpImage) {
        ui.editor.graph.openLink(FilenameDialog.filenameHelpLink);
      } else if (title !=) {
        ui.showError(null, title, mxResources.get(), function () {
          ui.editor.graph.openLink(FilenameDialog.filenameHelpLink);
        }, null, mxResources.get(), null, null, null ,);
      }
      mxEvent.consume(evt);
    });
    nameChanged();
    return hint;
  }

  /**
   undefined
   */
  showNewWindowOption = true;
  /**
   Remembers last value for border.
   */
  lastBorderValue =;
  /**
   Global switches for the export dialog.
   */
  showGifOption = true;
  /**
   Global switches for the export dialog.
   */
  showXmlOption = true;

  /**
   Hook for getting the export format. Returns null for the default
   intermediate XML export format or a function that returns the
   parameter and value to be used in the request in the form
   key=value, where value should be URL encoded.
   */
  exportFile(editorUi, name, format, bg, s, b, dpi) {
    var graph = editorUi.editor.graph;
    if (format ==) {
      ExportDialog.saveLocalFile(editorUi, mxUtils.getXml(editorUi.editor.getGraphXml()), name, format);
    } else if (format ==) {
      ExportDialog.saveLocalFile(editorUi, mxUtils.getXml(graph.getSvg(bg, s, b)), name, format);
    } else {
      var bounds = graph.getGraphBounds();
      var xmlDoc = mxUtils.createXmlDocument();
      var root = xmlDoc.createElement();
      xmlDoc.appendChild(root);
      var xmlCanvas = new mxXmlCanvas2D(root);
      xmlCanvas.translate(Math.floor((b / s - bounds.x) / graph.view.scale), Math.floor((b / s - bounds.y) / graph.view.scale));
      xmlCanvas.scale(s / graph.view.scale);
      var imgExport = new mxImageExport();
      imgExport.drawState(graph.getView().getState(graph.model.root), xmlCanvas);
      var param = +encodeURIComponent(mxUtils.getXml(root));
      var w = Math.ceil(bounds.width * s / graph.view.scale + * b);
      var h = Math.ceil(bounds.height * s / graph.view.scale + * b);
      if (param.length <= MAX_REQUEST_SIZE && w * h < MAX_AREA) {
        editorUi.hideDialog();
        var req = new mxXmlRequest(EXPORT_URL, +format + +encodeURIComponent(name) + +((bg != null) ? bg :) + +w + +h + +param + +dpi);
        req.simulate(document);
      } else {
        mxUtils.alert(mxResources.get());
      }
    }
  }

  /**
   Hook for getting the export format. Returns null for the default
   intermediate XML export format or a function that returns the
   parameter and value to be used in the request in the form
   key=value, where value should be URL encoded.
   */
  saveLocalFile(editorUi, data, filename, format) {
    if (data.length < MAX_REQUEST_SIZE) {
      editorUi.hideDialog();
      var req = new mxXmlRequest(SAVE_URL, +encodeURIComponent(data) + +encodeURIComponent(filename) + +format);
      req.simulate(document);
    } else {
      mxUtils.alert(mxResources.get());
      mxUtils.popup(xml);
    }
  }

  /**
   Optional help link.
   */
  getDisplayIdForCell(ui, cell) {
    var id = null;
    if (ui.editor.graph.getModel().getParent(cell) != null) {
      id = cell.getId();
    }
    return id;
  }

  /**
   Optional help link.
   */
  placeholderHelpLink = null;
}

/**
 * @type {string}
 */
FilenameDialog.filenameHelpLink = null;

/**
 * @param ui {EditorUi}
 * @param nameInput {HTMLInputElement}
 * @param hints {Array.<{title: string, ext: string}>}
 * @returns {HTMLImageElement}
 */
FilenameDialog.createTypeHint = function (ui, nameInput, hints) {
  var hint = document.createElement('img');
  hint.style.cssText = 'vertical-align:top;height:16px;width:16px;margin-left:4px;background-repeat:no-repeat;background-position:center bottom;cursor:pointer;';
  mxUtils.setOpacity(hint, 70);

  var nameChanged = function () {
    hint.setAttribute('src', Editor.helpImage);
    hint.setAttribute('title', mxResources.get('help'));

    for (var i = 0; i < hints.length; i++) {
      if (hints[i].ext.length > 0 &&
          nameInput.value.substring(nameInput.value.length -
              hints[i].ext.length - 1) == '.' + hints[i].ext) {
        hint.setAttribute('src', mxClient.imageBasePath + '/warning.png');
        hint.setAttribute('title', mxResources.get(hints[i].title));
        break;
      }
    }
  };

  mxEvent.addListener(nameInput, 'keyup', nameChanged);
  mxEvent.addListener(nameInput, 'change', nameChanged);
  mxEvent.addListener(hint, 'click', function (evt) {
    var title = hint.getAttribute('title');

    if (hint.getAttribute('src') == Editor.helpImage) {
      ui.editor.graph.openLink(FilenameDialog.filenameHelpLink);
    } else if (title != '') {
      ui.showError(null, title, mxResources.get('help'), function () {
        ui.editor.graph.openLink(FilenameDialog.filenameHelpLink);
      }, null, mxResources.get('ok'), null, null, null, 340, 90);
    }

    mxEvent.consume(evt);
  });

  nameChanged();

  return hint;
};

/**
 * Constructs a new textarea dialog.
 * @class
 */
export class TextareaDialog {
  constructor(editorUi, title, url, fn, cancelFn, cancelTitle, w, h, addButtons, noHide, noWrap, applyTitle, helpLink) {
    w = (w != null) ? w :;
    h = (h != null) ? h :;
    noHide = (noHide != null) ? noHide : false;
    var row, td;
    var table = document.createElement();
    var tbody = document.createElement();
    row = document.createElement();
    td = document.createElement();
    td.style.fontSize =;
    td.style.width =;
    mxUtils.write(td, title);
    row.appendChild(td);
    tbody.appendChild(row);
    row = document.createElement();
    td = document.createElement();
    var nameInput = document.createElement();
    if (noWrap) {
      nameInput.setAttribute(,);
    }
    nameInput.setAttribute(,);
    nameInput.setAttribute(,);
    nameInput.setAttribute(,);
    nameInput.setAttribute(,);
    mxUtils.write(nameInput, url ||);
    nameInput.style.resize =;
    nameInput.style.width = w +;
    nameInput.style.height = h +;
    this.textarea = nameInput;
    this.init = function () {
      nameInput.focus();
      nameInput.scrollTop =;
    };
    td.appendChild(nameInput);
    row.appendChild(td);
    tbody.appendChild(row);
    row = document.createElement();
    td = document.createElement();
    td.style.paddingTop =;
    td.style.whiteSpace =;
    td.setAttribute(,);
    if (helpLink != null) {
      var helpBtn = mxUtils.button(mxResources.get(), function () {
        editorUi.editor.graph.openLink(helpLink);
      });
      helpBtn.className =;
      td.appendChild(helpBtn);
    }
    var cancelBtn = mxUtils.button(cancelTitle || mxResources.get(), function () {
      editorUi.hideDialog();
      if (cancelFn != null) {
        cancelFn();
      }
    });
    cancelBtn.className =;
    if (editorUi.editor.cancelFirst) {
      td.appendChild(cancelBtn);
    }
    if (addButtons != null) {
      addButtons(td, nameInput);
    }
    if (fn != null) {
      var genericBtn = mxUtils.button(applyTitle || mxResources.get(), function () {
        if (!noHide) {
          editorUi.hideDialog();
        }
        fn(nameInput.value);
      });
      genericBtn.className =;
      td.appendChild(genericBtn);
    }
    if (!editorUi.editor.cancelFirst) {
      td.appendChild(cancelBtn);
    }
    row.appendChild(td);
    tbody.appendChild(row);
    table.appendChild(tbody);
    this.container = table;
  }

  /**
   Creates function to apply value
   */
  presetColors = [, , , , , , , , , , , , , , , , , , , , , , ];
  /**
   Creates function to apply value
   */
  defaultColors = [, , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , ];

  /**
   Creates function to apply value
   */
  createApplyFunction() {
    return mxUtils.bind(this, function (color) {
      var graph = this.editorUi.editor.graph;
      graph.getModel().beginUpdate();
      try {
        graph.setCellStyles(this.currentColorKey, color);
        this.editorUi.fireEvent(new mxEventObject(, , [this.currentColorKey], , [color], , graph.getSelectionCells()));
      } finally {
        graph.getModel().endUpdate();
      }
    });
  }

  /**
   undefined
   */
  recentColors = [];

  /**
   Adds recent color for later use.
   */
  addRecentColor(color, max) {
    if (color != null) {
      mxUtils.remove(color, ColorDialog.recentColors);
      ColorDialog.recentColors.splice(, , color);
      if (ColorDialog.recentColors.length >= max) {
        ColorDialog.recentColors.pop();
      }
    }
  }

  /**
   Adds recent color for later use.
   */
  resetRecentColors() {
    ColorDialog.recentColors = [];
  }

  /**
   undefined
   */
  filenameHelpLink = null;

  /**
   undefined
   */
  createTypeHint(ui, nameInput, hints) {
    var hint = document.createElement();
    hint.style.cssText =;
    mxUtils.setOpacity(hint);
    var nameChanged = function () {
      hint.setAttribute(, Editor.helpImage);
      hint.setAttribute(, mxResources.get());
      for (var i =; i < hints.length; i++) {
        if (hints[i].ext.length > && nameInput.value.substring(nameInput.value.length - hints[i].ext.length -) == +hints[i].ext) {
          hint.setAttribute(, mxClient.imageBasePath +);
          hint.setAttribute(, mxResources.get(hints[i].title));
          break;
        }
      }
    };
    mxEvent.addListener(nameInput, , nameChanged);
    mxEvent.addListener(nameInput, , nameChanged);
    mxEvent.addListener(hint, , function (evt) {
      var title = hint.getAttribute();
      if (hint.getAttribute() == Editor.helpImage) {
        ui.editor.graph.openLink(FilenameDialog.filenameHelpLink);
      } else if (title !=) {
        ui.showError(null, title, mxResources.get(), function () {
          ui.editor.graph.openLink(FilenameDialog.filenameHelpLink);
        }, null, mxResources.get(), null, null, null ,);
      }
      mxEvent.consume(evt);
    });
    nameChanged();
    return hint;
  }

  /**
   undefined
   */
  showNewWindowOption = true;
  /**
   Remembers last value for border.
   */
  lastBorderValue =;
  /**
   Global switches for the export dialog.
   */
  showGifOption = true;
  /**
   Global switches for the export dialog.
   */
  showXmlOption = true;

  /**
   Hook for getting the export format. Returns null for the default
   intermediate XML export format or a function that returns the
   parameter and value to be used in the request in the form
   key=value, where value should be URL encoded.
   */
  exportFile(editorUi, name, format, bg, s, b, dpi) {
    var graph = editorUi.editor.graph;
    if (format ==) {
      ExportDialog.saveLocalFile(editorUi, mxUtils.getXml(editorUi.editor.getGraphXml()), name, format);
    } else if (format ==) {
      ExportDialog.saveLocalFile(editorUi, mxUtils.getXml(graph.getSvg(bg, s, b)), name, format);
    } else {
      var bounds = graph.getGraphBounds();
      var xmlDoc = mxUtils.createXmlDocument();
      var root = xmlDoc.createElement();
      xmlDoc.appendChild(root);
      var xmlCanvas = new mxXmlCanvas2D(root);
      xmlCanvas.translate(Math.floor((b / s - bounds.x) / graph.view.scale), Math.floor((b / s - bounds.y) / graph.view.scale));
      xmlCanvas.scale(s / graph.view.scale);
      var imgExport = new mxImageExport();
      imgExport.drawState(graph.getView().getState(graph.model.root), xmlCanvas);
      var param = +encodeURIComponent(mxUtils.getXml(root));
      var w = Math.ceil(bounds.width * s / graph.view.scale + * b);
      var h = Math.ceil(bounds.height * s / graph.view.scale + * b);
      if (param.length <= MAX_REQUEST_SIZE && w * h < MAX_AREA) {
        editorUi.hideDialog();
        var req = new mxXmlRequest(EXPORT_URL, +format + +encodeURIComponent(name) + +((bg != null) ? bg :) + +w + +h + +param + +dpi);
        req.simulate(document);
      } else {
        mxUtils.alert(mxResources.get());
      }
    }
  }

  /**
   Hook for getting the export format. Returns null for the default
   intermediate XML export format or a function that returns the
   parameter and value to be used in the request in the form
   key=value, where value should be URL encoded.
   */
  saveLocalFile(editorUi, data, filename, format) {
    if (data.length < MAX_REQUEST_SIZE) {
      editorUi.hideDialog();
      var req = new mxXmlRequest(SAVE_URL, +encodeURIComponent(data) + +encodeURIComponent(filename) + +format);
      req.simulate(document);
    } else {
      mxUtils.alert(mxResources.get());
      mxUtils.popup(xml);
    }
  }

  /**
   Optional help link.
   */
  getDisplayIdForCell(ui, cell) {
    var id = null;
    if (ui.editor.graph.getModel().getParent(cell) != null) {
      id = cell.getId();
    }
    return id;
  }

  /**
   Optional help link.
   */
  placeholderHelpLink = null;
}

/**
 * Constructs a new edit file dialog.
 * @class
 */
export class EditDiagramDialog {
  constructor(editorUi) {
    var div = document.createElement();
    div.style.textAlign =;
    var textarea = document.createElement();
    textarea.setAttribute(,);
    textarea.setAttribute(,);
    textarea.setAttribute(,);
    textarea.setAttribute(,);
    textarea.setAttribute(,);
    textarea.style.overflow =;
    textarea.style.resize =;
    textarea.style.width =;
    textarea.style.height =;
    textarea.style.marginBottom =;
    textarea.value = mxUtils.getPrettyXml(editorUi.editor.getGraphXml());
    div.appendChild(textarea);
    this.init = function () {
      textarea.focus();
    };
    if (Graph.fileSupport) {
      function handleDrop(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        if (evt.dataTransfer.files.length >) {
          var file = evt.dataTransfer.files[];
          var reader = new FileReader();
          reader.onload = function (e) {
            textarea.value = e.target.result;
          };
          reader.readAsText(file);
        } else {
          textarea.value = editorUi.extractGraphModelFromEvent(evt);
        }
      }
      ;

      function handleDragOver(evt) {
        evt.stopPropagation();
        evt.preventDefault();
      }
      ;
      textarea.addEventListener(, handleDragOver, false);
      textarea.addEventListener(, handleDrop, false);
    }
    var cancelBtn = mxUtils.button(mxResources.get(), function () {
      editorUi.hideDialog();
    });
    cancelBtn.className =;
    if (editorUi.editor.cancelFirst) {
      div.appendChild(cancelBtn);
    }
    var select = document.createElement();
    select.style.width =;
    select.className =;
    if (editorUi.editor.graph.isEnabled()) {
      var replaceOption = document.createElement();
      replaceOption.setAttribute(,);
      mxUtils.write(replaceOption, mxResources.get());
      select.appendChild(replaceOption);
    }
    var newOption = document.createElement();
    newOption.setAttribute(,);
    mxUtils.write(newOption, mxResources.get());
    if (EditDiagramDialog.showNewWindowOption) {
      select.appendChild(newOption);
    }
    if (editorUi.editor.graph.isEnabled()) {
      var importOption = document.createElement();
      importOption.setAttribute(,);
      mxUtils.write(importOption, mxResources.get());
      select.appendChild(importOption);
    }
    div.appendChild(select);
    var okBtn = mxUtils.button(mxResources.get(), function () {
      var data = Graph.zapGremlins(mxUtils.trim(textarea.value));
      var error = null;
      if (select.value ==) {
        editorUi.hideDialog();
        editorUi.editor.editAsNew(data);
      } else if (select.value ==) {
        editorUi.editor.graph.model.beginUpdate();
        try {
          editorUi.editor.setGraphXml(mxUtils.parseXml(data).documentElement);
          editorUi.hideDialog();
        } catch (e) {
          error = e;
        } finally {
          editorUi.editor.graph.model.endUpdate();
        }
      } else if (select.value ==) {
        editorUi.editor.graph.model.beginUpdate();
        try {
          var doc = mxUtils.parseXml(data);
          var model = new mxGraphModel();
          var codec = new mxCodec(doc);
          codec.decode(doc.documentElement, model);
          var children = model.getChildren(model.getChildAt(model.getRoot()));
          editorUi.editor.graph.setSelectionCells(editorUi.editor.graph.importCells(children));
          editorUi.hideDialog();
        } catch (e) {
          error = e;
        } finally {
          editorUi.editor.graph.model.endUpdate();
        }
      }
      if (error != null) {
        mxUtils.alert(error.message);
      }
    });
    okBtn.className =;
    div.appendChild(okBtn);
    if (!editorUi.editor.cancelFirst) {
      div.appendChild(cancelBtn);
    }
    this.container = div;
  }

  /**
   Creates function to apply value
   */
  presetColors = [, , , , , , , , , , , , , , , , , , , , , , ];
  /**
   Creates function to apply value
   */
  defaultColors = [, , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , ];

  /**
   Creates function to apply value
   */
  createApplyFunction() {
    return mxUtils.bind(this, function (color) {
      var graph = this.editorUi.editor.graph;
      graph.getModel().beginUpdate();
      try {
        graph.setCellStyles(this.currentColorKey, color);
        this.editorUi.fireEvent(new mxEventObject(, , [this.currentColorKey], , [color], , graph.getSelectionCells()));
      } finally {
        graph.getModel().endUpdate();
      }
    });
  }

  /**
   undefined
   */
  recentColors = [];

  /**
   Adds recent color for later use.
   */
  addRecentColor(color, max) {
    if (color != null) {
      mxUtils.remove(color, ColorDialog.recentColors);
      ColorDialog.recentColors.splice(, , color);
      if (ColorDialog.recentColors.length >= max) {
        ColorDialog.recentColors.pop();
      }
    }
  }

  /**
   Adds recent color for later use.
   */
  resetRecentColors() {
    ColorDialog.recentColors = [];
  }

  /**
   undefined
   */
  filenameHelpLink = null;

  /**
   undefined
   */
  createTypeHint(ui, nameInput, hints) {
    var hint = document.createElement();
    hint.style.cssText =;
    mxUtils.setOpacity(hint);
    var nameChanged = function () {
      hint.setAttribute(, Editor.helpImage);
      hint.setAttribute(, mxResources.get());
      for (var i =; i < hints.length; i++) {
        if (hints[i].ext.length > && nameInput.value.substring(nameInput.value.length - hints[i].ext.length -) == +hints[i].ext) {
          hint.setAttribute(, mxClient.imageBasePath +);
          hint.setAttribute(, mxResources.get(hints[i].title));
          break;
        }
      }
    };
    mxEvent.addListener(nameInput, , nameChanged);
    mxEvent.addListener(nameInput, , nameChanged);
    mxEvent.addListener(hint, , function (evt) {
      var title = hint.getAttribute();
      if (hint.getAttribute() == Editor.helpImage) {
        ui.editor.graph.openLink(FilenameDialog.filenameHelpLink);
      } else if (title !=) {
        ui.showError(null, title, mxResources.get(), function () {
          ui.editor.graph.openLink(FilenameDialog.filenameHelpLink);
        }, null, mxResources.get(), null, null, null ,);
      }
      mxEvent.consume(evt);
    });
    nameChanged();
    return hint;
  }

  /**
   undefined
   */
  showNewWindowOption = true;
  /**
   Remembers last value for border.
   */
  lastBorderValue =;
  /**
   Global switches for the export dialog.
   */
  showGifOption = true;
  /**
   Global switches for the export dialog.
   */
  showXmlOption = true;

  /**
   Hook for getting the export format. Returns null for the default
   intermediate XML export format or a function that returns the
   parameter and value to be used in the request in the form
   key=value, where value should be URL encoded.
   */
  exportFile(editorUi, name, format, bg, s, b, dpi) {
    var graph = editorUi.editor.graph;
    if (format ==) {
      ExportDialog.saveLocalFile(editorUi, mxUtils.getXml(editorUi.editor.getGraphXml()), name, format);
    } else if (format ==) {
      ExportDialog.saveLocalFile(editorUi, mxUtils.getXml(graph.getSvg(bg, s, b)), name, format);
    } else {
      var bounds = graph.getGraphBounds();
      var xmlDoc = mxUtils.createXmlDocument();
      var root = xmlDoc.createElement();
      xmlDoc.appendChild(root);
      var xmlCanvas = new mxXmlCanvas2D(root);
      xmlCanvas.translate(Math.floor((b / s - bounds.x) / graph.view.scale), Math.floor((b / s - bounds.y) / graph.view.scale));
      xmlCanvas.scale(s / graph.view.scale);
      var imgExport = new mxImageExport();
      imgExport.drawState(graph.getView().getState(graph.model.root), xmlCanvas);
      var param = +encodeURIComponent(mxUtils.getXml(root));
      var w = Math.ceil(bounds.width * s / graph.view.scale + * b);
      var h = Math.ceil(bounds.height * s / graph.view.scale + * b);
      if (param.length <= MAX_REQUEST_SIZE && w * h < MAX_AREA) {
        editorUi.hideDialog();
        var req = new mxXmlRequest(EXPORT_URL, +format + +encodeURIComponent(name) + +((bg != null) ? bg :) + +w + +h + +param + +dpi);
        req.simulate(document);
      } else {
        mxUtils.alert(mxResources.get());
      }
    }
  }

  /**
   Hook for getting the export format. Returns null for the default
   intermediate XML export format or a function that returns the
   parameter and value to be used in the request in the form
   key=value, where value should be URL encoded.
   */
  saveLocalFile(editorUi, data, filename, format) {
    if (data.length < MAX_REQUEST_SIZE) {
      editorUi.hideDialog();
      var req = new mxXmlRequest(SAVE_URL, +encodeURIComponent(data) + +encodeURIComponent(filename) + +format);
      req.simulate(document);
    } else {
      mxUtils.alert(mxResources.get());
      mxUtils.popup(xml);
    }
  }

  /**
   Optional help link.
   */
  getDisplayIdForCell(ui, cell) {
    var id = null;
    if (ui.editor.graph.getModel().getParent(cell) != null) {
      id = cell.getId();
    }
    return id;
  }

  /**
   Optional help link.
   */
  placeholderHelpLink = null;
}

/**
 *
 */
EditDiagramDialog.showNewWindowOption = true;

/**
 * Constructs a new export dialog.
 * @class
 */
export class ExportDialog {
  constructor(editorUi) {
    var graph = editorUi.editor.graph;
    var bounds = graph.getGraphBounds();
    var scale = graph.view.scale;
    var width = Math.ceil(bounds.width / scale);
    var height = Math.ceil(bounds.height / scale);
    var row, td;
    var table = document.createElement();
    var tbody = document.createElement();
    table.setAttribute(, (mxClient.IS_SF) ? :);
    row = document.createElement();
    td = document.createElement();
    td.style.fontSize =;
    td.style.width =;
    mxUtils.write(td, mxResources.get() +);
    row.appendChild(td);
    var nameInput = document.createElement();
    nameInput.setAttribute(, editorUi.editor.getOrCreateFilename());
    nameInput.style.width =;
    td = document.createElement();
    td.appendChild(nameInput);
    row.appendChild(td);
    tbody.appendChild(row);
    row = document.createElement();
    td = document.createElement();
    td.style.fontSize =;
    mxUtils.write(td, mxResources.get() +);
    row.appendChild(td);
    var imageFormatSelect = document.createElement();
    imageFormatSelect.style.width =;
    var pngOption = document.createElement();
    pngOption.setAttribute(,);
    mxUtils.write(pngOption, mxResources.get());
    imageFormatSelect.appendChild(pngOption);
    var gifOption = document.createElement();
    if (ExportDialog.showGifOption) {
      gifOption.setAttribute(,);
      mxUtils.write(gifOption, mxResources.get());
      imageFormatSelect.appendChild(gifOption);
    }
    var jpgOption = document.createElement();
    jpgOption.setAttribute(,);
    mxUtils.write(jpgOption, mxResources.get());
    imageFormatSelect.appendChild(jpgOption);
    var pdfOption = document.createElement();
    pdfOption.setAttribute(,);
    mxUtils.write(pdfOption, mxResources.get());
    imageFormatSelect.appendChild(pdfOption);
    var svgOption = document.createElement();
    svgOption.setAttribute(,);
    mxUtils.write(svgOption, mxResources.get());
    imageFormatSelect.appendChild(svgOption);
    if (ExportDialog.showXmlOption) {
      var xmlOption = document.createElement();
      xmlOption.setAttribute(,);
      mxUtils.write(xmlOption, mxResources.get());
      imageFormatSelect.appendChild(xmlOption);
    }
    td = document.createElement();
    td.appendChild(imageFormatSelect);
    row.appendChild(td);
    tbody.appendChild(row);
    row = document.createElement();
    td = document.createElement();
    td.style.fontSize =;
    mxUtils.write(td, mxResources.get() +);
    row.appendChild(td);
    var zoomInput = document.createElement();
    zoomInput.setAttribute(,);
    zoomInput.setAttribute(,);
    zoomInput.style.width =;
    td = document.createElement();
    td.appendChild(zoomInput);
    row.appendChild(td);
    tbody.appendChild(row);
    row = document.createElement();
    td = document.createElement();
    td.style.fontSize =;
    mxUtils.write(td, mxResources.get() +);
    row.appendChild(td);
    var widthInput = document.createElement();
    widthInput.setAttribute(, width);
    widthInput.style.width =;
    td = document.createElement();
    td.appendChild(widthInput);
    row.appendChild(td);
    tbody.appendChild(row);
    row = document.createElement();
    td = document.createElement();
    td.style.fontSize =;
    mxUtils.write(td, mxResources.get() +);
    row.appendChild(td);
    var heightInput = document.createElement();
    heightInput.setAttribute(, height);
    heightInput.style.width =;
    td = document.createElement();
    td.appendChild(heightInput);
    row.appendChild(td);
    tbody.appendChild(row);
    row = document.createElement();
    td = document.createElement();
    td.style.fontSize =;
    mxUtils.write(td, mxResources.get() +);
    row.appendChild(td);
    var dpiSelect = document.createElement();
    dpiSelect.style.width =;
    var dpi100Option = document.createElement();
    dpi100Option.setAttribute(,);
    mxUtils.write(dpi100Option);
    dpiSelect.appendChild(dpi100Option);
    var dpi200Option = document.createElement();
    dpi200Option.setAttribute(,);
    mxUtils.write(dpi200Option);
    dpiSelect.appendChild(dpi200Option);
    var dpi300Option = document.createElement();
    dpi300Option.setAttribute(,);
    mxUtils.write(dpi300Option);
    dpiSelect.appendChild(dpi300Option);
    var dpi400Option = document.createElement();
    dpi400Option.setAttribute(,);
    mxUtils.write(dpi400Option);
    dpiSelect.appendChild(dpi400Option);
    var dpiCustOption = document.createElement();
    dpiCustOption.setAttribute(,);
    mxUtils.write(dpiCustOption, mxResources.get());
    dpiSelect.appendChild(dpiCustOption);
    var customDpi = document.createElement();
    customDpi.style.width =;
    customDpi.style.display =;
    customDpi.setAttribute(,);
    customDpi.setAttribute(,);
    customDpi.setAttribute(,);
    customDpi.setAttribute(,);
    var zoomUserChanged = false;
    mxEvent.addListener(dpiSelect, , function () {
      if (this.value ==) {
        this.style.display =;
        customDpi.style.display =;
        customDpi.focus();
      } else {
        customDpi.value = this.value;
        if (!zoomUserChanged) {
          zoomInput.value = this.value;
        }
      }
    });
    mxEvent.addListener(customDpi, , function () {
      var dpi = parseInt(customDpi.value);
      if (isNaN(dpi) || dpi <=) {
        customDpi.style.backgroundColor =;
      } else {
        customDpi.style.backgroundColor =;
        if (!zoomUserChanged) {
          zoomInput.value = dpi;
        }
      }
    });
    td = document.createElement();
    td.appendChild(dpiSelect);
    td.appendChild(customDpi);
    row.appendChild(td);
    tbody.appendChild(row);
    row = document.createElement();
    td = document.createElement();
    td.style.fontSize =;
    mxUtils.write(td, mxResources.get() +);
    row.appendChild(td);
    var transparentCheckbox = document.createElement();
    transparentCheckbox.setAttribute(,);
    transparentCheckbox.checked = graph.background == null || graph.background == mxConstants.NONE;
    td = document.createElement();
    td.appendChild(transparentCheckbox);
    mxUtils.write(td, mxResources.get());
    row.appendChild(td);
    tbody.appendChild(row);
    row = document.createElement();
    td = document.createElement();
    td.style.fontSize =;
    mxUtils.write(td, mxResources.get() +);
    row.appendChild(td);
    var borderInput = document.createElement();
    borderInput.setAttribute(,);
    borderInput.setAttribute(, ExportDialog.lastBorderValue);
    borderInput.style.width =;
    td = document.createElement();
    td.appendChild(borderInput);
    row.appendChild(td);
    tbody.appendChild(row);
    table.appendChild(tbody);

    function formatChanged() {
      var name = nameInput.value;
      var dot = name.lastIndexOf();
      if (dot >) {
        nameInput.value = name.substring(, dot +) + imageFormatSelect.value;
      } else {
        nameInput.value = name + +imageFormatSelect.value;
      }
      if (imageFormatSelect.value ===) {
        zoomInput.setAttribute(,);
        widthInput.setAttribute(,);
        heightInput.setAttribute(,);
        borderInput.setAttribute(,);
      } else {
        zoomInput.removeAttribute();
        widthInput.removeAttribute();
        heightInput.removeAttribute();
        borderInput.removeAttribute();
      }
      if (imageFormatSelect.value === || imageFormatSelect.value ===) {
        transparentCheckbox.removeAttribute();
      } else {
        transparentCheckbox.setAttribute(,);
      }
      if (imageFormatSelect.value ===) {
        dpiSelect.removeAttribute();
        customDpi.removeAttribute();
      } else {
        dpiSelect.setAttribute(,);
        customDpi.setAttribute(,);
      }
    }
    ;
    mxEvent.addListener(imageFormatSelect, , formatChanged);
    formatChanged();

    function checkValues() {
      if (widthInput.value * heightInput.value > MAX_AREA || widthInput.value <=) {
        widthInput.style.backgroundColor =;
      } else {
        widthInput.style.backgroundColor =;
      }
      if (widthInput.value * heightInput.value > MAX_AREA || heightInput.value <=) {
        heightInput.style.backgroundColor =;
      } else {
        heightInput.style.backgroundColor =;
      }
    }
    ;
    mxEvent.addListener(zoomInput, , function () {
      zoomUserChanged = true;
      var s = Math.max(, parseFloat(zoomInput.value) ||) /;
      zoomInput.value = parseFloat((s *).toFixed());
      if (width >) {
        widthInput.value = Math.floor(width * s);
        heightInput.value = Math.floor(height * s);
      } else {
        zoomInput.value =;
        widthInput.value = width;
        heightInput.value = height;
      }
      checkValues();
    });
    mxEvent.addListener(widthInput, , function () {
      var s = parseInt(widthInput.value) / width;
      if (s >) {
        zoomInput.value = parseFloat((s *).toFixed());
        heightInput.value = Math.floor(height * s);
      } else {
        zoomInput.value =;
        widthInput.value = width;
        heightInput.value = height;
      }
      checkValues();
    });
    mxEvent.addListener(heightInput, , function () {
      var s = parseInt(heightInput.value) / height;
      if (s >) {
        zoomInput.value = parseFloat((s *).toFixed());
        widthInput.value = Math.floor(width * s);
      } else {
        zoomInput.value =;
        widthInput.value = width;
        heightInput.value = height;
      }
      checkValues();
    });
    row = document.createElement();
    td = document.createElement();
    td.setAttribute(,);
    td.style.paddingTop =;
    td.colSpan =;
    var saveBtn = mxUtils.button(mxResources.get(), mxUtils.bind(this, function () {
      if (parseInt(zoomInput.value) <=) {
        mxUtils.alert(mxResources.get());
      } else {
        var name = nameInput.value;
        var format = imageFormatSelect.value;
        var s = Math.max(, parseFloat(zoomInput.value) ||) /;
        var b = Math.max(, parseInt(borderInput.value));
        var bg = graph.background;
        var dpi = Math.max(, parseInt(customDpi.value));
        if ((format == || format ==) && transparentCheckbox.checked) {
          bg = null;
        } else if (bg == null || bg == mxConstants.NONE) {
          bg =;
        }
        ExportDialog.lastBorderValue = b;
        ExportDialog.exportFile(editorUi, name, format, bg, s, b, dpi);
      }
    }));
    saveBtn.className =;
    var cancelBtn = mxUtils.button(mxResources.get(), function () {
      editorUi.hideDialog();
    });
    cancelBtn.className =;
    if (editorUi.editor.cancelFirst) {
      td.appendChild(cancelBtn);
      td.appendChild(saveBtn);
    } else {
      td.appendChild(saveBtn);
      td.appendChild(cancelBtn);
    }
    row.appendChild(td);
    tbody.appendChild(row);
    table.appendChild(tbody);
    this.container = table;
  }

  /**
   Creates function to apply value
   */
  presetColors = [, , , , , , , , , , , , , , , , , , , , , , ];
  /**
   Creates function to apply value
   */
  defaultColors = [, , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , ];

  /**
   Creates function to apply value
   */
  createApplyFunction() {
    return mxUtils.bind(this, function (color) {
      var graph = this.editorUi.editor.graph;
      graph.getModel().beginUpdate();
      try {
        graph.setCellStyles(this.currentColorKey, color);
        this.editorUi.fireEvent(new mxEventObject(, , [this.currentColorKey], , [color], , graph.getSelectionCells()));
      } finally {
        graph.getModel().endUpdate();
      }
    });
  }

  /**
   undefined
   */
  recentColors = [];

  /**
   Adds recent color for later use.
   */
  addRecentColor(color, max) {
    if (color != null) {
      mxUtils.remove(color, ColorDialog.recentColors);
      ColorDialog.recentColors.splice(, , color);
      if (ColorDialog.recentColors.length >= max) {
        ColorDialog.recentColors.pop();
      }
    }
  }

  /**
   Adds recent color for later use.
   */
  resetRecentColors() {
    ColorDialog.recentColors = [];
  }

  /**
   undefined
   */
  filenameHelpLink = null;

  /**
   undefined
   */
  createTypeHint(ui, nameInput, hints) {
    var hint = document.createElement();
    hint.style.cssText =;
    mxUtils.setOpacity(hint);
    var nameChanged = function () {
      hint.setAttribute(, Editor.helpImage);
      hint.setAttribute(, mxResources.get());
      for (var i =; i < hints.length; i++) {
        if (hints[i].ext.length > && nameInput.value.substring(nameInput.value.length - hints[i].ext.length -) == +hints[i].ext) {
          hint.setAttribute(, mxClient.imageBasePath +);
          hint.setAttribute(, mxResources.get(hints[i].title));
          break;
        }
      }
    };
    mxEvent.addListener(nameInput, , nameChanged);
    mxEvent.addListener(nameInput, , nameChanged);
    mxEvent.addListener(hint, , function (evt) {
      var title = hint.getAttribute();
      if (hint.getAttribute() == Editor.helpImage) {
        ui.editor.graph.openLink(FilenameDialog.filenameHelpLink);
      } else if (title !=) {
        ui.showError(null, title, mxResources.get(), function () {
          ui.editor.graph.openLink(FilenameDialog.filenameHelpLink);
        }, null, mxResources.get(), null, null, null ,);
      }
      mxEvent.consume(evt);
    });
    nameChanged();
    return hint;
  }

  /**
   undefined
   */
  showNewWindowOption = true;
  /**
   Remembers last value for border.
   */
  lastBorderValue =;
  /**
   Global switches for the export dialog.
   */
  showGifOption = true;
  /**
   Global switches for the export dialog.
   */
  showXmlOption = true;

  /**
   Hook for getting the export format. Returns null for the default
   intermediate XML export format or a function that returns the
   parameter and value to be used in the request in the form
   key=value, where value should be URL encoded.
   */
  exportFile(editorUi, name, format, bg, s, b, dpi) {
    var graph = editorUi.editor.graph;
    if (format ==) {
      ExportDialog.saveLocalFile(editorUi, mxUtils.getXml(editorUi.editor.getGraphXml()), name, format);
    } else if (format ==) {
      ExportDialog.saveLocalFile(editorUi, mxUtils.getXml(graph.getSvg(bg, s, b)), name, format);
    } else {
      var bounds = graph.getGraphBounds();
      var xmlDoc = mxUtils.createXmlDocument();
      var root = xmlDoc.createElement();
      xmlDoc.appendChild(root);
      var xmlCanvas = new mxXmlCanvas2D(root);
      xmlCanvas.translate(Math.floor((b / s - bounds.x) / graph.view.scale), Math.floor((b / s - bounds.y) / graph.view.scale));
      xmlCanvas.scale(s / graph.view.scale);
      var imgExport = new mxImageExport();
      imgExport.drawState(graph.getView().getState(graph.model.root), xmlCanvas);
      var param = +encodeURIComponent(mxUtils.getXml(root));
      var w = Math.ceil(bounds.width * s / graph.view.scale + * b);
      var h = Math.ceil(bounds.height * s / graph.view.scale + * b);
      if (param.length <= MAX_REQUEST_SIZE && w * h < MAX_AREA) {
        editorUi.hideDialog();
        var req = new mxXmlRequest(EXPORT_URL, +format + +encodeURIComponent(name) + +((bg != null) ? bg :) + +w + +h + +param + +dpi);
        req.simulate(document);
      } else {
        mxUtils.alert(mxResources.get());
      }
    }
  }

  /**
   Hook for getting the export format. Returns null for the default
   intermediate XML export format or a function that returns the
   parameter and value to be used in the request in the form
   key=value, where value should be URL encoded.
   */
  saveLocalFile(editorUi, data, filename, format) {
    if (data.length < MAX_REQUEST_SIZE) {
      editorUi.hideDialog();
      var req = new mxXmlRequest(SAVE_URL, +encodeURIComponent(data) + +encodeURIComponent(filename) + +format);
      req.simulate(document);
    } else {
      mxUtils.alert(mxResources.get());
      mxUtils.popup(xml);
    }
  }

  /**
   Optional help link.
   */
  getDisplayIdForCell(ui, cell) {
    var id = null;
    if (ui.editor.graph.getModel().getParent(cell) != null) {
      id = cell.getId();
    }
    return id;
  }

  /**
   Optional help link.
   */
  placeholderHelpLink = null;
}

/**
 * Remembers last value for border.
 */
ExportDialog.lastBorderValue = 0;

/**
 * Global switches for the export dialog.
 */
ExportDialog.showGifOption = true;

/**
 * Global switches for the export dialog.
 */
ExportDialog.showXmlOption = true;

/**
 * Hook for getting the export format. Returns null for the default
 * intermediate XML export format or a function that returns the
 * parameter and value to be used in the request in the form
 * key=value, where value should be URL encoded.
 * @param editorUi {EditorUi}
 * @param name {string}
 * @param format {string}
 * @param bg {string}
 * @param s {number}
 * @param b {number}
 * @param dpi {number}
 */
ExportDialog.exportFile = function (editorUi, name, format, bg, s, b, dpi) {
  var graph = editorUi.editor.graph;

  if (format == 'xml') {
    ExportDialog.saveLocalFile(editorUi, mxUtils.getXml(editorUi.editor.getGraphXml()), name, format);
  } else if (format == 'svg') {
    ExportDialog.saveLocalFile(editorUi, mxUtils.getXml(graph.getSvg(bg, s, b)), name, format);
  } else {
    var bounds = graph.getGraphBounds();

    // New image export
    var xmlDoc = mxUtils.createXmlDocument();
    var root = xmlDoc.createElement('output');
    xmlDoc.appendChild(root);

    // Renders graph. Offset will be multiplied with state's scale when painting state.
    var xmlCanvas = new mxXmlCanvas2D(root);
    xmlCanvas.translate(Math.floor((b / s - bounds.x) / graph.view.scale),
        Math.floor((b / s - bounds.y) / graph.view.scale));
    xmlCanvas.scale(s / graph.view.scale);

    var imgExport = new mxImageExport();
    imgExport.drawState(graph.getView().getState(graph.model.root), xmlCanvas);

    // Puts request data together
    var param = 'xml=' + encodeURIComponent(mxUtils.getXml(root));
    var w = Math.ceil(bounds.width * s / graph.view.scale + 2 * b);
    var h = Math.ceil(bounds.height * s / graph.view.scale + 2 * b);

    // Requests image if request is valid
    if (param.length <= MAX_REQUEST_SIZE && w * h < MAX_AREA) {
      editorUi.hideDialog();
      var req = new mxXmlRequest(EXPORT_URL, 'format=' + format +
          '&filename=' + encodeURIComponent(name) +
          '&bg=' + ((bg != null) ? bg : 'none') +
          '&w=' + w + '&h=' + h + '&' + param +
          '&dpi=' + dpi);
      req.simulate(document, '_blank');
    } else {
      mxUtils.alert(mxResources.get('drawingTooLarge'));
    }
  }
};

/**
 * Hook for getting the export format. Returns null for the default
 * intermediate XML export format or a function that returns the
 * parameter and value to be used in the request in the form
 * key=value, where value should be URL encoded.
 * @param editorUi {EditorUi}
 * @param data {string}
 * @param filename {string}
 * @param format {string}
 */
ExportDialog.saveLocalFile = function (editorUi, data, filename, format) {
  if (data.length < MAX_REQUEST_SIZE) {
    editorUi.hideDialog();
    var req = new mxXmlRequest(SAVE_URL, 'xml=' + encodeURIComponent(data) + '&filename=' +
        encodeURIComponent(filename) + '&format=' + format);
    req.simulate(document, '_blank');
  } else {
    mxUtils.alert(mxResources.get('drawingTooLarge'));
    mxUtils.popup(xml);
  }
};

/**
 * Constructs a new metadata dialog.
 * @class
 */
export class EditDataDialog {
  constructor(ui, cell) {
    var div = document.createElement();
    var graph = ui.editor.graph;
    var value = graph.getModel().getValue(cell);
    if (!mxUtils.isNode(value)) {
      var doc = mxUtils.createXmlDocument();
      var obj = doc.createElement();
      obj.setAttribute(, value ||);
      value = obj;
    }
    var form = new mxForm();
    form.table.style.width =;
    var attrs = value.attributes;
    var names = [];
    var texts = [];
    var count =;
    var id = (EditDataDialog.getDisplayIdForCell != null) ? EditDataDialog.getDisplayIdForCell(ui, cell) : null;
    var addRemoveButton = function (text, name) {
      var wrapper = document.createElement();
      wrapper.style.position =;
      wrapper.style.paddingRight =;
      wrapper.style.boxSizing =;
      wrapper.style.width =;
      var removeAttr = document.createElement();
      var img = mxUtils.createImage(Dialog.prototype.closeImage);
      img.style.height =;
      img.style.fontSize =;
      img.style.marginBottom = (mxClient.IS_IE11) ? :;
      removeAttr.className =;
      removeAttr.setAttribute(, mxResources.get());
      removeAttr.style.position =;
      removeAttr.style.top =;
      removeAttr.style.right =;
      removeAttr.style.margin =;
      removeAttr.style.width =;
      removeAttr.style.height =;
      removeAttr.style.cursor =;
      removeAttr.appendChild(img);
      var removeAttrFn = (function (name) {
        return function () {
          var count =;
          for (var j =; j < names.length; j++) {
            if (names[j] == name) {
              texts[j] = null;
              form.table.deleteRow(count + ((id != null) ? :));
              break;
            }
            if (texts[j] != null) {
              count++;
            }
          }
        };
      })(name);
      mxEvent.addListener(removeAttr, , removeAttrFn);
      var parent = text.parentNode;
      wrapper.appendChild(text);
      wrapper.appendChild(removeAttr);
      parent.appendChild(wrapper);
    };
    var addTextArea = function (index, name, value) {
      names[index] = name;
      texts[index] = form.addTextarea(names[count] +, value);
      texts[index].style.width =;
      addRemoveButton(texts[index], name);
    };
    var temp = [];
    var isLayer = graph.getModel().getParent(cell) == graph.getModel().getRoot();
    for (var i =; i < attrs.length; i++) {
      if ((isLayer || attrs[i].nodeName !=) && attrs[i].nodeName !=) {
        temp.push({ name: attrs[i].nodeName, value: attrs[i].nodeValue });
      }
    }
    temp.sort(function (a, b) {
      if (a.name < b.name) {
        return -;
      } else if (a.name > b.name) {
        return;
      } else {
        return;
      }
    });
    if (id != null) {
      var text = document.createElement();
      text.style.width =;
      text.style.fontSize =;
      text.style.textAlign =;
      mxUtils.write(text, id);
      form.addField(mxResources.get() +, text);
    }
    for (var i =; i < temp.length; i++) {
      addTextArea(count, temp[i].name, temp[i].value);
      count++;
    }
    var top = document.createElement();
    top.style.cssText =;
    top.appendChild(form.table);
    var newProp = document.createElement();
    newProp.style.boxSizing =;
    newProp.style.paddingRight =;
    newProp.style.whiteSpace =;
    newProp.style.marginTop =;
    newProp.style.width =;
    var nameInput = document.createElement();
    nameInput.setAttribute(, mxResources.get());
    nameInput.setAttribute(,);
    nameInput.setAttribute(, (mxClient.IS_IE || mxClient.IS_IE11) ? :);
    nameInput.style.boxSizing =;
    nameInput.style.marginLeft =;
    nameInput.style.width =;
    newProp.appendChild(nameInput);
    top.appendChild(newProp);
    div.appendChild(top);
    var addBtn = mxUtils.button(mxResources.get(), function () {
      var name = nameInput.value;
      if (name.length > && name != && name != && name.indexOf() <) {
        try {
          var idx = mxUtils.indexOf(names, name);
          if (idx >= && texts[idx] != null) {
            texts[idx].focus();
          } else {
            var clone = value.cloneNode(false);
            clone.setAttribute(name);
            if (idx >=) {
              names.splice(idx);
              texts.splice(idx);
            }
            names.push(name);
            var text = form.addTextarea(name + ,);
            text.style.width =;
            texts.push(text);
            addRemoveButton(text, name);
            text.focus();
          }
          addBtn.setAttribute(,);
          nameInput.value =;
        } catch (e) {
          mxUtils.alert(e);
        }
      } else {
        mxUtils.alert(mxResources.get());
      }
    });
    this.init = function () {
      if (texts.length >) {
        texts[].focus();
      } else {
        nameInput.focus();
      }
    };
    addBtn.setAttribute(, mxResources.get());
    addBtn.setAttribute(,);
    addBtn.style.textOverflow =;
    addBtn.style.position =;
    addBtn.style.overflow =;
    addBtn.style.width =;
    addBtn.style.right =;
    addBtn.className =;
    newProp.appendChild(addBtn);
    var cancelBtn = mxUtils.button(mxResources.get(), function () {
      ui.hideDialog.apply(ui, arguments);
    });
    cancelBtn.className =;
    var applyBtn = mxUtils.button(mxResources.get(), function () {
      try {
        ui.hideDialog.apply(ui, arguments);
        value = value.cloneNode(true);
        var removeLabel = false;
        for (var i =; i < names.length; i++) {
          if (texts[i] == null) {
            value.removeAttribute(names[i]);
          } else {
            value.setAttribute(names[i], texts[i].value);
            removeLabel = removeLabel || (names[i] == && value.getAttribute() ==);
          }
        }
        if (removeLabel) {
          value.removeAttribute();
        }
        graph.getModel().setValue(cell, value);
      } catch (e) {
        mxUtils.alert(e);
      }
    });
    applyBtn.className =;

    function updateAddBtn() {
      if (nameInput.value.length >) {
        addBtn.removeAttribute();
      } else {
        addBtn.setAttribute(,);
      }
    }
    ;
    mxEvent.addListener(nameInput, , updateAddBtn);
    mxEvent.addListener(nameInput, , updateAddBtn);
    var buttons = document.createElement();
    buttons.style.cssText =;
    if (ui.editor.graph.getModel().isVertex(cell) || ui.editor.graph.getModel().isEdge(cell)) {
      var replace = document.createElement();
      replace.style.marginRight =;
      var input = document.createElement();
      input.setAttribute(,);
      input.style.marginRight =;
      if (value.getAttribute() ==) {
        input.setAttribute(,);
        input.defaultChecked = true;
      }
      mxEvent.addListener(input, , function () {
        if (value.getAttribute() ==) {
          value.removeAttribute();
        } else {
          value.setAttribute(,);
        }
      });
      replace.appendChild(input);
      mxUtils.write(replace, mxResources.get());
      if (EditDataDialog.placeholderHelpLink != null) {
        var link = document.createElement();
        link.setAttribute(, EditDataDialog.placeholderHelpLink);
        link.setAttribute(, mxResources.get());
        link.setAttribute(,);
        link.style.marginLeft =;
        link.style.cursor =;
        var icon = document.createElement();
        mxUtils.setOpacity(icon);
        icon.style.height =;
        icon.style.width =;
        icon.setAttribute(,);
        icon.setAttribute(,);
        icon.style.marginTop = (mxClient.IS_IE11) ? :;
        icon.setAttribute(, Editor.helpImage);
        link.appendChild(icon);
        replace.appendChild(link);
      }
      buttons.appendChild(replace);
    }
    if (ui.editor.cancelFirst) {
      buttons.appendChild(cancelBtn);
      buttons.appendChild(applyBtn);
    } else {
      buttons.appendChild(applyBtn);
      buttons.appendChild(cancelBtn);
    }
    div.appendChild(buttons);
    this.container = div;
  }

  /**
   Creates function to apply value
   */
  presetColors = [, , , , , , , , , , , , , , , , , , , , , , ];
  /**
   Creates function to apply value
   */
  defaultColors = [, , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , ];

  /**
   Creates function to apply value
   */
  createApplyFunction() {
    return mxUtils.bind(this, function (color) {
      var graph = this.editorUi.editor.graph;
      graph.getModel().beginUpdate();
      try {
        graph.setCellStyles(this.currentColorKey, color);
        this.editorUi.fireEvent(new mxEventObject(, , [this.currentColorKey], , [color], , graph.getSelectionCells()));
      } finally {
        graph.getModel().endUpdate();
      }
    });
  }

  /**
   undefined
   */
  recentColors = [];

  /**
   Adds recent color for later use.
   */
  addRecentColor(color, max) {
    if (color != null) {
      mxUtils.remove(color, ColorDialog.recentColors);
      ColorDialog.recentColors.splice(, , color);
      if (ColorDialog.recentColors.length >= max) {
        ColorDialog.recentColors.pop();
      }
    }
  }

  /**
   Adds recent color for later use.
   */
  resetRecentColors() {
    ColorDialog.recentColors = [];
  }

  /**
   undefined
   */
  filenameHelpLink = null;

  /**
   undefined
   */
  createTypeHint(ui, nameInput, hints) {
    var hint = document.createElement();
    hint.style.cssText =;
    mxUtils.setOpacity(hint);
    var nameChanged = function () {
      hint.setAttribute(, Editor.helpImage);
      hint.setAttribute(, mxResources.get());
      for (var i =; i < hints.length; i++) {
        if (hints[i].ext.length > && nameInput.value.substring(nameInput.value.length - hints[i].ext.length -) == +hints[i].ext) {
          hint.setAttribute(, mxClient.imageBasePath +);
          hint.setAttribute(, mxResources.get(hints[i].title));
          break;
        }
      }
    };
    mxEvent.addListener(nameInput, , nameChanged);
    mxEvent.addListener(nameInput, , nameChanged);
    mxEvent.addListener(hint, , function (evt) {
      var title = hint.getAttribute();
      if (hint.getAttribute() == Editor.helpImage) {
        ui.editor.graph.openLink(FilenameDialog.filenameHelpLink);
      } else if (title !=) {
        ui.showError(null, title, mxResources.get(), function () {
          ui.editor.graph.openLink(FilenameDialog.filenameHelpLink);
        }, null, mxResources.get(), null, null, null ,);
      }
      mxEvent.consume(evt);
    });
    nameChanged();
    return hint;
  }

  /**
   undefined
   */
  showNewWindowOption = true;
  /**
   Remembers last value for border.
   */
  lastBorderValue =;
  /**
   Global switches for the export dialog.
   */
  showGifOption = true;
  /**
   Global switches for the export dialog.
   */
  showXmlOption = true;

  /**
   Hook for getting the export format. Returns null for the default
   intermediate XML export format or a function that returns the
   parameter and value to be used in the request in the form
   key=value, where value should be URL encoded.
   */
  exportFile(editorUi, name, format, bg, s, b, dpi) {
    var graph = editorUi.editor.graph;
    if (format ==) {
      ExportDialog.saveLocalFile(editorUi, mxUtils.getXml(editorUi.editor.getGraphXml()), name, format);
    } else if (format ==) {
      ExportDialog.saveLocalFile(editorUi, mxUtils.getXml(graph.getSvg(bg, s, b)), name, format);
    } else {
      var bounds = graph.getGraphBounds();
      var xmlDoc = mxUtils.createXmlDocument();
      var root = xmlDoc.createElement();
      xmlDoc.appendChild(root);
      var xmlCanvas = new mxXmlCanvas2D(root);
      xmlCanvas.translate(Math.floor((b / s - bounds.x) / graph.view.scale), Math.floor((b / s - bounds.y) / graph.view.scale));
      xmlCanvas.scale(s / graph.view.scale);
      var imgExport = new mxImageExport();
      imgExport.drawState(graph.getView().getState(graph.model.root), xmlCanvas);
      var param = +encodeURIComponent(mxUtils.getXml(root));
      var w = Math.ceil(bounds.width * s / graph.view.scale + * b);
      var h = Math.ceil(bounds.height * s / graph.view.scale + * b);
      if (param.length <= MAX_REQUEST_SIZE && w * h < MAX_AREA) {
        editorUi.hideDialog();
        var req = new mxXmlRequest(EXPORT_URL, +format + +encodeURIComponent(name) + +((bg != null) ? bg :) + +w + +h + +param + +dpi);
        req.simulate(document);
      } else {
        mxUtils.alert(mxResources.get());
      }
    }
  }

  /**
   Hook for getting the export format. Returns null for the default
   intermediate XML export format or a function that returns the
   parameter and value to be used in the request in the form
   key=value, where value should be URL encoded.
   */
  saveLocalFile(editorUi, data, filename, format) {
    if (data.length < MAX_REQUEST_SIZE) {
      editorUi.hideDialog();
      var req = new mxXmlRequest(SAVE_URL, +encodeURIComponent(data) + +encodeURIComponent(filename) + +format);
      req.simulate(document);
    } else {
      mxUtils.alert(mxResources.get());
      mxUtils.popup(xml);
    }
  }

  /**
   Optional help link.
   */
  getDisplayIdForCell(ui, cell) {
    var id = null;
    if (ui.editor.graph.getModel().getParent(cell) != null) {
      id = cell.getId();
    }
    return id;
  }

  /**
   Optional help link.
   */
  placeholderHelpLink = null;
}

/**
 * Optional help link.
 * @returns {string}
 */
EditDataDialog.getDisplayIdForCell = function (ui, cell) {
  var id = null;

  if (ui.editor.graph.getModel().getParent(cell) != null) {
    id = cell.getId();
  }

  return id;
};

/**
 * Optional help link.
 * @type {string}
 */
EditDataDialog.placeholderHelpLink = null;

/**
 * Constructs a new link dialog.
 * @class
 */
export class LinkDialog {
  constructor(editorUi, initialValue, btnLabel, fn) {
    var div = document.createElement();
    mxUtils.write(div, mxResources.get() +);
    var inner = document.createElement();
    inner.className =;
    inner.style.backgroundColor =;
    inner.style.borderColor =;
    inner.style.whiteSpace =;
    inner.style.textOverflow =;
    inner.style.cursor =;
    if (!mxClient.IS_VML) {
      inner.style.paddingRight =;
    }
    var linkInput = document.createElement();
    linkInput.setAttribute(, initialValue);
    linkInput.setAttribute(,);
    linkInput.setAttribute(,);
    linkInput.style.marginTop =;
    linkInput.style.width =;
    linkInput.style.backgroundImage = +Dialog.prototype.clearImage +;
    linkInput.style.backgroundRepeat =;
    linkInput.style.backgroundPosition =;
    linkInput.style.paddingRight =;
    var cross = document.createElement();
    cross.setAttribute(, mxResources.get());
    cross.style.position =;
    cross.style.left =;
    cross.style.width =;
    cross.style.height =;
    cross.style.cursor =;
    cross.style.display = (mxClient.IS_VML) ? :;
    cross.style.top = ((mxClient.IS_VML) ? :) +;
    cross.style.background = +IMAGE_PATH +;
    mxEvent.addListener(cross, , function () {
      linkInput.value =;
      linkInput.focus();
    });
    inner.appendChild(linkInput);
    inner.appendChild(cross);
    div.appendChild(inner);
    this.init = function () {
      linkInput.focus();
      if (mxClient.IS_GC || mxClient.IS_FF || document.documentMode >= || mxClient.IS_QUIRKS) {
        linkInput.select();
      } else {
        document.execCommand(, false, null);
      }
    };
    var btns = document.createElement();
    btns.style.marginTop =;
    btns.style.textAlign =;
    mxEvent.addListener(linkInput, , function (e) {
      if (e.keyCode ==) {
        editorUi.hideDialog();
        fn(linkInput.value);
      }
    });
    var cancelBtn = mxUtils.button(mxResources.get(), function () {
      editorUi.hideDialog();
    });
    cancelBtn.className =;
    if (editorUi.editor.cancelFirst) {
      btns.appendChild(cancelBtn);
    }
    var mainBtn = mxUtils.button(btnLabel, function () {
      editorUi.hideDialog();
      fn(linkInput.value);
    });
    mainBtn.className =;
    btns.appendChild(mainBtn);
    if (!editorUi.editor.cancelFirst) {
      btns.appendChild(cancelBtn);
    }
    div.appendChild(btns);
    this.container = div;
  }

  /**
   Creates function to apply value
   */
  presetColors = [, , , , , , , , , , , , , , , , , , , , , , ];
  /**
   Creates function to apply value
   */
  defaultColors = [, , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , ];

  /**
   Creates function to apply value
   */
  createApplyFunction() {
    return mxUtils.bind(this, function (color) {
      var graph = this.editorUi.editor.graph;
      graph.getModel().beginUpdate();
      try {
        graph.setCellStyles(this.currentColorKey, color);
        this.editorUi.fireEvent(new mxEventObject(, , [this.currentColorKey], , [color], , graph.getSelectionCells()));
      } finally {
        graph.getModel().endUpdate();
      }
    });
  }

  /**
   undefined
   */
  recentColors = [];

  /**
   Adds recent color for later use.
   */
  addRecentColor(color, max) {
    if (color != null) {
      mxUtils.remove(color, ColorDialog.recentColors);
      ColorDialog.recentColors.splice(, , color);
      if (ColorDialog.recentColors.length >= max) {
        ColorDialog.recentColors.pop();
      }
    }
  }

  /**
   Adds recent color for later use.
   */
  resetRecentColors() {
    ColorDialog.recentColors = [];
  }

  /**
   undefined
   */
  filenameHelpLink = null;

  /**
   undefined
   */
  createTypeHint(ui, nameInput, hints) {
    var hint = document.createElement();
    hint.style.cssText =;
    mxUtils.setOpacity(hint);
    var nameChanged = function () {
      hint.setAttribute(, Editor.helpImage);
      hint.setAttribute(, mxResources.get());
      for (var i =; i < hints.length; i++) {
        if (hints[i].ext.length > && nameInput.value.substring(nameInput.value.length - hints[i].ext.length -) == +hints[i].ext) {
          hint.setAttribute(, mxClient.imageBasePath +);
          hint.setAttribute(, mxResources.get(hints[i].title));
          break;
        }
      }
    };
    mxEvent.addListener(nameInput, , nameChanged);
    mxEvent.addListener(nameInput, , nameChanged);
    mxEvent.addListener(hint, , function (evt) {
      var title = hint.getAttribute();
      if (hint.getAttribute() == Editor.helpImage) {
        ui.editor.graph.openLink(FilenameDialog.filenameHelpLink);
      } else if (title !=) {
        ui.showError(null, title, mxResources.get(), function () {
          ui.editor.graph.openLink(FilenameDialog.filenameHelpLink);
        }, null, mxResources.get(), null, null, null ,);
      }
      mxEvent.consume(evt);
    });
    nameChanged();
    return hint;
  }

  /**
   undefined
   */
  showNewWindowOption = true;
  /**
   Remembers last value for border.
   */
  lastBorderValue =;
  /**
   Global switches for the export dialog.
   */
  showGifOption = true;
  /**
   Global switches for the export dialog.
   */
  showXmlOption = true;

  /**
   Hook for getting the export format. Returns null for the default
   intermediate XML export format or a function that returns the
   parameter and value to be used in the request in the form
   key=value, where value should be URL encoded.
   */
  exportFile(editorUi, name, format, bg, s, b, dpi) {
    var graph = editorUi.editor.graph;
    if (format ==) {
      ExportDialog.saveLocalFile(editorUi, mxUtils.getXml(editorUi.editor.getGraphXml()), name, format);
    } else if (format ==) {
      ExportDialog.saveLocalFile(editorUi, mxUtils.getXml(graph.getSvg(bg, s, b)), name, format);
    } else {
      var bounds = graph.getGraphBounds();
      var xmlDoc = mxUtils.createXmlDocument();
      var root = xmlDoc.createElement();
      xmlDoc.appendChild(root);
      var xmlCanvas = new mxXmlCanvas2D(root);
      xmlCanvas.translate(Math.floor((b / s - bounds.x) / graph.view.scale), Math.floor((b / s - bounds.y) / graph.view.scale));
      xmlCanvas.scale(s / graph.view.scale);
      var imgExport = new mxImageExport();
      imgExport.drawState(graph.getView().getState(graph.model.root), xmlCanvas);
      var param = +encodeURIComponent(mxUtils.getXml(root));
      var w = Math.ceil(bounds.width * s / graph.view.scale + * b);
      var h = Math.ceil(bounds.height * s / graph.view.scale + * b);
      if (param.length <= MAX_REQUEST_SIZE && w * h < MAX_AREA) {
        editorUi.hideDialog();
        var req = new mxXmlRequest(EXPORT_URL, +format + +encodeURIComponent(name) + +((bg != null) ? bg :) + +w + +h + +param + +dpi);
        req.simulate(document);
      } else {
        mxUtils.alert(mxResources.get());
      }
    }
  }

  /**
   Hook for getting the export format. Returns null for the default
   intermediate XML export format or a function that returns the
   parameter and value to be used in the request in the form
   key=value, where value should be URL encoded.
   */
  saveLocalFile(editorUi, data, filename, format) {
    if (data.length < MAX_REQUEST_SIZE) {
      editorUi.hideDialog();
      var req = new mxXmlRequest(SAVE_URL, +encodeURIComponent(data) + +encodeURIComponent(filename) + +format);
      req.simulate(document);
    } else {
      mxUtils.alert(mxResources.get());
      mxUtils.popup(xml);
    }
  }

  /**
   Optional help link.
   */
  getDisplayIdForCell(ui, cell) {
    var id = null;
    if (ui.editor.graph.getModel().getParent(cell) != null) {
      id = cell.getId();
    }
    return id;
  }

  /**
   Optional help link.
   */
  placeholderHelpLink = null;
}

/**
 *
 * @class
 */
export class OutlineWindow {
  constructor(editorUi, x, y, w, h) {
    var graph = editorUi.editor.graph;
    var div = document.createElement();
    div.style.position =;
    div.style.width =;
    div.style.height =;
    div.style.border =;
    div.style.overflow =;
    this.window = new mxWindow(mxResources.get(), div, x, y, w, h, true, true);
    this.window.minimumSize = new mxRectangle(, , ,);
    this.window.destroyOnClose = false;
    this.window.setMaximizable(false);
    this.window.setResizable(true);
    this.window.setClosable(true);
    this.window.setVisible(true);
    this.window.setLocation = function (x, y) {
      var iw = window.innerWidth || document.body.clientWidth || document.documentElement.clientWidth;
      var ih = window.innerHeight || document.body.clientHeight || document.documentElement.clientHeight;
      x = Math.max(, Math.min(x, iw - this.table.clientWidth));
      y = Math.max(, Math.min(y, ih - this.table.clientHeight -));
      if (this.getX() != x || this.getY() != y) {
        mxWindow.prototype.setLocation.apply(this, arguments);
      }
    };
    var resizeListener = mxUtils.bind(this, function () {
      var x = this.window.getX();
      var y = this.window.getY();
      this.window.setLocation(x, y);
    });
    mxEvent.addListener(window, , resizeListener);
    var outline = editorUi.createOutline(this.window);
    this.destroy = function () {
      mxEvent.removeListener(window, , resizeListener);
      this.window.destroy();
      outline.destroy();
    };
    this.window.addListener(mxEvent.RESIZE, mxUtils.bind(this, function () {
      outline.update(false);
      outline.outline.sizeDidChange();
    }));
    this.window.addListener(mxEvent.SHOW, mxUtils.bind(this, function () {
      this.window.fit();
      outline.suspended = false;
      outline.outline.refresh();
      outline.update();
    }));
    this.window.addListener(mxEvent.HIDE, mxUtils.bind(this, function () {
      outline.suspended = true;
    }));
    this.window.addListener(mxEvent.NORMALIZE, mxUtils.bind(this, function () {
      outline.suspended = false;
      outline.update();
    }));
    this.window.addListener(mxEvent.MINIMIZE, mxUtils.bind(this, function () {
      outline.suspended = true;
    }));
    var outlineCreateGraph = outline.createGraph;
    outline.createGraph = function (container) {
      var g = outlineCreateGraph.apply(this, arguments);
      g.gridEnabled = false;
      g.pageScale = graph.pageScale;
      g.pageFormat = graph.pageFormat;
      g.background = (graph.background == null || graph.background == mxConstants.NONE) ? graph.defaultPageBackgroundColor : graph.background;
      g.pageVisible = graph.pageVisible;
      var current = mxUtils.getCurrentStyle(graph.container);
      div.style.backgroundColor = current.backgroundColor;
      return g;
    };

    function update() {
      outline.outline.pageScale = graph.pageScale;
      outline.outline.pageFormat = graph.pageFormat;
      outline.outline.pageVisible = graph.pageVisible;
      outline.outline.background = (graph.background == null || graph.background == mxConstants.NONE) ? graph.defaultPageBackgroundColor : graph.background;
      ;
      var current = mxUtils.getCurrentStyle(graph.container);
      div.style.backgroundColor = current.backgroundColor;
      if (graph.view.backgroundPageShape != null && outline.outline.view.backgroundPageShape != null) {
        outline.outline.view.backgroundPageShape.fill = graph.view.backgroundPageShape.fill;
      }
      outline.outline.refresh();
    }
    ;
    outline.init(div);
    editorUi.editor.addListener(, update);
    editorUi.addListener(, update);
    editorUi.addListener(, update);
    editorUi.addListener(, update);
    editorUi.addListener(, function () {
      update();
      outline.update(true);
    });
    if (outline.outline.dialect == mxConstants.DIALECT_SVG) {
      var zoomInAction = editorUi.actions.get();
      var zoomOutAction = editorUi.actions.get();
      mxEvent.addMouseWheelListener(function (evt, up) {
        var outlineWheel = false;
        var source = mxEvent.getSource(evt);
        while (source != null) {
          if (source == outline.outline.view.canvas.ownerSVGElement) {
            outlineWheel = true;
            break;
          }
          source = source.parentNode;
        }
        if (outlineWheel) {
          if (up) {
            zoomInAction.funct();
          } else {
            zoomOutAction.funct();
          }
          mxEvent.consume(evt);
        }
      });
    }
  }

  /**
   Creates function to apply value
   */
  presetColors = [, , , , , , , , , , , , , , , , , , , , , , ];
  /**
   Creates function to apply value
   */
  defaultColors = [, , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , ];

  /**
   Creates function to apply value
   */
  createApplyFunction() {
    return mxUtils.bind(this, function (color) {
      var graph = this.editorUi.editor.graph;
      graph.getModel().beginUpdate();
      try {
        graph.setCellStyles(this.currentColorKey, color);
        this.editorUi.fireEvent(new mxEventObject(, , [this.currentColorKey], , [color], , graph.getSelectionCells()));
      } finally {
        graph.getModel().endUpdate();
      }
    });
  }

  /**
   undefined
   */
  recentColors = [];

  /**
   Adds recent color for later use.
   */
  addRecentColor(color, max) {
    if (color != null) {
      mxUtils.remove(color, ColorDialog.recentColors);
      ColorDialog.recentColors.splice(, , color);
      if (ColorDialog.recentColors.length >= max) {
        ColorDialog.recentColors.pop();
      }
    }
  }

  /**
   Adds recent color for later use.
   */
  resetRecentColors() {
    ColorDialog.recentColors = [];
  }

  /**
   undefined
   */
  filenameHelpLink = null;

  /**
   undefined
   */
  createTypeHint(ui, nameInput, hints) {
    var hint = document.createElement();
    hint.style.cssText =;
    mxUtils.setOpacity(hint);
    var nameChanged = function () {
      hint.setAttribute(, Editor.helpImage);
      hint.setAttribute(, mxResources.get());
      for (var i =; i < hints.length; i++) {
        if (hints[i].ext.length > && nameInput.value.substring(nameInput.value.length - hints[i].ext.length -) == +hints[i].ext) {
          hint.setAttribute(, mxClient.imageBasePath +);
          hint.setAttribute(, mxResources.get(hints[i].title));
          break;
        }
      }
    };
    mxEvent.addListener(nameInput, , nameChanged);
    mxEvent.addListener(nameInput, , nameChanged);
    mxEvent.addListener(hint, , function (evt) {
      var title = hint.getAttribute();
      if (hint.getAttribute() == Editor.helpImage) {
        ui.editor.graph.openLink(FilenameDialog.filenameHelpLink);
      } else if (title !=) {
        ui.showError(null, title, mxResources.get(), function () {
          ui.editor.graph.openLink(FilenameDialog.filenameHelpLink);
        }, null, mxResources.get(), null, null, null ,);
      }
      mxEvent.consume(evt);
    });
    nameChanged();
    return hint;
  }

  /**
   undefined
   */
  showNewWindowOption = true;
  /**
   Remembers last value for border.
   */
  lastBorderValue =;
  /**
   Global switches for the export dialog.
   */
  showGifOption = true;
  /**
   Global switches for the export dialog.
   */
  showXmlOption = true;

  /**
   Hook for getting the export format. Returns null for the default
   intermediate XML export format or a function that returns the
   parameter and value to be used in the request in the form
   key=value, where value should be URL encoded.
   */
  exportFile(editorUi, name, format, bg, s, b, dpi) {
    var graph = editorUi.editor.graph;
    if (format ==) {
      ExportDialog.saveLocalFile(editorUi, mxUtils.getXml(editorUi.editor.getGraphXml()), name, format);
    } else if (format ==) {
      ExportDialog.saveLocalFile(editorUi, mxUtils.getXml(graph.getSvg(bg, s, b)), name, format);
    } else {
      var bounds = graph.getGraphBounds();
      var xmlDoc = mxUtils.createXmlDocument();
      var root = xmlDoc.createElement();
      xmlDoc.appendChild(root);
      var xmlCanvas = new mxXmlCanvas2D(root);
      xmlCanvas.translate(Math.floor((b / s - bounds.x) / graph.view.scale), Math.floor((b / s - bounds.y) / graph.view.scale));
      xmlCanvas.scale(s / graph.view.scale);
      var imgExport = new mxImageExport();
      imgExport.drawState(graph.getView().getState(graph.model.root), xmlCanvas);
      var param = +encodeURIComponent(mxUtils.getXml(root));
      var w = Math.ceil(bounds.width * s / graph.view.scale + * b);
      var h = Math.ceil(bounds.height * s / graph.view.scale + * b);
      if (param.length <= MAX_REQUEST_SIZE && w * h < MAX_AREA) {
        editorUi.hideDialog();
        var req = new mxXmlRequest(EXPORT_URL, +format + +encodeURIComponent(name) + +((bg != null) ? bg :) + +w + +h + +param + +dpi);
        req.simulate(document);
      } else {
        mxUtils.alert(mxResources.get());
      }
    }
  }

  /**
   Hook for getting the export format. Returns null for the default
   intermediate XML export format or a function that returns the
   parameter and value to be used in the request in the form
   key=value, where value should be URL encoded.
   */
  saveLocalFile(editorUi, data, filename, format) {
    if (data.length < MAX_REQUEST_SIZE) {
      editorUi.hideDialog();
      var req = new mxXmlRequest(SAVE_URL, +encodeURIComponent(data) + +encodeURIComponent(filename) + +format);
      req.simulate(document);
    } else {
      mxUtils.alert(mxResources.get());
      mxUtils.popup(xml);
    }
  }

  /**
   Optional help link.
   */
  getDisplayIdForCell(ui, cell) {
    var id = null;
    if (ui.editor.graph.getModel().getParent(cell) != null) {
      id = cell.getId();
    }
    return id;
  }

  /**
   Optional help link.
   */
  placeholderHelpLink = null;
}

/**
 *
 * @class
 */
export class LayersWindow {
  constructor(editorUi, x, y, w, h) {
    var graph = editorUi.editor.graph;
    var div = document.createElement();
    div.style.userSelect =;
    div.style.background = (Dialog.backdropColor ==) ? : Dialog.backdropColor;
    div.style.border =;
    div.style.height =;
    div.style.marginBottom =;
    div.style.overflow =;
    var tbarHeight = (!EditorUi.compactUi) ? :;
    var listDiv = document.createElement();
    listDiv.style.backgroundColor = (Dialog.backdropColor ==) ? : Dialog.backdropColor;
    listDiv.style.position =;
    listDiv.style.overflow =;
    listDiv.style.left =;
    listDiv.style.right =;
    listDiv.style.top =;
    listDiv.style.bottom = (parseInt(tbarHeight) +) +;
    div.appendChild(listDiv);
    var dragSource = null;
    var dropIndex = null;
    mxEvent.addListener(div, , function (evt) {
      evt.dataTransfer.dropEffect =;
      dropIndex =;
      evt.stopPropagation();
      evt.preventDefault();
    });
    mxEvent.addListener(div, , function (evt) {
      evt.stopPropagation();
      evt.preventDefault();
    });
    var layerCount = null;
    var selectionLayer = null;
    var ldiv = document.createElement();
    ldiv.className =;
    ldiv.style.position =;
    ldiv.style.bottom =;
    ldiv.style.left =;
    ldiv.style.right =;
    ldiv.style.height = tbarHeight;
    ldiv.style.overflow =;
    ldiv.style.padding = (!EditorUi.compactUi) ? :;
    ldiv.style.backgroundColor = (Dialog.backdropColor ==) ? : Dialog.backdropColor;
    ldiv.style.borderWidth =;
    ldiv.style.borderColor =;
    ldiv.style.borderStyle =;
    ldiv.style.display =;
    ldiv.style.whiteSpace =;
    if (mxClient.IS_QUIRKS) {
      ldiv.style.filter =;
    }
    var link = document.createElement();
    link.className =;
    if (mxClient.IS_QUIRKS) {
      link.style.filter =;
    }
    var removeLink = link.cloneNode();
    removeLink.innerHTML =;
    mxEvent.addListener(removeLink, , function (evt) {
      if (graph.isEnabled()) {
        graph.model.beginUpdate();
        try {
          var index = graph.model.root.getIndex(selectionLayer);
          graph.removeCells([selectionLayer], false);
          if (graph.model.getChildCount(graph.model.root) ==) {
            graph.model.add(graph.model.root, new mxCell());
            graph.setDefaultParent(null);
          } else if (index > && index <= graph.model.getChildCount(graph.model.root)) {
            graph.setDefaultParent(graph.model.getChildAt(graph.model.root, index -));
          } else {
            graph.setDefaultParent(null);
          }
        } finally {
          graph.model.endUpdate();
        }
      }
      mxEvent.consume(evt);
    });
    if (!graph.isEnabled()) {
      removeLink.className =;
    }
    ldiv.appendChild(removeLink);
    var insertLink = link.cloneNode();
    insertLink.setAttribute(, mxUtils.trim(mxResources.get(, [])));
    insertLink.innerHTML =;
    mxEvent.addListener(insertLink, , function (evt) {
      if (graph.isEnabled() && !graph.isSelectionEmpty()) {
        editorUi.editor.graph.popupMenuHandler.hideMenu();
        var menu = new mxPopupMenu(mxUtils.bind(this, function (menu, parent) {
          for (var i = layerCount -; i >=; i--) {
            (mxUtils.bind(this, function (child) {
              var item = menu.addItem(graph.convertValueToString(child) || mxResources.get(), null, mxUtils.bind(this, function () {
                graph.moveCells(graph.getSelectionCells(), , , false, child);
              }), parent);
              if (graph.getSelectionCount() == && graph.model.isAncestor(child, graph.getSelectionCell())) {
                menu.addCheckmark(item, Editor.checkmarkImage);
              }
            }))(graph.model.getChildAt(graph.model.root, i));
          }
        }));
        menu.div.className +=;
        menu.smartSeparators = true;
        menu.showDisabled = true;
        menu.autoExpand = true;
        menu.hideMenu = mxUtils.bind(this, function () {
          mxPopupMenu.prototype.hideMenu.apply(menu, arguments);
          menu.destroy();
        });
        var offset = mxUtils.getOffset(insertLink);
        menu.popup(offset.x, offset.y + insertLink.offsetHeight, null, evt);
        editorUi.setCurrentMenu(menu);
      }
    });
    ldiv.appendChild(insertLink);
    var dataLink = link.cloneNode();
    dataLink.innerHTML =;
    dataLink.setAttribute(, mxResources.get());
    mxEvent.addListener(dataLink, , function (evt) {
      if (graph.isEnabled()) {
        editorUi.showDataDialog(selectionLayer);
      }
      mxEvent.consume(evt);
    });
    if (!graph.isEnabled()) {
      dataLink.className =;
    }
    ldiv.appendChild(dataLink);

    function renameLayer(layer) {
      if (graph.isEnabled() && layer != null) {
        var label = graph.convertValueToString(layer);
        var dlg = new FilenameDialog(editorUi, label || mxResources.get(), mxResources.get(), mxUtils.bind(this, function (newValue) {
          if (newValue != null) {
            graph.cellLabelChanged(layer, newValue);
          }
        }), mxResources.get());
        editorUi.showDialog(dlg.container, , , true, true);
        dlg.init();
      }
    }
    ;
    var duplicateLink = link.cloneNode();
    duplicateLink.innerHTML =;
    mxEvent.addListener(duplicateLink, , function (evt) {
      if (graph.isEnabled()) {
        var newCell = null;
        graph.model.beginUpdate();
        try {
          newCell = graph.cloneCell(selectionLayer);
          graph.cellLabelChanged(newCell, mxResources.get());
          newCell.setVisible(true);
          newCell = graph.addCell(newCell, graph.model.root);
          graph.setDefaultParent(newCell);
        } finally {
          graph.model.endUpdate();
        }
        if (newCell != null && !graph.isCellLocked(newCell)) {
          graph.selectAll(newCell);
        }
      }
    });
    if (!graph.isEnabled()) {
      duplicateLink.className =;
    }
    ldiv.appendChild(duplicateLink);
    var addLink = link.cloneNode();
    addLink.innerHTML =;
    addLink.setAttribute(, mxResources.get());
    mxEvent.addListener(addLink, , function (evt) {
      if (graph.isEnabled()) {
        graph.model.beginUpdate();
        try {
          var cell = graph.addCell(new mxCell(mxResources.get()), graph.model.root);
          graph.setDefaultParent(cell);
        } finally {
          graph.model.endUpdate();
        }
      }
      mxEvent.consume(evt);
    });
    if (!graph.isEnabled()) {
      addLink.className =;
    }
    ldiv.appendChild(addLink);
    div.appendChild(ldiv);

    function refresh() {
      layerCount = graph.model.getChildCount(graph.model.root);
      listDiv.innerHTML =;

      function addLayer(index, label, child, defaultParent) {
        var ldiv = document.createElement();
        ldiv.className =;
        ldiv.style.overflow =;
        ldiv.style.position =;
        ldiv.style.padding =;
        ldiv.style.height =;
        ldiv.style.display =;
        ldiv.style.backgroundColor = (Dialog.backdropColor ==) ? : Dialog.backdropColor;
        ldiv.style.borderWidth =;
        ldiv.style.borderColor =;
        ldiv.style.borderStyle =;
        ldiv.style.whiteSpace =;
        ldiv.setAttribute(, label);
        var left = document.createElement();
        left.style.display =;
        left.style.width =;
        left.style.textOverflow =;
        left.style.overflow =;
        mxEvent.addListener(ldiv, , function (evt) {
          evt.dataTransfer.dropEffect =;
          dropIndex = index;
          evt.stopPropagation();
          evt.preventDefault();
        });
        mxEvent.addListener(ldiv, , function (evt) {
          dragSource = ldiv;
          if (mxClient.IS_FF) {
            evt.dataTransfer.setData(,);
          }
        });
        mxEvent.addListener(ldiv, , function (evt) {
          if (dragSource != null && dropIndex != null) {
            graph.addCell(child, graph.model.root, dropIndex);
          }
          dragSource = null;
          dropIndex = null;
          evt.stopPropagation();
          evt.preventDefault();
        });
        var btn = document.createElement();
        btn.setAttribute(,);
        btn.setAttribute(,);
        btn.setAttribute(,);
        btn.style.padding =;
        btn.setAttribute(, mxResources.get());
        var state = graph.view.getState(child);
        var style = (state != null) ? state.style : graph.getCellStyle(child);
        if (mxUtils.getValue(style ,) ==) {
          btn.setAttribute(, Dialog.prototype.lockedImage);
        } else {
          btn.setAttribute(, Dialog.prototype.unlockedImage);
        }
        if (graph.isEnabled()) {
          btn.style.cursor =;
        }
        mxEvent.addListener(btn, , function (evt) {
          if (graph.isEnabled()) {
            var value = null;
            graph.getModel().beginUpdate();
            try {
              value = (mxUtils.getValue(style ,) ==) ? null :;
              graph.setCellStyles(, value, [child]);
            } finally {
              graph.getModel().endUpdate();
            }
            if (value ==) {
              graph.removeSelectionCells(graph.getModel().getDescendants(child));
            }
            mxEvent.consume(evt);
          }
        });
        left.appendChild(btn);
        var inp = document.createElement();
        inp.setAttribute(,);
        inp.setAttribute(, mxResources.get(, [child.value || mxResources.get()]));
        inp.style.marginLeft =;
        inp.style.marginRight =;
        inp.style.marginTop =;
        left.appendChild(inp);
        if (graph.model.isVisible(child)) {
          inp.setAttribute(,);
          inp.defaultChecked = true;
        }
        mxEvent.addListener(inp, , function (evt) {
          graph.model.setVisible(child, !graph.model.isVisible(child));
          mxEvent.consume(evt);
        });
        mxUtils.write(left, label);
        ldiv.appendChild(left);
        if (graph.isEnabled()) {
          if (mxClient.IS_TOUCH || mxClient.IS_POINTER || mxClient.IS_VML || (mxClient.IS_IE && document.documentMode <)) {
            var right = document.createElement();
            right.style.display =;
            right.style.textAlign =;
            right.style.whiteSpace =;
            right.style.position =;
            right.style.right =;
            right.style.top =;
            if (index >) {
              var img2 = document.createElement();
              img2.setAttribute(, mxResources.get());
              img2.className =;
              img2.style.cssFloat =;
              img2.innerHTML =;
              img2.style.width =;
              img2.style.height =;
              img2.style.fontSize =;
              img2.style.margin =;
              img2.style.marginTop =;
              right.appendChild(img2);
              mxEvent.addListener(img2, , function (evt) {
                if (graph.isEnabled()) {
                  graph.addCell(child, graph.model.root, index -);
                }
                mxEvent.consume(evt);
              });
            }
            if (index >= && index < layerCount -) {
              var img1 = document.createElement();
              img1.setAttribute(, mxResources.get());
              img1.className =;
              img1.style.cssFloat =;
              img1.innerHTML =;
              img1.style.width =;
              img1.style.height =;
              img1.style.fontSize =;
              img1.style.margin =;
              img1.style.marginTop =;
              right.appendChild(img1);
              mxEvent.addListener(img1, , function (evt) {
                if (graph.isEnabled()) {
                  graph.addCell(child, graph.model.root, index +);
                }
                mxEvent.consume(evt);
              });
            }
            ldiv.appendChild(right);
          }
          if (mxClient.IS_SVG && (!mxClient.IS_IE || document.documentMode >=)) {
            ldiv.setAttribute(,);
            ldiv.style.cursor =;
          }
        }
        mxEvent.addListener(ldiv, , function (evt) {
          var nodeName = mxEvent.getSource(evt).nodeName;
          if (nodeName != && nodeName !=) {
            renameLayer(child);
            mxEvent.consume(evt);
          }
        });
        if (graph.getDefaultParent() == child) {
          ldiv.style.background = (Dialog.backdropColor ==) ? :;
          ldiv.style.fontWeight = (graph.isEnabled()) ? :;
          selectionLayer = child;
        } else {
          mxEvent.addListener(ldiv, , function (evt) {
            if (graph.isEnabled()) {
              graph.setDefaultParent(defaultParent);
              graph.view.setCurrentRoot(null);
              refresh();
            }
          });
        }
        listDiv.appendChild(ldiv);
      }
      ;
      for (var i = layerCount -; i >=; i--) {
        (mxUtils.bind(this, function (child) {
          addLayer(i, graph.convertValueToString(child) || mxResources.get(), child, child);
        }))(graph.model.getChildAt(graph.model.root, i));
      }
      var label = graph.convertValueToString(selectionLayer) || mxResources.get();
      removeLink.setAttribute(, mxResources.get(, [label]));
      duplicateLink.setAttribute(, mxResources.get(, [label]));
      dataLink.setAttribute(, mxResources.get());
      if (graph.isSelectionEmpty()) {
        insertLink.className =;
      }
    }
    ;
    refresh();
    graph.model.addListener(mxEvent.CHANGE, function () {
      refresh();
    });
    graph.selectionModel.addListener(mxEvent.CHANGE, function () {
      if (graph.isSelectionEmpty()) {
        insertLink.className =;
      } else {
        insertLink.className =;
      }
    });
    this.window = new mxWindow(mxResources.get(), div, x, y, w, h, true, true);
    this.window.minimumSize = new mxRectangle(, , ,);
    this.window.destroyOnClose = false;
    this.window.setMaximizable(false);
    this.window.setResizable(true);
    this.window.setClosable(true);
    this.window.setVisible(true);
    this.window.addListener(mxEvent.SHOW, mxUtils.bind(this, function () {
      this.window.fit();
    }));
    this.refreshLayers = refresh;
    this.window.setLocation = function (x, y) {
      var iw = window.innerWidth || document.body.clientWidth || document.documentElement.clientWidth;
      var ih = window.innerHeight || document.body.clientHeight || document.documentElement.clientHeight;
      x = Math.max(, Math.min(x, iw - this.table.clientWidth));
      y = Math.max(, Math.min(y, ih - this.table.clientHeight -));
      if (this.getX() != x || this.getY() != y) {
        mxWindow.prototype.setLocation.apply(this, arguments);
      }
    };
    var resizeListener = mxUtils.bind(this, function () {
      var x = this.window.getX();
      var y = this.window.getY();
      this.window.setLocation(x, y);
    });
    mxEvent.addListener(window, , resizeListener);
    this.destroy = function () {
      mxEvent.removeListener(window, , resizeListener);
      this.window.destroy();
    };
  }

  /**
   Creates function to apply value
   */
  presetColors = [, , , , , , , , , , , , , , , , , , , , , , ];
  /**
   Creates function to apply value
   */
  defaultColors = [, , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , ];

  /**
   Creates function to apply value
   */
  createApplyFunction() {
    return mxUtils.bind(this, function (color) {
      var graph = this.editorUi.editor.graph;
      graph.getModel().beginUpdate();
      try {
        graph.setCellStyles(this.currentColorKey, color);
        this.editorUi.fireEvent(new mxEventObject(, , [this.currentColorKey], , [color], , graph.getSelectionCells()));
      } finally {
        graph.getModel().endUpdate();
      }
    });
  }

  /**
   undefined
   */
  recentColors = [];

  /**
   Adds recent color for later use.
   */
  addRecentColor(color, max) {
    if (color != null) {
      mxUtils.remove(color, ColorDialog.recentColors);
      ColorDialog.recentColors.splice(, , color);
      if (ColorDialog.recentColors.length >= max) {
        ColorDialog.recentColors.pop();
      }
    }
  }

  /**
   Adds recent color for later use.
   */
  resetRecentColors() {
    ColorDialog.recentColors = [];
  }

  /**
   undefined
   */
  filenameHelpLink = null;

  /**
   undefined
   */
  createTypeHint(ui, nameInput, hints) {
    var hint = document.createElement();
    hint.style.cssText =;
    mxUtils.setOpacity(hint);
    var nameChanged = function () {
      hint.setAttribute(, Editor.helpImage);
      hint.setAttribute(, mxResources.get());
      for (var i =; i < hints.length; i++) {
        if (hints[i].ext.length > && nameInput.value.substring(nameInput.value.length - hints[i].ext.length -) == +hints[i].ext) {
          hint.setAttribute(, mxClient.imageBasePath +);
          hint.setAttribute(, mxResources.get(hints[i].title));
          break;
        }
      }
    };
    mxEvent.addListener(nameInput, , nameChanged);
    mxEvent.addListener(nameInput, , nameChanged);
    mxEvent.addListener(hint, , function (evt) {
      var title = hint.getAttribute();
      if (hint.getAttribute() == Editor.helpImage) {
        ui.editor.graph.openLink(FilenameDialog.filenameHelpLink);
      } else if (title !=) {
        ui.showError(null, title, mxResources.get(), function () {
          ui.editor.graph.openLink(FilenameDialog.filenameHelpLink);
        }, null, mxResources.get(), null, null, null ,);
      }
      mxEvent.consume(evt);
    });
    nameChanged();
    return hint;
  }

  /**
   undefined
   */
  showNewWindowOption = true;
  /**
   Remembers last value for border.
   */
  lastBorderValue =;
  /**
   Global switches for the export dialog.
   */
  showGifOption = true;
  /**
   Global switches for the export dialog.
   */
  showXmlOption = true;

  /**
   Hook for getting the export format. Returns null for the default
   intermediate XML export format or a function that returns the
   parameter and value to be used in the request in the form
   key=value, where value should be URL encoded.
   */
  exportFile(editorUi, name, format, bg, s, b, dpi) {
    var graph = editorUi.editor.graph;
    if (format ==) {
      ExportDialog.saveLocalFile(editorUi, mxUtils.getXml(editorUi.editor.getGraphXml()), name, format);
    } else if (format ==) {
      ExportDialog.saveLocalFile(editorUi, mxUtils.getXml(graph.getSvg(bg, s, b)), name, format);
    } else {
      var bounds = graph.getGraphBounds();
      var xmlDoc = mxUtils.createXmlDocument();
      var root = xmlDoc.createElement();
      xmlDoc.appendChild(root);
      var xmlCanvas = new mxXmlCanvas2D(root);
      xmlCanvas.translate(Math.floor((b / s - bounds.x) / graph.view.scale), Math.floor((b / s - bounds.y) / graph.view.scale));
      xmlCanvas.scale(s / graph.view.scale);
      var imgExport = new mxImageExport();
      imgExport.drawState(graph.getView().getState(graph.model.root), xmlCanvas);
      var param = +encodeURIComponent(mxUtils.getXml(root));
      var w = Math.ceil(bounds.width * s / graph.view.scale + * b);
      var h = Math.ceil(bounds.height * s / graph.view.scale + * b);
      if (param.length <= MAX_REQUEST_SIZE && w * h < MAX_AREA) {
        editorUi.hideDialog();
        var req = new mxXmlRequest(EXPORT_URL, +format + +encodeURIComponent(name) + +((bg != null) ? bg :) + +w + +h + +param + +dpi);
        req.simulate(document);
      } else {
        mxUtils.alert(mxResources.get());
      }
    }
  }

  /**
   Hook for getting the export format. Returns null for the default
   intermediate XML export format or a function that returns the
   parameter and value to be used in the request in the form
   key=value, where value should be URL encoded.
   */
  saveLocalFile(editorUi, data, filename, format) {
    if (data.length < MAX_REQUEST_SIZE) {
      editorUi.hideDialog();
      var req = new mxXmlRequest(SAVE_URL, +encodeURIComponent(data) + +encodeURIComponent(filename) + +format);
      req.simulate(document);
    } else {
      mxUtils.alert(mxResources.get());
      mxUtils.popup(xml);
    }
  }

  /**
   Optional help link.
   */
  getDisplayIdForCell(ui, cell) {
    var id = null;
    if (ui.editor.graph.getModel().getParent(cell) != null) {
      id = cell.getId();
    }
    return id;
  }

  /**
   Optional help link.
   */
  placeholderHelpLink = null;
}
