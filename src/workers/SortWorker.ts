function sortWorker(self: any) {
  function toUint8Array(s: any) {
    return new Uint8Array(atob(s).split('').map(charCodeAt));
  }

  function charCodeAt(c: string) {
    return c.charCodeAt(0);
  }

  const MemoryPageSize = 65536;
  const BytesPerFloat = 4;
  const BytesPerInt = 4;
  const DefaultSplatSortDistanceMapPrecision = 16;

  // let centersReady = false;
  let wasmInstance: any;
  let wasmMemory: any;
  let splatCount: number;
  let indexesToSortOffset: number;
  let sortedIndexesOffset: number;
  let mappedDistancesOffset: number;
  let frequenciesOffset: number;
  let centersOffset: number;
  let modelViewProjOffset: number;
  let countsZero: any;
  const distanceMapRange = 1 << DefaultSplatSortDistanceMapPrecision;
  let indices: any;

  self.onmessage = (e: any) => {
    if (e.data.init) {
      startWasmModule(e.data.splatCount);
    }
    if (e.data.sort) {
      sort(e);
    }
  };

  function sort(e: any) {
    const centers = e.data.sort.centers;
    const splats = e.data.sort.totalSplats;
    const modelViewProj = e.data.sort.modelViewProj;

    // pass the centers to the memory
    new Float32Array(wasmMemory, centersOffset, centers.byteLength / BytesPerFloat).set(
      new Float32Array(centers),
    );

    // pass the indices
    new Int32Array(wasmMemory, 0, e.data.sort.indices.byteLength / BytesPerFloat).set(
      e.data.sort.indices,
    );

    if (!countsZero) {
      countsZero = new Uint32Array(distanceMapRange);
    }
    new Float32Array(wasmMemory, modelViewProjOffset, 16).set(modelViewProj);
    new Uint32Array(wasmMemory, frequenciesOffset, distanceMapRange).set(countsZero);

    wasmInstance.exports.sortIndexes(
      indexesToSortOffset,
      centersOffset,
      mappedDistancesOffset,
      frequenciesOffset,
      modelViewProjOffset,
      sortedIndexesOffset,
      distanceMapRange,
      splats,
    );

    const sortedIndexesC = new Int32Array(wasmMemory, sortedIndexesOffset, splats);

    self.postMessage({
      dataSorted: sortedIndexesC,
    });
  }

  function startWasmModule(_splatCount: number) {
    splatCount = _splatCount;

    // Memory setup
    const CENTERS_BYTES_PER_ENTRY = BytesPerFloat * 4;
    const matrixSize = 16 * BytesPerFloat;

    const memoryRequiredForIndexesToSort = splatCount * BytesPerInt;
    const memoryRequiredForCenters = splatCount * CENTERS_BYTES_PER_ENTRY;
    const memoryRequiredForModelViewProjectionMatrix = matrixSize;
    const memoryRequiredForMappedDistances = splatCount * BytesPerInt;
    const memoryRequiredForSortedIndexes = splatCount * BytesPerInt;
    const memoryRequiredForIntermediateSortBuffers = distanceMapRange * BytesPerFloat * 2;
    const extraMemory = MemoryPageSize * 32;

    const totalRequiredMemory =
      memoryRequiredForIndexesToSort +
      memoryRequiredForCenters +
      memoryRequiredForModelViewProjectionMatrix +
      memoryRequiredForMappedDistances +
      memoryRequiredForIntermediateSortBuffers +
      memoryRequiredForSortedIndexes +
      extraMemory;

    const totalPagesRequired = Math.floor(totalRequiredMemory / MemoryPageSize) + 1;

    // Memory used to the sorter
    const sorterWasmImport = {
      module: {},
      env: {
        memory: new WebAssembly.Memory({
          initial: totalPagesRequired,
          maximum: totalPagesRequired,
        }),
      },
    };

    /*

        USED WASM2JS (https://github.com/thlorenz/wasm2js) to extract the base64 file required for the sorter.

                    The process goes as follows
                                |
                                |
                                v
           sorter_test.cpp file (original C sorter file)
                                |
                                |
                                v
      sorter_test.wasm file (compiled WASM file from the original C file)
                                |
                                |
                                v
      buffer string with base64 (obtained from sorter_test.wasm using WASM2JS)

        */

    const buffer = toUint8Array(
      'AGFzbQEAAAAADwhkeWxpbmsuMAEEAAAAAAEPAmAAAGAIf39/f39/f38AAg8BA2VudgZtZW1vcnkCAAADAwIAAQcjAhFfX3dhc21fY2FsbF9jdG9ycwAAC3NvcnRJbmRleGVzAAEKhgMCAwABC/8CAgN/A30gBwRAIAQqAighCyAEKgIYIQwgBCoCCCENQfj///8HIQlBiICAgHghBANAIAIgCkECdCIIaiALIAEgACAIaigCAEEEdGoiCCoCCJQgDSAIKgIAlCAMIAgqAgSUkpJDAACARZT8ACIINgIAIAkgCCAIIAlKGyEJIAQgCCAEIAhKGyEEIApBAWoiCiAHRw0ACyAGQQFrsyAEsiAJspOVIQtBACEEA0AgAiAEQQJ0aiIBIAsgASgCACAJa7KU/AAiATYCACADIAFBAnRqIgEgASgCAEEBajYCACAEQQFqIgQgB0cNAAsLIAZBAk8EQCADKAIAIQlBASEEA0AgAyAEQQJ0aiIBIAEoAgAgCWoiCTYCACAEQQFqIgQgBkcNAAsLIAdBAEoEQCAHIQQDQCAFIAcgAyACIARBAWsiAUECdCIGaigCAEECdGoiCSgCACIIa0ECdGogACAGaigCADYCACAJIAhBAWs2AgAgBEEBSyEGIAEhBCAGDQALCws=',
    );

    WebAssembly.instantiate(buffer, sorterWasmImport).then((result) => {
      // Save the instance of the WASM to use
      wasmInstance = result.instance;

      // Retrieve the memory used in the C module.
      wasmMemory = sorterWasmImport.env.memory.buffer;

      indices = new Int32Array(splatCount);
      for (let i = 0; i < splatCount; i++) {
        indices[i] = i;
      }

      // Define the offsets used to allocate the data inside memory.
      indexesToSortOffset = 0;
      centersOffset = indexesToSortOffset + memoryRequiredForIndexesToSort;
      modelViewProjOffset = centersOffset + memoryRequiredForCenters;
      mappedDistancesOffset = modelViewProjOffset + memoryRequiredForModelViewProjectionMatrix;
      frequenciesOffset = mappedDistancesOffset + memoryRequiredForMappedDistances;
      sortedIndexesOffset = frequenciesOffset + memoryRequiredForIntermediateSortBuffers;

      self.postMessage({
        sorterReady: true,
      });
    });
  }
}

export function createSortWorker(splatCount: number): Promise<Worker> {
  return new Promise((resolve) => {
    const worker = new Worker(
      URL.createObjectURL(
        new Blob(['(', sortWorker.toString(), ')(self)'], {
          type: 'application/javascript',
        }),
      ),
    );

    // Setup the WASM module
    worker.postMessage({
      init: true,
      splatCount,
    });

    worker.onmessage = (e: any) => {
      // pass the centers information
      if (e.data.sorterReady) {
        resolve(worker);
      }
    };
  });
}
