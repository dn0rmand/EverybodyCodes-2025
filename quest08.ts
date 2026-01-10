import { Quest } from './tools/quest.ts'

type TLine = {
  from: number
  to: number
}

type TInput = {
  nails: number
  sequence: number[]
}

export class Quest08 extends Quest<TInput> {
  constructor() {
    super(8)
  }

  loadInput(part: number): TInput {
    const sequence = this.readDataFile(part)[0]
      .split(',')
      .map(v => +v)

    const nails = sequence.reduce((a, b) => (a < b ? b : a), 0)

    return { nails, sequence }
  }

  isOpposite(count: number, a: number, b: number): boolean {
    if (count % 2 !== 0) {
      return false
    }
    count /= 2
    return a + count === b || b + count == a
  }

  makeKnots(lines: TLine[], line: TLine): number {
    const crossings = lines.filter(l => {
      if (l.from === line.to || l.from === line.from || l.to === line.to || l.to === line.from) {
        return false
      }

      let c = 0
      if (line.from < l.from && l.from < line.to) {
        c++
      }
      if (line.from < l.to && l.to < line.to) {
        c++
      }
      return c === 1
    })
    return crossings.length
  }

  part1(input: TInput): number {
    let total = 0
    for (let i = 1; i < input.sequence.length; i++) {
      if (this.isOpposite(input.nails, input.sequence[i - 1], input.sequence[i])) {
        total++
      }
    }
    return total
  }

  part2(input: TInput): number {
    const lines: TLine[] = []

    let total = 0
    for (let i = 1; i < input.sequence.length; i++) {
      const from = input.sequence[i - 1]
      const to = input.sequence[i]
      const line: TLine = { from: Math.min(from, to), to: Math.max(from, to) }

      total += this.makeKnots(lines, line)
      lines.push(line)
    }
    return total
  }

  part3(input: TInput): number {
    const lines: TLine[] = []

    for (let i = 1; i < input.sequence.length; i++) {
      const from = input.sequence[i - 1]
      const to = input.sequence[i]
      const line: TLine = { from: Math.min(from, to), to: Math.max(from, to) }
      lines.push(line)
    }

    let max = 0
    const offset = input.nails / 2
    for (let to = offset + 1; to <= input.nails; to++) {
      for (let from = 1; from < to - offset; from++) {
        const knots = this.makeKnots(lines, { from, to })
        max = Math.max(max, knots)
      }
    }
    return max
  }
}

if (!Deno.mainModule.endsWith('/main.ts')) {
  new Quest08().execute()
}
