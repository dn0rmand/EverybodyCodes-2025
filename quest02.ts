import { Quest } from './tools/quest.ts'

type TComplex = {
  x: bigint
  y: bigint
}

export class Quest02 extends Quest<TComplex> {
  constructor() {
    super(2)
  }

  loadInput(part: number): TComplex {
    let data = this.readDataFile(part)[0]
    data = data.substring(3, data.length - 1)
    const values = data.split(',').map(v => BigInt(+v))

    return { x: values[0], y: values[1] }
  }

  cycle(R: TComplex, A: TComplex, D: TComplex): TComplex {
    const x2 = R.x * R.x
    const y2 = R.y * R.y
    const X = x2 - y2
    const Y = R.x * R.y * 2n
    return { x: A.x + X / D.x, y: A.y + Y / D.y }
  }

  checkPoint(A: TComplex): boolean {
    let R = { x: 0n, y: 0n }
    const D = { x: 100000n, y: 100000n }
    const MAX = 1000000n
    const MIN = -MAX

    for (let i = 0; i < 100; i++) {
      R = this.cycle(R, A, D)
      if (R.x <= MIN || R.x >= MAX || R.y <= MIN || R.y >= MAX) {
        return false
      }
    }

    return true
  }

  part1(A: TComplex): string {
    let R = { x: 0n, y: 0n }
    const D = { x: 10n, y: 10n }

    R = this.cycle(R, A, D)
    R = this.cycle(R, A, D)
    R = this.cycle(R, A, D)

    return `[${R.x},${R.y}]`
  }

  part2(A: TComplex): number {
    let count = 0

    for (let y = 0n; y <= 1000n; y += 10n) {
      for (let x = 0n; x <= 1000n; x += 10n) {
        if (this.checkPoint({ x: A.x + x, y: A.y + y })) {
          count++
        }
      }
    }
    return count
  }

  part3(A: TComplex): number {
    let count = 0

    for (let y = 0n; y <= 1000n; y++) {
      for (let x = 0n; x <= 1000n; x++) {
        if (this.checkPoint({ x: A.x + x, y: A.y + y })) {
          count++
        }
      }
    }
    return count
  }
}

if (!Deno.mainModule.endsWith('/main.ts')) {
  new Quest02().execute()
}
