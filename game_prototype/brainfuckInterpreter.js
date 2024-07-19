class BrainfuckInterpreter {
    constructor() {
        this.memory = new Array(30000).fill(0);
        this.pointer = 0;
        this.output = '';
    }

    interpret(code) {
        let i = 0;
        while (i < code.length) {
            switch (code[i]) {
                case '>': this.pointer = (this.pointer + 1) % this.memory.length; break;
                case '<': this.pointer = (this.pointer - 1 + this.memory.length) % this.memory.length; break;
                case '+': this.memory[this.pointer] = (this.memory[this.pointer] + 1) % 256; break;
                case '-': this.memory[this.pointer] = (this.memory[this.pointer] - 1 + 256) % 256; break;
                case '.': this.output += String.fromCharCode(this.memory[this.pointer]); break;
                case '[':
                    if (this.memory[this.pointer] === 0) {
                        let loopCount = 1;
                        while (loopCount > 0) {
                            i++;
                            if (code[i] === '[') loopCount++;
                            if (code[i] === ']') loopCount--;
                        }
                    }
                    break;
                case ']':
                    if (this.memory[this.pointer] !== 0) {
                        let loopCount = 1;
                        while (loopCount > 0) {
                            i--;
                            if (code[i] === ']') loopCount++;
                            if (code[i] === '[') loopCount--;
                        }
                    }
                    break;
            }
            i++;
        }
        return this.output;
    }
}