import { aggregate } from "./aggregate.ts"
import { parseArgs } from "./args.ts"
import { seedOrders } from "./gen.ts"

async function main() {
    try {
        const { positionals, values } = parseArgs()
        const [cmd] = positionals

        switch (cmd) {
            case 'gen':
                await seedOrders(values.mode, values.rows)
                break
            case 'agg':
                await aggregate(values.threshold)
                break
            default:
                throw new Error('Unsupported command')
        }
    } catch (err) {
        console.error(err)
        process.exitCode = 1
    }
}

main()