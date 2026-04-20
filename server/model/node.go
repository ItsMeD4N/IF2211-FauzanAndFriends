package model

import (
	"strings"
)

type Node struct {
	ID          int               `json:"id"`
	Tag         string            `json:"tag"`
	Attributes  map[string]string `json:"attributes,omitempty"`
	Children    []*Node           `json:"children,omitempty"`
	Parent      *Node             `json:"-"`
	Depth       int               `json:"depth"`
	TextContent string            `json:"textContent,omitempty"`
}

func (n *Node) Classes() []string {
	cls, ok := n.Attributes["class"]
	if !ok || cls == "" {
		return nil
	}
	parts := strings.Fields(cls)
	result := make([]string, 0, len(parts))
	for _, p := range parts {
		if p != "" {
			result = append(result, p)
		}
	}
	return result
}

func (n *Node) GetID() string {
	return n.Attributes["id"]
}

func (n *Node) HasClass(class string) bool {
	for _, c := range n.Classes() {
		if c == class {
			return true
		}
	}
	return false
}

func (n *Node) GetPath() string {
	parts := []string{}
	current := n
	for current != nil {
		label := current.Tag
		if id := current.GetID(); id != "" {
			label += "#" + id
		}
		parts = append([]string{label}, parts...)
		current = current.Parent
	}
	return strings.Join(parts, " > ")
}

func MaxDepth(root *Node) int {
	if root == nil {
		return 0
	}
	max := root.Depth
	var dfs func(n *Node)
	dfs = func(n *Node) {
		if n.Depth > max {
			max = n.Depth
		}
		for _, child := range n.Children {
			dfs(child)
		}
	}
	dfs(root)
	return max
}

func CountNodes(root *Node) int {
	if root == nil {
		return 0
	}
	count := 0
	var dfs func(n *Node)
	dfs = func(n *Node) {
		count++
		for _, child := range n.Children {
			dfs(child)
		}
	}
	dfs(root)
	return count
}

func FlattenNodes(root *Node) []*Node {
	if root == nil {
		return nil
	}
	var nodes []*Node
	var dfs func(n *Node)
	dfs = func(n *Node) {
		nodes = append(nodes, n)
		for _, child := range n.Children {
			dfs(child)
		}
	}
	dfs(root)
	return nodes
}

type NodeJSON struct {
	ID          int               `json:"id"`
	Tag         string            `json:"tag"`
	Name        string            `json:"name"`
	Attributes  map[string]string `json:"attributes,omitempty"`
	Children    []*NodeJSON       `json:"children,omitempty"`
	Depth       int               `json:"depth"`
	TextContent string            `json:"textContent,omitempty"`
}

func (n *Node) ToJSON() *NodeJSON {
	if n == nil {
		return nil
	}

	label := n.Tag
	if id := n.GetID(); id != "" {
		label += "#" + id
	}
	if classes := n.Classes(); len(classes) > 0 {
		label += "." + strings.Join(classes, ".")
	}

	result := &NodeJSON{
		ID:          n.ID,
		Tag:         n.Tag,
		Name:        label,
		Attributes:  n.Attributes,
		Depth:       n.Depth,
		TextContent: n.TextContent,
	}

	for _, child := range n.Children {
		result.Children = append(result.Children, child.ToJSON())
	}
	return result
}

type MatchedNodeJSON struct {
	ID          int               `json:"id"`
	Tag         string            `json:"tag"`
	Attributes  map[string]string `json:"attributes,omitempty"`
	Depth       int               `json:"depth"`
	Path        string            `json:"path"`
	TextContent string            `json:"textContent,omitempty"`
}

func (n *Node) ToMatchedJSON() *MatchedNodeJSON {
	return &MatchedNodeJSON{
		ID:          n.ID,
		Tag:         n.Tag,
		Attributes:  n.Attributes,
		Depth:       n.Depth,
		Path:        n.GetPath(),
		TextContent: n.TextContent,
	}
}

func (n *Node) GetSiblings() []*Node {
	if n.Parent == nil {
		return nil
	}
	var siblings []*Node
	for _, child := range n.Parent.Children {
		if child != n {
			siblings = append(siblings, child)
		}
	}
	return siblings
}

func (n *Node) GetPreviousSibling() *Node {
	if n.Parent == nil {
		return nil
	}
	for i, child := range n.Parent.Children {
		if child == n && i > 0 {
			return n.Parent.Children[i-1]
		}
	}
	return nil
}

func (n *Node) NextSibling() *Node {
	if n.Parent == nil {
		return nil
	}
	for i, child := range n.Parent.Children {
		if child == n && i < len(n.Parent.Children)-1 {
			return n.Parent.Children[i+1]
		}
	}
	return nil
}
