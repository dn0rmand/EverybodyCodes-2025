import { Matrix } from './matrix.ts'

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
        for (let value = 0; value < 200; value++) {
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
        for (let v1 = 0; v1 < 200; v1++) {
          missingFields[0].value = v1
          for (let v2 = 0; v2 < 60; v2++) {
            missingFields[1].value = v2
            const v = this.evaluate()
            if (v < min) {
              min = v
            }
          }
        }
        return min
      }
      case 3: {
        let min = Number.MAX_SAFE_INTEGER
        for (let v1 = 0; v1 < 30; v1++) {
          missingFields[0].value = v1
          for (let v2 = 0; v2 < 40; v2++) {
            missingFields[1].value = v2
            for (let v3 = 0; v3 < 200; v3++) {
              missingFields[2].value = v3
              const v = this.evaluate()
              if (v < min) {
                min = v
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
