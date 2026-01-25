import { Quest } from '../quest.ts'

type TNode = {
  rank: number
  symbol: string
  left?: TNode
  right?: TNode
}

type TCommand = {
  action: string
  id: number
  left?: TNode
  right?: TNode
}

type TInput = TCommand[]

export class Quest02 extends Quest<TInput> {
  constructor() {
    super(2, 1)
  }

  parseNode(value: string): TNode {
    const [rank, symbol] = value.slice(1, -1).split(',')

    return {
      rank: +rank,
      symbol,
    }
  }

  loadInput(part: number): TInput {
    const data = this.readDataFile(part)
    return data.map(line => {
      // ADD id=1 left=[10,A] right=[30,H]
      const info = line.split(' ')
      const action = info[0]
      if (action === 'SWAP') {
        return {
          action,
          id: +info[1],
        }
      } else if (action === 'ADD') {
        const [_1, id] = info[1].split('=')
        const [_2, left] = info[2].split('=')
        const [_3, right] = info[3].split('=')

        return {
          action,
          id: +id,
          left: this.parseNode(left),
          right: this.parseNode(right),
        }
      } else {
        throw 'Invalid action'
      }
    })
  }

  addNode(target: TNode, node: TNode) {
    while (true) {
      if (node.rank < target.rank) {
        if (target.left === undefined) {
          target.left = node
          break
        } else {
          target = target.left
        }
      } else if (node.rank > target.rank) {
        if (target.right === undefined) {
          target.right = node
          break
        } else {
          target = target.right
        }
      } else {
        throw 'Duplicate Ranks'
      }
    }
  }

  addNodeToTree(root: TNode | undefined, node: TNode): TNode {
    if (root === undefined) {
      return node
    } else {
      this.addNode(root, node)
      return root
    }
  }

  swapNode(leftNode: TNode, rightNode: TNode, includeTree: boolean) {
    const { rank, symbol, left, right } = leftNode

    leftNode.rank = rightNode.rank
    leftNode.symbol = rightNode.symbol

    rightNode.rank = rank
    rightNode.symbol = symbol

    if (includeTree) {
      leftNode.left = rightNode.left
      leftNode.right = rightNode.right
      rightNode.left = left
      rightNode.right = right
    }
  }

  readSymbols(node: TNode | undefined, level: number, targetLevel: number): string {
    if (node === undefined) {
      return ''
    } else if (level < targetLevel) {
      return this.readSymbols(node.left, level + 1, targetLevel) + this.readSymbols(node.right, level + 1, targetLevel)
    } else {
      return node.symbol
    }
  }

  countLevels(node: TNode | undefined, level: number, levels: number[]) {
    if (node !== undefined) {
      levels[level] = (levels[level] ?? 0) + 1
      this.countLevels(node.left, level + 1, levels)
      this.countLevels(node.right, level + 1, levels)
    }
  }

  getMaxLevel(root: TNode | undefined): number {
    const levels: number[] = []

    this.countLevels(root, 0, levels)
    return levels.reduce((a, v, i) => (v === undefined ? a : levels[a] < v ? i : a), 0)
  }

  readMessage(left: TNode | undefined, right: TNode | undefined): string {
    const leftLevel = this.getMaxLevel(left)
    const rightLevel = this.getMaxLevel(right)

    return this.readSymbols(left, 0, leftLevel) + this.readSymbols(right, 0, rightLevel)
  }

  part1(commands: TInput): string {
    let left: TNode | undefined = undefined
    let right: TNode | undefined = undefined

    for (const command of commands) {
      left = this.addNodeToTree(left, command.left!)
      right = this.addNodeToTree(right, command.right!)
    }

    return this.readMessage(left, right)
  }

  part2(commands: TInput): string {
    let left: TNode | undefined = undefined
    let right: TNode | undefined = undefined

    for (const command of commands) {
      if (command.action === 'ADD') {
        left = this.addNodeToTree(left, command.left!)
        right = this.addNodeToTree(right, command.right!)
      } else if (command.action === 'SWAP') {
        const f = commands.find(c => c.action === 'ADD' && c.id === command.id)
        if (f === undefined) {
          throw `Cannot find node with id ${command.id}`
        }
        this.swapNode(f.left!, f.right!, false)
      }
    }

    return this.readMessage(left, right)
  }

  part3(commands: TInput): string {
    let left: TNode | undefined = undefined
    let right: TNode | undefined = undefined

    for (const command of commands) {
      if (command.action === 'ADD') {
        left = this.addNodeToTree(left, command.left!)
        right = this.addNodeToTree(right, command.right!)
      } else if (command.action === 'SWAP') {
        const f = commands.find(c => c.action === 'ADD' && c.id === command.id)
        if (f === undefined) {
          throw `Cannot find node with id ${command.id}`
        }
        this.swapNode(f.left!, f.right!, true)
      }
    }

    return this.readMessage(left, right)
  }
}

if (!Deno.mainModule.endsWith('/main.ts')) {
  new Quest02().execute()
}
