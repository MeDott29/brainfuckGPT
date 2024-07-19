const BF_VOCAB = [">", "<", "+", "-", ".", ",", "[", "]"];
const VOCAB_SIZE = BF_VOCAB.length;
const CONTEXT_LENGTH = 16;

class BrainfuckGPT {
    constructor(embedSize = 64, numHeads = 4, numLayers = 4) {
        this.embedSize = embedSize;
        this.numHeads = numHeads;
        this.numLayers = numLayers;
        this.model = this.buildModel();
    }

    buildModel() {
        const input = tf.input({shape: [CONTEXT_LENGTH]});
        
        let x = tf.layers.embedding({
            inputDim: VOCAB_SIZE,
            outputDim: this.embedSize,
            inputLength: CONTEXT_LENGTH
        }).apply(input);

        const positionEncoding = this.getPositionEncoding(CONTEXT_LENGTH, this.embedSize);
        x = tf.add(x, positionEncoding);

        for (let i = 0; i < this.numLayers; i++) {
            x = this.transformerBlock(x);
        }

        const output = tf.layers.dense({units: VOCAB_SIZE}).apply(x);

        return tf.model({inputs: input, outputs: output});
    }

    transformerBlock(x) {
        const attn = this.multiHeadAttention(x, x, x);
        const out1 = tf.layers.layerNormalization().apply(tf.add(x, attn));
        const ffn = this.feedForwardNetwork(out1);
        return tf.layers.layerNormalization().apply(tf.add(out1, ffn));
    }

    multiHeadAttention(q, k, v) {
        const multiHead = tf.layers.multiHeadAttention({
            numHeads: this.numHeads,
            keyDim: this.embedSize / this.numHeads
        });
        return multiHead.apply([q, k, v]);
    }

    feedForwardNetwork(x) {
        const hidden = tf.layers.dense({
            units: this.embedSize * 4,
            activation: 'relu'
        }).apply(x);
        return tf.layers.dense({units: this.embedSize}).apply(hidden);
    }

    getPositionEncoding(maxLen, dModel) {
        const positionEncoding = new Array(maxLen).fill(0).map((_, pos) => {
            return new Array(dModel).fill(0).map((_, i) => {
                if (i % 2 === 0) {
                    return Math.sin(pos / Math.pow(10000, i / dModel));
                } else {
                    return Math.cos(pos / Math.pow(10000, (i - 1) / dModel));
                }
            });
        });
        return tf.tensor(positionEncoding);
    }

    async train(dataset, epochs = 10, batchSize = 32) {
        const optimizer = tf.train.adam();
        this.model.compile({
            optimizer: optimizer,
            loss: 'categoricalCrossentropy',
            metrics: ['accuracy']
        });

        const history = await this.model.fit(dataset.xs, dataset.ys, {
            epochs: epochs,
            batchSize: batchSize,
            callbacks: tf.callbacks.earlyStopping({monitor: 'val_loss', patience: 3})
        });

        return history;
    }

    async generate(startSequence, numSteps = 5) {
        let currentSequence = startSequence.padStart(CONTEXT_LENGTH, BF_VOCAB[0]);
        
        for (let i = 0; i < numSteps; i++) {
            const input = tf.tensor2d([currentSequence.split('').map(char => BF_VOCAB.indexOf(char))]);
            const prediction = this.model.predict(input);
            const nextTokenIndex = tf.argMax(prediction.slice([0, prediction.shape[1] - 1]), 1).dataSync()[0];
            currentSequence = currentSequence.slice(1) + BF_VOCAB[nextTokenIndex];
        }

        return currentSequence.slice(-numSteps);
    }
}

function createDataset(brainfuckCode, sequenceLength = CONTEXT_LENGTH) {
    const xs = [];
    const ys = [];

    for (let i = 0; i < brainfuckCode.length - sequenceLength; i++) {
        const sequence = brainfuckCode.slice(i, i + sequenceLength);
        const nextChar = brainfuckCode[i + sequenceLength];

        xs.push(sequence.split('').map(char => BF_VOCAB.indexOf(char)));
        ys.push(BF_VOCAB.indexOf(nextChar));
    }

    return {
        xs: tf.tensor2d(xs),
        ys: tf.oneHot(tf.tensor1d(ys, 'int32'), VOCAB_SIZE)
    };
}
