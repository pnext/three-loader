import { beforeEach, describe, it, expect } from "@jest/globals";



interface OctreeGeometryNode {
  byteOffset: number;
  byteSize: number;
}

class S3Server {
  readonly data = "ABCDEFGHIGKLMNOPQRSTUVWXYZabcdefghigklmnopqrstuvwxyz"
  requestCount = 0;
  async getNodeData(range: [number, number]): Promise<string> {
    // Simulate fetching node data from a server
    console.log(`Fetching data from ${range[0]} to ${Math.min(range[1], this.data.length)}`);
    this.requestCount++;
    return this.data.slice(range[0], range[1]);
  }
}

class SimpleLoader {
  constructor(private readonly server: S3Server) { }

  load(nodes: OctreeGeometryNode): Promise<string> {
    const { byteOffset, byteSize } = nodes;

    return this.server.getNodeData([byteOffset, byteOffset + byteSize])
  }
}

class SingleRequestLoader {
  private loadEverything: Promise<string> | undefined;

  constructor(private readonly server: S3Server) { }

  load(nodes: OctreeGeometryNode): Promise<string> {
    const { byteOffset, byteSize } = nodes;

    this.loadEverything ??= new Promise(resolve => resolve(this.server.getNodeData([0, Infinity])));
    return this.loadEverything.then(
      (data) => data.slice(byteOffset, byteOffset + byteSize)
    );
  }
}



interface BatchedRequest {
  byteOffset: number;
  byteSize: number;
  callback: (data: string) => void;
}

class TemporalBatchingRequestLoader {
  private nextBatch: BatchedRequest[] = [];
  private runNextBatchTimeout: any;
  constructor(private readonly server: S3Server) { }

  load(nodes: OctreeGeometryNode): Promise<string> {
    return new Promise((resolve) => {
      this.scheduleNextBatch();
      this.nextBatch.push({
        byteOffset: nodes.byteOffset,
        byteSize: nodes.byteSize,
        callback: (data) => resolve(data)
      });
    });

  }

  private scheduleNextBatch() {
    clearTimeout(this.runNextBatchTimeout);
    this.runNextBatchTimeout = setTimeout(() => {
      const nextBatch = this.nextBatch;
      this.nextBatch = [];
      const batchStart = Math.min(...nextBatch.map(req => req.byteOffset));
      const batchEnd = Math.max(...nextBatch.map(req => req.byteOffset + req.byteSize));

      this.server.getNodeData([batchStart, batchEnd - batchStart]).then((data) => {
        nextBatch.forEach(req => {
          const relativeByteOffset = req.byteOffset - batchStart;
          req.callback(data.slice(relativeByteOffset, relativeByteOffset + req.byteSize));
        });
      });
    }, 0); // <-- with a bigger number here you can increase thesize of the window where the request will be aggregated together.
  }
}

// class SpatialBatchingRequestLoader {
//   /* It should be possible to have a loader that batch together only the queries that are request range that are close to each other to avoid requesting useless bytes */
// }


describe('LoadingStrategies', () => {

  let server: S3Server;

  beforeEach(() => {
    server = new S3Server();
  });

  it.each([
    SingleRequestLoader,
    SimpleLoader,
    TemporalBatchingRequestLoader
  ])("load stuff with %p", async (Loader) => {
    const upperNode: OctreeGeometryNode = { byteOffset: 0, byteSize: 10 };
    const lowerNode: OctreeGeometryNode = { byteOffset: 26, byteSize: 8 };

    const loader = new Loader(server);
    const upper = loader.load(upperNode);
    const lower = loader.load(lowerNode);

    await expect(upper).resolves.toBe("ABCDEFGHIG");
    await expect(lower).resolves.toBe("abcdefgh");

    console.log(`Server requests made with ${Loader.name}: ${server.requestCount}`);
  });
});