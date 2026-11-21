## node cli.ts gen --mode=safe --rows=10000000

- 1001ms 135.14mb 
- 2000ms 135.32mb
- 3000ms 136.07mb
- 4001ms 136.82mb
- 5001ms 137.39mb
- 6002ms 137.95mb

### node cli.ts gen --mode=unsafe --rows=10000000
- 6204ms 752.23mb


### node cli.ts agg
- `readFile` вместо `createReadStream` - **RangeError: Invalid string length**
- 1000ms 118.66mb
- 1999ms 144.39mb
- 3000ms 144.39mb
- 4000ms 144.39mb
- 5001ms 144.39mb
- 6002ms 144.39mb
- 7002ms 144.39mb
- 8002ms 144.39mb
- 9002ms 144.39mb
- 10002ms 144.39mb
- 11002ms 144.39mb