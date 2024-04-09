import React, { FC } from 'react';
import { Provider } from 'react-redux';
import { renderHook } from '@testing-library/react-hooks';
import configureStore from '../../store/store';
import useRamps, { RampsMetaMaskEntry } from './useRamps';
import { mockRampNetworks } from './constants';
import RampAPI from './rampAPI';
import { AggregatorNetwork } from './useRamps.types';
import { cloneDeep } from 'lodash';

const mockedMetametricsId = '0xtestMetaMetricsId';
const mockedNetworks = mockRampNetworks;

jest.mock('./rampAPI');
const mockedAPI = RampAPI as jest.Mocked<typeof RampAPI>;

// test utilities
const buildNewStore = (chainId: string) => ({
  metamask: {
    providerConfig: {
      chainId,
    },
  },
});

const updateOrAddNetwork = (network: AggregatorNetwork) => {
  const clonedNetworks = cloneDeep(mockedNetworks);
  const index = clonedNetworks.findIndex(
    (mockedNetwork) => mockedNetwork.chainId === network.chainId,
  );
  if (index === -1) {
    return clonedNetworks.concat(network);
  }
  clonedNetworks[index] = network;
  return clonedNetworks;
};

let mockStoreState = {
  metamask: {
    providerConfig: {
      chainId: '0x1',
    },
    metaMetricsId: mockedMetametricsId,
  },
};

const wrapper: FC = ({ children }) => (
  <Provider store={configureStore(mockStoreState)}>{children}</Provider>
);

describe('useRamps', () => {
  // mock the openTab function to test if it is called with the correct URL when opening the Pdapp
  beforeAll(() => {
    Object.defineProperty(global, 'platform', {
      value: {
        openTab: jest.fn(),
      },
    });
  });

  // mock the ramps API to return the mocked networks
  beforeEach(() => {
    mockedAPI.getNetworks.mockImplementation(() =>
      Promise.resolve(mockedNetworks),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should default the metamask entry param when opening the buy crypto URL', () => {
    const metaMaskEntry = 'ext_buy_sell_button';
    const mockChainId = '0x1';

    mockStoreState = {
      ...mockStoreState,
      metamask: {
        ...mockStoreState.metamask,
        providerConfig: {
          chainId: mockChainId,
        },
      },
    };

    const mockBuyURI = `${process.env.PORTFOLIO_URL}/buy?metamaskEntry=${metaMaskEntry}&chainId=${mockChainId}&metametricsId=${mockedMetametricsId}`;
    const openTabSpy = jest.spyOn(global.platform, 'openTab');

    const { result } = renderHook(() => useRamps(), { wrapper }); // default metamask entry

    result.current.openBuyCryptoInPdapp();
    expect(openTabSpy).toHaveBeenCalledWith({
      url: mockBuyURI,
    });
  });

  it('should use the correct metamask entry param when opening the buy crypto URL', () => {
    const metaMaskEntry = 'ext_buy_banner_tokens';
    const mockChainId = '0x1';

    mockStoreState = {
      ...mockStoreState,
      metamask: {
        ...mockStoreState.metamask,
        providerConfig: {
          chainId: mockChainId,
        },
      },
    };

    const mockBuyURI = `${process.env.PORTFOLIO_URL}/buy?metamaskEntry=${metaMaskEntry}&chainId=${mockChainId}&metametricsId=${mockedMetametricsId}`;
    const openTabSpy = jest.spyOn(global.platform, 'openTab');

    const { result } = renderHook(
      () => useRamps(RampsMetaMaskEntry.TokensBanner),
      { wrapper },
    );

    result.current.openBuyCryptoInPdapp();
    expect(openTabSpy).toHaveBeenCalledWith({
      url: mockBuyURI,
    });
  });

  ['0x1', '0x38', '0xa'].forEach((mockChainId) => {
    it(`should open the buy crypto URL with the currently connected chain ID of ${mockChainId}`, () => {
      mockStoreState = {
        ...mockStoreState,
        metamask: {
          ...mockStoreState.metamask,
          providerConfig: {
            chainId: mockChainId,
          },
        },
      };

      const mockBuyURI = `${process.env.PORTFOLIO_URL}/buy?metamaskEntry=ext_buy_sell_button&chainId=${mockChainId}&metametricsId=${mockedMetametricsId}`;

      const openTabSpy = jest.spyOn(global.platform, 'openTab');

      const { result } = renderHook(() => useRamps(), { wrapper });

      result.current.openBuyCryptoInPdapp();
      expect(openTabSpy).toHaveBeenCalledWith({
        url: mockBuyURI,
      });
    });
  });
});