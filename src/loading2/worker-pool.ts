
// Create enums for different types of workers
export enum WorkerType {
	DECODER_WORKER = 'DECODER_WORKER',
	DECODER_WORKER_GLTF = 'DECODER_WORKER_GLTF',
	DECODER_WORKER_SPLATS = 'DECODER_WORKER_SPLATS',
}

// Worker JS names: 'BinaryDecoderWorker.js', 'DEMWorker.js', 'EptBinaryDecoderWorker.js', 'EptLaszipDecoderWorker.js',
// EptZstandardDecoder_preamble.js', 'EptZstandardDecoderWorker.js', 'LASDecoderWorker.js', 'LASLAZWorker.js', 'LazLoaderWorker.js'

function createWorker(type: WorkerType): Worker {
	// console.log(type)
	switch (type) {
	case WorkerType.DECODER_WORKER: {
		const DecoderWorker = require('./decoder.worker.js').default;
		return new DecoderWorker();
	}
	case WorkerType.DECODER_WORKER_GLTF: {
		const DecoderWorker_GLTF = require('./gltf-decoder.worker.js').default;
		return new DecoderWorker_GLTF();
	}
	case WorkerType.DECODER_WORKER_SPLATS: {
		const DecoderWorker_GLTF = require('./gltf-splats-decoder.worker.js').default;
		return new DecoderWorker_GLTF();
	}
	default:
		throw new Error('Unknown worker type');
	}
}

export class WorkerPool {
	// Workers will be an object that has a key for each worker type and the value is an array of Workers that can be empty
	private workers: { [key in WorkerType]: Worker[] } = {DECODER_WORKER: [], DECODER_WORKER_GLTF: []};

	getWorker(workerType: WorkerType): Worker {
		// Throw error if workerType is not recognized
		if (this.workers[workerType] === undefined) {
			throw new Error('Unknown worker type');
		}
		// Given a worker URL, if URL does not exist in the worker object, create a new array with the URL as a key
		if (this.workers[workerType].length === 0) {
			const worker = createWorker(workerType);
			this.workers[workerType].push(worker);
		}
		const worker = this.workers[workerType].pop();
		if (worker === undefined) { // Typescript needs this
			throw new Error('No workers available');
		}
		// Return the last worker in the array and remove it from the array
		return worker;
	}

	returnWorker(workerType: WorkerType, worker: Worker) {
		this.workers[workerType].push(worker);
	}
}
