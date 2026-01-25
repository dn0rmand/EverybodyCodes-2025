import { Quest } from './quest.ts'

type TInput = string[]

export class Quest00 extends Quest<TInput> {
  constructor() {
    super(0)
  }

  loadInput(part: number): TInput {
    const data = this.readDataFile(part)
    return data
  }

  part1(_: TInput): number {
    return 0
  }

  part2(_: TInput): number {
    return 0
  }

  part3(_: TInput): number {
    return 0
  }
}

if (!Deno.mainModule.endsWith('/main.ts')) {
  new Quest00().execute()
}
