package selector

import (
	"stima-tubes2/model"
)

func MatchSimple(node *model.Node, sel SimpleSelector) bool {
	if node == nil || node.Tag == "#text" {
		return false
	}

	if sel.Tag != "" && node.Tag != sel.Tag {
		return false
	}

	if sel.ID != "" && node.GetID() != sel.ID {
		return false
	}

	for _, cls := range sel.Classes {
		if !node.HasClass(cls) {
			return false
		}
	}

	return true
}

func MatchChain(node *model.Node, chain SelectorChain) bool {
	if len(chain.Parts) == 0 {
		return false
	}

	lastIdx := len(chain.Parts) - 1
	if !MatchSimple(node, chain.Parts[lastIdx]) {
		return false
	}

	if len(chain.Parts) == 1 {
		return true
	}

	current := node
	for i := lastIdx - 1; i >= 0; i-- {
		combinator := chain.Combinators[i]
		part := chain.Parts[i]

		switch combinator {
		case CombDescendant:
			found := false
			ancestor := current.Parent
			for ancestor != nil {
				if MatchSimple(ancestor, part) {
					current = ancestor
					found = true
					break
				}
				ancestor = ancestor.Parent
			}
			if !found {
				return false
			}

		case CombChild:
			parent := current.Parent
			if parent == nil || !MatchSimple(parent, part) {
				return false
			}
			current = parent

		case CombAdjacentSibling:
			prev := current.GetPreviousSibling()
			if prev == nil || !MatchSimple(prev, part) {
				return false
			}
			current = prev

		case CombGeneralSibling:
			if current.Parent == nil {
				return false
			}
			found := false
			for _, child := range current.Parent.Children {
				if child == current {
					break
				}
				if MatchSimple(child, part) {
					current = child
					found = true
				}
			}
			if !found {
				return false
			}
		}
	}

	return true
}
