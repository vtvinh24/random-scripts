## [Go back](../README.md)

# Memtest logs to memmap patterns converter

### [memtest-to-memmap.js](./memtest-to-memmap.js)

This script will:

1. Read all logs (files ending with .log) in ./test-report directory
2. Parse faulty RAM addresses
3. Generate a result.yml containing memmap patterns (`0xsize$0xaddress`)

### How to get MemTest logs

1. Run MemTest
2. Save the log file
3. Move the log file to `./test-report` directory

The log file name should look like `MemTest86-{timestamp}.log`
You can see one example log in `./test-report` directory

### Usage

```bash
node memtest-to-memmap.js
```

#### Args

`--skip-extract`: Skip initial extraction and convert `result.yml` directly to `memmap-patterns

### Notes

For now all addresses ranges are locked to 0x100000 (matching 1MB, which is used for my machine)

### Compatibility

- `Node 20.15.0`
- `PassMark MemTest86 v11.2 (build 2000)`
