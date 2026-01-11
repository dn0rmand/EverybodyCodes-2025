import { Quest } from './tools/quest.ts'

type TInput = number[]

export class Quest11 extends Quest<TInput> {
  constructor() {
    super(11)
  }

  loadInput(part: number): TInput {
    const data = this.readDataFile(part).map(v => +v)
    return data
  }

  phaseOne(columns: number[]): boolean {
    let didMove: boolean = false
    for (let i = 1; i < columns.length; i++) {
      if (columns[i - 1] > columns[i]) {
        columns[i - 1]--
        columns[i]++
        didMove = true
      }
    }
    return didMove
  }

  phaseTwo(columns: number[]): boolean {
    let didMove: boolean = false
    for (let i = 1; i < columns.length; i++) {
      if (columns[i - 1] < columns[i]) {
        columns[i - 1]++
        columns[i]--
        didMove = true
      }
    }
    return didMove
  }

  part1(input: TInput): number {
    let rounds = 0
    let phase = 1
    while (rounds < 10) {
      if (phase === 1) {
        if (this.phaseOne(input)) {
          rounds++
        } else {
          phase = 2
        }
      } else {
        if (this.phaseTwo(input)) {
          rounds++
        } else {
          break
        }
      }
    }
    return input.reduce((a, v, i) => a + (i + 1) * v, 0)
  }

  part2(input: TInput): number {
    let rounds1 = 0
    while (this.phaseOne(input)) {
      rounds1++
    }

    const target = input.reduce((a, v) => a + v, 0) / input.length
    const rounds2 = input.reduce((a, v) => (v > target ? a + v - target : a), 0)

    return rounds1 + rounds2
  }

  part3(input: TInput): number {
    while (this.phaseOne(input)) {
      throw 'Not expected'
    }

    const target = input.reduce((a, v) => a + v, 0) / input.length
    const rounds = input.reduce((a, v) => (v > target ? a + v - target : a), 0)

    return rounds
  }
}

if (!Deno.mainModule.endsWith('/main.ts')) {
  new Quest11().execute()
}
