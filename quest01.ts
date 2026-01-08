import { Quest } from './tools/quest.ts'

type TMove = {
  direction: string
  distance: number
}

type TInput = {
  names: string[]
  moves: TMove[]
}

export class Quest01 extends Quest<TInput> {
  constructor() {
    super(1)
  }

  loadInput(part: number): TInput {
    const data = this.readDataFile(part)

    return {
      names: data[0].split(','),
      moves: data[2].split(',').map(s => ({
        direction: s[0],
        distance: +s.slice(1),
      })),
    }
  }

  part1(input: TInput): string {
    let position = 0
    for (const move of input.moves) {
      if (move.direction == 'L') {
        position = Math.max(0, position - move.distance)
      } else {
        position = Math.min(input.names.length - 1, position + move.distance)
      }
    }
    return input.names[position]
  }

  part2(input: TInput): string {
    let position = 0
    const modulo = input.names.length
    for (const move of input.moves) {
      if (move.direction == 'L') {
        position = (position + modulo - move.distance) % modulo
      } else {
        position = (position + move.distance) % modulo
      }
    }
    return input.names[position]
  }

  part3(input: TInput): string {
    const modulo = input.names.length
    for (const move of input.moves) {
      const name = input.names[0]
      const distance = move.distance % modulo
      const newPosition = move.direction == 'L' ? (modulo - distance) % modulo : distance % modulo

      input.names[0] = input.names[newPosition]
      input.names[newPosition] = name
    }
    return input.names[0]
  }
}

if (!Deno.mainModule.endsWith('/main.ts')) {
  new Quest01().execute()
}
