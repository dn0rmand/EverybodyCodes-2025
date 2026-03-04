import { Quest } from '../quest.ts'

type TDragon = {
  id: number
  red: number
  green: number
  blue: number
  shine: number
  group: string
}

type TInput = TDragon[]

export class Quest01 extends Quest<TInput> {
  constructor() {
    super(1, 3)
  }

  parseColor(color: string | undefined, char: string): number {
    let c = 0
    if (color === undefined) {
      return c
    }

    for (const l of color) {
      c *= 2
      if (l === char) {
        c += 1
      }
    }
    return c
  }

  loadInput(part: number): TInput {
    const data = this.readDataFile(part)

    const input = data.map(row => {
      const vals = row.split(':')
      const id = +vals[0]
      const cols = vals[1].split(' ')
      const red = this.parseColor(cols[0], 'R')
      const green = this.parseColor(cols[1], 'G')
      const blue = this.parseColor(cols[2], 'B')
      const shine = this.parseColor(cols[3], 'S')

      const dragon: TDragon = {
        id,
        red,
        green,
        blue,
        shine,
        group: '',
      }
      return dragon
    })
    return input
  }

  part1(input: TInput): number {
    const good = input.filter(v => v.green > v.blue && v.green > v.red)

    return good.reduce((a, v) => a + v.id, 0)
  }

  part2(input: TInput): number {
    input.sort((a, b) => {
      let d = b.shine - a.shine
      if (d === 0) {
        d = a.blue + a.green + a.red - (b.blue + b.green + b.red)
      }
      return d
    })
    return input[0].id
  }

  part3(input: TInput): number {
    const getMainColor = (c: TDragon) => {
      if (c.red > c.blue && c.red > c.green) {
        return 'R'
      }
      if (c.blue > c.red && c.blue > c.green) {
        return 'B'
      }
      if (c.green > c.blue && c.green > c.red) {
        return 'G'
      }
      return ' '
    }

    let maxGroup = ''
    let maxCount = 0
    const groups: { [id: string]: number } = {}

    for (const e of input) {
      const k1 = getMainColor(e)
      const k2 = e.shine <= 30 ? 'M' : e.shine >= 33 ? 'S' : ' '
      if (k2 == ' ' || k1 == ' ') {
        continue
      }
      e.group = k1 + k2
      groups[e.group] ??= 0
      groups[e.group] += 1

      if (groups[e.group] > maxCount) {
        maxCount = groups[e.group]
        maxGroup = e.group
      }
    }

    return input.filter(e => e.group === maxGroup).reduce((a, e) => a + e.id, 0)
  }
}

if (!Deno.mainModule.endsWith('/main.ts')) {
  new Quest01().execute()
}
