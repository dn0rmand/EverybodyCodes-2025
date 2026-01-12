import { Quest } from './tools/quest.ts'

type TRange = {
  from: number
  to: number
  reverse: boolean
}
type TInput = TRange[]

export class Quest13 extends Quest<TInput> {
  constructor() {
    super(13)
  }

  loadInput(part: number): TInput {
    const data = this.readDataFile(part)
    const ranges =
      part === 1
        ? data.map(v => ({ from: +v, to: +v, reverse: false }))
        : data.map(l => {
            const v = l.split('-')
            return { from: +v[0], to: +v[1], reverse: false }
          })

    const right: TRange[] = []
    const left: TRange[] = []

    for (let i = 0; i < ranges.length; i++) {
      const r = ranges[i]
      if (i & 1) {
        r.reverse = true
        left.unshift(r)
      } else {
        right.push(r)
      }
    }
    return [{ from: 1, to: 1, reverse: false }, ...right, ...left]
  }

  unlock(ranges: TInput, turns: number): number {
    const totalDials = ranges.reduce((a, r) => a + (r.to - r.from + 1), 0)
    const index = turns % totalDials

    for (let i = 0, idx = 0; i < ranges.length; i++) {
      const r = ranges[i]
      const l = r.to - r.from + 1
      if (idx + l <= index) {
        idx += l
      } else {
        const k = index - idx
        return r.reverse ? r.to - k : r.from + k
      }
    }
    throw 'Error'
  }

  part1(ranges: TInput): number {
    return this.unlock(ranges, 2025)
  }

  part2(ranges: TInput): number {
    return this.unlock(ranges, 20252025)
  }

  part3(ranges: TInput): number {
    return this.unlock(ranges, 202520252025)
  }
}

if (!Deno.mainModule.endsWith('/main.ts')) {
  new Quest13().execute()
}
