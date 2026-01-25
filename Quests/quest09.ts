import { Quest } from '../quest.ts'

type DNA = {
  id: number
  chain: string
  father: DNA | undefined
  mother: DNA | undefined
  family: DNA[] | undefined
}

type TInput = DNA[]

export class Quest09 extends Quest<TInput> {
  constructor() {
    super(9)
  }

  loadInput(part: number): TInput {
    const data = this.readDataFile(part)
    const dna = data.map(line => {
      const v = line.split(':')
      return { id: +v[0], chain: v[1], father: undefined, mother: undefined, family: undefined }
    })

    return dna
  }

  findChild(dna1: DNA, dna2: DNA, dna3: DNA): DNA | undefined {
    const child: boolean[] = [true, true, true]
    let parents = 0

    for (let i = 3; i < dna1.chain.length && parents < 2; i++) {
      const c1 = dna1.chain[i]
      const c2 = dna2.chain[i]
      const c3 = dna3.chain[i]
      if (child[0] && c1 != c2 && c1 != c3) {
        child[0] = false
        parents++
      }
      if (child[1] && c2 != c1 && c2 != c3) {
        child[1] = false
        parents++
      }
      if (child[2] && c3 != c1 && c3 != c2) {
        child[2] = false
        parents++
      }
    }
    if (child[0]) {
      return dna1
    } else if (child[1]) {
      return dna2
    } else if (child[2]) {
      return dna3
    } else {
      return undefined
    }
  }

  isChildOf(child: DNA, father: DNA, mother: DNA): boolean {
    for (let i = 0; i < child.chain.length; i++) {
      const c = child.chain[i]
      if (c !== father.chain[i] && c !== mother.chain[i]) {
        return false
      }
    }
    return true
  }

  compare(parent: DNA, child: DNA): number {
    if (parent.id === child.id) {
      return 1
    }
    let total = 0
    for (let i = 0; i < child.chain.length; i++) {
      if (child.chain[i] === parent.chain[i]) {
        total++
      }
    }
    return total
  }

  buildChain(dna: DNA[], part: number) {
    for (const child of dna) {
      for (const mother of dna) {
        if (child.mother) {
          break
        }
        if (mother.id === child.id || (part === 2 && mother.mother)) {
          continue
        }
        for (const father of dna) {
          if (father.id === child.id || father.id === mother.id || (part === 2 && father.mother)) {
            continue
          }
          if (this.isChildOf(child, father, mother)) {
            child.father = father
            child.mother = mother
            break
          }
        }
      }
    }
  }

  mergeFamilies(node1: DNA, node2: DNA) {
    if (node1.family === undefined) {
      node1.family = [node1]
    }
    if (node2.family === undefined) {
      node2.family = [node2]
    }
    if (Object.is(node1.family, node2.family)) {
      return
    }
    if (node1.family.length > node2.family.length) {
      ;[node1, node2] = [node2, node1]
    }

    node2.family!.forEach(n => {
      n.family = node1.family
      node1.family!.push(n)
    })
  }

  parseNode(node: DNA | undefined) {
    if (node === undefined || node.family !== undefined) {
      return
    }
    const mother = node.mother
    const father = node.father
    this.parseNode(mother)
    this.parseNode(father)
    if (mother !== undefined) {
      this.mergeFamilies(mother, father!)
      this.mergeFamilies(mother, node)
    } else {
      node.family = [node]
    }
  }

  part1(dna: TInput): number {
    const child = this.findChild(dna[0], dna[1], dna[2])
    const total = dna.reduce((a, d) => a * this.compare(d, child!), 1)
    return total
  }

  part2(dna: TInput): number {
    this.buildChain(dna, 2)

    const total = dna
      .filter((e: DNA) => e.mother !== undefined)
      .reduce((a: number, child: DNA) => (a += this.compare(child, child.mother!) * this.compare(child, child.father!)), 0)

    return total
  }

  part3(dna: TInput): number {
    this.buildChain(dna, 3)
    for (const node of dna) {
      this.parseNode(node)
    }
    dna.sort((a, b) => (b.family ?? []).length - (a.family ?? []).length)
    const max = dna[0].family ?? []
    const total = max.reduce((a, d) => a + d.id, 0)
    return total
  }
}

if (!Deno.mainModule.endsWith('/main.ts')) {
  new Quest09().execute()
}
