import { Quest } from '../quest.ts'

export class Quest02 extends Quest<string[]> {
  constructor() {
    super(2, 3)
  }

  loadInput(part: number): string[] {
    const data = this.readDataFile(part)
    return data
  }

  part1(input: string[]): number {
    return 0
  }

  part2(input: string[]): number {
    return 0
  }

  part3(input: string[]): number {
    return 0
  }
}

if (!Deno.mainModule.endsWith('/main.ts')) {
  new Quest02().execute()
}
