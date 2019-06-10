"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var ExportUtil = _interopRequireWildcard(require("./ExportUtil"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var CSSOptimizer =
/*#__PURE__*/
function () {
  function CSSOptimizer() {
    _classCallCheck(this, CSSOptimizer);

    /**
     *  Keep the order to collapsed Order: top-left corner, top-right,  bottom-left corners, bottom-right
     */
    this.borderRadius = ["borderTopLeftRadius", "borderTopRightRadius", "borderBottomLeftRadius", "borderBottomRightRadius"];
    /**
    * Order: top, right, bottom, left
    */

    this.borderWidth = ["borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth"];
    this.borderStyle = ['borderTopStyle', 'borderRightStyle', 'borderBottomStyle', 'borderLeftStyle'];
    this.borderColor = ['borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor'];
    this.padding = ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'];
  }

  _createClass(CSSOptimizer, [{
    key: "runFlat",
    value: function runFlat(model) {
      model = ExportUtil.clone(model);

      if (model.templates) {
        this.compressList(model.templates);
      }

      this.compressList(model.screens);
      this.compressList(model.widgets);
      return model;
    }
  }, {
    key: "runTree",
    value: function runTree(model) {
      var _this = this;

      /**
      * Generate the template styles
      */
      model.templates.forEach(function (template) {
        template.style = _this.compress(template.style, template);
      });
      /**
       * Generate styles for each screen. The templates styles
       * might here be reused!
       */

      model.screens.forEach(function (screen) {
        screen.style = _this.compress(screen.style, screen);
        screen.children.forEach(function (child) {
          _this.compressChildren(child);
        });
      });
      return model;
    }
  }, {
    key: "compressChildren",
    value: function compressChildren(element) {
      var _this2 = this;

      element.style = this.compress(element.style, element, false);

      if (element.children) {
        element.children.forEach(function (child) {
          _this2.compressChildren(child);
        });
      }
    }
  }, {
    key: "compressList",
    value: function compressList(list) {
      var _this3 = this;

      Object.values(list).forEach(function (item) {
        item.style = _this3.compress(item.style, item);
      });
    }
  }, {
    key: "compress",
    value: function compress(style) {
      /**
       * TODOD: We have to convert the padding in here alreadz to box model. For now
       * we need the correct box model in the css factory...
       */
      // this.resizeToBoxModel(element)
      // this.compressAttribes(style, this.padding, 'padding', 'px', 0)

      /**
       * Compress and collapse border
       */
      this.compressAttribes(style, this.borderRadius, 'borderRadius', 'px', 0);
      var borderIsEqual = this.compressAttribes(style, this.borderColor, 'borderColor', false, 'transparent');
      var widthIsEqual = this.compressAttribes(style, this.borderWidth, 'borderWidth', 'px', 0);
      var styleIsEqual = this.compressAttribes(style, this.borderStyle, 'borderStyle', false, 'solid');
      /**
       * Merge borders of possible
       */

      if (borderIsEqual && widthIsEqual && styleIsEqual) {
        style.border = "".concat(style.borderWidth, " ").concat(style.borderStyle, " ").concat(style.borderColor);
        delete style.borderColor;
        delete style.borderWidth;
        delete style.borderStyle;
      }
      /**
       * Remove defaults for the all equal case
       */


      if (style.borderStyle === 'solid solid solid solid') {
        delete style.borderStyle;
      }

      if (style.borderStyle === 'solid') {
        delete style.borderStyle;
      }

      if (style.border === '0px solid transparent') {
        delete style.border;
      }

      if (style.padding === '0px') {
        delete style.padding;
      }

      return style;
    }
  }, {
    key: "resizeToBoxModel",
    value: function resizeToBoxModel(widget) {
      console.debug('CSSOptimizer.resizeToBoxModel()');

      if (widget.style) {
        if (widget.style.paddingTop) {
          widget.h -= widget.style.paddingTop;
        }

        if (widget.style.paddingBottom) {
          widget.h -= widget.style.paddingBottom;
        }

        if (widget.style.paddingLeft) {
          widget.w -= widget.style.paddingLeft;
        }

        if (widget.style.paddingRight) {
          widget.w -= widget.style.paddingRight;
        }

        if (widget.style.borderTopWidth) {
          widget.h -= widget.style.borderTopWidth;
        }

        if (widget.style.borderBottomWidth) {
          widget.h -= widget.style.borderBottomWidth;
        }

        if (widget.style.borderLeftWidth) {
          widget.w -= widget.style.borderLeftWidth;
        }

        if (widget.style.borderRightWidth) {
          widget.w -= widget.style.borderRightWidth;
        }
      }

      return widget;
    }
  }, {
    key: "compressAttribes",
    value: function compressAttribes(style, keys, prop, unit, defaultValue) {
      /**
       * Check if we have all the same
       */
      var firstValue = style[keys[0]];

      if (keys.every(function (key) {
        return style[key] === firstValue;
      })) {
        if (firstValue === undefined || firstValue === null) {
          firstValue = defaultValue;
        }

        if (unit) {
          firstValue += unit;
        }

        keys.forEach(function (key) {
          delete style[key];
        });
        style[prop] = firstValue;
        return true;
      } else {
        var values = [];
        keys.forEach(function (key) {
          var value = style[key];

          if (value === undefined || value === null) {
            value = defaultValue;
          }

          if (unit) {
            value += unit;
          }

          values.push(value);
          delete style[key];
        });
        style[prop] = values.join(' ');
        return false;
      }
    }
  }]);

  return CSSOptimizer;
}();

exports["default"] = CSSOptimizer;