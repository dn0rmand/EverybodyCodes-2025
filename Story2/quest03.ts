import { Quest } from '../quest.ts'

type TDice = {
  id: number
  faces: number[]
  seed: number
  pulse: number
  current: number
  modulo: number
  position: number
}

type TMap = {
  width: number
  height: number
  data: number[][]
}

type TInput = {
  dices: TDice[]
  track: number[]
  map: TMap
}

const REGEX = /(?<id>\d+)(?:: faces=\[)(?<faces>-?\d+(?:,-?\d+)*)(?:] seed=)(?<seed>\d+)/gi

export class Quest03 extends Quest<TInput> {
  constructor() {
    super(3, 2)
  }

  loadInput(part: number): TInput {
    const data = this.readDataFile(part)
    const map: TMap = {
      width: 0,
      height: 0,
      data: [],
    }
    const input: TInput = {
      dices: [],
      track: [],
      map,
    }

    let index = 0
    while (index < data.length) {
      const line = data[index++]
      if (line.length === 0) {
        break
      }

      for (const match of line.matchAll(REGEX)) {
        const id = +match.groups!['id']
        const faces = match.groups!['faces'].split(',').map(v => +v)
        const seed = +match.groups!['seed']

        input.dices.push({ id, faces, seed, pulse: seed, current: 0, modulo: seed * faces.length, position: 0 })
      }
    }

    if (part === 2) {
      if (index >= data.length) {
        throw 'Missing track'
      }
      input.track = data[index].split('').map(v => +v)
    } else if (part === 3) {
      if (index >= data.length) {
        throw 'Missing map'
      }

      map.width = data[index].length
      while (index < data.length) {
        const row = data[index++].split('').map(v => +v)
        map.data.push(row)
      }
      map.height = map.data.length
    }

    return input
  }

  rollDice(dice: TDice, roll_number: number): number {
    const spin = (dice.pulse * roll_number) % dice.modulo

    dice.current = (dice.current + spin) % dice.faces.length

    dice.pulse = (dice.pulse + spin) % dice.seed
    dice.pulse = (dice.pulse + 1 + roll_number + dice.seed) % dice.modulo

    return dice.faces[dice.current]
  }

  processDice(map: TMap, dice: TDice, visited: Set<number>) {
    let states: Map<number, { x: number; y: number }> = new Map()
    let newStates: Map<number, { x: number; y: number }> = new Map()

    let roll_number = 1
    let current = this.rollDice(dice, roll_number)

    const makeKey = (x: number, y: number) => x + y * map.width

    const addState = (x: number, y: number, value: number) => {
      if (x < 0 || y < 0 || x >= map.width || y >= map.height) {
        return
      }
      if (map.data[y][x] === value) {
        const k = makeKey(x, y)
        newStates.set(k, { x, y })
        visited.add(k)
      }
    }

    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        addState(x, y, current)
      }
    }

    ;[states, newStates] = [newStates, states]

    while (states.size > 0) {
      newStates.clear()
      current = this.rollDice(dice, ++roll_number)
      for (const { x, y } of states.values()) {
        addState(x, y, current)
        addState(x, y + 1, current)
        addState(x, y - 1, current)
        addState(x + 1, y, current)
        addState(x - 1, y, current)
      }
      ;[states, newStates] = [newStates, states]
    }
  }

  part1(input: TInput): number {
    let total = 0
    const dices = input.dices
    for (let roll_number = 1; ; roll_number++) {
      total += dices.reduce((a, d) => a + this.rollDice(d, roll_number), 0)
      if (total >= 10000) {
        return roll_number
      }
    }
  }

  part2(input: TInput): string {
    const order = []
    let dices = input.dices
    let roll_number = 0

    while (dices.length > 0) {
      ++roll_number

      let has_win = false
      for (const d of dices) {
        const v = this.rollDice(d, roll_number)
        if (v === input.track[d.position]) {
          d.position++
          if (d.position >= input.track.length) {
            order.push(d.id)
            has_win = true
          }
        }
      }
      if (has_win) {
        dices = dices.filter(d => d.position < input.track.length)
      }
    }

    return order.join(',')
  }

  part3(input: TInput): number {
    const visited: Set<number> = new Set()

    for (const dice of input.dices) {
      this.processDice(input.map, dice, visited)
    }

    return visited.size
  }
}

if (!Deno.mainModule.endsWith('/main.ts')) {
  new Quest03().execute()
}
