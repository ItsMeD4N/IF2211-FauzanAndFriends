package lca

import (
	"math"
	"stima-tubes2/model"
)

type LCAProcessor struct {
	Up    [][]int
	Depth []int
	LOG   int
	N     int
	Nodes []*model.Node
}

type LCAResult struct {
	LCANodeID     int   `json:"lcaNodeId"`
	LCATag        string `json:"lcaTag"`
	LCADepth      int   `json:"lcaDepth"`
	PathFromNode1 []int `json:"pathFromNode1"`
	PathFromNode2 []int `json:"pathFromNode2"`
}

func NewLCAProcessor(root *model.Node) *LCAProcessor {
	if root == nil {
		return nil
	}

	nodes := model.FlattenNodes(root)
	n := len(nodes)

	if n == 0 {
		return nil
	}

	logN := 1
	if n > 1 {
		logN = int(math.Ceil(math.Log2(float64(n)))) + 1
	}

	up := make([][]int, n)
	depth := make([]int, n)
	nodeIndex := make([]*model.Node, n)

	for i := range up {
		up[i] = make([]int, logN)
		for j := range up[i] {
			up[i][j] = -1
		}
	}

	visited := make(map[int]bool)
	queue := []*model.Node{root}
	visited[root.ID] = true

	for len(queue) > 0 {
		current := queue[0]
		queue = queue[1:]

		if current.ID >= n {
			continue
		}

		nodeIndex[current.ID] = current
		depth[current.ID] = current.Depth

		if current.Parent != nil {
			up[current.ID][0] = current.Parent.ID
		} else {
			up[current.ID][0] = -1
		}

		for _, child := range current.Children {
			if !visited[child.ID] {
				visited[child.ID] = true
				queue = append(queue, child)
			}
		}
	}

	for k := 1; k < logN; k++ {
		for v := 0; v < n; v++ {
			prev := up[v][k-1]
			if prev != -1 && prev < n {
				up[v][k] = up[prev][k-1]
			}
		}
	}

	return &LCAProcessor{
		Up:    up,
		Depth: depth,
		LOG:   logN,
		N:     n,
		Nodes: nodeIndex,
	}
}

func (l *LCAProcessor) Query(u, v int) *LCAResult {
	if l == nil || u < 0 || u >= l.N || v < 0 || v >= l.N {
		return nil
	}
	if l.Nodes[u] == nil || l.Nodes[v] == nil {
		return nil
	}

	origU, origV := u, v

	if l.Depth[u] < l.Depth[v] {
		u, v = v, u
	}

	diff := l.Depth[u] - l.Depth[v]
	for k := 0; k < l.LOG; k++ {
		if diff&(1<<k) != 0 {
			if u != -1 {
				u = l.Up[u][k]
			}
		}
	}

	if u == v {
		return l.buildResult(u, origU, origV)
	}

	for k := l.LOG - 1; k >= 0; k-- {
		if u == -1 || v == -1 {
			break
		}
		if u < l.N && v < l.N && l.Up[u][k] != l.Up[v][k] {
			u = l.Up[u][k]
			v = l.Up[v][k]
		}
	}

	if u != -1 && u < l.N {
		lcaID := l.Up[u][0]
		return l.buildResult(lcaID, origU, origV)
	}

	return nil
}

func (l *LCAProcessor) buildResult(lcaID, node1ID, node2ID int) *LCAResult {
	if lcaID < 0 || lcaID >= l.N || l.Nodes[lcaID] == nil {
		return nil
	}

	return &LCAResult{
		LCANodeID:     lcaID,
		LCATag:        l.Nodes[lcaID].Tag,
		LCADepth:      l.Depth[lcaID],
		PathFromNode1: l.getPathTo(node1ID, lcaID),
		PathFromNode2: l.getPathTo(node2ID, lcaID),
	}
}

func (l *LCAProcessor) getPathTo(fromID, toID int) []int {
	var path []int
	current := fromID
	for current != -1 && current != toID && current < l.N {
		path = append(path, current)
		current = l.Up[current][0]
	}
	if current == toID {
		path = append(path, toID)
	}
	return path
}
