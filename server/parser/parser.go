package parser

import (
	"stima-tubes2/model"
)

type Parser struct {
	tokens []Token
	pos    int
	nextID int
}

func Parse(html string) (*model.Node, int, int) {
	tokenizer := NewTokenizer(html)
	tokens := tokenizer.Tokenize()

	p := &Parser{
		tokens: tokens,
		pos:    0,
		nextID: 0,
	}

	root := p.buildTree()
	totalNodes := model.CountNodes(root)
	maxDepth := model.MaxDepth(root)

	return root, totalNodes, maxDepth
}

func (p *Parser) currentToken() Token {
	if p.pos >= len(p.tokens) {
		return Token{Type: TokenEOF}
	}
	return p.tokens[p.pos]
}

func (p *Parser) advance() {
	p.pos++
}

func (p *Parser) allocID() int {
	id := p.nextID
	p.nextID++
	return id
}

func (p *Parser) buildTree() *model.Node {
	root := &model.Node{
		ID:         p.allocID(),
		Tag:        "document",
		Attributes: make(map[string]string),
		Depth:      0,
	}

	stack := []*model.Node{root}

	for p.currentToken().Type != TokenEOF {
		token := p.currentToken()

		switch token.Type {
		case TokenStartTag:
			parent := stack[len(stack)-1]
			node := &model.Node{
				ID:         p.allocID(),
				Tag:        token.TagName,
				Attributes: token.Attributes,
				Parent:     parent,
				Depth:      parent.Depth + 1,
			}
			parent.Children = append(parent.Children, node)
			stack = append(stack, node)
			p.advance()

		case TokenSelfClosingTag:
			parent := stack[len(stack)-1]
			node := &model.Node{
				ID:         p.allocID(),
				Tag:        token.TagName,
				Attributes: token.Attributes,
				Parent:     parent,
				Depth:      parent.Depth + 1,
			}
			parent.Children = append(parent.Children, node)
			p.advance()

		case TokenEndTag:
			for i := len(stack) - 1; i > 0; i-- {
				if stack[i].Tag == token.TagName {
					stack = stack[:i]
					break
				}
			}
			p.advance()

		case TokenText:
			if token.Content != "" {
				parent := stack[len(stack)-1]
				node := &model.Node{
					ID:          p.allocID(),
					Tag:         "#text",
					Attributes:  make(map[string]string),
					Parent:      parent,
					Depth:       parent.Depth + 1,
					TextContent: token.Content,
				}
				parent.Children = append(parent.Children, node)
			}
			p.advance()

		default:
			p.advance()
		}
	}

	return root
}
