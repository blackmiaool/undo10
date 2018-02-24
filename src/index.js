const  Emitter = require('emitter');

// emit: canUndo cantUndo canRedo cantRedo
class Undo extends Emitter{
    constructor({ data }) {
        this.commands = {};
        this.history = [];
        this.stackPosition = 0;
        this.data = data;
        this.undoState=false;
        this.redoState=false;
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
        if(!this.canUndo()){
            this.undoState=false;
            this.emit('cantUndo');
        }
        if(!this.redoState){
            this.redoState=true;
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

        if(!this.canRedo()){
            this.redoState=false;
            this.emit('cantRedo');
        }
        if(!this.undoState){
            this.undoState=true;
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

export default Undo;
