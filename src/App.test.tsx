import { render, screen } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import App from './App';

afterEach(() => vi.restoreAllMocks());

test('loads and renders products from the API', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: async () => [{
      id: 1,
      shelfOfOrigin: 2,
      barcode: '5700000000000',
      amountCounted: 3,
      date: '2026-07-26',
    }],
  }));

  render(<App />);

  expect(await screen.findByText('5700000000000')).toBeInTheDocument();
  expect(fetch).toHaveBeenCalledWith('/api/products', {});
});
