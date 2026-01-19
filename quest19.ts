import { Quest } from './tools/quest.ts'

type TTriplet = {
  x: number
  y: number
  size: number
}

type TState = {
  x: number
  y: number
  flaps: number
}

type TInput = TTriplet[]

export class Quest19 extends Quest<TInput> {
  constructor() {
    super(19)
  }

  loadInput(part: number): TInput {
    const data = this.readDataFile(part)
    const triplets: TInput = []

    data.forEach(line => {
      const values = line.split(',').map(v => +v)
      const t = { x: values[0], y: values[1], size: values[2] }
      triplets.push(t)
    })
    return triplets
  }

  getMoves(triplets: TInput, state: TState): TState[] {
    triplets = triplets.filter(t => t.x > state.x)
    if (triplets.length === 0) {
      throw 'Should not get here'
    }
    const passages = triplets.filter(t => t.x === triplets[0].x)
    const newStates: TState[] = []
    for (const passage of passages) {
      const xOffset = passage.x - state.x
      let previous: number = Number.MAX_SAFE_INTEGER
      for (let y = passage.y; y < passage.y + passage.size; y++) {
        const yOffset = y - state.y
        const absYoffset = Math.abs(yOffset)

        if (yOffset === 0 && (xOffset & 1) === 0) {
          previous = absYoffset
          newStates.push({ x: passage.x, y, flaps: state.flaps + xOffset / 2 })
          continue
        }
        if (absYoffset > xOffset) {
          if (previous < absYoffset) {
            break
          }
          continue
        }
        previous = absYoffset
        let flaps = yOffset > 0 ? yOffset : 0
        const left = xOffset - absYoffset
        if ((left & 1) === 0) {
          flaps += left / 2
          newStates.push({ x: passage.x, y, flaps: state.flaps + flaps })
        }
      }
    }
    return newStates
  }

  fly(triplets: TInput): number {
    let states: Map<number, TState> = new Map()
    let newStates: Map<number, TState> = new Map()

    let minFlaps = Number.MAX_SAFE_INTEGER

    const maxX = Math.max(...triplets.map(t => t.x))

    states.set(0, { x: 0, y: 0, flaps: 0 })
    while (states.size > 0) {
      newStates.clear()
      for (const state of states.values()) {
        const moves = this.getMoves(triplets, state)
        for (const newState of moves) {
          if (newState.y < 0 || newState.flaps >= minFlaps) {
            continue
          }
          if (newState.x >= maxX) {
            minFlaps = Math.min(minFlaps, newState.flaps)
            continue
          }

          const old = newStates.get(newState.y)
          if (old === undefined || old.flaps > newState.flaps) {
            newStates.set(newState.y, newState)
          }
        }
      }

      const tmp = newStates
      newStates = states
      states = tmp
    }

    return minFlaps
  }

  part1(input: TInput): number {
    return this.fly(input)
  }

  part2(input: TInput): number {
    return this.fly(input)
  }

  part3(input: TInput): number {
    return this.fly(input)
  }
}

if (!Deno.mainModule.endsWith('/main.ts')) {
  new Quest19().execute()
}
