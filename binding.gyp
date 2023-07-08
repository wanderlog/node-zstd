{
  "targets": [
    {
      "target_name": "binding",
      "include_dirs": [
        "<!(node -e \"require('nan')\")",
        "deps/zstd/lib",
        "src/common"
      ],
      "dependencies": [
        "<(module_root_dir)/deps/zstd.gyp:zstd"
      ],
      "sources": [
        "src/zstd_index.cc",
        "src/common/stream_coder.cc",
        "src/common/allocator.cc",
        "src/compress/stream_compressor.cc",
        "src/compress/stream_compress_worker.cc",
        "src/decompress/stream_decompressor.cc",
        "src/decompress/stream_decompress_worker.cc"
      ],
      "conditions": [
        [
          "OS == 'mac'", {
            "xcode_settings": {
              "GCC_ENABLE_CPP_EXCEPTIONS": "YES",
              "MACOSX_DEPLOYMENT_TARGET": "10.12"
            }
          }
        ],
        [
          "OS=='linux'", {
            "cflags_cc": [ "-O2", "-std=c++17", "-flto" ]
          }
        ]
      ]
    }
  ]
}
