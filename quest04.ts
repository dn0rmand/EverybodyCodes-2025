import { Quest } from './tools/quest.ts'

type TGear = {
  in: number
  out: number
}

type TInput = TGear[]

export class Quest04 extends Quest<TInput> {
  constructor() {
    super(4)
  }

  loadInput(part: number): TInput {
    const data = this.readDataFile(part).map(v => {
      const values = v.split('|').map(t => +t)
      return { in: values[0], out: values[1] ?? values[0] }
    })
    return data
  }

  part1(gears: TInput): number {
    const teeths = gears[0].in * 2025
    const turns = teeths / gears[gears.length - 1].in

    return Math.floor(turns)
  }

  part2(gears: TInput): number {
    const teeths = gears[gears.length - 1].in * 10000000000000
    const turns = teeths / gears[0].in

    return Math.ceil(turns)
  }

  part3(gears: TInput): number {
    let teeths = 100 * gears[0].in
    for (let i = 1; i < gears.length; i++) {
      const g = gears[i]
      teeths = teeths * (g.out / g.in)
    }
    const turns = teeths / gears[gears.length - 1].out
    return Math.floor(turns)
  }
}

if (!Deno.mainModule.endsWith('/main.ts')) {
  new Quest04().execute()
}
