# undo10

```javascript
import Undo10 from 'Undo10';

const undo = new Undo10({
    data: [1, 2, 3]
});
undo.register({
    name: "delete line",
    exec(lineNum) {
        const line = this.data.splice(lineNum, 1);
        return line;
    },
    undo(lineNum, line) {
        this.data.splice(lineNum, 0, ...line);
    }
});
undo.exec("delete line", 2);
console.log(undo);
```