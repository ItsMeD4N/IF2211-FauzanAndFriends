package selector

import (
	"strings"
)

type CombinatorType int

const (
	CombDescendant      CombinatorType = iota
	CombChild
	CombAdjacentSibling
	CombGeneralSibling
)

type SimpleSelector struct {
	Tag     string
	ID      string
	Classes []string
}

type SelectorChain struct {
	Parts       []SimpleSelector
	Combinators []CombinatorType
}

func ParseSelector(input string) SelectorChain {
	input = strings.TrimSpace(input)
	if input == "" {
		return SelectorChain{}
	}

	var parts []SimpleSelector
	var combinators []CombinatorType

	tokens := tokenizeSelector(input)

	i := 0
	for i < len(tokens) {
		if tokens[i].typ == selectorToken {
			parts = append(parts, parseSimpleSelector(tokens[i].value))
			i++

			if i < len(tokens) && tokens[i].typ == combinatorToken {
				comb := parseCombinator(tokens[i].value)
				combinators = append(combinators, comb)
				i++
			} else if i < len(tokens) && tokens[i].typ == selectorToken {
				combinators = append(combinators, CombDescendant)
			}
		} else {
			i++
		}
	}

	return SelectorChain{
		Parts:       parts,
		Combinators: combinators,
	}
}

type selectorTokenType int

const (
	selectorToken   selectorTokenType = iota
	combinatorToken
)

type sToken struct {
	typ   selectorTokenType
	value string
}

func tokenizeSelector(input string) []sToken {
	var tokens []sToken
	runes := []rune(input)
	i := 0

	for i < len(runes) {
		if runes[i] == ' ' || runes[i] == '\t' {
			j := i
			for j < len(runes) && (runes[j] == ' ' || runes[j] == '\t') {
				j++
			}
			if j < len(runes) && (runes[j] == '>' || runes[j] == '+' || runes[j] == '~') {
				i = j
				continue
			}
			if len(tokens) > 0 && tokens[len(tokens)-1].typ == selectorToken && j < len(runes) {
				i = j
				continue
			}
			i = j
			continue
		}

		if runes[i] == '>' || runes[i] == '+' || runes[i] == '~' {
			tokens = append(tokens, sToken{typ: combinatorToken, value: string(runes[i])})
			i++
			for i < len(runes) && (runes[i] == ' ' || runes[i] == '\t') {
				i++
			}
			continue
		}

		start := i
		for i < len(runes) && runes[i] != ' ' && runes[i] != '\t' && runes[i] != '>' && runes[i] != '+' && runes[i] != '~' {
			i++
		}
		if i > start {
			tokens = append(tokens, sToken{typ: selectorToken, value: string(runes[start:i])})
		}
	}

	return tokens
}

func parseSimpleSelector(s string) SimpleSelector {
	sel := SimpleSelector{}
	runes := []rune(s)
	i := 0

	if i < len(runes) && runes[i] != '.' && runes[i] != '#' && runes[i] != '*' {
		start := i
		for i < len(runes) && runes[i] != '.' && runes[i] != '#' {
			i++
		}
		sel.Tag = strings.ToLower(string(runes[start:i]))
	} else if i < len(runes) && runes[i] == '*' {
		i++
	}

	for i < len(runes) {
		if runes[i] == '#' {
			i++
			start := i
			for i < len(runes) && runes[i] != '.' && runes[i] != '#' {
				i++
			}
			sel.ID = string(runes[start:i])
		} else if runes[i] == '.' {
			i++
			start := i
			for i < len(runes) && runes[i] != '.' && runes[i] != '#' {
				i++
			}
			cls := string(runes[start:i])
			if cls != "" {
				sel.Classes = append(sel.Classes, cls)
			}
		} else {
			i++
		}
	}

	return sel
}

func parseCombinator(s string) CombinatorType {
	switch s {
	case ">":
		return CombChild
	case "+":
		return CombAdjacentSibling
	case "~":
		return CombGeneralSibling
	default:
		return CombDescendant
	}
}

func (sc SelectorChain) String() string {
	if len(sc.Parts) == 0 {
		return ""
	}

	var sb strings.Builder
	for i, part := range sc.Parts {
		if i > 0 {
			switch sc.Combinators[i-1] {
			case CombDescendant:
				sb.WriteString(" ")
			case CombChild:
				sb.WriteString(" > ")
			case CombAdjacentSibling:
				sb.WriteString(" + ")
			case CombGeneralSibling:
				sb.WriteString(" ~ ")
			}
		}
		if part.Tag != "" {
			sb.WriteString(part.Tag)
		}
		if part.ID != "" {
			sb.WriteString("#" + part.ID)
		}
		for _, cls := range part.Classes {
			sb.WriteString("." + cls)
		}
	}
	return sb.String()
}
