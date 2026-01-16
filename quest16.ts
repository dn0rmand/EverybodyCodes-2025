import { Quest } from './tools/quest.ts'

type TInput = number[]

export class Quest16 extends Quest<TInput> {
  constructor() {
    super(16)
  }

  loadInput(part: number): TInput {
    const data = this.readDataFile(part)[0]

    return data.split(',').map(v => +v)
  }

  reverse(values: number[]): number[] {
    const result = []

    let index = 1 + values.findIndex(v => v > 0)
    while (index > 0) {
      for (let c = index - 1; c < values.length; c += index) {
        values[c]--
        if (values[c] < 0) {
          throw 'Error'
        }
      }
      result.push(index)
      index = 1 + values.findIndex(v => v > 0)
    }

    return result
  }

  quickSearch(spell: number[]): number {
    const BLOCKS = 202520252025000
    let min = 1
    let max = BLOCKS

    const getBlocks = (length: number): number => spell.reduce((a, v) => a + Math.floor(length / v), 0)

    while (min < max) {
      const middle = Math.floor((min + max) / 2)
      const blocks = getBlocks(middle)
      if (blocks > BLOCKS) {
        max = middle - 1
      } else if (blocks < BLOCKS) {
        min = middle + 1
      } else {
        return middle
      }
    }

    return getBlocks(min) <= BLOCKS ? min : max
  }

  part1(input: TInput): number {
    let total = 0
    for (const value of input) {
      total += Math.floor(90 / value)
    }
    return total
  }

  part2(input: TInput): number {
    const spell = this.reverse(input)
    const total = spell.reduce((a, v) => a * v, 1)
    return total
  }

  part3(input: TInput): number {
    const spell = this.reverse(input)
    return this.quickSearch(spell)
  }
}

if (!Deno.mainModule.endsWith('/main.ts')) {
  new Quest16().execute()
}
