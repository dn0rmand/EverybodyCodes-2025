import { Quest } from '../quest.ts'

type TFormula = {
  a: number
  b: number
  c: number
  x: number
  y: number
  z: number
  m: number
}
type TInput = TFormula[]

export class Quest01 extends Quest<TInput> {
  constructor() {
    super(1, 1)
  }

  loadInput(part: number): TInput {
    const data = this.readDataFile(part)
    return data.map(line => {
      const formula: TFormula = {
        a: 0,
        b: 0,
        c: 0,
        x: 0,
        y: 0,
        z: 0,
        m: 1,
      }
      for (const l of line.split(' ')) {
        const [letter, value] = l.split('=')
        switch (letter) {
          case 'A':
            formula.a = +value
            break
          case 'B':
            formula.b = +value
            break
          case 'C':
            formula.c = +value
            break
          case 'X':
            formula.x = +value
            break
          case 'Y':
            formula.y = +value
            break
          case 'Z':
            formula.z = +value
            break
          case 'M':
            formula.m = +value
            break
          default:
            throw 'Syntax error'
        }
      }
      return formula
    })
  }

  eni(n: number, exp: number, mod: number, count?: number): number {
    const remainders = []
    const visited = []

    let value = 1
    let steps = 0
    let jumped = false

    while (exp--) {
      steps++
      value = (value * n) % mod
      remainders.unshift(value)
      if (count !== undefined) {
        if (remainders.length > count) {
          remainders.pop()
        }
        if (jumped) {
          continue
        }
        if (visited[value] !== undefined) {
          const jump = steps - visited[value]
          exp = exp % jump
          jumped = true
        } else {
          visited[value] = steps
        }
      }
    }

    const result = remainders.length === 0 ? 1 : +remainders.join('')

    return result
  }

  eni2(n: number, exp: number, mod: number): number {
    const visited = []

    let value = 1
    let steps = 0
    let jumped = false
    let total = 0

    while (exp--) {
      steps++
      value = (value * n) % mod
      total += value
      if (!jumped) {
        if (visited[value] !== undefined) {
          const idx = visited[value]
          const sum = visited.map((v, i) => (v !== undefined && v >= idx ? i : 0)).reduce((a, v) => a + v, 0)
          const size = steps - visited[value]
          const remain = exp % size
          const jumps = (exp - remain) / size
          exp = remain
          total += sum * jumps
          jumped = true
        } else {
          visited[value] = steps
        }
      }
    }

    return total
  }

  part1(formulas: TInput): number {
    let max = 0
    for (const { a, b, c, x, y, z, m } of formulas) {
      const v = this.eni(a, x, m) + this.eni(b, y, m) + this.eni(c, z, m)
      max = Math.max(max, v)
    }
    return max
  }

  part2(formulas: TInput): number {
    let max = 0
    for (const { a, b, c, x, y, z, m } of formulas) {
      const v = this.eni(a, x, m, 5) + this.eni(b, y, m, 5) + this.eni(c, z, m, 5)
      max = Math.max(max, v)
    }
    return max
  }

  part3(formulas: TInput): number {
    let max = 0
    for (const { a, b, c, x, y, z, m } of formulas) {
      const v = this.eni2(a, x, m) + this.eni2(b, y, m) + this.eni2(c, z, m)
      max = Math.max(max, v)
    }
    return max
  }
}

if (!Deno.mainModule.endsWith('/main.ts')) {
  new Quest01().execute()
}
