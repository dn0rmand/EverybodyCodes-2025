import { Quest } from './tools/quest.ts'

type TRules = Record<string, string[]>

type TInput = {
  names: string[]
  rules: TRules
}

type TState = {
  length: number
  key: string
  count: number
}

export class Quest07 extends Quest<TInput> {
  constructor() {
    super(7)
  }

  loadInput(part: number): TInput {
    const data = this.readDataFile(part)
    const names = data[0].split(',')
    const rules: TRules = {}

    for (let i = 2; i < data.length; i++) {
      const [key, values] = data[i].split(' > ')
      rules[key] = values.split(',')
    }

    return { names, rules }
  }

  validateName(name: string, rules: TRules): boolean {
    for (let i = 0; i < name.length - 1; i++) {
      const rule = rules[name[i]]
      if (rule !== undefined && !rule.includes(name[i + 1])) {
        return false
      }
    }
    return true
  }

  part1(input: TInput): string {
    return input.names.find(n => this.validateName(n, input.rules))!
  }

  part2(input: TInput): number {
    return input.names.reduce((a, n, i) => (this.validateName(n, input.rules) ? a + i + 1 : a), 0)
  }

  part3(input: TInput): number {
    let states: Map<string, TState> = new Map()
    let newStates: Map<string, TState> = new Map()

    const addState = (state: TState) => {
      if (state.length >= 7 && state.length <= 11) {
        found += state.count
      }

      if (state.length < 11) {
        const key = `${state.key}:${state.length}`
        const old = newStates.get(key)
        if (old !== undefined) {
          old.count += state.count
        } else {
          newStates.set(key, state)
        }
      }
    }

    const rules = input.rules

    const prefixes = input.names.filter(p => this.validateName(p, rules)).sort((a, b) => a.length - b.length)

    for (const prefix of prefixes) {
      const use = prefixes.findIndex(p => prefix.length > p.length && prefix.startsWith(p)) < 0
      if (use) {
        const start: TState = { key: prefix[prefix.length - 1], length: prefix.length, count: 1 }
        addState(start)
      }
    }

    ;[states, newStates] = [newStates, states]

    let found: number = 0

    while (states.size > 0) {
      newStates.clear()
      for (const state of states.values()) {
        const rule = rules[state.key] ?? []
        for (const c of rule) {
          addState({ key: c, length: state.length + 1, count: state.count })
        }
      }
      ;[states, newStates] = [newStates, states]
    }
    return found
  }
}

if (!Deno.mainModule.endsWith('/main.ts')) {
  new Quest07().execute()
}
