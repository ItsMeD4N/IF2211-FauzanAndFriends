package traversal

import (
	"stima-tubes2/model"
	"stima-tubes2/selector"
	"time"
)

func DFS(root *model.Node, chain selector.SelectorChain, limit int) TraversalResult {
	result := TraversalResult{}
	if root == nil || len(chain.Parts) == 0 {
		return result
	}

	startTime := time.Now()
	stack := []*model.Node{root}
	step := 0

	for len(stack) > 0 {
		current := stack[len(stack)-1]
		stack = stack[:len(stack)-1]

		step++
		result.VisitedCount++

		result.Log = append(result.Log, LogEntry{
			Step:      step,
			NodeID:    current.ID,
			NodeTag:   current.Tag,
			Action:    "visit",
			QueueSize: len(stack),
			Depth:     current.Depth,
		})

		if selector.MatchChain(current, chain) {
			result.MatchedNodes = append(result.MatchedNodes, current)
			step++
			result.Log = append(result.Log, LogEntry{
				Step:      step,
				NodeID:    current.ID,
				NodeTag:   current.Tag,
				Action:    "match",
				QueueSize: len(stack),
				Depth:     current.Depth,
			})

			if limit > 0 && len(result.MatchedNodes) >= limit {
				break
			}
		}

		for i := len(current.Children) - 1; i >= 0; i-- {
			child := current.Children[i]
			stack = append(stack, child)
			step++
			result.Log = append(result.Log, LogEntry{
				Step:      step,
				NodeID:    child.ID,
				NodeTag:   child.Tag,
				Action:    "enqueue",
				QueueSize: len(stack),
				Depth:     child.Depth,
			})
		}
	}

	result.ExecutionTime = float64(time.Since(startTime).Microseconds()) / 1000.0
	return result
}
