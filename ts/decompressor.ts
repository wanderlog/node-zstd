import bindings from 'bindings';

const decompressor = bindings('decompressor.node');

export interface ZstdDecompressParams {
  dict?: Buffer;
  dictSize?: number;
}

type ZstdCallback = (err: Error | null, output?: Buffer) => void;

export interface StreamDecompressor {
  new(params: ZstdDecompressParams): StreamDecompressor;
  getBlockSize(): number;
  decompress(callback: ZstdCallback, sync: boolean): void;
  copy(chunk: Buffer): void;
}

export default <{
  StreamDecompressor: StreamDecompressor;
}>decompressor;
