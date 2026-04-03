import { Quest } from '../quest.ts'

enum BondType {
  none = 0,
  strong = 1,
  weak = 2,
}

type TConnector = {
  color: string
  shape: string
  connection: TNode | null
  bondType: BondType
}

type TNode = {
  id: number
  plug: TConnector
  leftSocket: TConnector
  rightSocket: TConnector
}

class Tree {
  private root: TNode | null = null
  private bondType: BondType
  private allowOverride: boolean

  constructor(bondType: BondType, allowOverride: boolean) {
    this.bondType = bondType
    this.allowOverride = allowOverride
  }

  private matches(plug: TConnector, socket: TConnector): BondType {
    if (socket.color === plug.color && socket.shape === plug.shape) {
      return BondType.strong
    } else if (socket.color === plug.color || socket.shape === plug.shape) {
      return BondType.weak
    } else {
      return BondType.none
    }
  }

  private plugTo(node: TNode, socket: TConnector): TNode | null {
    const match = this.matches(node.plug, socket)

    if (socket.connection === null) {
      if (this.bondType === BondType.strong && match === BondType.strong) {
        socket.connection = node
        socket.bondType = BondType.strong
        return null
      } else if (this.bondType === BondType.weak && match !== BondType.none) {
        socket.connection = node
        socket.bondType = match
        return null
      } else {
        return node
      }
    } else if (this.allowOverride && match === BondType.strong && socket.bondType === BondType.weak) {
      const old = socket.connection
      socket.connection = node
      socket.bondType = BondType.strong
      return old
    } else {
      return this.addNode(node, socket.connection)
    }
  }

  addNode(node: TNode, current: TNode | null = null): TNode | null {
    let toAdd: TNode | null = node

    if (current === null) {
      if (this.root === null) {
        this.root = node
        return node
      }
      while (toAdd !== null) {
        const id: number = toAdd.id
        toAdd = this.addNode(toAdd, this.root)
        if (toAdd?.id === id) {
          throw 'Stuck in a loop'
        }
      }
      return null
    }
    toAdd = this.plugTo(toAdd, current.leftSocket)
    if (toAdd === null) {
      return null
    }
    toAdd = this.plugTo(toAdd, current.rightSocket)
    if (toAdd === null) {
      return null
    }
    return toAdd
  }

  getIds(current: TNode | null = null): number[] {
    if (current === null) {
      current = this.root
      if (current === null) {
        throw 'Tree node initialized'
      }
    }
    const leftIds = current.leftSocket.connection !== null ? this.getIds(current.leftSocket.connection) : []
    const rightIds = current.rightSocket.connection !== null ? this.getIds(current.rightSocket.connection) : []

    return [...leftIds, current.id, ...rightIds]
  }
}

export class Quest03 extends Quest<TNode[]> {
  constructor() {
    super(3, 3)
  }

  loadInput(part: number): TNode[] {
    const data = this.readDataFile(part)
    const expression =
      /id=(?<id>\d*), plug=(?<plugColor>\w+) (?<plugShape>\w+), leftSocket=(?<leftColor>\w+) (?<leftShape>\w+), rightSocket=(?<rightColor>\w+) (?<rightShape>\w+), data=(?<data>.*)/

    const nodes = data.map(line => {
      const groups = line.match(expression)?.groups
      if (!groups) {
        throw 'Invalid input'
      }
      const node = {
        id: +groups.id,
        plug: { color: groups.plugColor, shape: groups.plugShape, connection: null, bondType: BondType.none },
        leftSocket: { color: groups.leftColor, shape: groups.leftShape, connection: null, bondType: BondType.none },
        rightSocket: { color: groups.rightColor, shape: groups.rightShape, connection: null, bondType: BondType.none },
      }
      return node
    })

    return nodes
  }

  connectNodes(nodes: TNode[], bondType: BondType, canOverride: boolean): Tree {
    const tree = new Tree(bondType, canOverride)
    for (const node of nodes) {
      tree.addNode(node)
    }
    return tree
  }

  getTreeHash(tree: Tree): number {
    const ids = tree.getIds()
    const hash = ids.reduce((a, id, idx) => a + (idx + 1) * id, 0)
    return hash
  }

  part1(nodes: TNode[]): number {
    const tree = this.connectNodes(nodes, BondType.strong, false)
    return this.getTreeHash(tree)
  }

  part2(nodes: TNode[]): number {
    const tree = this.connectNodes(nodes, BondType.weak, false)
    return this.getTreeHash(tree)
  }

  part3(nodes: TNode[]): number {
    const tree = this.connectNodes(nodes, BondType.weak, true)
    return this.getTreeHash(tree)
  }
}

if (!Deno.mainModule.endsWith('/main.ts')) {
  new Quest03().execute()
}
