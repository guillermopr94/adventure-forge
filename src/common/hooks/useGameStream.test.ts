import { processSSEBuffer } from './sseUtils';

describe('SSE Buffer Processing Logic (sseUtils)', () => {
  it('should handle standard SSE line with double newline', () => {
    let buffer = 'data: {"type": "status", "message": "Thinking..."}\n\n';
    let events: any[] = [];
    
    buffer = processSSEBuffer(buffer, (e) => events.push(e));
    
    expect(buffer).toBe('');
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('status');
  });

  it('should handle split chunks of JSON', () => {
    let events: any[] = [];
    let buffer = '';
    
    // Chunk 1
    buffer += 'data: {"type": "status", "messa';
    buffer = processSSEBuffer(buffer, (e) => events.push(e));
    expect(events).toHaveLength(0); // No message yet
    expect(buffer).toContain('messa');
    
    // Chunk 2
    buffer += 'ge": "Thinking..."}\n\n';
    buffer = processSSEBuffer(buffer, (e) => events.push(e));
    
    expect(buffer).toBe('');
    expect(events).toHaveLength(1);
    expect(events[0].message).toBe('Thinking...');
  });

  it('should handle multiple SSE messages in one buffer', () => {
    let buffer = 'data: {"type": "status"}\n\ndata: {"type": "text_structure", "paragraphs": ["Hi"]}\n\n';
    let events: any[] = [];
    
    buffer = processSSEBuffer(buffer, (e) => events.push(e));
    
    expect(events).toHaveLength(2);
    expect(events[1].type).toBe('text_structure');
  });

  it('should handle multi-line SSE blocks (standard compatibility)', () => {
    let buffer = 'id: 1\nevent: message\ndata: {"type": "status"}\n\n';
    let events: any[] = [];
    
    buffer = processSSEBuffer(buffer, (e) => events.push(e));
    
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('status');
  });

  it('should handle messy whitespace and empty lines', () => {
    let buffer = '\n\ndata: {"type": "status"}\n\n  \n\ndata: {"type": "done"}\n\n';
    let events: any[] = [];
    
    buffer = processSSEBuffer(buffer, (e) => events.push(e));
    
    expect(events).toHaveLength(2);
    expect(events[0].type).toBe('status');
    expect(events[1].type).toBe('done');
  });

  it('should not crash on invalid JSON but continue processing', () => {
    let buffer = 'data: {invalid}\n\ndata: {"type": "done"}\n\n';
    let events: any[] = [];
    
    // Mock console.error to avoid polluting test logs
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    buffer = processSSEBuffer(buffer, (e) => events.push(e));
    
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('done');
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
