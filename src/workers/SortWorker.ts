
function sortWorker(self: any) {

    const MemoryPageSize = 65536;
    const BytesPerFloat = 4;
    const BytesPerInt = 4;
    const DefaultSplatSortDistanceMapPrecision = 24;

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
    let distanceMapRange = 1 << DefaultSplatSortDistanceMapPrecision;
    let indices: any;


    self.onmessage = (e: any) => {
        if(e.data.init) startWasmModule(e.data.splatCount);
        if(e.data.sort) sort(e);
    };


    function sort(e: any) {

      let centers = e.data.sort.centers;
      let splats = e.data.sort.totalSplats;
      let modelViewProj = e.data.sort.modelViewProj;

      //pass the centers to the memory
      new Float32Array(
        wasmMemory,
        centersOffset,
        centers.byteLength / BytesPerFloat,
      ).set(new Float32Array(centers));

      //pass the indices
      new Int32Array(
        wasmMemory,
        0,
        e.data.sort.indices.byteLength / BytesPerFloat,
      ).set(e.data.sort.indices);

      if (!countsZero) countsZero = new Uint32Array(distanceMapRange);
      new Float32Array(wasmMemory, modelViewProjOffset, 16).set(modelViewProj);
      new Uint32Array(wasmMemory, frequenciesOffset, distanceMapRange).set(
        countsZero,
      );

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

      const sortedIndexesC = new Int32Array(
        wasmMemory,
        sortedIndexesOffset,
        splats,
      );
      
      self.postMessage({
        dataSorted: sortedIndexesC
      })

    }

    async function startWasmModule(_splatCount: number) {

        splatCount = _splatCount;

        //Memory setup
        const CENTERS_BYTES_PER_ENTRY = BytesPerFloat * 4; 
        const matrixSize = 16 * BytesPerFloat;


        const memoryRequiredForIndexesToSort = splatCount * BytesPerInt;
        const memoryRequiredForCenters = splatCount * CENTERS_BYTES_PER_ENTRY;
        const memoryRequiredForModelViewProjectionMatrix = matrixSize;
        const memoryRequiredForMappedDistances = splatCount * BytesPerInt;
        const memoryRequiredForSortedIndexes = splatCount * BytesPerInt;

        const memoryRequiredForIntermediateSortBuffers = distanceMapRange * BytesPerFloat * 2;

        const memoryRequiredforTransformIndexes = 0;
        const memoryRequiredforTransforms = 0;
        const extraMemory = MemoryPageSize * 32;
    
        const totalRequiredMemory =
        memoryRequiredForIndexesToSort +
        memoryRequiredForCenters +
        memoryRequiredForModelViewProjectionMatrix +
        memoryRequiredForMappedDistances +
        memoryRequiredForIntermediateSortBuffers +
        memoryRequiredForSortedIndexes +
        memoryRequiredforTransformIndexes +
        memoryRequiredforTransforms +
        extraMemory;
      
        const totalPagesRequired = Math.floor(totalRequiredMemory / MemoryPageSize) + 1;
    
    
        //Memory used to the sorter
        const sorterWasmImport = {
            module: {},
            env: {
              memory: new WebAssembly.Memory({
                initial: totalPagesRequired,
                maximum: totalPagesRequired
              }),
            },
          };
    
        //Setup the loading url for this!  
        const response = await fetch("https://mdbm.es/sorter_test.wasm");
        const buffer = await response.arrayBuffer();
        const result = await WebAssembly.instantiate(buffer, sorterWasmImport);

        //Save the instance of the WASM to use
        wasmInstance = result.instance;

        //Retrieve the memory used in the C module.
        wasmMemory = sorterWasmImport.env.memory.buffer;

        indices = new Int32Array(splatCount);
        for(let i = 0; i < splatCount; i++) {
          indices[i] = i;
        }

        //Define the offsets used to allocate the data inside memory.
        indexesToSortOffset = 0;
        centersOffset = indexesToSortOffset + memoryRequiredForIndexesToSort;
        modelViewProjOffset = centersOffset + memoryRequiredForCenters;
        mappedDistancesOffset = modelViewProjOffset + memoryRequiredForModelViewProjectionMatrix;
        frequenciesOffset = mappedDistancesOffset + memoryRequiredForMappedDistances;
        sortedIndexesOffset = frequenciesOffset + memoryRequiredForIntermediateSortBuffers;
    
        self.postMessage({
          sorterReady: true
        });
    }
}


export async function createSortWorker(splatCount: number): Promise<Worker> {

  return new Promise(resolve => {
      const worker = new Worker(
        URL.createObjectURL(
          new Blob(['(', sortWorker.toString(), ')(self)'], {
            type: 'application/javascript',
          }),
        ),
    );

      //Setup the WASM module
      worker.postMessage({
          init: true,
          splatCount
      });

      worker.onmessage = (e: any) => {
          
          //pass the centers information
          if(e.data.sorterReady) {
              console.log("wasm compiled");
              resolve(worker);
          }

      }
  })

}
