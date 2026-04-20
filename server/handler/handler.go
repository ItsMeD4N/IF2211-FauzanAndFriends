package handler

import (
	"encoding/json"
	"log"
	"net/http"
	"stima-tubes2/lca"
	"stima-tubes2/model"
	"stima-tubes2/parser"
	"stima-tubes2/scraper"
	"stima-tubes2/selector"
	"stima-tubes2/traversal"
)

type ParseRequest struct {
	Source string `json:"source"`
	URL    string `json:"url"`
	HTML   string `json:"html"`
}

type SearchRequest struct {
	Source    string `json:"source"`
	URL      string `json:"url"`
	HTML     string `json:"html"`
	Selector string `json:"selector"`
	Algorithm string `json:"algorithm"`
	Limit    int    `json:"limit"`
	Parallel bool   `json:"parallel"`
}

type LCARequest struct {
	Source  string `json:"source"`
	URL     string `json:"url"`
	HTML    string `json:"html"`
	NodeID1 int    `json:"nodeId1"`
	NodeID2 int    `json:"nodeId2"`
}

type ParseResponse struct {
	Tree       *model.NodeJSON `json:"tree"`
	TotalNodes int             `json:"totalNodes"`
	MaxDepth   int             `json:"maxDepth"`
}

type SearchResponse struct {
	Tree            *model.NodeJSON          `json:"tree"`
	Matches         []*model.MatchedNodeJSON `json:"matches"`
	MatchCount      int                      `json:"matchCount"`
	TotalNodes      int                      `json:"totalNodes"`
	MaxDepth        int                      `json:"maxDepth"`
	VisitedCount    int                      `json:"visitedCount"`
	ExecutionTimeMs float64                  `json:"executionTimeMs"`
	Log             []traversal.LogEntry     `json:"log"`
	Algorithm       string                   `json:"algorithm"`
	SelectorUsed    string                   `json:"selectorUsed"`
	Parallel        bool                     `json:"parallel"`
}

type LCAResponse struct {
	Tree          *model.NodeJSON `json:"tree"`
	LCANodeID     int             `json:"lcaNodeId"`
	LCATag        string          `json:"lcaTag"`
	LCADepth      int             `json:"lcaDepth"`
	PathFromNode1 []int           `json:"pathFromNode1"`
	PathFromNode2 []int           `json:"pathFromNode2"`
	TotalNodes    int             `json:"totalNodes"`
	MaxDepth      int             `json:"maxDepth"`
}

type ErrorResponse struct {
	Error string `json:"error"`
}

func writeJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(data); err != nil {
		log.Printf("Error encoding JSON: %v", err)
	}
}

func writeError(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, ErrorResponse{Error: msg})
}

func resolveHTML(source, url, html string) (string, error) {
	if source == "url" {
		return scraper.FetchHTML(url)
	}
	return html, nil
}

func HandleParse(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	var req ParseRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid JSON: "+err.Error())
		return
	}

	htmlContent, err := resolveHTML(req.Source, req.URL, req.HTML)
	if err != nil {
		writeError(w, http.StatusBadRequest, "Failed to fetch HTML: "+err.Error())
		return
	}

	if htmlContent == "" {
		writeError(w, http.StatusBadRequest, "No HTML content provided")
		return
	}

	root, totalNodes, maxDepth := parser.Parse(htmlContent)

	writeJSON(w, http.StatusOK, ParseResponse{
		Tree:       root.ToJSON(),
		TotalNodes: totalNodes,
		MaxDepth:   maxDepth,
	})
}

func HandleSearch(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	var req SearchRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid JSON: "+err.Error())
		return
	}

	htmlContent, err := resolveHTML(req.Source, req.URL, req.HTML)
	if err != nil {
		writeError(w, http.StatusBadRequest, "Failed to fetch HTML: "+err.Error())
		return
	}

	if htmlContent == "" {
		writeError(w, http.StatusBadRequest, "No HTML content provided")
		return
	}

	if req.Selector == "" {
		writeError(w, http.StatusBadRequest, "CSS selector is required")
		return
	}

	root, totalNodes, maxDepth := parser.Parse(htmlContent)
	chain := selector.ParseSelector(req.Selector)

	var result traversal.TraversalResult

	switch req.Algorithm {
	case "dfs":
		if req.Parallel {
			result = traversal.ParallelDFS(root, chain, req.Limit, 4)
		} else {
			result = traversal.DFS(root, chain, req.Limit)
		}
	default:
		if req.Parallel {
			result = traversal.ParallelBFS(root, chain, req.Limit, 4)
		} else {
			result = traversal.BFS(root, chain, req.Limit)
		}
	}

	var matches []*model.MatchedNodeJSON
	for _, node := range result.MatchedNodes {
		matches = append(matches, node.ToMatchedJSON())
	}

	algo := req.Algorithm
	if algo == "" {
		algo = "bfs"
	}

	writeJSON(w, http.StatusOK, SearchResponse{
		Tree:            root.ToJSON(),
		Matches:         matches,
		MatchCount:      len(matches),
		TotalNodes:      totalNodes,
		MaxDepth:        maxDepth,
		VisitedCount:    result.VisitedCount,
		ExecutionTimeMs: result.ExecutionTime,
		Log:             result.Log,
		Algorithm:       algo,
		SelectorUsed:    req.Selector,
		Parallel:        req.Parallel,
	})
}

func HandleLCA(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	var req LCARequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid JSON: "+err.Error())
		return
	}

	htmlContent, err := resolveHTML(req.Source, req.URL, req.HTML)
	if err != nil {
		writeError(w, http.StatusBadRequest, "Failed to fetch HTML: "+err.Error())
		return
	}

	if htmlContent == "" {
		writeError(w, http.StatusBadRequest, "No HTML content provided")
		return
	}

	root, totalNodes, maxDepth := parser.Parse(htmlContent)

	processor := lca.NewLCAProcessor(root)
	if processor == nil {
		writeError(w, http.StatusInternalServerError, "Failed to build LCA processor")
		return
	}

	result := processor.Query(req.NodeID1, req.NodeID2)
	if result == nil {
		writeError(w, http.StatusBadRequest, "Could not find LCA for the given nodes")
		return
	}

	writeJSON(w, http.StatusOK, LCAResponse{
		Tree:          root.ToJSON(),
		LCANodeID:     result.LCANodeID,
		LCATag:        result.LCATag,
		LCADepth:      result.LCADepth,
		PathFromNode1: result.PathFromNode1,
		PathFromNode2: result.PathFromNode2,
		TotalNodes:    totalNodes,
		MaxDepth:      maxDepth,
	})
}
