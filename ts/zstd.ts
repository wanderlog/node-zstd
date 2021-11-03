import { join } from 'path';

const binding = require('node-gyp-build')(join(__dirname, '..'));

type ZstdCallback = (err: Error | null, output?: Buffer) => void;

export interface ZstdCompressParams {
  level?: number;
  dict?: Buffer;
  dictSize?: number;
}

export interface StreamCompressor {
  new(params: ZstdCompressParams): StreamCompressor;
  getBlockSize(): number;
  compress(isLast: boolean, callback: ZstdCallback, sync: boolean): void;
  copy(chunk: Buffer): void;
}

export interface ZstdDecompressParams {
  dict?: Buffer;
  dictSize?: number;
}

export interface StreamDecompressor {
  new(params: ZstdDecompressParams): StreamDecompressor;
  getBlockSize(): number;
  decompress(callback: ZstdCallback, sync: boolean): void;
  copy(chunk: Buffer): void;
}

export default <{
  StreamCompressor: StreamCompressor;
  StreamDecompressor: StreamDecompressor;
}>binding;
