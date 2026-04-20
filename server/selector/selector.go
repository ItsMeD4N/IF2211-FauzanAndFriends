package selector

// Package selector mengimplementasikan parsing CSS Selector secara manual
// menggunakan iterasi karakter tanpa library cascadia, regexp, atau parser eksternal apapun.
// Selector yang didukung: tag, .class, #id, *, dan combinator: >, +, ~, (spasi)descendant.
// Pseudo-class seperti :hover atau :nth-child diabaikan sesuai spesifikasi tugas.

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

// ParseSelector mem-parsing string CSS selector secara manual, karakter per karakter.
// Tidak menggunakan library cascadia, regexp, atau strings.* yang kompleks.
func ParseSelector(input string) SelectorChain {
	// Trim spasi manual menggantikan strings.TrimSpace
	input = trimSpace(input)
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

// tokenizeSelector memecah string CSS selector menjadi slice token.
// Contoh: "div > p.text" -> [{sel,"div"}, {comb,">"}, {sel,"p.text"}]
//
// Algoritma: iterasi rune per rune, deteksi karakter combinator (>, +, ~),
// spasi (descendant combinator), atau karakter awal selector.
//
// PENTING: karakter ':' dianggap sebagai pemutus token selector.
// Ini agar pseudo-class seperti ":hover" atau ":first-child" dibuang secara otomatis
// dan tidak merusak parsing bagian selector sebelumnya.
func tokenizeSelector(input string) []sToken {
	var tokens []sToken
	runes := []rune(input)
	i := 0

	for i < len(runes) {
		// Lewati spasi/tab
		if runes[i] == ' ' || runes[i] == '\t' {
			j := i
			for j < len(runes) && (runes[j] == ' ' || runes[j] == '\t') {
				j++
			}
			// Jika setelah spasi ada combinator eksplisit, loncat ke sana
			if j < len(runes) && (runes[j] == '>' || runes[j] == '+' || runes[j] == '~') {
				i = j
				continue
			}
			// Spasi antara dua selector = descendant combinator (ditangani di ParseSelector)
			if len(tokens) > 0 && tokens[len(tokens)-1].typ == selectorToken && j < len(runes) {
				i = j
				continue
			}
			i = j
			continue
		}

		// Combinator eksplisit: >, +, ~
		if runes[i] == '>' || runes[i] == '+' || runes[i] == '~' {
			tokens = append(tokens, sToken{typ: combinatorToken, value: string(runes[i])})
			i++
			// Lewati spasi setelah combinator
			for i < len(runes) && (runes[i] == ' ' || runes[i] == '\t') {
				i++
			}
			continue
		}

		// Baca token selector: kumpulkan karakter hingga menemukan pemisah.
		// Pemisah valid: spasi, tab, >, +, ~
		// Karakter ':' juga jadi pemisah untuk memotong pseudo-class (:hover, dll.)
		start := i
		for i < len(runes) &&
			runes[i] != ' ' && runes[i] != '\t' &&
			runes[i] != '>' && runes[i] != '+' && runes[i] != '~' &&
			runes[i] != ':' { // berhenti di pseudo-class, diabaikan sesuai spesifikasi
			i++
		}
		if i > start {
			tokens = append(tokens, sToken{typ: selectorToken, value: string(runes[start:i])})
		}

		// Jika berhenti di ':', lewati sisa pseudo-class hingga pemisah berikutnya
		if i < len(runes) && runes[i] == ':' {
			for i < len(runes) && runes[i] != ' ' && runes[i] != '\t' &&
				runes[i] != '>' && runes[i] != '+' && runes[i] != '~' {
				i++
			}
		}
	}

	return tokens
}

// parseSimpleSelector mem-parsing satu token selector menjadi SimpleSelector.
// Contoh: "div.card.highlight#main" -> {Tag:"div", ID:"main", Classes:["card","highlight"]}
//
// Algoritma iterasi rune manual:
//  1. Jika rune pertama bukan '.', '#', atau '*' -> baca sebagai nama tag.
//  2. Jika rune pertama '*' -> universal selector, tag dibiarkan kosong.
//  3. Iterasi sisa rune: '#' awali ID, '.' awali class name.
func parseSimpleSelector(s string) SimpleSelector {
	sel := SimpleSelector{}
	runes := []rune(s)
	i := 0

	// Baca nama tag jika ada (tidak dimulai dengan '.', '#', atau '*')
	if i < len(runes) && runes[i] != '.' && runes[i] != '#' && runes[i] != '*' {
		start := i
		for i < len(runes) && runes[i] != '.' && runes[i] != '#' {
			i++
		}
		// Konversi ke lowercase manual (menggantikan strings.ToLower)
		sel.Tag = toLowerStr(string(runes[start:i]))
	} else if i < len(runes) && runes[i] == '*' {
		// Universal selector '*' — cocok dengan semua elemen, tag kosong
		i++
	}

	// Baca bagian #id dan .class secara bergantian
	for i < len(runes) {
		if runes[i] == '#' {
			// Baca ID: ambil rune hingga '.' atau '#' berikutnya
			i++
			start := i
			for i < len(runes) && runes[i] != '.' && runes[i] != '#' {
				i++
			}
			sel.ID = string(runes[start:i])
		} else if runes[i] == '.' {
			// Baca class name: ambil rune hingga '.' atau '#' berikutnya
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
			i++ // skip karakter tidak dikenal
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

// String menghasilkan representasi string dari SelectorChain untuk keperluan debugging.
// Tidak menggunakan strings.Builder sehingga 100% from scratch.
func (sc SelectorChain) String() string {
	if len(sc.Parts) == 0 {
		return ""
	}

	var result []rune
	for i, part := range sc.Parts {
		if i > 0 {
			switch sc.Combinators[i-1] {
			case CombDescendant:
				result = append(result, ' ')
			case CombChild:
				result = append(result, []rune(" > ")...)
			case CombAdjacentSibling:
				result = append(result, []rune(" + ")...)
			case CombGeneralSibling:
				result = append(result, []rune(" ~ ")...)
			}
		}
		result = append(result, []rune(part.Tag)...)
		if part.ID != "" {
			result = append(result, '#')
			result = append(result, []rune(part.ID)...)
		}
		for _, cls := range part.Classes {
			result = append(result, '.')
			result = append(result, []rune(cls)...)
		}
	}
	return string(result)
}

// trimSpace menghapus spasi dan tab di awal dan akhir string secara manual.
// Digunakan sebagai pengganti strings.TrimSpace agar tidak ada ketergantungan ke package strings.
func trimSpace(s string) string {
	runes := []rune(s)
	start := 0
	end := len(runes)
	for start < end && (runes[start] == ' ' || runes[start] == '\t') {
		start++
	}
	for end > start && (runes[end-1] == ' ' || runes[end-1] == '\t') {
		end--
	}
	return string(runes[start:end])
}

// toLowerStr mengkonversi string ke huruf kecil secara manual per rune.
// Menggantikan strings.ToLower agar tidak ada ketergantungan ke package strings.
func toLowerStr(s string) string {
	runes := []rune(s)
	for i, ch := range runes {
		if ch >= 'A' && ch <= 'Z' {
			runes[i] = ch + 32
		}
	}
	return string(runes)
}
