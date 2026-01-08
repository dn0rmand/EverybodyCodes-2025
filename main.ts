import { IQuest } from './tools/quest.ts'
import { Quest01 } from './quest01.ts'

const days: IQuest[] = [new Quest01()]

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

const dayLog = (buffer: string[]) => (msg: string) => {
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
  const s = `${value}`
  if (s.length < length) {
    return direction === 'L' ? ' '.repeat(length - s.length) + s : s + ' '.repeat(length - s.length)
  } else {
    return s.substring(0, length)
  }
}

function executeAll() {
  console.time('@advent-2025')

  output('┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐')
  output('│ 🎄🎄🎄🎄🎄🎄🎄🎄🎄🎄🎄🎄🎄🎄🎄🎄🎄🎄🎄🎄 The Song of Ducks and Dragons - 2025 🎄🎄🎄🎄🎄🎄🎄🎄🎄🎄🎄🎄🎄🎄🎄🎄🎄🎄 │')
  output('├─────┬───────────────────────────┬──────────────────────┬─────────────────────────────────────────────┬─────────────┤')
  output('│ Day │ Title                     │ Part 1               │ Part 2               │ Part 3               │ Time in ms  │')

  for (const day of days) {
    const lines: string[] = []
    console.log = dayLog(lines)
    const key = `@day${day.quest}`
    const msg = `to execute both parts of day ${day.quest}`
    console.time(key)
    day.execute()
    console.timeLog(key, msg)

    const p1 = lines[1].split('Part 1: ')[1]
    const p2 = lines[2].split('Part 2: ')[1]
    const p3 = lines[3].split('Part 3: ')[1]
    const duration = times[`@day${day.quest}`].duration
    const ms = `${duration.toFixed(4)} ms`

    output('├─────┼───────────────────────────┼──────────────────────┼──────────────────────┼──────────────────────┼─────────────┤')
    output(`│ ${format(day.quest, 3, 'L')} │ ${format(day.title, 25)} │ ${format(p1, 20)} │ ${format(p2, 20)} │ ${format(p3, 20)} │ ${format(ms, 11, 'L')} │`)
  }
  console.timeLog('@advent-2025', 'to execute them all')

  const total = `${times['@advent-2025'].duration.toFixed(4)} ms`

  output('└─────┴───────────────────────────┴──────────────────────┴──────────────────────┴──────────────────────┼─────────────┤')
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
