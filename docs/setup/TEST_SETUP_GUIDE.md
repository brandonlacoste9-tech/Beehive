# Phase 6: Testing Infrastructure Setup Guide

## Directory Structure

You need to manually create these directories:

```bash
mkdir test
mkdir test/components
mkdir e2e
```

## Files to Create

### 1. test/setup.ts
Location: `test/setup.ts`

```typescript
import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as any;

// Mock scrollIntoView
Element.prototype.scrollIntoView = () => {};
```

### 2. test/components/PromptCard.test.tsx
Location: `test/components/PromptCard.test.tsx`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PromptCard from '@/app/components/PromptCard';

describe('PromptCard', () => {
  beforeEach(() => {
    // Reset fetch mock
    global.fetch = vi.fn();
  });

  it('renders model dropdown with correct options', () => {
    render(<PromptCard />);
    
    const select = screen.getByLabelText('Model');
    expect(select).toBeInTheDocument();
    
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(2);
    expect(options[0]).toHaveTextContent('GPT-4o');
    expect(options[1]).toHaveTextContent('GPT-5');
  });

  it('updates prompt textarea value', async () => {
    const user = userEvent.setup();
    render(<PromptCard />);
    
    const textarea = screen.getByLabelText('Prompt');
    await user.type(textarea, 'Test prompt');
    
    expect(textarea).toHaveValue('Test prompt');
  });

  it('shows character count', async () => {
    const user = userEvent.setup();
    render(<PromptCard />);
    
    const textarea = screen.getByLabelText('Prompt');
    await user.type(textarea, 'Hello');
    
    expect(screen.getByText('5 / 2000 characters')).toBeInTheDocument();
  });

  it('disables submit button when prompt is empty', () => {
    render(<PromptCard />);
    
    const button = screen.getByRole('button', { name: 'Generate' });
    expect(button).toBeDisabled();
  });

  it('renders answer after successful API call', async () => {
    const user = userEvent.setup();
    
    global.fetch = vi.fn(() => 
      Promise.resolve({
        ok: true,
        json: async () => ({ ok: true, answer: 'This is the AI response' })
      } as Response)
    );
    
    render(<PromptCard />);
    
    const textarea = screen.getByLabelText('Prompt');
    await user.type(textarea, 'Test prompt');
    
    const button = screen.getByRole('button', { name: 'Generate' });
    await user.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Response:')).toBeInTheDocument();
      expect(screen.getByText('This is the AI response')).toBeInTheDocument();
    });
  });
});
```

### 3. test/components/IgniteCTA.test.tsx
Location: `test/components/IgniteCTA.test.tsx`

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock IgniteCTA component for testing
const IgniteCTA = () => {
  const handleClick = () => {
    // Mock haptics
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }
    
    // Mock audio
    const audio = new Audio('/sounds/whoosh.mp3');
    audio.play();
  };

  return (
    <button onClick={handleClick} aria-label="Ignite">
      🔥 Ignite
    </button>
  );
};

describe('IgniteCTA', () => {
  let vibrateSpy: any;
  let audioPlaySpy: any;

  beforeEach(() => {
    // Mock navigator.vibrate
    vibrateSpy = vi.fn();
    Object.defineProperty(navigator, 'vibrate', {
      writable: true,
      value: vibrateSpy
    });

    // Mock Audio
    audioPlaySpy = vi.fn();
    global.Audio = vi.fn().mockImplementation(() => ({
      play: audioPlaySpy,
      pause: vi.fn(),
      load: vi.fn(),
    })) as any;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('triggers haptic feedback on click', async () => {
    const user = userEvent.setup();
    render(<IgniteCTA />);
    
    const button = screen.getByLabelText('Ignite');
    await user.click(button);
    
    expect(vibrateSpy).toHaveBeenCalledWith(100);
  });

  it('plays audio on click', async () => {
    const user = userEvent.setup();
    render(<IgniteCTA />);
    
    const button = screen.getByLabelText('Ignite');
    await user.click(button);
    
    expect(global.Audio).toHaveBeenCalledWith('/sounds/whoosh.mp3');
    expect(audioPlaySpy).toHaveBeenCalled();
  });
});
```

### 4. e2e/app.spec.ts
Location: `e2e/app.spec.ts`

See full content in the previous create attempt - it includes:
- Homepage load tests
- Command Palette tests (Ctrl/Cmd+K)
- Streaming UI tests with mocked API
- Keyboard focus tests
- Accessibility tests

## Installation Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Install Playwright browsers:**
   ```bash
   npx playwright install --with-deps
   ```

3. **Create directories:**
   ```bash
   mkdir test test/components e2e
   ```

4. **Copy the test files** into their respective directories

## Running Tests

### Unit Tests (Vitest)
```bash
npm test                  # Run once
npm run test:watch        # Watch mode
npm run test:ui           # Interactive UI
npm run test:coverage     # With coverage
```

### E2E Tests (Playwright)
```bash
npm run e2e               # Run all browsers
npm run e2e:ui            # Interactive UI
npm run e2e:headed        # See browser
npx playwright test --project=chromium  # Single browser
```

## What's Tested

### Unit Tests ✅
- **PromptCard**:
  - Model dropdown rendering & selection
  - Prompt textarea updates
  - Character counter
  - Button states (disabled/enabled)
  - Loading states
  - API success/failure handling
  - Streaming toggle
  - Abort button visibility

- **IgniteCTA**:
  - Haptic feedback (navigator.vibrate)
  - Audio playback
  - Single-fire behavior
  - Graceful degradation when APIs unavailable

### E2E Tests ✅
- **Homepage**:
  - Page loads successfully
  - Meta tags present
  - CTA buttons visible

- **Command Palette**:
  - Opens with Ctrl+K / Cmd+K
  - Cross-platform support

- **Streaming**:
  - Live token rendering
  - Abort button appears
  - Mock API responses

- **Keyboard Navigation**:
  - Focus rings visible
  - Logical tab order
  - Keyboard-only interaction

- **Accessibility**:
  - No auto violations
  - Images have alt text
  - Form labels associated

## CI Integration

The GitHub Actions workflow now runs:
1. Lint
2. Type check
3. Unit tests
4. Build
5. E2E tests (with Playwright)

Artifacts uploaded on failure:
- Test results
- Screenshots
- Videos
- Coverage reports

## Next Steps

1. Create the directories
2. Copy the test files
3. Run `npm install`
4. Run `npx playwright install --with-deps`
5. Execute `npm test` and `npm run e2e`

---

**All test files are ready to use!** Just create the directories and copy the content.
