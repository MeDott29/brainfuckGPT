class BrainfuckInterpreter {
    constructor(memorySize = 30000) {
        this.memory = new Array(memorySize).fill(0);
        this.pointer = 0;
        this.output = "";
    }

    interpret(code) {
        let i = 0;
        const codeLength = code.length;
        const loopStack = [];

        while (i < codeLength) {
            switch (code[i]) {
                case '>':
                    this.pointer = (this.pointer + 1) % this.memory.length;
                    break;
                case '<':
                    this.pointer = (this.pointer - 1 + this.memory.length) % this.memory.length;
                    break;
                case '+':
                    this.memory[this.pointer] = (this.memory[this.pointer] + 1) % 256;
                    break;
                case '-':
                    this.memory[this.pointer] = (this.memory[this.pointer] - 1 + 256) % 256;
                    break;
                case '.':
                    this.output += String.fromCharCode(this.memory[this.pointer]);
                    break;
                case ',':
                    // Input is not implemented in this version
                    break;
                case '[':
                    if (this.memory[this.pointer] === 0) {
                        let loopCount = 1;
                        while (loopCount > 0) {
                            i++;
                            if (code[i] === '[') loopCount++;
                            if (code[i] === ']') loopCount--;
                        }
                    } else {
                        loopStack.push(i);
                    }
                    break;
                case ']':
                    if (this.memory[this.pointer] !== 0) {
                        i = loopStack[loopStack.length - 1];
                    } else {
                        loopStack.pop();
                    }
                    break;
            }
            i++;
            updateMemoryVisualization(this.memory, this.pointer);
        }

        return this.output;
    }
}
