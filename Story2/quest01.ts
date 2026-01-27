import { Quest } from '../quest.ts'

type TMap = {
  height: number
  width: number
  slots: number
  data: string[]
}

type TInput = {
  map: TMap
  tokens: string[]
}

export class Quest01 extends Quest<TInput> {
  played: Map<string, number> = new Map()

  constructor() {
    super(1, 2)
  }

  loadInput(part: number): TInput {
    this.played.clear()
    const data = this.readDataFile(part)
    let idx = 0
    const input: TInput = {
      tokens: [],
      map: { width: 0, height: 0, slots: 0, data: [] },
    }

    while (data[idx] != '') {
      const line = data[idx++]
      input.map.data.push(line)
    }

    input.map.height = input.map.data.length
    input.map.width = input.map.data[0].length
    input.map.slots = Math.floor(input.map.width / 2 + 1)
    idx++

    for (; idx < data.length; idx++) {
      input.tokens.push(data[idx])
    }
    return input
  }

  play(map: TMap, token: string, start: number): number {
    const key = `${start}:${token}`
    let won = this.played.get(key)
    if (won !== undefined) {
      return won
    }
    let x = (start - 1) * 2
    let ti = 0
    for (let y = 0; y < map.height; y++) {
      if (map.data[y][x] === '*') {
        const direction = token[ti]
        ti = (ti + 1) % token.length
        if (direction === 'L') {
          if (x === 0) {
            x++
          } else {
            x--
          }
        } else if (direction === 'R') {
          if (x === map.width - 1) {
            x--
          } else {
            x++
          }
        } else {
          throw 'Invalid'
        }
      }
    }

    if (x % 2 !== 0) {
      throw 'error'
    }
    const end = x / 2 + 1

    won = Math.max(0, end * 2 - start)
    this.played.set(key, won)
    return won
  }

  getBest(map: TMap, token: string): number {
    let max = 0
    for (let start = 1; start <= map.slots; start++) {
      const w = this.play(map, token, start)
      max = Math.max(w, max)
    }
    return max
  }

  memoizeMax: Map<number, number> = new Map()
  memoizeMin: Map<number, number> = new Map()

  getMax(input: TInput, index: number, usedSlots: number): number {
    if (index >= input.tokens.length) {
      return 0
    }

    const key = usedSlots * 30 + index
    let max = this.memoizeMax.get(key)
    if (max !== undefined) {
      return max
    }
    max = 0

    const token = input.tokens[index]
    for (let start = 1; start <= input.map.slots; start++) {
      const flag = 1 << (start - 1)
      if (usedSlots & flag) {
        continue
      }
      max = Math.max(max, this.play(input.map, token, start) + this.getMax(input, index + 1, usedSlots | flag))
    }

    this.memoizeMax.set(key, max)
    return max
  }

  getMin(input: TInput, index: number, usedSlots: number): number {
    if (index >= input.tokens.length) {
      return 0
    }

    const key = usedSlots * 30 + index

    let min = this.memoizeMin.get(key)
    if (min !== undefined) {
      return min
    }
    min = Number.MAX_SAFE_INTEGER

    const token = input.tokens[index]
    for (let start = 1; start <= input.map.slots; start++) {
      const flag = 1 << (start - 1)
      if (usedSlots & flag) {
        continue
      }
      min = Math.min(min, this.play(input.map, token, start) + this.getMin(input, index + 1, usedSlots | flag))
    }

    this.memoizeMin.set(key, min)
    return min
  }

  part1(input: TInput): number {
    let total = 0
    for (let i = 0; i < input.tokens.length; i++) {
      const token = input.tokens[i]
      total += this.play(input.map, token, i + 1)
    }
    return total
  }

  part2(input: TInput): number {
    let total = 0
    for (const token of input.tokens) {
      const max = this.getBest(input.map, token)
      total += max
    }
    return total
  }

  part3(input: TInput): string {
    const minimum = this.getMin(input, 0, 0)
    const maximum = this.getMax(input, 0, 0)
    return `${minimum} ${maximum}`
  }
}

if (!Deno.mainModule.endsWith('/main.ts')) {
  new Quest01().execute()
}
