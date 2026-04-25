package parser

type TokenType int

const (
	TokenStartTag TokenType = iota
	TokenEndTag
	TokenSelfClosingTag
	TokenText
	TokenComment
	TokenDoctype
	TokenEOF
)

type Token struct {
	Type       TokenType
	TagName    string
	Attributes map[string]string
	Content    string
}

type Tokenizer struct {
	input []rune
	pos   int
}

func NewTokenizer(input string) *Tokenizer {
	return &Tokenizer{
		input: []rune(input),
		pos:   0,
	}
}

func (t *Tokenizer) peek() rune {
	if t.pos >= len(t.input) {
		return 0
	}
	return t.input[t.pos]
}

func (t *Tokenizer) next() rune {
	if t.pos >= len(t.input) {
		return 0
	}
	ch := t.input[t.pos]
	t.pos++
	return ch
}

func (t *Tokenizer) eof() bool {
	return t.pos >= len(t.input)
}

func (t *Tokenizer) skipWhitespace() {
	for !t.eof() && isWhitespace(t.peek()) {
		t.next()
	}
}

func isWhitespace(ch rune) bool {
	return ch == ' ' || ch == '\t' || ch == '\n' || ch == '\r'
}

func isAlpha(ch rune) bool {
	return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z')
}

func isAlphaNumeric(ch rune) bool {
	return isAlpha(ch) || (ch >= '0' && ch <= '9')
}

func isTagNameChar(ch rune) bool {
	return isAlphaNumeric(ch) || ch == '-' || ch == '_' || ch == '!'
}

func isAttrNameChar(ch rune) bool {
	return isAlphaNumeric(ch) || ch == '-' || ch == '_' || ch == ':' || ch == '.'
}

func toLower(ch rune) rune {
	if ch >= 'A' && ch <= 'Z' {
		return ch + 32
	}
	return ch
}

func toLowerString(s string) string {
	runes := []rune(s)
	for i, ch := range runes {
		runes[i] = toLower(ch)
	}
	return string(runes)
}

var voidElements = map[string]bool{
	"area": true, "base": true, "br": true, "col": true,
	"embed": true, "hr": true, "img": true, "input": true,
	"link": true, "meta": true, "param": true, "source": true,
	"track": true, "wbr": true,
}

var skipElements = map[string]bool{
	"script":   true,
	"style":    true,
	"noscript": true,
	"head":     true,
}

func (t *Tokenizer) Tokenize() []Token {
	var tokens []Token
	for !t.eof() {
		if t.peek() == '<' {
			token := t.readTag()

			if token.Type != TokenComment && token.Type != TokenDoctype {
				tokens = append(tokens, token)
			}

			if token.Type == TokenStartTag && skipElements[token.TagName] {
				t.skipUntilClosingTag(token.TagName)
			}
		} else {
			text := t.readText()
			if text.Content != "" {
				tokens = append(tokens, text)
			}
		}
	}
	tokens = append(tokens, Token{Type: TokenEOF})
	return tokens
}

func (t *Tokenizer) readText() Token {
	var content []rune
	for !t.eof() && t.peek() != '<' {
		content = append(content, t.next())
	}
	text := collapseWhitespace(string(content))
	return Token{Type: TokenText, Content: text}
}

func collapseWhitespace(s string) string {
	runes := []rune(s)
	var result []rune
	inSpace := false
	for _, ch := range runes {
		if isWhitespace(ch) {
			if !inSpace && len(result) > 0 {
				result = append(result, ' ')
			}
			inSpace = true
		} else {
			inSpace = false
			result = append(result, ch)
		}
	}
	if len(result) > 0 && result[len(result)-1] == ' ' {
		result = result[:len(result)-1]
	}
	return string(result)
}

func (t *Tokenizer) readTag() Token {
	t.next()

	if t.pos+2 < len(t.input) && t.input[t.pos] == '!' && t.input[t.pos+1] == '-' && t.input[t.pos+2] == '-' {
		return t.readComment()
	}

	if t.pos+7 < len(t.input) && toLowerString(string(t.input[t.pos:t.pos+8])) == "!doctype" {
		return t.readDoctype()
	}

	isClosing := false
	if t.peek() == '/' {
		isClosing = true
		t.next()
	}

	t.skipWhitespace()

	tagName := t.readTagName()
	if tagName == "" {
		for !t.eof() && t.peek() != '>' {
			t.next()
		}
		if !t.eof() {
			t.next()
		}
		return Token{Type: TokenText, Content: ""}
	}

	tagName = toLowerString(tagName)

	if isClosing {
		for !t.eof() && t.peek() != '>' {
			t.next()
		}
		if !t.eof() {
			t.next()
		}
		return Token{Type: TokenEndTag, TagName: tagName}
	}

	attrs := t.readAttributes()

	selfClosing := false
	t.skipWhitespace()
	if t.peek() == '/' {
		selfClosing = true
		t.next()
	}

	if t.peek() == '>' {
		t.next()
	}

	if voidElements[tagName] {
		selfClosing = true
	}

	if selfClosing {
		return Token{Type: TokenSelfClosingTag, TagName: tagName, Attributes: attrs}
	}

	return Token{Type: TokenStartTag, TagName: tagName, Attributes: attrs}
}

func (t *Tokenizer) readTagName() string {
	var name []rune
	for !t.eof() && isTagNameChar(t.peek()) {
		name = append(name, t.next())
	}
	return string(name)
}

func (t *Tokenizer) readAttributes() map[string]string {
	attrs := make(map[string]string)

	for {
		t.skipWhitespace()

		if t.eof() || t.peek() == '>' || t.peek() == '/' {
			break
		}

		attrName := t.readAttrName()
		if attrName == "" {
			t.next() 
			continue
		}
		attrName = toLowerString(attrName)

		t.skipWhitespace()

		if t.peek() == '=' {
			t.next() 
			t.skipWhitespace()
			attrValue := t.readAttrValue()
			attrs[attrName] = attrValue
		} else {
			
			attrs[attrName] = ""
		}
	}

	return attrs
}

func (t *Tokenizer) readAttrName() string {
	var name []rune
	for !t.eof() && isAttrNameChar(t.peek()) {
		name = append(name, t.next())
	}
	return string(name)
}

func (t *Tokenizer) readAttrValue() string {
	if t.eof() {
		return ""
	}

	if t.peek() == '"' || t.peek() == '\'' {
		quote := t.next()
		var value []rune
		for !t.eof() && t.peek() != quote {
			value = append(value, t.next())
		}
		if !t.eof() {
			t.next()
		}
		return string(value)
	}

	var value []rune
	for !t.eof() && !isWhitespace(t.peek()) && t.peek() != '>' && t.peek() != '/' {
		value = append(value, t.next())
	}
	return string(value)
}

func (t *Tokenizer) readComment() Token {
	t.pos += 3
	var content []rune
	for !t.eof() {
		if t.pos+2 < len(t.input) && t.input[t.pos] == '-' && t.input[t.pos+1] == '-' && t.input[t.pos+2] == '>' {
			t.pos += 3
			break
		}
		content = append(content, t.next())
	}
	return Token{Type: TokenComment, Content: string(content)}
}

func (t *Tokenizer) readDoctype() Token {
	for !t.eof() && t.peek() != '>' {
		t.next()
	}
	if !t.eof() {
		t.next()
	}
	return Token{Type: TokenDoctype}
}

func (t *Tokenizer) skipUntilClosingTag(tagName string) {
	target := "</" + tagName
	for !t.eof() {
		if t.peek() == '<' {
			
			remaining := string(t.input[t.pos:])
			if len(remaining) >= len(target) && toLowerString(remaining[:len(target)]) == target {
				t.pos += len(target) 
				
				for !t.eof() && t.peek() != '>' {
					t.next()
				}
				if !t.eof() {
					t.next() 
				}
				return
			}
		}
		t.next()
	}
}
