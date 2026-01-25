import { Quest } from '../quest.ts'

type TConnection = {
  thickness: number
  target: number
  plant: TPlant
}

type TPlant = {
  id: number
  thickness: number
  connections: TConnection[]
  freeBranch: boolean
}

type TTestInput = boolean[]

type TInput = {
  root: TPlant
  plants: Map<number, TPlant>
  testInputs: TTestInput[]
}

const dummyPlant: TPlant = { id: 0, thickness: 0, connections: [], freeBranch: true }

class TextReader {
  data: string[]

  constructor(data: string[]) {
    this.data = data
  }

  skipWhiteLine() {
    if (this.data.length > 0 && this.data[0].length === 0) {
      this.data.shift()
    }
  }

  parsePlant(): TPlant | undefined {
    if (this.data.length === 0 || this.data[0].length === 0) {
      return undefined
    }

    let line = this.data.shift()
    let matches = line!.match(/(?:Plant )(?<id>\d+)(?: with thickness )(?<thickness>\d+)(?::)/)
    if (!matches) {
      throw 'Syntax error'
    }
    const { id, thickness } = matches!.groups!
    const plant: TPlant = {
      id: +id,
      thickness: +thickness,
      connections: [],
      freeBranch: false,
    }
    while (this.data.length > 0 && this.data[0].length > 0) {
      line = this.data.shift()
      matches = line!.match(/- free branch with thickness 1/)
      if (matches) {
        plant.freeBranch = true
        continue
      }
      matches = line!.match(/(?:- branch to Plant )(?<target>\d+)( with thickness )(?<thickness>-?\d+)(?:)/)
      if (!matches) {
        throw 'Syntax error'
      }
      plant.connections.push({
        thickness: +matches.groups!.thickness,
        target: +matches.groups!.target,
        plant: dummyPlant,
      })
    }

    this.skipWhiteLine()

    return plant
  }

  parseTestInput(): TTestInput[] {
    this.skipWhiteLine()

    const values: TTestInput[] = []
    while (this.data.length > 0 && this.data[0].length > 0) {
      const line = this.data.shift()!
      if (!line.match(/[01]( [01])*/)) {
        throw 'Syntax error'
      }
      const value = line.split(' ').map(v => v === '1')
      values.push([false, ...value]) // No plant with Id = 0
    }
    return values
  }
}

export class Quest18 extends Quest<TInput> {
  constructor() {
    super(18)
  }

  loadInput(part: number): TInput {
    const data = this.readDataFile(part)
    const reader = new TextReader(data)
    const input: TInput = {
      root: dummyPlant,
      plants: new Map(),
      testInputs: [],
    }

    for (let plant = reader.parsePlant(); plant; plant = reader.parsePlant()) {
      input.plants.set(plant.id, plant)
    }

    input.testInputs = reader.parseTestInput()

    const notRoot: number[] = []
    for (const plant of input.plants.values()) {
      if (plant.freeBranch) {
        notRoot.push(plant.id)
        continue
      }
      for (const c of plant.connections) {
        notRoot.push(c.target)
        c.plant = input.plants.get(c.target)!
      }
    }

    const rootIds = [...input.plants.keys()].filter(id => !notRoot.includes(id))
    if (rootIds.length !== 1) {
      throw 'No root found or too many found'
    }
    input.root = input.plants.get(rootIds[0])!
    return input
  }

  getBrightness(plant: TPlant, connectionThickness: number, testInput: TTestInput | undefined = undefined): number {
    if (plant.freeBranch) {
      const factor = ((testInput ?? [])[plant.id] ?? true) ? 1 : 0
      return connectionThickness * factor
    }

    let total = 0

    for (const connection of plant.connections) {
      total += this.getBrightness(connection.plant, connection.thickness, testInput)
    }

    if (total >= plant.thickness) {
      return total * connectionThickness
    } else {
      return 0
    }
  }

  part1(input: TInput): number {
    return this.getBrightness(input.root, 1)
  }

  part2(input: TInput): number {
    let total = 0
    for (const test of input.testInputs) {
      total += this.getBrightness(input.root, 1, test)
    }
    return total
  }

  part3(input: TInput): number {
    const testInput: TTestInput = [false]

    const allBranches = [...input.plants.values()]
    const freeBranches = allBranches.filter(p => p.freeBranch)

    freeBranches.forEach(b => (testInput[b.id] = !allBranches.filter(p => !p.freeBranch).some(p => p.connections.some(c => c.target === b.id && c.thickness < 0))))

    let max = this.getBrightness(input.root, 1, testInput)

    for (const f of freeBranches.filter(f => !testInput[f.id])) {
      testInput[f.id] = true
      const v = this.getBrightness(input.root, 1, testInput)
      if (v >= max) {
        max = v
      } else {
        testInput[f.id] = false
      }
    }

    let total = 0
    for (const test of input.testInputs) {
      const v = this.getBrightness(input.root, 1, test)
      if (v) {
        if (v > max) {
          throw 'Error'
        }
        total += max - v
      }
    }
    return total
  }
}

if (!Deno.mainModule.endsWith('/main.ts')) {
  new Quest18().execute()
}
