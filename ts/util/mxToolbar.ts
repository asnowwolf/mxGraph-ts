/**
 * Class: mxToolbar
 *
 * Creates a toolbar inside a given DOM node. The toolbar may contain icons,
 * buttons and combo boxes.
 *
 * Event: mxEvent.SELECT
 *
 * Fires when an item was selected in the toolbar. The <code>function</code>
 * property contains the function that was selected in <selectMode>.
 *
 * Constructor: mxToolbar
 *
 * Constructs a toolbar in the specified container.
 *
 * Parameters:
 *
 * container - DOM node that contains the toolbar.
 */
import { mxClient } from '../mxClient';
import { mxEvent } from './mxEvent';
import { mxEventObject } from './mxEventObject';
import { mxPoint } from './mxPoint';
import { mxPopupMenu } from './mxPopupMenu';
import { mxUtils } from './mxUtils';

export class mxToolbar {
  constructor(container: HTMLElement) {
    this.container = container;
  }

  container: HTMLElement;
  /**
   * Variable: enabled
   *
   * Specifies if events are handled. Default is true.
   * @example true
   */
  enabled: boolean = true;
  /**
   * Variable: noReset
   *
   * Specifies if <resetMode> requires a forced flag of true for resetting
   * the current mode in the toolbar. Default is false. This is set to true
   * if the toolbar item is double clicked to avoid a reset after a single
   * use of the item.
   */
  noReset: boolean = true;
  /**
   * Variable: updateDefaultMode
   *
   * Boolean indicating if the default mode should be the last selected
   * switch mode or the first inserted switch mode. Default is true, that
   * is the last selected switch mode is the default mode. The default mode
   * is the mode to be selected after a reset of the toolbar. If this is
   * false, then the default mode is the first inserted mode item regardless
   * of what was last selected. Otherwise, the selected item after a reset is
   * the previously selected item.
   * @example true
   */
  updateDefaultMode: boolean = true;
  menu: mxPopupMenu;
  currentImg: any;
  defaultMode: any;
  selectedMode: any;
  defaultFunction: any;

  /**
   * Function: addItem
   *
   * Adds the given function as an image with the specified title and icon
   * and returns the new image node.
   *
   * Parameters:
   *
   * title - Optional string that is used as the tooltip.
   * icon - Optional URL of the image to be used. If no URL is given, then a
   * button is created.
   * funct - Function to execute on a mouse click.
   * pressedIcon - Optional URL of the pressed image. Default is a gray
   * background.
   * style - Optional style classname. Default is mxToolbarItem.
   * factoryMethod - Optional factory method for popup menu, eg.
   * function(menu, evt, cell) { menu.addItem('Hello, World!'); }
   */
  addItem(title: string, icon: any, funct: Function, pressedIcon: any, style: any, factoryMethod: any): any {
    const img = document.createElement((!!icon) ? 'img' : 'button');
    const initialClassName = style || ((!!factoryMethod) ? 'mxToolbarMode' : 'mxToolbarItem');
    img.className = initialClassName;
    img.setAttribute('src', icon);
    if (!!title) {
      if (!!icon) {
        img.setAttribute('title', title);
      } else {
        mxUtils.write(img, title);
      }
    }
    this.container.appendChild(img);
    if (!!funct) {
      mxEvent.addListener(img, 'click', funct);
      if (mxClient.IS_TOUCH) {
        mxEvent.addListener(img, 'touchend', funct);
      }
    }
    const mouseHandler = (evt) => {
      if (!!pressedIcon) {
        img.setAttribute('src', icon);
      } else {
        img.style.backgroundColor = '';
      }
    };
    mxEvent.addGestureListeners(img, (evt) => {
      if (!!pressedIcon) {
        img.setAttribute('src', pressedIcon);
      } else {
        img.style.backgroundColor = 'gray';
      }
      if (!!factoryMethod) {
        if (!this.menu) {
          this.menu = new mxPopupMenu();
          this.menu.init();
        }
        const last = this.currentImg;
        if (this.menu.isMenuShowing()) {
          this.menu.hideMenu();
        }
        if (last != img) {
          this.currentImg = img;
          this.menu.factoryMethod = factoryMethod;
          const point = new mxPoint(img.offsetLeft, img.offsetTop + img.offsetHeight);
          this.menu.popup(point.x, point.y, null, evt);
          if (this.menu.isMenuShowing()) {
            img.className = initialClassName + 'Selected';
            this.menu.hideMenu = function () {
              mxPopupMenu.prototype.hideMenu.apply(this);
              img.className = initialClassName;
              this.currentImg = undefined;
            };
          }
        }
      }
    }, null, mouseHandler);
    mxEvent.addListener(img, 'mouseout', mouseHandler);
    return img;
  }

  /**
   * Function: addCombo
   *
   * Adds and returns a new SELECT element using the given style. The element
   * is placed inside a DIV with the mxToolbarComboContainer style classname.
   *
   * Parameters:
   *
   * style - Optional style classname. Default is mxToolbarCombo.
   */
  addCombo(style: any): any {
    const div = document.createElement('div');
    div.style.display = 'inline';
    div.className = 'mxToolbarComboContainer';
    const select = document.createElement('select');
    select.className = style || 'mxToolbarCombo';
    div.appendChild(select);
    this.container.appendChild(div);
    return select;
  }

  /**
   * Function: addCombo
   *
   * Adds and returns a new SELECT element using the given title as the
   * default element. The selection is reset to this element after each
   * change.
   *
   * Parameters:
   *
   * title - String that specifies the title of the default element.
   * style - Optional style classname. Default is mxToolbarCombo.
   */
  addActionCombo(title: string, style: any): any {
    const select = document.createElement('select');
    select.className = style || 'mxToolbarCombo';
    this.addOption(select, title, null);
    mxEvent.addListener(select, 'change', function (evt) {
      const value = select.options[select.selectedIndex];
      select.selectedIndex = 0;
      if (!!value.funct) {
        value.funct(evt);
      }
    });
    this.container.appendChild(select);
    return select;
  }

  /**
   * Function: addOption
   *
   * Adds and returns a new OPTION element inside the given SELECT element.
   * If the given value is a function then it is stored in the option's funct
   * field.
   *
   * Parameters:
   *
   * combo - SELECT element that will contain the new entry.
   * title - String that specifies the title of the option.
   * value - Specifies the value associated with this option.
   */
  addOption(combo: any, title: string, value: any): any {
    const option = document.createElement('option');
    mxUtils.writeln(option, title);
    if (typeof (value) == 'function') {
      option.funct = value;
    } else {
      option.setAttribute('value', value);
    }
    combo.appendChild(option);
    return option;
  }

  /**
   * Function: addSwitchMode
   *
   * Adds a new selectable item to the toolbar. Only one switch mode item may
   * be selected at a time. The currently selected item is the default item
   * after a reset of the toolbar.
   */
  addSwitchMode(title: string, icon: any, funct: Function, pressedIcon: any, style: any): any {
    const img = document.createElement('img');
    img.initialClassName = style || 'mxToolbarMode';
    img.className = img.initialClassName;
    img.setAttribute('src', icon);
    img.altIcon = pressedIcon;
    if (!!title) {
      img.setAttribute('title', title);
    }
    mxEvent.addListener(img, 'click', (evt) => {
      let tmp = this.selectedMode.altIcon;
      if (!!tmp) {
        this.selectedMode.altIcon = this.selectedMode.getAttribute('src');
        this.selectedMode.setAttribute('src', tmp);
      } else {
        this.selectedMode.className = this.selectedMode.initialClassName;
      }
      if (this.updateDefaultMode) {
        this.defaultMode = img;
      }
      this.selectedMode = img;
      const tmp = img.altIcon;
      if (!!tmp) {
        img.altIcon = img.getAttribute('src');
        img.setAttribute('src', tmp);
      } else {
        img.className = img.initialClassName + 'Selected';
      }
      this.fireEvent(new mxEventObject(mxEvent.SELECT));
      funct();
    });
    this.container.appendChild(img);
    if (!this.defaultMode) {
      this.defaultMode = img;
      this.selectMode(img);
      funct();
    }
    return img;
  }

  /**
   * Function: addMode
   *
   * Adds a new item to the toolbar. The selection is typically reset after
   * the item has been consumed, for example by adding a new vertex to the
   * graph. The reset is not carried out if the item is double clicked.
   *
   * The function argument uses the following signature: funct(evt, cell) where
   * evt is the native mouse event and cell is the cell under the mouse.
   */
  addMode(title: string, icon: any, funct: Function, pressedIcon: any, style: any, toggle: any): any {
    toggle = (!!toggle) ? toggle : true;
    const img = document.createElement((!!icon) ? 'img' : 'button');
    img.initialClassName = style || 'mxToolbarMode';
    img.className = img.initialClassName;
    img.setAttribute('src', icon);
    img.altIcon = pressedIcon;
    if (!!title) {
      img.setAttribute('title', title);
    }
    if (this.enabled && toggle) {
      mxEvent.addListener(img, 'click', (evt) => {
        this.selectMode(img, funct);
        this.noReset = false;
      });
      mxEvent.addListener(img, 'dblclick', (evt) => {
        this.selectMode(img, funct);
        this.noReset = true;
      });
      if (!this.defaultMode) {
        this.defaultMode = img;
        this.defaultFunction = funct;
        this.selectMode(img, funct);
      }
    }
    this.container.appendChild(img);
    return img;
  }

  /**
   * Function: selectMode
   *
   * Resets the state of the previously selected mode and displays the given
   * DOM node as selected. This function fires a select event with the given
   * function as a parameter.
   */
  selectMode(domNode: any, funct: Function): void {
    if (this.selectedMode != domNode) {
      if (!!this.selectedMode) {
        const tmp = this.selectedMode.altIcon;
        if (!!tmp) {
          this.selectedMode.altIcon = this.selectedMode.getAttribute('src');
          this.selectedMode.setAttribute('src', tmp);
        } else {
          this.selectedMode.className = this.selectedMode.initialClassName;
        }
      }
      this.selectedMode = domNode;
      const tmp = this.selectedMode.altIcon;
      if (!!tmp) {
        this.selectedMode.altIcon = this.selectedMode.getAttribute('src');
        this.selectedMode.setAttribute('src', tmp);
      } else {
        this.selectedMode.className = this.selectedMode.initialClassName + 'Selected';
      }
      this.fireEvent(new mxEventObject(mxEvent.SELECT, 'function', funct));
    }
  }

  /**
   * Function: resetMode
   *
   * Selects the default mode and resets the state of the previously selected
   * mode.
   */
  resetMode(forced: any): void {
    if ((forced || !this.noReset) && this.selectedMode != this.defaultMode) {
      this.selectMode(this.defaultMode, this.defaultFunction);
    }
  }

  /**
   * Function: addSeparator
   *
   * Adds the specifies image as a separator.
   *
   * Parameters:
   *
   * icon - URL of the separator icon.
   */
  addSeparator(icon: any): any {
    return this.addItem(null, icon, null);
  }

  /**
   * Function: addBreak
   *
   * Adds a break to the container.
   */
  addBreak(): void {
    mxUtils.br(this.container);
  }

  /**
   * Function: addLine
   *
   * Adds a horizontal line to the container.
   */
  addLine(): void {
    const hr = document.createElement('hr');
    hr.style.marginRight = '6px';
    hr.setAttribute('size', '1');
    this.container.appendChild(hr);
  }

  /**
   * Function: destroy
   *
   * Removes the toolbar and all its associated resources.
   */
  destroy(): void {
    mxEvent.release(this.container);
    this.container = undefined;
    this.defaultMode = undefined;
    this.defaultFunction = undefined;
    this.selectedMode = undefined;
    if (!!this.menu) {
      this.menu.destroy();
    }
  }
}
