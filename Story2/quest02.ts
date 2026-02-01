import { Quest } from '../quest.ts'

type TColor = 'R' | 'G' | 'B'
type TChain = {
  color: TColor
  next: TChain | undefined
}

type TCircle = {
  leftBalloons: TChain | undefined
  lastLeft: TChain | undefined
  rightBalloons: TChain | undefined
  leftLength: number
  rightLength: number
}

const arrowsOrder: TColor[] = ['R', 'G', 'B']

export class Quest02 extends Quest<TColor[]> {
  constructor() {
    super(2, 2)
  }

  loadInput(part: number): TColor[] {
    const data = this.readDataFile(part)
    const line = data[0] // .repeat(part === 2 ? 100 : part === 3 ? 100000 : 1)
    return line.split('').map(c => {
      if (c === 'R' || c === 'G' || c === 'B') {
        return c
      }
      throw 'Syntax Error'
    })
  }

  makeCircle(colors: TColor[], repeat: number): TCircle {
    let left: TChain = { color: colors[0], next: undefined }
    let right: TChain = { color: colors[0], next: undefined }

    const circle: TCircle = {
      leftBalloons: left,
      lastLeft: left,
      rightBalloons: right,
      leftLength: 1,
      rightLength: 1,
    }

    const length = repeat * colors.length

    for (let k = 1; k < length / 2; k++) {
      const color = colors[k % colors.length]
      const newLeft: TChain = { color, next: undefined }
      const newRight: TChain = { color, next: undefined }
      left.next = newLeft
      right.next = newRight
      left = newLeft
      right = newRight
      circle.lastLeft = newLeft
      circle.leftLength++
      circle.rightLength++
    }

    return circle
  }

  popCircle(circle: TCircle, color: TColor): TCircle {
    const left = circle.leftBalloons!

    if (left.color === color && circle.leftLength === circle.rightLength) {
      const right = circle.rightBalloons!
      circle.rightBalloons = right.next
      circle.rightLength -= 1
    }

    circle.leftBalloons = left.next
    circle.leftLength -= 1

    if (circle.leftLength === 0) {
      circle.leftLength = circle.rightLength
      circle.leftBalloons = circle.rightBalloons
      circle.lastLeft = circle.leftBalloons
      circle.rightBalloons = undefined
      circle.rightLength = 0
    } else if (circle.rightLength > circle.leftLength) {
      const right = circle.rightBalloons!
      circle.rightBalloons = right.next
      right.next = undefined
      circle.lastLeft!.next = right
      circle.lastLeft = right
      circle.leftLength++
      circle.rightLength--
    }
    return circle
  }

  part1(balloons: TColor[]): number {
    let nextBalloon = 0
    let arrows = 0

    while (nextBalloon < balloons.length) {
      const color = arrowsOrder[arrows++ % 3]
      while (balloons[nextBalloon++] === color);
    }

    return arrows
  }

  part2(colors: TColor[]): number {
    let arrows = 0
    let balloons = this.makeCircle(colors, 100)

    while (balloons.leftLength > 0) {
      balloons = this.popCircle(balloons, arrowsOrder[arrows++ % 3])
    }
    return arrows
  }

  part3(colors: TColor[]): number {
    let arrows = 0
    let circle = this.makeCircle(colors, 100000)

    while (circle.leftLength > 0) {
      circle = this.popCircle(circle, arrowsOrder[arrows++ % 3])
    }
    return arrows
  }
}

if (!Deno.mainModule.endsWith('/main.ts')) {
  new Quest02().execute()
}
