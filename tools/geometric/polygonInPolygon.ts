export type TPoint = {
  x: number
  y: number
}

export type TLine = {
  a: TPoint
  b: TPoint
}

export type TPolygon = TPoint[]

const lineLength = (a: TPoint, b: TPoint): number => b.x - a.x + b.y - a.y

const pointWithLine = (p: TPoint, a: TPoint, b: TPoint): boolean => (p.x - b.x) * (a.y - b.y) === (p.y - b.y) * (a.x - b.x)

const pointOnLine = (point: TPoint, a: TPoint, b: TPoint): boolean => {
  const l = lineLength(a, b)
  if (!pointWithLine(point, a, b)) {
    return false
  }
  if (lineLength(a, point) <= l) {
    return false
  }
  if (lineLength(b, point) <= l) {
    return false
  }
  return true
}

const lineIntersectsLine = (aa: TPoint, ab: TPoint, ba: TPoint, bb: TPoint): boolean => {
  if ((aa.x === ba.x && aa.y === ba.y) || (ab.x === bb.x && ab.y === bb.y)) {
    return true
  }

  // Test for point on line
  if (pointOnLine(aa, ba, bb) || pointOnLine(ab, ba, bb)) {
    return true
  }
  if (pointOnLine(ba, aa, ab) || pointOnLine(bb, aa, ab)) {
    return true
  }

  const denom = (bb.y - bb.y) * (ab.x - aa.x) - (bb.x - ba.x) * (ab.y - aa.y)

  if (denom === 0) {
    return false
  }

  const deltaY = aa.y - ba.y
  const deltaX = aa.x - ba.x
  const numer0 = (bb.x - ba.x) * deltaY - (bb.y - ba.y) * deltaX
  const numer1 = (ab.x - aa.x) * deltaY - (ab.y - aa.y) * deltaX
  const quotA = numer0 / denom
  const quotB = numer1 / denom

  return quotA > 0 && quotA < 1 && quotB > 0 && quotB < 1
}

export class Polygon {
  pointsChecked: Map<number, boolean> = new Map()
  linesChecked: Map<bigint, boolean> = new Map()
  xConnect: Map<number, TPoint[]> = null!
  path: TPoint[] = []

  constructor(points: TPoint[], xConnect: Map<number, TPoint[]>, yConnect: Map<number, TPoint[]>) {
    this.xConnect = xConnect
    const start = points[0]

    let point = start
    let state = 0

    do {
      this.path.push(point)

      if (state === 0) {
        state = 1
        point = xConnect.get(point.x)?.find(pt => pt.y !== point.y)!
      } else {
        state = 0
        point = yConnect.get(point.y)?.find(pt => pt.x !== point.x)!
      }

      if (point.x === start.x && point.y === start.y) {
        break
      }
    } while (point.x !== start.x || point.y !== start.y)

    this.path.push(start)
  }

  lineIntersects(line: TLine): boolean {
    const keya = line.a.y * 100000 + line.a.x
    const keyb = line.b.y * 100000 + line.b.x
    const key = keya < keyb ? BigInt(keyb) * 10000000000n + BigInt(keya) : BigInt(keya) * 10000000000n + BigInt(keyb)

    let intersects = this.linesChecked.get(key)
    if (intersects !== undefined) {
      return intersects
    }
    intersects = false

    for (let i = 0, l = this.path.length - 1; i < l; i++) {
      const v0 = this.path[i],
        v1 = this.path[i + 1]

      if (lineIntersectsLine(line.a, line.b, v0, v1)) {
        intersects = true
        break
      }
    }

    this.linesChecked.set(key, intersects)
    return intersects
  }

  containsPoint(point: TPoint, o: TPoint): boolean {
    if ((this.xConnect.get(o.x) ?? []).some(p => p.y === o.y)) {
      return true
    }

    const { x, y } = point
    const key = y * 100000 + x

    let inside = this.pointsChecked.get(key)
    if (inside !== undefined) {
      return inside
    }

    inside = false
    for (let i = 0, j = this.path.length - 1; i < this.path.length; j = i++) {
      const { x: xi, y: yi } = this.path[i]
      const { x: xj, y: yj } = this.path[j]
      if (yi > y != yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
        inside = !inside
      }
    }

    this.pointsChecked.set(key, inside)
    return inside
  }

  containsPolygon(polygonA: TPolygon, outerPolygonA: TPolygon): boolean {
    let inside = true

    for (let i = 0, l = polygonA.length - 1; i < l; i++) {
      const a = polygonA[i]
      const o = outerPolygonA[i]

      if (!this.containsPoint(o, o)) {
        inside = false
        break
      }

      if (this.lineIntersects({ a, b: polygonA[i + 1] })) {
        inside = false
        break
      }
    }

    return inside
  }
}
