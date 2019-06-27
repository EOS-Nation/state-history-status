# State History Status

NodeJS command line tool that retrieves the nodeos state history status and outputs the result as json.

## Installation

`npm install -g state-history-status`

## Usage

```
state-history-status [options]

Options:
  -V, --version      output the version number
  -H, --host [host]  Nodeos host with state history enabled. (default: "localhost")
  -P, --port [port]  Port of the state history plugin. (default: "8080")
  -h, --help         output usage information

```

## Output

```json
{"head":{"block_num":65220432,"block_id":"03E32F50F6B43EFC8F285BD25C35C578C8BACDAB7D67E5E7861F4C38460BCB62"},"last_irreversible":{"block_num":65220103,"block_id":"03E32E07816806B80D6F2AEAC48485B5EE2B6CC50D07BFDC8F43DB90680681F7"},"trace_begin_block":2,"trace_end_block":65220433,"chain_state_begin_block":2,"chain_state_end_block":65220433}
```
