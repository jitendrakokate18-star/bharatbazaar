import { StockDataProvider } from './dataProvider';
import { realFreeProvider } from './realProvider';
import { mockStockDataProvider } from './mockProvider';

export function getDataProvider(): StockDataProvider {
  if (process.env.DATA_PROVIDER === 'mock') {
    return mockStockDataProvider;
  }
  return realFreeProvider;
}

export const defaultDataProvider = getDataProvider();
