export class AdventureNode {
  constructor(
    private prev: AdventureNode,
    private next: AdventureNode,
  ) {}
}

export class NodeError extends Error {}

export class PostNode extends AdventureNode {
  constructor(
    prev: AdventureNode,
    next: AdventureNode,
    text: string,
  ) {
    if (text.length > 300) {
      throw new NodeError()
    }
    super(prev, next)
  }
}

export class VoteNode extends AdventureNode {
  constructor(
    prev: AdventureNode,
    next: AdventureNode,
  ) {
    super(prev, next)
  }
}

export class CombatNode extends AdventureNode {
  constructor(
    prev: AdventureNode,
    next: AdventureNode,
  ) {
    super(prev, next)
  }
}