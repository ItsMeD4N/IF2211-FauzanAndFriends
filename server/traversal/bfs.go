package traversal

import (
	"stima-tubes2/model"
	"stima-tubes2/selector"
	"time"
)

type LogEntry struct {
	Step      int    `json:"step"`
	NodeID    int    `json:"nodeId"`
	NodeTag   string `json:"tag"`
	Action    string `json:"action"`
	QueueSize int    `json:"queueSize"`
	Depth     int    `json:"depth"`
}

type TraversalResult struct {
	MatchedNodes  []*model.Node `json:"-"`
	VisitedCount  int           `json:"visitedCount"`
	ExecutionTime float64       `json:"executionTimeMs"`
	Log           []LogEntry    `json:"log"`
}

func BFS(root *model.Node, chain selector.SelectorChain, limit int) TraversalResult {
	result := TraversalResult{}
	if root == nil || len(chain.Parts) == 0 {
		return result
	}

	startTime := time.Now()
	queue := []*model.Node{root}
	step := 0

	for len(queue) > 0 {
		current := queue[0]
		queue = queue[1:]

		step++
		result.VisitedCount++

		result.Log = append(result.Log, LogEntry{
			Step:      step,
			NodeID:    current.ID,
			NodeTag:   current.Tag,
			Action:    "visit",
			QueueSize: len(queue),
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
				QueueSize: len(queue),
				Depth:     current.Depth,
			})

			if limit > 0 && len(result.MatchedNodes) >= limit {
				break
			}
		}

		for _, child := range current.Children {
			queue = append(queue, child)
			step++
			result.Log = append(result.Log, LogEntry{
				Step:      step,
				NodeID:    child.ID,
				NodeTag:   child.Tag,
				Action:    "enqueue",
				QueueSize: len(queue),
				Depth:     child.Depth,
			})
		}
	}

	result.ExecutionTime = float64(time.Since(startTime).Microseconds()) / 1000.0
	return result
}
