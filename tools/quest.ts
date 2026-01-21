export interface IQuest {
  quest: number
  title: string
  execute(): void
}

export abstract class Quest<T> implements IQuest {
  public quest: number
  public title: string

  constructor(quest: number, title?: string) {
    this.quest = quest
    this.title = title ?? `Quest ${quest}`
  }

  abstract part1(input: T): number | string
  abstract part2(input: T): number | string
  abstract part3(input: T): number | string
  abstract loadInput(part: number): T

  timeStart(name: string) {
    const key = name //.toLowerCase().replace('  ', '-')
    console.time(`quest${this.quest}:${key}`)
  }

  timeEnd(name: string) {
    const key = name //.toLowerCase().replace('  ', '-')
    console.timeLog(`quest${this.quest}:${key}`, `to ${name === 'input' ? 'parse' : 'execute'} ${name} of quest ${this.quest}`)
  }

  readDataFile(part: number): string[] {
    const data = Deno.readTextFileSync(`./data/quest${this.quest}/${part}.raw`)
    return data.split('\n')
  }

  execute(): void {
    try {
      console.log(`--- quest ${this.quest}: ${this.title} ---`)

      this.timeStart('total')

      this.timeStart('part-1')
      console.log(`Part 1: ${this.part1(this.loadInput(1))}`)
      this.timeEnd('part-1')

      this.timeStart('part-2')
      console.log(`Part 2: ${this.part2(this.loadInput(2))}`)
      this.timeEnd('part-2')

      this.timeStart('part-3')
      console.log(`Part 3: ${this.part3(this.loadInput(3))}`)
      this.timeEnd('part-3')

      this.timeEnd('total')
    } catch (error) {
      // deno-lint-ignore no-debugger
      debugger
      throw error
    }
  }
}
