/**
 * Class: mxPopupMenu
 *
 * Basic popup menu. To add a vertical scrollbar to a given submenu, the
 * following code can be used.
 *
 * (code)
 * var mxPopupMenuShowMenu = mxPopupMenu.prototype.showMenu;
 * mxPopupMenu.prototype.showMenu = function()
 * {
 *   mxPopupMenuShowMenu.apply(this, arguments);
 *
 *   this.div.style.overflowY = 'auto';
 *   this.div.style.overflowX = 'hidden';
 *   this.div.style.maxHeight = '160px';
 * };
 * (end)
 *
 * Constructor: mxPopupMenu
 *
 * Constructs a popupmenu.
 *
 * Event: mxEvent.SHOW
 *
 * Fires after the menu has been shown in <popup>.
 */
import { mxCell } from '../model/mxCell';
import { mxClient } from '../mxClient';
import { mxEvent } from './mxEvent';
import { mxEventObject } from './mxEventObject';
import { mxUtils } from './mxUtils';

export class mxPopupMenu {
  constructor(factoryMethod: any) {
    this.factoryMethod = factoryMethod;
    if (!!factoryMethod) {
      this.init();
    }
  }

  factoryMethod: any;
  /**
   * Variable: submenuImage
   *
   * URL of the image to be used for the submenu icon.
   */
  submenuImage: any;
  /**
   * Variable: zIndex
   *
   * Specifies the zIndex for the popupmenu and its shadow. Default is 1006.
   * @example 10006
   */
  zIndex: number;
  /**
   * Variable: useLeftButtonForPopup
   *
   * Specifies if popupmenus should be activated by clicking the left mouse
   * button. Default is false.
   */
  useLeftButtonForPopup: boolean;
  /**
   * Variable: enabled
   *
   * Specifies if events are handled. Default is true.
   * @example true
   */
  enabled: boolean;
  /**
   * Variable: itemCount
   *
   * Contains the number of times <addItem> has been called for a new menu.
   */
  itemCount: number;
  /**
   * Variable: autoExpand
   *
   * Specifies if submenus should be expanded on mouseover. Default is false.
   */
  autoExpand: boolean;
  /**
   * Variable: smartSeparators
   *
   * Specifies if separators should only be added if a menu item follows them.
   * Default is false.
   */
  smartSeparators: boolean;
  /**
   * Variable: labels
   *
   * Specifies if any labels should be visible. Default is true.
   * @example true
   */
  labels: boolean;
  table: boolean;
  tbody: any;
  div: HTMLElement;
  eventReceiver: any;
  containsItems: boolean;

  /**
   * Function: init
   *
   * Initializes the shapes required for this vertex handler.
   */
  init(): void {
    this.table = document.createElement('table');
    this.table.className = 'mxPopupMenu';
    this.tbody = document.createElement('tbody');
    this.table.appendChild(this.tbody);
    this.div = document.createElement('div');
    this.div.className = 'mxPopupMenu';
    this.div.style.display = 'inline';
    this.div.style.zIndex = this.zIndex;
    this.div.appendChild(this.table);
    mxEvent.disableContextMenu(this.div);
  }

  /**
   * Function: isEnabled
   *
   * Returns true if events are handled. This implementation
   * returns <enabled>.
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Function: setEnabled
   *
   * Enables or disables event handling. This implementation
   * updates <enabled>.
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Function: isPopupTrigger
   *
   * Returns true if the given event is a popupmenu trigger for the optional
   * given cell.
   *
   * Parameters:
   *
   * me - <mxMouseEvent> that represents the mouse event.
   */
  isPopupTrigger(me: any): boolean {
    return me.isPopupTrigger() || (this.useLeftButtonForPopup && mxEvent.isLeftMouseButton(me.getEvent()));
  }

  /**
   * Function: addItem
   *
   * Adds the given item to the given parent item. If no parent item is specified
   * then the item is added to the top-level menu. The return value may be used
   * as the parent argument, ie. as a submenu item. The return value is the table
   * row that represents the item.
   *
   * Paramters:
   *
   * title - String that represents the title of the menu item.
   * image - Optional URL for the image icon.
   * funct - Function associated that takes a mouseup or touchend event.
   * parent - Optional item returned by <addItem>.
   * iconCls - Optional string that represents the CSS class for the image icon.
   * IconsCls is ignored if image is given.
   * enabled - Optional boolean indicating if the item is enabled. Default is true.
   * active - Optional boolean indicating if the menu should implement any event handling.
   * Default is true.
   */
  addItem(title: string, image: any, funct: Function, parent: any, iconCls: string, enabled: boolean, active: any): any {
    parent = parent || this;
    this.itemCount++;
    if (parent.willAddSeparator) {
      if (parent.containsItems) {
        this.addSeparator(parent, true);
      }
      parent.willAddSeparator = false;
    }
    parent.containsItems = true;
    const tr = document.createElement('tr');
    tr.className = 'mxPopupMenuItem';
    const col1 = document.createElement('td');
    col1.className = 'mxPopupMenuIcon';
    if (!!image) {
      const img = document.createElement('img');
      img.src = image;
      col1.appendChild(img);
    } else if (!!iconCls) {
      const div = document.createElement('div');
      div.className = iconCls;
      col1.appendChild(div);
    }
    tr.appendChild(col1);
    if (this.labels) {
      const col2 = document.createElement('td');
      col2.className = 'mxPopupMenuItem' + ((!!enabled && !enabled) ? ' mxDisabled' : '');
      mxUtils.write(col2, title);
      col2.align = 'left';
      tr.appendChild(col2);
      const col3 = document.createElement('td');
      col3.className = 'mxPopupMenuItem' + ((!!enabled && !enabled) ? ' mxDisabled' : '');
      col3.style.paddingRight = '6px';
      col3.style.textAlign = 'right';
      tr.appendChild(col3);
      if (!parent.div) {
        this.createSubmenu(parent);
      }
    }
    parent.tbody.appendChild(tr);
    if (active != false && enabled != false) {
      let currentSelection = undefined;
      mxEvent.addGestureListeners(tr, (evt) => {
        this.eventReceiver = tr;
        if (parent.activeRow != tr && parent.activeRow != parent) {
          if (!!parent.activeRow && !!parent.activeRow.div.parentNode) {
            this.hideSubmenu(parent);
          }
          if (!!tr.div) {
            this.showSubmenu(parent, tr);
            parent.activeRow = tr;
          }
        }
        if (!!document.selection && (mxClient.IS_QUIRKS || document.documentMode == 8)) {
          currentSelection = document.selection.createRange();
        }
        mxEvent.consume(evt);
      }, mxUtils.bind(this, function (evt) {
        if (parent.activeRow != tr && parent.activeRow != parent) {
          if (!!parent.activeRow && !!parent.activeRow.div.parentNode) {
            this.hideSubmenu(parent);
          }
          if (this.autoExpand && !!tr.div) {
            this.showSubmenu(parent, tr);
            parent.activeRow = tr;
          }
        }
        tr.className = 'mxPopupMenuItemHover';
      }), (evt) => {
        if (this.eventReceiver == tr) {
          if (parent.activeRow != tr) {
            this.hideMenu();
          }
          if (!!currentSelection) {
            try {
              currentSelection.select();
            } catch (e) {
            }
            currentSelection = undefined;
          }
          if (!!funct) {
            funct(evt);
          }
        }
        this.eventReceiver = undefined;
        mxEvent.consume(evt);
      });
      mxEvent.addListener(tr, 'mouseout', (evt) => {
        tr.className = 'mxPopupMenuItem';
      });
    }
    return tr;
  }

  /**
   * Adds a checkmark to the given menuitem.
   */
  addCheckmark(item: any, img: any): void {
    const td = item.firstChild.nextSibling;
    td.style.backgroundImage = 'url(\'' + img + '\')';
    td.style.backgroundRepeat = 'no-repeat';
    td.style.backgroundPosition = '2px 50%';
  }

  /**
   * Function: createSubmenu
   *
   * Creates the nodes required to add submenu items inside the given parent
   * item. This is called in <addItem> if a parent item is used for the first
   * time. This adds various DOM nodes and a <submenuImage> to the parent.
   *
   * Parameters:
   *
   * parent - An item returned by <addItem>.
   */
  createSubmenu(parent: any): void {
    parent.table = document.createElement('table');
    parent.table.className = 'mxPopupMenu';
    parent.tbody = document.createElement('tbody');
    parent.table.appendChild(parent.tbody);
    parent.div = document.createElement('div');
    parent.div.className = 'mxPopupMenu';
    parent.div.style.position = 'absolute';
    parent.div.style.display = 'inline';
    parent.div.style.zIndex = this.zIndex;
    parent.div.appendChild(parent.table);
    const img = document.createElement('img');
    img.setAttribute('src', this.submenuImage);
    td = parent.firstChild.nextSibling.nextSibling;
    td.appendChild(img);
  }

  /**
   * Function: showSubmenu
   *
   * Shows the submenu inside the given parent row.
   */
  showSubmenu(parent: any, row: any): void {
    if (!!row.div) {
      row.div.style.left = (parent.div.offsetLeft + row.offsetLeft + row.offsetWidth - 1) + 'px';
      row.div.style.top = (parent.div.offsetTop + row.offsetTop) + 'px';
      document.body.appendChild(row.div);
      const left = parseInt(row.div.offsetLeft);
      const width = parseInt(row.div.offsetWidth);
      const offset = mxUtils.getDocumentScrollOrigin(document);
      const b = document.body;
      const d = document.documentElement;
      const right = offset.x + (b.clientWidth || d.clientWidth);
      if (left + width > right) {
        row.div.style.left = Math.max(0, (parent.div.offsetLeft - width + ((mxClient.IS_IE) ? 6 : -6))) + 'px';
      }
      mxUtils.fit(row.div);
    }
  }

  /**
   * Function: addSeparator
   *
   * Adds a horizontal separator in the given parent item or the top-level menu
   * if no parent is specified.
   *
   * Parameters:
   *
   * parent - Optional item returned by <addItem>.
   * force - Optional boolean to ignore <smartSeparators>. Default is false.
   */
  addSeparator(parent: any, force: any): void {
    parent = parent || this;
    if (this.smartSeparators && !force) {
      parent.willAddSeparator = true;
    } else if (!!parent.tbody) {
      parent.willAddSeparator = false;
      const tr = document.createElement('tr');
      const col1 = document.createElement('td');
      col1.className = 'mxPopupMenuIcon';
      col1.style.padding = '0 0 0 0px';
      tr.appendChild(col1);
      const col2 = document.createElement('td');
      col2.style.padding = '0 0 0 0px';
      col2.setAttribute('colSpan', '2');
      const hr = document.createElement('hr');
      hr.setAttribute('size', '1');
      col2.appendChild(hr);
      tr.appendChild(col2);
      parent.tbody.appendChild(tr);
    }
  }

  /**
   * Function: popup
   *
   * Shows the popup menu for the given event and cell.
   *
   * Example:
   *
   * (code)
   * graph.panningHandler.popup = function(x, y, cell, evt)
   * {
   *   mxUtils.alert('Hello, World!');
   * }
   * (end)
   */
  popup(x: number, y: number, cell: mxCell, evt: Event): void {
    if (!!this.div && !!this.tbody && !!this.factoryMethod) {
      this.div.style.left = x + 'px';
      this.div.style.top = y + 'px';
      while (!!this.tbody.firstChild) {
        mxEvent.release(this.tbody.firstChild);
        this.tbody.removeChild(this.tbody.firstChild);
      }
      this.itemCount = 0;
      this.factoryMethod(this, cell, evt);
      if (this.itemCount > 0) {
        this.showMenu();
        this.fireEvent(new mxEventObject(mxEvent.SHOW));
      }
    }
  }

  /**
   * Function: isMenuShowing
   *
   * Returns true if the menu is showing.
   */
  isMenuShowing(): boolean {
    return !!this.div && this.div.parentNode == document.body;
  }

  /**
   * Function: showMenu
   *
   * Shows the menu.
   */
  showMenu(): void {
    if (document.documentMode >= 9) {
      this.div.style.filter = 'none';
    }
    document.body.appendChild(this.div);
    mxUtils.fit(this.div);
  }

  /**
   * Function: hideMenu
   *
   * Removes the menu and all submenus.
   */
  hideMenu(): void {
    if (!!this.div) {
      if (!!this.div.parentNode) {
        this.div.parentNode.removeChild(this.div);
      }
      this.hideSubmenu(this);
      this.containsItems = false;
      this.fireEvent(new mxEventObject(mxEvent.HIDE));
    }
  }

  /**
   * Function: hideSubmenu
   *
   * Removes all submenus inside the given parent.
   *
   * Parameters:
   *
   * parent - An item returned by <addItem>.
   */
  hideSubmenu(parent: any): void {
    if (!!parent.activeRow) {
      this.hideSubmenu(parent.activeRow);
      if (!!parent.activeRow.div.parentNode) {
        parent.activeRow.div.parentNode.removeChild(parent.activeRow.div);
      }
      parent.activeRow = undefined;
    }
  }

  /**
   * Function: destroy
   *
   * Destroys the handler and all its resources and DOM nodes.
   */
  destroy(): void {
    if (!!this.div) {
      mxEvent.release(this.div);
      if (!!this.div.parentNode) {
        this.div.parentNode.removeChild(this.div);
      }
      this.div = undefined;
    }
  }
}
