import { Quest } from '../quest.ts'

type TPoint = {
  x: number
  y: number
}

type TInput = {
  width: number
  height: number
  start: TPoint
  end: TPoint
  maps: Uint8Array[]
  allowRotation: boolean

  get: (x: number, y: number, rotation: number) => boolean
}

export class Quest20 extends Quest<TInput> {
  constructor() {
    super(20)
  }

  rotate(data: Uint8Array, width: number, height: number): Uint8Array {
    const output = new Uint8Array(width * height)
    let w = width
    for (let y = 0; y < height; y++) {
      let ox = height - 1 + y
      let oy = height - 1 - y
      let up = true
      for (let x = y; x < w; x++) {
        const c = data[ox + oy * width]
        output[x + y * width] = c
        if (up) {
          oy--
        } else {
          ox--
        }
        up = !up
      }
      w--
    }
    return output
  }

  loadInput(part: number): TInput {
    const data = this.readDataFile(part)
    const width = data[0].length
    const height = data.length
    const trampolines = new Uint8Array(data[0].length * data.length)
    const maps = [trampolines, trampolines, trampolines]
    const input: TInput = {
      width,
      height,
      start: { x: 0, y: 0 },
      end: { x: 0, y: 0 },
      allowRotation: part === 3,
      maps,
      get: (x, y, rotation) => {
        if (x < 0 || x >= width || y < 0 || y >= height) {
          return false
        } else {
          const map = maps[rotation]
          return map[x + y * width] === 1
        }
      },
    }

    const set = (x: number, y: number, v: boolean) => {
      if (x >= 0 && x < width && y >= 0 && y < height) {
        maps[0][x + y * width] = v ? 1 : 0
      }
    }

    for (let y = 0; y < input.height; y++) {
      for (let x = 0; x < input.width; x++) {
        switch (data[y][x]) {
          case 'S':
            input.start = { x, y }
            set(x, y, true)
            break
          case 'E':
            input.end = { x, y }
            set(x, y, true)
            break
          case 'T':
            set(x, y, true)
            break
        }
      }
    }

    if (input.allowRotation) {
      input.maps[1] = this.rotate(input.maps[0], width, height)
      input.maps[2] = this.rotate(input.maps[1], width, height)
    }
    return input
  }

  getMoves(input: TInput, { x, y }: TPoint, rotation: number): TPoint[] {
    const moves: TPoint[] = [{ x: x + 1, y }, { x: x - 1, y }, (x + y) % 2 === 0 ? { x, y: y - 1 } : { x, y: y + 1 }]
    if (input.allowRotation) {
      // Can jump in place
      moves.push({ x, y })
    }
    return moves.filter(move => move.x >= 0 && move.x < input.width && move.y >= 0 && move.y < input.height && input.get(move.x, move.y, rotation))
  }

  getJumps(input: TInput, withRotation: boolean) {
    const visited: Set<number> = new Set()

    visited.add(input.start.x + input.start.y * input.width)

    let states: TPoint[] = [input.start]
    let jumps = 0
    let rotation = 0

    while (states.length > 0) {
      const newStates: TPoint[] = []
      jumps++
      if (withRotation) {
        rotation = (rotation + 1) % 3
      }
      for (const state of states) {
        for (const newState of this.getMoves(input, state, rotation)) {
          if (newState.x === input.end.x && newState.y === input.end.y) {
            return jumps
          }

          const key = (newState.x + newState.y * input.width) << (2 + rotation)
          if (visited.has(key)) {
            continue
          }
          visited.add(key)
          newStates.push(newState)
        }
      }
      states = newStates
    }

    throw new Error('No solution found')
  }

  part1(input: TInput): number {
    let total = 0
    for (let y = 0; y < input.height; y++) {
      for (let x = 0; x < input.width; x++) {
        if (input.get(x, y, 0)) {
          if (x > 0 && input.get(x - 1, y, 0)) {
            total++
          }
          if ((x + y) % 2 === 0 && y > 0 && input.get(x, y - 1, 0)) {
            total++
          }
        }
      }
    }
    return total
  }

  part2(input: TInput): number {
    return this.getJumps(input, false)
  }

  part3(input: TInput): number {
    return this.getJumps(input, true)
  }
}

if (!Deno.mainModule.endsWith('/main.ts')) {
  new Quest20().execute()
}
