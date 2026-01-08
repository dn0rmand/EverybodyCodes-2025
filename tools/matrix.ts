export class Matrix {
  matrix: number[][]
  rows: number
  columns: number
  values: number[]

  constructor(rows: number, columns: number) {
    this.rows = rows
    this.columns = columns
    this.matrix = new Array(rows)
    this.values = new Array(columns - 1)

    for (let r = 0; r < rows; r++) {
      this.matrix[r] = new Array(columns).fill(0)
    }
  }

  private gcd(a: number, b: number): number {
    a = a < 0 ? -a : a
    b = b < 0 ? -b : b
    if (a < b) {
      ;[a, b] = [b, a]
    }

    while (b !== 0) {
      const c = a % b
      a = b
      b = c
    }
    return a
  }

  private gcdRow(row: number) {
    const g = this.matrix[row].reduce((a, v) => {
      if (v !== 0) {
        if (a === 0) {
          a = Math.abs(v)
        } else {
          a = this.gcd(a, v)
        }
      }
      return a
    }, 0)

    if (g > 1) {
      for (let col = 0; col < this.columns; col++) {
        this.matrix[row][col] /= g
      }
    }
  }

  private removeEmptyRows() {
    // Remove empty rows
    const matrix = this.matrix.filter(r => r.some(v => v !== 0))
    if (matrix.length !== this.matrix.length) {
      this.matrix = matrix
      this.rows = matrix.length
    }
  }

  private cleanup() {
    this.removeEmptyRows()
    // Remove duplicate rows or rows with no unknown
    for (let row = this.rows - 1; row > 0; row--) {
      const r1 = this.matrix[row]
      if (r1.every((v, i) => v === 0 || i === this.columns - 1)) {
        this.matrix.splice(row, 1)
        this.rows--
      } else if (this.matrix.some((r2, i) => i < row && r2.every((v, idx) => v === r1[idx]))) {
        this.matrix.splice(row, 1)
        this.rows--
      }
    }
  }

  set(column: number, row: number, value: number): void {
    if (column < 0 || row < 0 || column >= this.columns || row >= this.rows) {
      throw 'Argument out of range'
    }
    this.matrix[row][column] = value
  }

  gaussianElimination() {
    const rows = this.rows
    const columns = this.columns

    let pivot = 0

    for (let row = 0; row < rows && pivot < columns - 1; row++, pivot++) {
      // 1. Search for maximum in this column (Partial Pivoting)
      let maxRow = row
      let r = this.matrix[maxRow][pivot]

      for (let nextRow = row + 1; nextRow < rows; nextRow++) {
        const v = this.matrix[nextRow][pivot]
        if (v !== 0 && (r === 0 || Math.abs(v) < Math.abs(r))) {
          maxRow = nextRow
          r = v
        }
      }

      // Swap maximum row with current row
      ;[this.matrix[row], this.matrix[maxRow]] = [this.matrix[maxRow], this.matrix[row]]

      if (this.matrix[row][pivot] < 0) {
        for (let col = row; col < columns; col++) {
          this.matrix[row][col] = -this.matrix[row][col]
        }
      }

      // Check if pivot is zero (singular matrix)
      if (Math.abs(this.matrix[row][pivot]) < 1e-10) {
        // next pivot but same row
        row--
        continue
      }

      const g = this.matrix[row].reduce((a, v) => {
        if (v !== 0) {
          if (a === 0) {
            a = v
          } else {
            a = this.gcd(a, v)
          }
        }
        return a
      }, 0)

      if (g > 1) {
        for (let col = 0; col < columns; col++) {
          this.matrix[row][col] /= g
        }
      }

      // 2. Eliminate entries below pivot
      for (let nextRow = row + 1; nextRow < rows; nextRow++) {
        let a = this.matrix[row][pivot]
        let b = this.matrix[nextRow][pivot]

        if (b === 0) {
          continue
        }
        const g = this.gcd(a, b)
        if (g !== 1) {
          a /= g
          b /= g
        }
        for (let col = row; col < columns; col++) {
          this.matrix[nextRow][col] = a * this.matrix[nextRow][col] - b * this.matrix[row][col]
        }
      }

      this.gcdRow(row)
    }

    this.cleanup()
  }
}

type TField = { calculated: boolean; value: number; usage: number }
type EvaluatorFunction = () => void
type GetterFunction = () => number
type SetterFunction = (value: number) => void

export class Evaluator {
  private fields: TField[] = []
  private evaluators: EvaluatorFunction[] = []
  private valueIndex: number

  constructor(matrix: Matrix) {
    this.valueIndex = matrix.columns - 1
    this.generateEvaluators(matrix)
  }

  private evaluate(): number {
    for (const e of this.evaluators) {
      e()
    }
    if (this.fields.some(f => f.value < 0 || f.value !== Math.floor(f.value))) {
      return Number.MAX_SAFE_INTEGER
    }
    const r = this.fields.reduce((a, f) => a + f.value, 0)

    return Math.min(r, Number.MAX_SAFE_INTEGER)
  }

  solve(): number {
    const missingFields = this.fields.filter(f => f.calculated === false)
    if (missingFields.length === 0) {
      return this.evaluate()
    }

    missingFields.sort((a, b) => b.usage - a.usage)
    switch (missingFields.length) {
      case 1: {
        let min = Number.MAX_SAFE_INTEGER
        for (let value = 0; value < 260; value++) {
          missingFields[0].value = value
          const v = this.evaluate()
          if (v < min) {
            min = v
          }
        }
        return min
      }
      case 2: {
        let min = Number.MAX_SAFE_INTEGER
        for (let v1 = 0; v1 < 30; v1++) {
          missingFields[0].value = v1
          let prev = Number.MAX_SAFE_INTEGER
          for (let v2 = 0; v1 + v2 < 60; v2++) {
            missingFields[1].value = v2
            const v = this.evaluate()
            if (v < min) {
              min = v
            }
            if (prev < Number.MAX_SAFE_INTEGER && v > prev) {
              break
            }
            prev = v
          }
        }
        return min
      }
      case 3: {
        let min = Number.MAX_SAFE_INTEGER
        for (let v1 = 0; v1 < 30; v1++) {
          missingFields[0].value = v1
          for (let v2 = 0; v1 + v2 < 40; v2++) {
            missingFields[1].value = v2
            for (let v3 = 0; v1 + v2 + v3 < 200; v3++) {
              missingFields[2].value = v3
              const v = this.evaluate()
              if (v < min) {
                min = v
                break
              }
            }
          }
        }
        return min
      }
      default:
        return 1
    }
  }

  private getter(index: number): GetterFunction {
    let field = this.fields[index]
    if (field === undefined) {
      field = { calculated: false, value: Number.MAX_SAFE_INTEGER, usage: 1 }
      this.fields[index] = field
    } else {
      field.usage++
    }

    return () => field.value
  }

  private setter(index: number): SetterFunction {
    let field = this.fields[index]
    if (field === undefined) {
      field = { calculated: true, value: Number.MAX_SAFE_INTEGER, usage: 0 }
      this.fields[index] = field
    } else {
      field.calculated = true
    }

    return (value: number) => (field.value = value)
  }

  private addEvaluator(row: number[], pivot: number): boolean {
    while (pivot < this.valueIndex && row[pivot] === 0) {
      pivot++
    }
    if (pivot >= this.valueIndex) {
      return false
    }

    const getters = [() => row[this.valueIndex]]

    for (let i = pivot + 1; i < this.valueIndex; i++) {
      if (row[i] === 0) {
        continue
      }
      const getValue = this.getter(i)
      getters.push(() => -row[i] * getValue())
    }
    const divisor = row[pivot]
    const setter = this.setter(pivot)

    const evaluator: EvaluatorFunction = () => {
      const value = getters.reduce((a, s) => a + s(), 0)
      setter(value / divisor)
    }

    this.evaluators.unshift(evaluator)

    return true
  }

  private generateEvaluators(matrix: Matrix): void {
    let pivot = 0

    for (const row of matrix.matrix) {
      if (pivot === this.valueIndex) {
        break
      }
      if (!this.addEvaluator(row, pivot)) {
        break
      }
      pivot++
    }
  }
}
