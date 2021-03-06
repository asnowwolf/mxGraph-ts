/**
 * Class: mxPanningManager
 *
 * Implements a handler for panning.
 */
import { mxEvent } from './mxEvent';
import { mxEventObject } from './mxEventObject';
import { mxUtils } from './mxUtils';

export class mxPanningManager {
  constructor(graph: mxGraph) {
    this.thread = undefined;
    this.active = false;
    this.tdx = 0;
    this.tdy = 0;
    this.t0x = 0;
    this.t0y = 0;
    this.dx = 0;
    this.dy = 0;
    this.scrollbars = false;
    this.scrollLeft = 0;
    this.scrollTop = 0;
    this.mouseListener = {
      mouseDown(sender, me) {
      }, mouseMove(sender, me) {
      }, mouseUp: (sender, me) => {
        if (this.active) {
          this.stop();
        }
      },
    };
    graph.addMouseListener(this.mouseListener);
    this.mouseUpListener = () => {
      if (this.active) {
        this.stop();
      }
    };
    mxEvent.addListener(document, 'mouseup', this.mouseUpListener);
    const createThread = () => {
      this.scrollbars = mxUtils.hasScrollbars(graph.container);
      this.scrollLeft = graph.container.scrollLeft;
      this.scrollTop = graph.container.scrollTop;
      return window.setInterval(mxUtils.bind(this, function () {
        this.tdx -= this.dx;
        this.tdy -= this.dy;
        if (this.scrollbars) {
          const left = -graph.container.scrollLeft - Math.ceil(this.dx);
          const top = -graph.container.scrollTop - Math.ceil(this.dy);
          graph.panGraph(left, top);
          graph.panDx = this.scrollLeft - graph.container.scrollLeft;
          graph.panDy = this.scrollTop - graph.container.scrollTop;
          graph.fireEvent(new mxEventObject(mxEvent.PAN));
        } else {
          graph.panGraph(this.getDx(), this.getDy());
        }
      }, this.delay);
    };
  )
  ;

  this;
.
  this;
  this;
.
  this;
  this;
.
  this;
  this;
.
  isActive = function () {
      return active;
    };

  getDx = function () {
      return Math.round(this.tdx);
  };
.
  getDy = function () {
      return Math.round(this.tdy);
    };

  start = function () {
      this.t0x = graph.view.translate.x;
      this.t0y = graph.view.translate.y;
      this.active = true;
  };
.
  panTo = function (x, y, w, h) {
      if (!this.active) {
        this.start();
      }
      this.scrollLeft = graph.container.scrollLeft;
      this.scrollTop = graph.container.scrollTop;
      w = (!!w) ? w : 0;
      h = (!!h) ? h : 0;
      const c = graph.container;
      this.dx = x + w - c.scrollLeft - c.clientWidth;
      if (this.dx < 0 && Math.abs(this.dx) < this.border) {
        this.dx = this.border + this.dx;
      } else if (this.handleMouseOut) {
        this.dx = Math.max(this.dx, 0);
      } else {
        this.dx = 0;
      }
      if (this.dx == 0) {
        this.dx = x - c.scrollLeft;
        if (this.dx > 0 && this.dx < this.border) {
          this.dx = this.dx - this.border;
        } else if (this.handleMouseOut) {
          this.dx = Math.min(0, this.dx);
        } else {
          this.dx = 0;
        }
      }
      this.dy = y + h - c.scrollTop - c.clientHeight;
      if (this.dy < 0 && Math.abs(this.dy) < this.border) {
        this.dy = this.border + this.dy;
      } else if (this.handleMouseOut) {
        this.dy = Math.max(this.dy, 0);
      } else {
        this.dy = 0;
      }
      if (this.dy == 0) {
        this.dy = y - c.scrollTop;
        if (this.dy > 0 && this.dy < this.border) {
          this.dy = this.dy - this.border;
        } else if (this.handleMouseOut) {
          this.dy = Math.min(0, this.dy);
        } else {
          this.dy = 0;
        }
      }
      if (this.dx != 0 || this.dy != 0) {
        this.dx *= this.damper;
        this.dy *= this.damper;
        if (!this.thread) {
          this.thread = createThread();
        }
      } else if (!!this.thread) {
        window.clearInterval(this.thread);
        this.thread = undefined;
      }
    };

  stop = function () {
      if (this.active) {
        this.active = false;
        if (!!this.thread) {
          window.clearInterval(this.thread);
          this.thread = undefined;
        }
        this.tdx = 0;
        this.tdy = 0;
        if (!this.scrollbars) {
          const px = graph.panDx;
          const py = graph.panDy;
          if (px != 0 || py != 0) {
            graph.panGraph(0, 0);
            graph.view.setTranslate(this.t0x + px / graph.view.scale, this.t0y + py / graph.view.scale);
          }
        } else {
          graph.panDx = 0;
          graph.panDy = 0;
          graph.fireEvent(new mxEventObject(mxEvent.PAN));
        }
      }
  };
.
  destroy = function () {
      graph.removeMouseListener(this.mouseListener);
      mxEvent.removeListener(document, 'mouseup', this.mouseUpListener);
    };
  }

any;
boolean;
number;
number;
number;
number;
number;
number;
boolean;
number;
number;
object;
Function;
  /**
   * Variable: damper
   *
   * Damper value for the panning. Default is 1/6.
   */
  any;
  /**
   * Variable: delay
   *
   * Delay in milliseconds for the panning. Default is 10.
   * @example 10
   */
  number;
  /**
   * Variable: handleMouseOut
   *
   * Specifies if mouse events outside of the component should be handled. Default is true.
   * @example true
   */
  boolean;
  /**
   * Variable: border
   *
   * Border to handle automatic panning inside the component. Default is 0 (disabled).
   */
  number;

isActive();
:
boolean;
{
    return active;
  }

getDx();
:
any;
{
    return Math.round(this.tdx);
  }

getDy();
:
any;
{
    return Math.round(this.tdy);
  }

start();
:
void {
    this.t0x = graph.view.translate.x;
    this.t0y = graph.view.translate.y;
    this.active = true;
  }

panTo(x;
:
number, y;
:
number, w;
:
number, h;
:
number;
):
void {
  if(!;
this.active;
)
{
      this.start();
    }
    this.scrollLeft = graph.container.scrollLeft;
    this.scrollTop = graph.container.scrollTop;
    w = (!!w) ? w : 0;
    h = (!!h) ? h : 0;
    const c = graph.container;
    this.dx = x + w - c.scrollLeft - c.clientWidth;
    if (this.dx < 0 && Math.abs(this.dx) < this.border) {
      this.dx = this.border + this.dx;
    } else if (this.handleMouseOut) {
      this.dx = Math.max(this.dx, 0);
    } else {
      this.dx = 0;
    }
    if (this.dx == 0) {
      this.dx = x - c.scrollLeft;
      if (this.dx > 0 && this.dx < this.border) {
        this.dx = this.dx - this.border;
      } else if (this.handleMouseOut) {
        this.dx = Math.min(0, this.dx);
      } else {
        this.dx = 0;
      }
    }
    this.dy = y + h - c.scrollTop - c.clientHeight;
    if (this.dy < 0 && Math.abs(this.dy) < this.border) {
      this.dy = this.border + this.dy;
    } else if (this.handleMouseOut) {
      this.dy = Math.max(this.dy, 0);
    } else {
      this.dy = 0;
    }
    if (this.dy == 0) {
      this.dy = y - c.scrollTop;
      if (this.dy > 0 && this.dy < this.border) {
        this.dy = this.dy - this.border;
      } else if (this.handleMouseOut) {
        this.dy = Math.min(0, this.dy);
      } else {
        this.dy = 0;
      }
    }
    if (this.dx != 0 || this.dy != 0) {
      this.dx *= this.damper;
      this.dy *= this.damper;
      if (!this.thread) {
        this.thread = createThread();
      }
    } else if (!!this.thread) {
      window.clearInterval(this.thread);
      this.thread = undefined;
    }
  }

stop();
:
void {
  if(this.active;
)
{
      this.active = false;
      if (!!this.thread) {
        window.clearInterval(this.thread);
        this.thread = undefined;
      }
      this.tdx = 0;
      this.tdy = 0;
      if (!this.scrollbars) {
        const px = graph.panDx;
        const py = graph.panDy;
        if (px != 0 || py != 0) {
          graph.panGraph(0, 0);
          graph.view.setTranslate(this.t0x + px / graph.view.scale, this.t0y + py / graph.view.scale);
        }
      } else {
        graph.panDx = 0;
        graph.panDy = 0;
        graph.fireEvent(new mxEventObject(mxEvent.PAN));
      }
    }
  }

destroy();
:
void {
    graph.removeMouseListener(this.mouseListener);
    mxEvent.removeListener(document, 'mouseup', this.mouseUpListener);
  }
}
