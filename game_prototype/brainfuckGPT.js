const VOCAB = ['+', '-', '<', '>', '[', ']', '.', ','];
const SEQUENCE_LENGTH = 50;

class BrainfuckGPT {
    constructor() {
        this.model = null;
    }

    async buildModel() {
        try {
            const model = tf.sequential();
            model.add(tf.layers.lstm({
                units: 128,
                inputShape: [SEQUENCE_LENGTH, VOCAB.length],
                returnSequences: true
            }));
            model.add(tf.layers.dense({units: VOCAB.length, activation: 'softmax'}));
            
            await model.compile({
                optimizer: 'adam',
                loss: 'categoricalCrossentropy',
                metrics: ['accuracy']
            });
            
            this.model = model;
            console.log('Model built successfully');
        } catch (error) {
            console.error('Error building model:', error);
            throw error;
        }
    }

    async train(dataset, epochs = 10) {
        if (!this.model) {
            console.log('Model not built, building now...');
            await this.buildModel();
        }
        
        const paddedDataset = dataset.map(s => s.padEnd(SEQUENCE_LENGTH, '.').slice(0, SEQUENCE_LENGTH));
        
        const xs = tf.tensor3d(paddedDataset.map(s => 
            s.split('').map(c => {
                const arr = new Array(VOCAB.length).fill(0);
                arr[VOCAB.indexOf(c)] = 1;
                return arr;
            })
        ));

        const ys = tf.tensor3d(paddedDataset.map(s => 
            s.split('').slice(1).concat('.').map(c => {
                const arr = new Array(VOCAB.length).fill(0);
                arr[VOCAB.indexOf(c)] = 1;
                return arr;
            })
        ));

        console.log('Starting model training...');
        await this.model.fit(xs, ys, {
            epochs: epochs,
            batchSize: 1,
            shuffle: true,
            callbacks: {
                onEpochEnd: (epoch, logs) => {
                    console.log(`Epoch ${epoch + 1}: loss = ${logs.loss.toFixed(4)}`);
                }
            }
        });
        console.log('Model training completed');
    }

    async generate(seed, length = SEQUENCE_LENGTH) {
        if (!this.model) throw new Error("Model not trained");

        let current = seed.padEnd(SEQUENCE_LENGTH, '.').slice(-SEQUENCE_LENGTH);
        let generated = '';

        for (let i = 0; i < length; i++) {
            const input = tf.tensor3d([current.split('').map(c => {
                const arr = new Array(VOCAB.length).fill(0);
                arr[VOCAB.indexOf(c)] = 1;
                return arr;
            })]);
            
            const prediction = await this.model.predict(input);
            const nextIndex = tf.argMax(prediction.slice([0, prediction.shape[1]-1, 0], [1, 1, -1])).dataSync()[0];
            const nextChar = VOCAB[nextIndex];
            
            generated += nextChar;
            current = (current + nextChar).slice(-SEQUENCE_LENGTH);
        }

        return generated;
    }

    interpretOutput(output) {
        const actions = [];
        for (let char of output) {
            switch (char) {
                case '+': actions.push('right'); break;
                case '-': actions.push('left'); break;
                case '>': actions.push('jump'); break;
            }
        }
        return actions;
    }
}

// Make BrainfuckGPT available globally
window.BrainfuckGPT = BrainfuckGPT;