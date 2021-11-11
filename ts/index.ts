import { Transform, TransformCallback } from 'stream';
import pond from 'pond';

import zstd, { ZstdCompressParams, ZstdDecompressParams } from './zstd';

export async function compress(input: Buffer, params: ZstdCompressParams = {}): Promise<Buffer> {
  if (!Buffer.isBuffer(input)) {
    throw new Error('Input is not a buffer.');
  }

  const stream = new TransformStreamCompressor(params);
  const pipeline = pond(stream);
  stream.end(input);

  return pipeline.spoon();
}

export async function decompress(input: Buffer, params: ZstdDecompressParams = {}): Promise<Buffer> {
  if (!Buffer.isBuffer(input)) {
    throw new Error('Input is not a buffer.');
  }

  const stream = new TransformStreamDecompressor(params);
  const pipeline = pond(stream);
  stream.end(input);

  return pipeline.spoon();
}

export function compressSync(input: Buffer, params: ZstdCompressParams): Buffer {
  if (!Buffer.isBuffer(input)) {
    throw new Error('Input is not a buffer.');
  }
  const stream = new TransformStreamCompressor(params || {}, true);
  const chunks: Buffer[] = [];
  let length = 0;
  stream.on('error', function (e) {
    throw e;
  });
  stream.on('data', function (c) {
    chunks.push(c);
    length += c.length;
  });
  stream.end(input);
  return Buffer.concat(chunks, length);
}

export function decompressSync(input: Buffer, params: ZstdDecompressParams): Buffer {
  if (!Buffer.isBuffer(input)) {
    throw new Error('Input is not a buffer.');
  }
  const stream = new TransformStreamDecompressor(params || {}, true);
  const chunks: Buffer[] = [];
  let length = 0;
  stream.on('error', function (e) {
    throw e;
  });
  stream.on('data', function (c) {
    chunks.push(c);
    length += c.length;
  });
  stream.end(input);
  return Buffer.concat(chunks, length);
}

interface TransformStatus {
  blockSize: number;
  remaining: number;
}

export class TransformStreamCompressor extends Transform {
  compressor: typeof zstd.StreamCompressor;
  sync: boolean;
  status: TransformStatus;

  constructor(params: ZstdCompressParams, sync = false) {
    super();
    this.compressor = new zstd.StreamCompressor(params || {});
    this.sync = sync;
    const blockSize = this.compressor.getBlockSize();
    this.status = {
      blockSize: blockSize,
      remaining: blockSize
    };
  }

  _transform(chunk: Buffer, encoding: BufferEncoding, next: TransformCallback): void {
    compressStreamChunk(this, chunk, this.compressor, this.status, this.sync, next);
  }

  _flush(done: TransformCallback): void {
    this.compressor.compress(true, (err, output) => {
      if (err) {
        return done(err);
      }
      if (output) {
        for (let i = 0; i < output.length; i++) {
          this.push(output[i]);
        }
      }
      return done();
    }, !this.sync);
  }
}

// We need to fill the blockSize for better compression results
export function compressStreamChunk(
  stream: Transform,
  chunk: Buffer,
  compressor: typeof zstd.StreamCompressor,
  status: TransformStatus,
  sync: boolean,
  done: (err?: Error) => void) {
  const length = chunk.length;

  if (length > status.remaining) {
    const slicedChunk = chunk.slice(0, status.remaining);
    chunk = chunk.slice(status.remaining);
    status.remaining = status.blockSize;

    compressor.copy(slicedChunk);
    compressor.compress(false, function (err, output) {
      if (err) {
        return done(err);
      }
      if (output) {
        for (let i = 0; i < output.length; i++) {
          stream.push(output[i]);
        }
      }
      return compressStreamChunk(stream, chunk, compressor, status, sync, done);
    }, !sync);
  } else if (length <= status.remaining) {
    status.remaining -= length;
    compressor.copy(chunk);
    return done();
  }
}

export function compressStream(params: ZstdCompressParams): TransformStreamCompressor {
  return new TransformStreamCompressor(params);
}

export class TransformStreamDecompressor extends Transform {
  decompressor: typeof zstd.StreamDecompressor;
  sync: boolean;
  status: TransformStatus;

  constructor(params: ZstdDecompressParams, sync = false) {
    super();
    this.decompressor = new zstd.StreamDecompressor(params || {});
    this.sync = sync || false;
    const blockSize = this.decompressor.getBlockSize();
    this.status = {
      blockSize: blockSize,
      remaining: blockSize
    };
  }

  _transform(chunk: Buffer, encoding: BufferEncoding, next: TransformCallback): void {
    decompressStreamChunk(this, chunk, this.decompressor, this.status, this.sync, next);
  }

  _flush(done: TransformCallback): void {
    this.decompressor.decompress((err, output) => {
      if (err) {
        return done(err);
      }
      if (output) {
        for (let i = 0; i < output.length; i++) {
          this.push(output[i]);
        }
      }
      return done();
    }, !this.sync);
  }
}

// We need to fill the blockSize for better compression results
export function decompressStreamChunk(
  stream: Transform,
  chunk: Buffer,
  decompressor: typeof zstd.StreamDecompressor,
  status: TransformStatus,
  sync: boolean,
  done: (err?: Error) => void) {
  const length = chunk.length;

  if (length > status.remaining) {
    const slicedChunk = chunk.slice(0, status.remaining);
    chunk = chunk.slice(status.remaining);
    status.remaining = status.blockSize;

    decompressor.copy(slicedChunk);
    decompressor.decompress(function (err, output) {
      if (err) {
        return done(err);
      }
      if (output) {
        for (let i = 0; i < output.length; i++) {
          stream.push(output[i]);
        }
      }
      return decompressStreamChunk(stream, chunk, decompressor, status, sync, done);
    }, !sync);
  } else if (length <= status.remaining) {
    status.remaining -= length;
    decompressor.copy(chunk);
    return done();
  }
}

export function decompressStream(params: ZstdDecompressParams): TransformStreamDecompressor {
  return new TransformStreamDecompressor(params);
};
