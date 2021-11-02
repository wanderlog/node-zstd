import bindings from 'bindings';

const compressor = bindings('compressor.node');

export interface ZstdCompressParams {
  level?: number;
  dict?: Buffer;
  dictSize?: number;
}

type ZstdCallback = (err: Error | null, output?: Buffer) => void;

export interface StreamCompressor {
  new(params: ZstdCompressParams): StreamCompressor;
  getBlockSize(): number;
  compress(isLast: boolean, callback: ZstdCallback, sync: boolean): void;
  copy(chunk: Buffer): void;
}

export default <{
  StreamCompressor: StreamCompressor;
}>compressor;
