(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define('Undo10', ['module', 'exports'], factory);
    } else if (typeof exports !== "undefined") {
        factory(module, exports);
    } else {
        var mod = {
            exports: {}
        };
        factory(mod, mod.exports);
        global.Undo10 = mod.exports;
    }
})(this, function (module, exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    function _possibleConstructorReturn(self, call) {
        if (!self) {
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        }

        return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }

    function _inherits(subClass, superClass) {
        if (typeof superClass !== "function" && superClass !== null) {
            throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
        }

        subClass.prototype = Object.create(superClass && superClass.prototype, {
            constructor: {
                value: subClass,
                enumerable: false,
                writable: true,
                configurable: true
            }
        });
        if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _createClass = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

    var Emitter = function () {
        function Emitter() {
            _classCallCheck(this, Emitter);

            this._callbacks = {};
        }

        _createClass(Emitter, [{
            key: 'on',
            value: function on(event, fn) {
                this._callbacks[event] = this.listeners(event);
                this._callbacks[event].push(fn);
                return this;
            }
        }, {
            key: 'once',
            value: function once(event, fn) {
                function on() {
                    this.off(event, on);
                    fn.apply(undefined, arguments);
                }

                on.fn = fn;
                this.on(event, on);
                return this;
            }
        }, {
            key: 'off',
            value: function off(event, fn) {
                if (arguments.length === 0) {
                    this._callbacks = {};
                    return this;
                }
                var callbacks = this.listeners(event);
                if (!callbacks.length) {
                    return this;
                }

                if (!fn) {
                    delete this._callbacks[event];
                    return this;
                }

                var cb = void 0;
                callbacks.some(function (cb, i) {
                    if (cb === fn || cb.fn === fn) {
                        callbacks.splice(i, 1);
                        return true;
                    }
                });
                return this;
            }
        }, {
            key: 'emit',
            value: function emit(event) {
                for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                    args[_key - 1] = arguments[_key];
                }

                this.listeners(event).forEach(function (callback) {
                    callback.apply(undefined, args);
                });
                return this;
            }
        }]);

        return Emitter;
    }();

    var Undo10 = function (_Emitter) {
        _inherits(Undo10, _Emitter);

        function Undo10(_ref) {
            var data = _ref.data;

            _classCallCheck(this, Undo10);

            var _this = _possibleConstructorReturn(this, (Undo10.__proto__ || Object.getPrototypeOf(Undo10)).call(this));

            _this.commands = {};
            _this.history = [];
            _this.stackPosition = 0;
            _this.data = data;
            _this.undoState = false;
            _this.redoState = false;
            return _this;
        }

        _createClass(Undo10, [{
            key: 'setCurrentRecord',
            value: function setCurrentRecord(record) {
                this.history[this.stackPosition - 1] = record;
            }
        }, {
            key: 'getCurrentRecord',
            value: function getCurrentRecord() {
                return this.history[this.stackPosition - 1];
            }
        }, {
            key: 'exec',
            value: function exec(commandName, arg) {
                var command = this.commands[commandName];
                var result = command.exec.call(this, arg);
                this.stackPosition++;
                this.setCurrentRecord({ commandName: commandName, arg: arg, result: result });
                this.history.splice(this.stackPosition);
            }
        }, {
            key: 'undo',
            value: function undo() {
                if (!this.canUndo()) {
                    return;
                }
                var record = this.getCurrentRecord();
                var command = this.commands[record.commandName];
                command.undo.call(this, record.arg, record.result);
                this.stackPosition--;
                if (!this.canUndo()) {
                    this.undoState = false;
                    this.emit('cantUndo');
                }
                if (!this.redoState) {
                    this.redoState = true;
                    this.emit('canRedo');
                }
            }
        }, {
            key: 'canUndo',
            value: function canUndo() {
                return this.stackPosition > 0;
            }
        }, {
            key: 'redo',
            value: function redo() {
                if (!this.canRedo()) {
                    return;
                }
                this.stackPosition++;
                var record = this.getCurrentRecord();
                var command = this.commands[record.commandName];
                command.exec.call(this, record.arg, record.result);

                if (!this.canRedo()) {
                    this.redoState = false;
                    this.emit('cantRedo');
                }
                if (!this.undoState) {
                    this.undoState = true;
                    this.emit('canUndo');
                }
            }
        }, {
            key: 'canRedo',
            value: function canRedo() {
                return this.stackPosition < this.history.length;
            }
        }, {
            key: 'register',
            value: function register(command) {
                this.commands[command.name] = command;
                return this;
            }
        }]);

        return Undo10;
    }(Emitter);

    if (typeof module !== 'undefined') {
        module.exports = Undo10;
    }

    exports.default = Undo10;
});
