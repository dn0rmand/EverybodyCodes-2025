import { Quest } from './tools/quest.ts'

type TInput = string

const LETTER_A = 'A'.charCodeAt(0)
const LETTER_a = 'a'.charCodeAt(0)

export class Quest06 extends Quest<TInput> {
  constructor() {
    super(6)
  }

  loadInput(part: number): TInput {
    const data = this.readDataFile(part)[0]
    return data
  }

  part1(input: TInput): number {
    let mentors = 0
    let total = 0

    for (const c of input) {
      if (c === 'A') {
        mentors++
      } else if (c === 'a') {
        total += mentors
      }
    }
    return total
  }

  part2(input: TInput): number {
    const mentors = [0, 0, 0]
    const total = [0, 0, 0]

    for (const c of input) {
      if (c === 'A' || c === 'B' || c === 'C') {
        const i = c.charCodeAt(0) - LETTER_A
        mentors[i]++
      } else if (c === 'a' || c === 'b' || c === 'c') {
        const i = c.charCodeAt(0) - LETTER_a
        total[i] += mentors[i]
      }
    }

    return total[0] + total[1] + total[2]
  }

  part3(input: TInput): number {
    const locations: { A: number[]; B: number[]; C: number[] } = {
      A: [],
      B: [],
      C: [],
    }
    const pairs: { a: number; b: number; c: number } = {
      a: 0,
      b: 0,
      c: 0,
    }

    for (let i = 0; i < input.length; i++) {
      const c = input[i]
      if (c === 'A' || c === 'B' || c === 'C') {
        locations[c].push(i)
      }
    }

    // middle sections
    for (let i = 0; i < input.length; i++) {
      const c = input[i]
      if (c === 'a' || c === 'b' || c === 'c') {
        const m = c === 'a' ? 'A' : c === 'b' ? 'B' : 'C'
        const locs = [...locations[m], ...locations[m].map(i => i + input.length), ...locations[m].map(i => i + 2 * input.length)]
        const mentors = locs.map(d => d - (i + input.length)).filter(d => -1000 <= d && d <= 1000).length
        pairs[c] += mentors * (1000 - 2)
      }
    }

    // first section
    for (let i = 0; i < input.length; i++) {
      const c = input[i]
      if (c === 'a' || c === 'b' || c === 'c') {
        const m = c === 'a' ? 'A' : c === 'b' ? 'B' : 'C'
        const locs = [...locations[m], ...locations[m].map(i => i + input.length)]
        const mentors = locs.map(d => d - i).filter(d => -1000 <= d && d <= 1000).length
        pairs[c] += mentors
      }
    }

    // last section
    for (let i = 0; i < input.length; i++) {
      const c = input[i]
      if (c === 'a' || c === 'b' || c === 'c') {
        const m = c === 'a' ? 'A' : c === 'b' ? 'B' : 'C'
        const locs = [...locations[m], ...locations[m].map(i => i + input.length)]
        const mentors = locs.map(d => d - (i + input.length)).filter(d => -1000 <= d && d <= 1000).length
        pairs[c] += mentors
      }
    }

    return pairs.a + pairs.b + pairs.c
  }
}

if (!Deno.mainModule.endsWith('/main.ts')) {
  new Quest06().execute()
}
