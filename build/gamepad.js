(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

(function () {
  var haveEvents = "ongamepadconnected" in window;
  var controllers = {};
  var cooldownedButtons = [];

  var BUTTON = {
    A: 0,
    B: 1,
    X: 2,
    Y: 3,
    LB: 4,
    RB: 5,
    LT: 6,
    RT: 7,
    BACK: 8,
    START: 9,
    LEFTSTICK: 10,
    RIGHTSTICK: 11,
    DUP: 12,
    DDOWN: 13,
    DLEFT: 14,
    DRIGHT: 15
  };

  var AXIS = {
    LOX: 0,
    LOY: 1,
    ROX: 2,
    ROY: 3
  };

  var pointing = false;
  var pointer = document.createElement("div");
  pointer.style.position = "absolute";
  pointer.style.width = "1px";
  pointer.style.height = "1px";
  pointer.style.boxShadow = "0 0 7px 4px #f00";
  pointer.style.background = "#f00";
  pointer.style.top = 0;
  pointer.style.left = 0;
  pointer.style.zIndex = 99;
  pointer.style.borderRadius = "50%";
  pointer.style.display = "none";
  document.body.appendChild(pointer);

  function cooldown(b) {
    if (cooldownedButtons.indexOf(b) < 0) {
      cooldownedButtons.push(b);

      setTimeout(function () {
        cooldownedButtons = cooldownedButtons.filter(function (v) {
          return v !== b;
        });
      }, 500);

      return true;
    }

    return false;
  }

  function addgamepad(gamepad) {
    controllers[gamepad.index] = gamepad;

    requestAnimationFrame(updateStatus); // eslint-disable-line
  }

  function scangamepads() {
    var gamepads = navigator.getGamepads ? navigator.getGamepads() : navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []; // eslint-disable-line no-nested-ternary
    for (var i = 0; i < gamepads.length; i++) {
      if (gamepads[i]) {
        if (gamepads[i].index in controllers) {
          controllers[gamepads[i].index] = gamepads[i];
        } else {
          addgamepad(gamepads[i]);
        }
      }
    }
  }

  function updateStatus() {
    var i = 0;
    var j = void 0;

    if (!haveEvents) {
      scangamepads();
    }

    for (j in controllers) {
      if (Object.prototype.hasOwnProperty.call(controllers, j)) {
        var controller = controllers[j];

        for (i = 0; i < controller.buttons.length; i++) {
          var val = controller.buttons[i];
          var pressed = void 0;

          if ((typeof val === "undefined" ? "undefined" : _typeof(val)) === "object") {
            pressed = val.pressed;
          }

          if (pressed && cooldown("button-" + i)) {
            switch (i) {
              case BUTTON.A:
                if (Reveal.isOverview()) {
                  Reveal.toggleOverview();
                } else {
                  Reveal.next();
                }
                break;
              case BUTTON.B:
                Reveal.prev();
                break;
              case BUTTON.LB:
                Reveal.prev();
                break;
              case BUTTON.RB:
                Reveal.next();
                break;
              case BUTTON.LT:
                Reveal.left();
                break;
              case BUTTON.RT:
                Reveal.right();
                break;
              case BUTTON.BACK:
                Reveal.togglePause();
                break;
              case BUTTON.START:
                Reveal.toggleOverview();
                break;
              case BUTTON.DUP:
                Reveal.up();
                break;
              case BUTTON.DDOWN:
                Reveal.down();
                break;
              case BUTTON.DLEFT:
                Reveal.left();
                break;
              case BUTTON.DRIGHT:
                Reveal.right();
                break;
              case BUTTON.RIGHTSTICK:
                pointing = !pointing;
                pointer.style.display = pointing ? "block" : "none";
                break;
              default:
                console.log(i);
            }
          }
        }

        for (i = 0; i < controller.axes.length; i++) {
          var _val = controller.axes[i];

          if (Math.abs(_val) > 0.85 && !pointing) {
            if (cooldown("axis-" + i)) {
              switch (i) {
                case AXIS.LOX:
                  {
                    if (_val < 0) {
                      Reveal.left();
                    } else {
                      Reveal.right();
                    }
                    break;
                  }
                case AXIS.LOY:
                  {
                    if (_val < 0) {
                      Reveal.up();
                    } else {
                      Reveal.down();
                    }
                    break;
                  }

                // no default
              }
            }
          }

          if (Math.abs(_val) > 0.2 && pointing) {
            var fastMultiplier = 8;
            var left = pointer.style.left.replace("px", "") * 1;
            var top = pointer.style.top.replace("px", "") * 1;
            var constrainValue = function constrainValue(newVal) {
              return Math.min(Math.max(newVal, 0), window.innerWidth);
            };
            switch (i) {
              case AXIS.ROX:
                {
                  var newVal = _val * 2 + left;
                  pointer.style.left = constrainValue(newVal) + "px";
                  break;
                }
              case AXIS.ROY:
                {
                  var _newVal = _val * 2 + top;
                  pointer.style.top = constrainValue(_newVal) + "px";
                  break;
                }
              case AXIS.LOX:
                {
                  var _newVal2 = _val * fastMultiplier + left;
                  pointer.style.left = constrainValue(_newVal2) + "px";
                  break;
                }
              case AXIS.LOY:
                {
                  var _newVal3 = _val * fastMultiplier + top;
                  pointer.style.top = constrainValue(_newVal3) + "px";
                  break;
                }

              // no default
            }
          }
        }
      }
    }

    requestAnimationFrame(updateStatus);
  }

  function connecthandler(e) {
    addgamepad(e.gamepad);
  }

  function removegamepad(gamepad) {
    delete controllers[gamepad.index];
  }

  function disconnecthandler(e) {
    removegamepad(e.gamepad);
  }

  window.addEventListener("gamepadconnected", connecthandler);
  window.addEventListener("gamepaddisconnected", disconnecthandler);

  if (!haveEvents) {
    setInterval(scangamepads, 500);
  }
})();

},{}]},{},[1])

//# sourceMappingURL=gamepad.js.map
