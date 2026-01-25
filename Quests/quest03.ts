import { Quest } from '../quest.ts'

export class Quest03 extends Quest<number[]> {
  constructor() {
    super(3)
  }

  loadInput(part: number): number[] {
    const data = this.readDataFile(part)[0]
      .split(',')
      .map(v => +v)
    return data
  }

  distinct(values: number[]): number[] {
    return Array.from(new Set(values))
  }

  part1(crates: number[]): number {
    crates = this.distinct(crates.sort((a, b) => a - b))

    const total = crates.reduce((a: number, v: number) => a + v, 0)
    return total
  }

  part2(crates: number[]): number {
    crates = this.distinct(crates.sort((a, b) => a - b)).filter((_, i) => i < 20)

    const total = crates.reduce((a: number, v: number) => a + v, 0)
    return total
  }

  part3(crates: number[]): number {
    crates.sort((a, b) => a - b)

    let count = 0
    while (crates.length > 0) {
      count++
      let previous = 0
      for (let i = 0; i < crates.length; i++) {
        const c = crates[i]
        if (c > previous) {
          previous = c
          crates[i] = 0
        }
      }
      crates = crates.filter(c => c > 0)
    }
    return count
  }
}

if (!Deno.mainModule.endsWith('/main.ts')) {
  new Quest03().execute()
}
