import React from 'react';
import styled from 'styled-components/macro';
import {
  SearchFormData,
  SourceType,
  AlgorithmType,
  LimitType,
} from 'types/tree';

interface InputPanelProps {
  formData: SearchFormData;
  onFormChange: (data: SearchFormData) => void;
  onSubmit: () => void;
  loading: boolean;
}

export function InputPanel({
  formData,
  onFormChange,
  onSubmit,
  loading,
}: InputPanelProps) {
  const update = (partial: Partial<SearchFormData>) => {
    onFormChange({ ...formData, ...partial });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Container>
      <Title>DOM Tree Explorer</Title>
      <Form onSubmit={handleSubmit}>
        <FieldGroup>
          <Label>Sumber Input</Label>
          <RadioGroup>
            <RadioLabel active={formData.source === 'url'}>
              <HiddenRadio
                type="radio"
                name="source"
                value="url"
                checked={formData.source === 'url'}
                onChange={() => update({ source: 'url' as SourceType })}
              />
              URL
            </RadioLabel>
            <RadioLabel active={formData.source === 'raw'}>
              <HiddenRadio
                type="radio"
                name="source"
                value="raw"
                checked={formData.source === 'raw'}
                onChange={() => update({ source: 'raw' as SourceType })}
              />
              Raw HTML
            </RadioLabel>
          </RadioGroup>
        </FieldGroup>

        {formData.source === 'url' ? (
          <FieldGroup>
            <Label>URL Website</Label>
            <Input
              type="text"
              placeholder="https://example.com"
              value={formData.url}
              onChange={e => update({ url: e.target.value })}
            />
          </FieldGroup>
        ) : (
          <FieldGroup>
            <Label>HTML Code</Label>
            <TextArea
              placeholder='<html><body><div class="card">...</div></body></html>'
              value={formData.html}
              onChange={e => update({ html: e.target.value })}
              rows={5}
            />
          </FieldGroup>
        )}

        <FieldGroup>
          <Label>CSS Selector</Label>
          <Input
            type="text"
            placeholder="div.card > p, #main, .container"
            value={formData.selector}
            onChange={e => update({ selector: e.target.value })}
          />
          <Hint>
            Contoh: <code>div</code>, <code>.card</code>, <code>#main</code>,{' '}
            <code>div &gt; p</code>
          </Hint>
        </FieldGroup>

        <FieldGroup>
          <Label>Algoritma</Label>
          <SelectWrapper>
            <Select
              value={formData.algorithm}
              onChange={e =>
                update({ algorithm: e.target.value as AlgorithmType })
              }
            >
              <option value="bfs">Breadth-First Search (BFS)</option>
              <option value="dfs">Depth-First Search (DFS)</option>
            </Select>
          </SelectWrapper>
        </FieldGroup>

        <FieldGroup>
          <Label>Batas Hasil</Label>
          <RadioGroup>
            <RadioLabel active={formData.limitType === 'all'}>
              <HiddenRadio
                type="radio"
                name="limit"
                value="all"
                checked={formData.limitType === 'all'}
                onChange={() => update({ limitType: 'all' as LimitType })}
              />
              Semua
            </RadioLabel>
            <RadioLabel active={formData.limitType === 'topn'}>
              <HiddenRadio
                type="radio"
                name="limit"
                value="topn"
                checked={formData.limitType === 'topn'}
                onChange={() => update({ limitType: 'topn' as LimitType })}
              />
              Top N
            </RadioLabel>
          </RadioGroup>
          {formData.limitType === 'topn' && (
            <NumberInput
              type="number"
              min={1}
              max={1000}
              value={formData.limitN}
              onChange={e => update({ limitN: parseInt(e.target.value) || 1 })}
            />
          )}
        </FieldGroup>

        <FieldGroup>
          <CheckboxLabel>
            <Checkbox
              type="checkbox"
              checked={formData.parallel}
              onChange={e => update({ parallel: e.target.checked })}
            />
            <CheckboxCustom checked={formData.parallel}>
              {formData.parallel && '✓'}
            </CheckboxCustom>
            Parallel (Goroutines)
          </CheckboxLabel>
        </FieldGroup>

        <SubmitButton type="submit" disabled={loading}>
          {loading ? (
            <>
              <Spinner /> Memproses...
            </>
          ) : (
            'Mulai Traversal'
          )}
        </SubmitButton>
      </Form>
    </Container>
  );
}

const Container = styled.div`
  background: #111;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 24px;
`;

const Title = styled.h2`
  color: #fff;
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0 0 20px 0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  color: #aaa;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const Input = styled.input`
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 6px;
  color: #fff;
  padding: 10px 12px;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: #888;
  }

  &::placeholder {
    color: #555;
  }
`;

const TextArea = styled.textarea`
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 6px;
  color: #fff;
  padding: 10px 12px;
  font-size: 0.85rem;
  font-family: 'JetBrains Mono', monospace;
  resize: vertical;
  min-height: 80px;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: #888;
  }

  &::placeholder {
    color: #555;
  }
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const HiddenRadio = styled.input`
  display: none;
`;

const RadioLabel = styled.label<{ active: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  color: ${p => (p.active ? '#fff' : '#888')};
  background: ${p => (p.active ? '#333' : '#1a1a1a')};
  border: 1px solid ${p => (p.active ? '#555' : '#2a2a2a')};
  transition: all 0.15s;
  flex: 1;
  text-align: center;
  justify-content: center;

  &:hover {
    background: #2a2a2a;
  }
`;

const SelectWrapper = styled.div`
  position: relative;
`;

const Select = styled.select`
  appearance: none;
  width: 100%;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 6px;
  color: #fff;
  padding: 10px 12px;
  font-size: 0.9rem;
  cursor: pointer;
  outline: none;

  &:focus {
    border-color: #888;
  }

  option {
    background: #1a1a1a;
    color: #fff;
  }
`;

const NumberInput = styled.input`
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 6px;
  color: #fff;
  padding: 8px 12px;
  font-size: 0.9rem;
  width: 100px;
  margin-top: 4px;
  outline: none;

  &:focus {
    border-color: #888;
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #ccc;
  font-size: 0.85rem;
`;

const Checkbox = styled.input`
  display: none;
`;

const CheckboxCustom = styled.span<{ checked: boolean }>`
  width: 18px;
  height: 18px;
  border-radius: 4px;
  border: 1px solid ${p => (p.checked ? '#fff' : '#555')};
  background: ${p => (p.checked ? '#fff' : 'transparent')};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  color: #000;
  transition: all 0.15s;
  flex-shrink: 0;
`;

const Hint = styled.span`
  color: #666;
  font-size: 0.75rem;

  code {
    background: #1a1a1a;
    padding: 1px 5px;
    border-radius: 3px;
    color: #aaa;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.72rem;
  }
`;

const SubmitButton = styled.button`
  background: #fff;
  color: #000;
  border: none;
  border-radius: 6px;
  padding: 12px 20px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 4px;

  &:hover:not(:disabled) {
    background: #ddd;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Spinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(0, 0, 0, 0.2);
  border-top-color: #000;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;
