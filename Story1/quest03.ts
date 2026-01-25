import { Quest } from '../quest.ts'

type TSnail = {
  x: number
  y: number
  offset: number
  modulo: number
}

type TInput = TSnail[]

function gcd(a: number, b: number): number {
  if (a < b) {
    ;[a, b] = [b, a]
  }

  while (b !== 0) {
    const c = a % b
    a = b
    b = c
  }
  return a
}

function lcm(a: number, b: number): number {
  const g = gcd(a, b)
  const l = (a / g) * b
  return l
}

export class Quest03 extends Quest<TInput> {
  constructor() {
    super(3, 1)
  }

  loadInput(part: number): TInput {
    const data = this.readDataFile(part)
    return data
      .map(line => {
        const [x, y] = line.split(' ')
        return {
          x: +x.split('=')[1],
          y: +y.split('=')[1],
          offset: 0,
          modulo: -1,
        }
      })
      .map(e => {
        e.modulo = e.x + e.y - 1
        return e
      })
  }

  findDays(snails: TSnail[]): number {
    snails.sort((a, b) => a.offset - b.offset)
    snails = snails.reduce((a: TSnail[], s: TSnail) => {
      if (a.length === 0) {
        a.push(s)
      } else if (a[a.length - 1].offset === s.offset) {
        a[a.length - 1].modulo = lcm(a[a.length - 1].modulo, s.modulo)
      } else {
        a.push(s)
      }

      return a
    }, [])
    snails.sort((a, b) => b.modulo - a.modulo)

    let m = snails[0].modulo
    let i = 1
    let days
    for (days = snails[0].offset; i < snails.length; ) {
      const s = snails[i]
      if ((days - s.offset) % s.modulo === 0) {
        i++
        m = lcm(m, s.modulo)
      } else {
        days += m
      }
    }
    return days
  }

  part1(snails: TInput): number {
    let total = 0
    for (const { x, y, modulo } of snails) {
      const steps = 100 % modulo
      let x2 = x
      let y2 = y
      for (let i = 0; i < steps; i++) {
        if (y2 === 1) {
          y2 = x2
          x2 = 1
        } else {
          x2++
          y2--
        }
      }
      total += x2 + 100 * y2
    }
    return total
  }

  part2(snails: TInput): number {
    for (const e of snails) {
      while (e.y !== 1) {
        e.y--
        e.x++
        e.offset++
      }
    }
    return this.findDays(snails)
  }

  part3(snails: TInput): number {
    for (const e of snails) {
      while (e.y !== 1) {
        e.y--
        e.x++
        e.offset++
      }
    }
    return this.findDays(snails)
  }
}

if (!Deno.mainModule.endsWith('/main.ts')) {
  new Quest03().execute()
}
