class Emitter {
    constructor() {
        this._callbacks = {};
    }
    on(event, fn) {
        this._callbacks[event] = this.listeners(event);
        this._callbacks[event].push(fn);
        return this;
    }
    once(event, fn) {
        function on() {
            this.off(event, on);
            fn.apply(undefined, arguments);
        }

        on.fn = fn;
        this.on(event, on);
        return this;
    }
    off(event, fn) {
        if (arguments.length === 0) {
            this._callbacks = {};
            return this;
        }
        const callbacks = this.listeners(event);
        if (!callbacks.length) { return this; }

        if (!fn) {
            delete this._callbacks[event];
            return this;
        }

        let cb;
        callbacks.some((cb, i) => {
            if (cb === fn || cb.fn === fn) {
                callbacks.splice(i, 1);
                return true;
            }
        });
        return this;
    }
    emit(event, ...args) {
        this.listeners(event).forEach((callback) => {
            callback.apply(undefined, args);
        });
        return this;
    }
}
// emit: canUndo cantUndo canRedo cantRedo
class Undo10 extends Emitter {
    constructor({ data }) {
        super();
        this.commands = {};
        this.history = [];
        this.stackPosition = 0;
        this.data = data;
        this.undoState = false;
        this.redoState = false;
    }
    setCurrentRecord(record) {
        this.history[this.stackPosition - 1] = record;
    }
    getCurrentRecord() {
        return this.history[this.stackPosition - 1];
    }
    exec(commandName, arg) {
        const command = this.commands[commandName];
        const result = command.exec.call(this, arg);
        this.stackPosition++;
        this.setCurrentRecord({ commandName, arg, result });
        this.history.splice(this.stackPosition);
    }
    undo() {
        if (!this.canUndo()) {
            return;
        }
        const record = this.getCurrentRecord();
        const command = this.commands[record.commandName];
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
    canUndo() {
        return this.stackPosition > 0;
    }
    redo() {
        if (!this.canRedo()) {
            return;
        }
        this.stackPosition++;
        const record = this.getCurrentRecord();
        const command = this.commands[record.commandName];
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
    canRedo() {
        return this.stackPosition < this.history.length;
    }
    register(command) {
        this.commands[command.name] = command;
        return this;
    }
}
if (typeof module !== 'undefined') {
    module.exports = Undo10;
}

export default Undo10;
