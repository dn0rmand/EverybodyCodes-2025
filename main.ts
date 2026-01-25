import { IQuest } from './quest.ts'
import { Quest01 } from './Quests/quest01.ts'
import { Quest02 } from './Quests/quest02.ts'
import { Quest03 } from './Quests/quest03.ts'
import { Quest04 } from './Quests/quest04.ts'
import { Quest05 } from './Quests/quest05.ts'
import { Quest06 } from './Quests/quest06.ts'
import { Quest07 } from './Quests/quest07.ts'
import { Quest08 } from './Quests/quest08.ts'
import { Quest09 } from './Quests/quest09.ts'
import { Quest10 } from './Quests/quest10.ts'
import { Quest11 } from './Quests/quest11.ts'
import { Quest12 } from './Quests/quest12.ts'
import { Quest13 } from './Quests/quest13.ts'
import { Quest14 } from './Quests/quest14.ts'
import { Quest15 } from './Quests/quest15.ts'
import { Quest16 } from './Quests/quest16.ts'
import { Quest17 } from './Quests/quest17.ts'
import { Quest18 } from './Quests/quest18.ts'
import { Quest19 } from './Quests/quest19.ts'
import { Quest20 } from './Quests/quest20.ts'

import { Quest01 as Story1Quest01 } from './Story1/quest01.ts'
import { Quest02 as Story1Quest02 } from './Story1/quest02.ts'

const quests: IQuest[] = [
  new Quest01(),
  new Quest02(),
  new Quest03(),
  new Quest04(),
  new Quest05(),
  new Quest06(),
  new Quest07(),
  new Quest08(),
  new Quest09(),
  new Quest10(),
  new Quest11(),
  new Quest12(),
  new Quest13(),
  new Quest14(),
  new Quest15(),
  new Quest16(),
  new Quest17(),
  new Quest18(),
  new Quest19(),
  new Quest20(),

  new Story1Quest01(),
  new Story1Quest02(),
]

type TimeEntry = {
  duration: number
  message: string
}

const times: { [id: string]: TimeEntry } = {}

function compare(a: TimeEntry, b: TimeEntry): number {
  return a.duration - b.duration
}

const output = console.log

console.debug = () => {}

const questLog = (buffer: string[]) => (msg: string) => {
  buffer.push(msg)
}

console.time = (key: string) => {
  if (key[0] == '@') {
    performance.mark(key + '$start')
  }
}

console.timeLog = (key: string, msg: string) => {
  if (key[0] == '@') {
    performance.mark(key + '$end')
    const t = performance.measure(key, key + '$start', key + '$end')
    times[key] = {
      duration: t.duration,
      message: `${t.duration.toFixed(5)}ms ${msg}`,
    }
  }
}

function format(value: string | number, length: number, direction: 'L' | 'R' = 'R') {
  const s = String(value)
  const sLen = s.length
  if (sLen < length) {
    const padding = ' '.repeat(length - sLen)
    return direction === 'L' ? padding + s : s + padding
  }
  return s.substring(0, length)
}

function executeAll() {
  console.time('@advent-2025')

  output('┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐')
  output('│ 🎄🎄🎄🎄🎄🎄🎄🎄🎄🎄🎄🎄🎄🎄🎄🎄🎄🎄🎄🎄 The Song of Ducks and Dragons - 2025 🎄🎄🎄🎄🎄🎄🎄🎄🎄🎄🎄🎄🎄🎄🎄🎄🎄🎄 │')
  output('├───────┬─────────────────────────┬──────────────────────┬─────────────────────────────────────────────┬─────────────┤')
  output('│ Quest │ Title                   │ Part 1               │ Part 2               │ Part 3               │ Time in ms  │')

  for (const quest of quests) {
    const lines: string[] = []
    console.log = questLog(lines)
    const key = `@quest${quest.quest}`
    const msg = `to execute all 3 parts of quest ${quest.quest}`
    console.time(key)
    quest.execute()
    console.timeLog(key, msg)

    const p1 = lines[1].split('Part 1: ')[1]
    const p2 = lines[2].split('Part 2: ')[1]
    const p3 = lines[3].split('Part 3: ')[1]
    const duration = times[`@quest${quest.quest}`].duration
    const ms = `${duration.toFixed(4)} ms`

    output('├───────┼─────────────────────────┼──────────────────────┼──────────────────────┼──────────────────────┼─────────────┤')
    output(`│ ${format(quest.quest, 5, 'L')} │ ${format(quest.title, 23)} │ ${format(p1, 20)} │ ${format(p2, 20)} │ ${format(p3, 20)} │ ${format(ms, 11, 'L')} │`)
  }
  console.timeLog('@advent-2025', 'to execute them all')

  const total = `${times['@advent-2025'].duration.toFixed(4)} ms`

  output('└───────┴─────────────────────────┴──────────────────────┴──────────────────────┴──────────────────────┼─────────────┤')
  output(`                                                                                                       │ ${format(total, 11, 'L')} │`)
  output('                                                                                                       └─────────────┘')

  times['@advent-2025'].duration = 0 // For the sorting

  const order = Object.keys(times)
    .filter(k => k !== '@advent-2025')
    .filter(k => times[k].duration > 10)
    .sort((a: string, b: string) => compare(times[b], times[a]))

  for (const key of order) {
    output(times[key].message)
  }
  output('\r')
}

executeAll()
