package traversal

import (
	"stima-tubes2/model"
	"stima-tubes2/selector"
	"sync"
	"sync/atomic"
	"time"
)

func ParallelBFS(root *model.Node, chain selector.SelectorChain, limit int, numWorkers int) TraversalResult {
	result := TraversalResult{}
	if root == nil || len(chain.Parts) == 0 {
		return result
	}
	if numWorkers <= 0 {
		numWorkers = 4
	}

	startTime := time.Now()

	var visitedCount int64
	var matchedNodes []*model.Node
	var log []LogEntry
	var logMu sync.Mutex
	var matchMu sync.Mutex

	step := int64(0)
	currentLevel := []*model.Node{root}
	done := false

	for len(currentLevel) > 0 && !done {
		nextLevel := make([]*model.Node, 0)
		var nextLevelMu sync.Mutex

		chunkSize := (len(currentLevel) + numWorkers - 1) / numWorkers
		var wg sync.WaitGroup

		for w := 0; w < numWorkers && w*chunkSize < len(currentLevel); w++ {
			start := w * chunkSize
			end := start + chunkSize
			if end > len(currentLevel) {
				end = len(currentLevel)
			}
			chunk := currentLevel[start:end]

			wg.Add(1)
			go func(nodes []*model.Node) {
				defer wg.Done()

				for _, node := range nodes {
					if done {
						return
					}

					atomic.AddInt64(&visitedCount, 1)
					s := atomic.AddInt64(&step, 1)

					logMu.Lock()
					log = append(log, LogEntry{
						Step:      int(s),
						NodeID:    node.ID,
						NodeTag:   node.Tag,
						Action:    "visit",
						QueueSize: len(currentLevel),
						Depth:     node.Depth,
					})
					logMu.Unlock()

					if selector.MatchChain(node, chain) {
						matchMu.Lock()
						matchedNodes = append(matchedNodes, node)
						matchCount := len(matchedNodes)
						matchMu.Unlock()

						s2 := atomic.AddInt64(&step, 1)
						logMu.Lock()
						log = append(log, LogEntry{
							Step:      int(s2),
							NodeID:    node.ID,
							NodeTag:   node.Tag,
							Action:    "match",
							QueueSize: len(currentLevel),
							Depth:     node.Depth,
						})
						logMu.Unlock()

						if limit > 0 && matchCount >= limit {
							done = true
							return
						}
					}

					nextLevelMu.Lock()
					for _, child := range node.Children {
						nextLevel = append(nextLevel, child)
					}
					nextLevelMu.Unlock()
				}
			}(chunk)
		}

		wg.Wait()
		currentLevel = nextLevel
	}

	result.MatchedNodes = matchedNodes
	result.VisitedCount = int(visitedCount)
	result.Log = log
	result.ExecutionTime = float64(time.Since(startTime).Microseconds()) / 1000.0
	return result
}

func ParallelDFS(root *model.Node, chain selector.SelectorChain, limit int, numWorkers int) TraversalResult {
	result := TraversalResult{}
	if root == nil || len(chain.Parts) == 0 {
		return result
	}
	if numWorkers <= 0 {
		numWorkers = 4
	}

	startTime := time.Now()

	var visitedCount int64
	var matchedNodes []*model.Node
	var log []LogEntry
	var logMu sync.Mutex
	var matchMu sync.Mutex
	step := int64(0)
	done := int32(0)

	atomic.AddInt64(&visitedCount, 1)
	s := atomic.AddInt64(&step, 1)
	log = append(log, LogEntry{
		Step:    int(s),
		NodeID:  root.ID,
		NodeTag: root.Tag,
		Action:  "visit",
		Depth:   root.Depth,
	})

	if selector.MatchChain(root, chain) {
		matchedNodes = append(matchedNodes, root)
		s2 := atomic.AddInt64(&step, 1)
		log = append(log, LogEntry{
			Step:    int(s2),
			NodeID:  root.ID,
			NodeTag: root.Tag,
			Action:  "match",
			Depth:   root.Depth,
		})
	}

	if len(root.Children) > 0 {
		var wg sync.WaitGroup
		sem := make(chan struct{}, numWorkers)

		var dfsWorker func(node *model.Node)
		dfsWorker = func(node *model.Node) {
			defer wg.Done()
			if atomic.LoadInt32(&done) == 1 {
				return
			}

			atomic.AddInt64(&visitedCount, 1)
			s := atomic.AddInt64(&step, 1)

			logMu.Lock()
			log = append(log, LogEntry{
				Step:    int(s),
				NodeID:  node.ID,
				NodeTag: node.Tag,
				Action:  "visit",
				Depth:   node.Depth,
			})
			logMu.Unlock()

			if selector.MatchChain(node, chain) {
				matchMu.Lock()
				matchedNodes = append(matchedNodes, node)
				matchCount := len(matchedNodes)
				matchMu.Unlock()

				s2 := atomic.AddInt64(&step, 1)
				logMu.Lock()
				log = append(log, LogEntry{
					Step:    int(s2),
					NodeID:  node.ID,
					NodeTag: node.Tag,
					Action:  "match",
					Depth:   node.Depth,
				})
				logMu.Unlock()

				if limit > 0 && matchCount >= limit {
					atomic.StoreInt32(&done, 1)
					return
				}
			}

			for _, child := range node.Children {
				if atomic.LoadInt32(&done) == 1 {
					return
				}
				wg.Add(1)
				select {
				case sem <- struct{}{}:
					go func(c *model.Node) {
						dfsWorker(c)
						<-sem
					}(child)
				default:
					dfsWorker(child)
				}
			}
		}

		for _, child := range root.Children {
			if atomic.LoadInt32(&done) == 1 {
				break
			}
			wg.Add(1)
			sem <- struct{}{}
			go func(c *model.Node) {
				dfsWorker(c)
				<-sem
			}(child)
		}

		wg.Wait()
	}

	result.MatchedNodes = matchedNodes
	result.VisitedCount = int(visitedCount)
	result.Log = log
	result.ExecutionTime = float64(time.Since(startTime).Microseconds()) / 1000.0
	return result
}
