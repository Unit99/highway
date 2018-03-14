/**
 * @license
 * Highway - Dogstudio
 *
 * Copyright 2018 Dogstudio.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:

 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.

 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/**
 * @file Highway default renderer that handle DOM stuffs.
 * @author Anthony Du Pont <bulldog@dogstudio.co>
 */
class RouterRenderer {

  /**
   * @arg {object} view — [router-view] Node
   * @arg {string} title — Page title
   * @arg {string} transition — Page transition
   * @constructor
   */
  constructor(view, title, transition) {
    // The [router-view] and the page title are the only main information we need
    // since the role of the renderer is to update the required DOM elements with
    // the page informations. In our case the content and title of the document.
    this.view = view;
    this.title = title;
    this.transition = transition;

    if (title && document.title !== title) {
      document.title = title;
    }

    // The [router-wrapper] is the main container of the router and the ancestor of our 
    // [router-view] that let us now where to remove of append our view in the DOM.
    // Everything outside of the [router-wrapper] is invisible for the router and
    // it should only contain the [router-view] and nothing else.
    this.wrapper = null;
  }

  /**
   * Add the view in DOM and play an `in` transition if one is defined.
   * 
   * @return {object} Promise
   */
  show() {
    return new Promise(resolve => {
      this.wrapper = document.querySelector('[router-wrapper]');

      // Before doing anything crazy you need to know your view doesn't exists
      // in the [router-wrapper] so it is appended to it right now!
      this.wrapper.appendChild(this.view);

      // The `onEnter` method if set in your custom renderer is called everytime
      // the view is appended to the DOM. This let you do some crazy stuffs at
      // this right moment.
      if (this.onEnter) {
        this.onEnter();
      }

      // Use of a callback method to optimize lines of code.
      const callback = () => {
        // The `onEnterCompleted` method if set in your custom renderer is called 
        // everytime a transition is over if set. Otherwise it's called right after
        // the `onEnter` method.
        if (this.onEnterCompleted) {
          this.onEnterCompleted();
        }
        resolve();
      };

      // You fool you didn't define any transition...
      if (!this.transition) {
        callback();
        return;
      }

      // The transition is set in your custom renderer with a getter called
      // `transition` that should return the transition object you want to 
      // apply to you view. We call the `in` step of this one right now!
      this.transition.in(this.view, callback);
    });
  }

  /**
   * Play an `out` transition if one is defined and remove the view from DOM.
   * 
   * @return {object} Promise
   */
  hide() {
    return new Promise(resolve => {
      this.wrapper = this.view.parentNode;

      // The `onLeave` method if set in your custom renderer is called everytime
      // before a view will be removed from the DOM. This let you do some stuffs
      // right before the view isn't available anymore.
      if (this.onLeave) {
        this.onLeave();
      }

      // Use of a callback method to optimize lines of code.
      const callback = () => {
        // It's time to say goodbye to the view... Farewell my friend.
        this.wrapper.removeChild(this.view);

        // The `onLeaveCompleted` method if set in your custom renderer is called 
        // everytime a view is completely removed from the DOM.
        if (this.onLeaveCompleted) {
          this.onLeaveCompleted();
        }
        resolve();
      };

      // You fool you didn't define any transition...
      if (!this.transition) {
        callback();
        return;
      }

      // We call the `out` step of your transition right now!
      this.transition.out(this.view, callback);
    });
  }
}

export default RouterRenderer;