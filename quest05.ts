import { Quest } from './tools/quest.ts'

type TBone = {
  left?: number
  value: number
  right?: number
}

type TSword = {
  id: number
  values: number[]
  bones?: TBone[]
  quality?: number
}

export class Quest05 extends Quest<TSword[]> {
  constructor() {
    super(5)
  }

  loadInput(part: number): TSword[] {
    const swords: TSword[] = []

    for (const line of this.readDataFile(part)) {
      const vals = line.split(':')
      const id = +vals[0]
      const values = vals[1].split(',').map(v => +v)

      swords.push({ id, values })
    }

    return swords
  }

  buildFishBone(values: number[]): TBone[] {
    const bones: TBone[] = []

    for (const v of values) {
      let placed = false
      for (const bone of bones) {
        if (bone.left === undefined && v < bone.value) {
          bone.left = v
          placed = true
          break
        } else if (bone.right === undefined && v > bone.value) {
          placed = true
          bone.right = v
          break
        }
      }
      if (!placed) {
        bones.push({ value: v })
      }
    }
    return bones
  }

  getSwordQuality(sword: TSword): number {
    sword.bones = this.buildFishBone(sword.values)
    const value = sword.bones.map(b => b.value).join('')
    sword.quality = +value
    return sword.quality
  }

  part1(swords: TSword[]): number {
    return this.getSwordQuality(swords[0])
  }

  part2(swords: TSword[]): number {
    let min = Number.MAX_SAFE_INTEGER
    let max = 0

    for (const sword of swords) {
      const quality = this.getSwordQuality(sword)
      min = Math.min(min, quality)
      max = Math.max(max, quality)
    }

    return max - min
  }

  part3(swords: TSword[]): number {
    for (const sword of swords) {
      this.getSwordQuality(sword)
    }
    swords.sort((a, b) => {
      let diff = b.quality! - a.quality!
      if (diff !== 0) {
        return diff
      }
      for (let i = 0; i < a.bones!.length && i < b.bones!.length; i++) {
        const va = +`${a.bones![i].left ?? ''}${a.bones![i].value}${a.bones![i].right ?? ''}`
        const vb = +`${b.bones![i].left ?? ''}${b.bones![i].value}${b.bones![i].right ?? ''}`
        diff = vb - va
        if (diff !== 0) {
          return diff
        }
      }
      diff = b.bones!.length - a.bones!.length
      if (diff === 0) {
        diff = b.id - a.id
      }
      return diff
    })

    const checksum = swords.reduce((a, v, i) => a + (i + 1) * v.id, 0)

    return checksum
  }
}

if (!Deno.mainModule.endsWith('/main.ts')) {
  new Quest05().execute()
}
