import { createAppKit } from 'https://esm.sh/@reown/appkit@1'
import { EthersAdapter } from 'https://esm.sh/@reown/appkit-adapter-ethers@1'
import { mainnet } from 'https://esm.sh/@reown/appkit@1/networks'

// ── Replace with your Project ID from cloud.reown.com ────────────────────
const PROJECT_ID = '5ba30af14fce1cabc3d4d19ae8b4c75f';

const ethersAdapter = new EthersAdapter();

const root = document.documentElement;
const gameAccent = getComputedStyle(root).getPropertyValue('--game-accent').trim();

export const modal = createAppKit({
  adapters: [ethersAdapter],
  networks: [mainnet],
  projectId: PROJECT_ID,
  metadata: {
    name: 'TCG Price Index',
    description: 'TCG card price tracker',
    url: window.location.origin,
    icons: [],
  },
  features: { analytics: false, email: false, socials: false, onramp: false },
  themeMode: document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light',
  themeVariables: {
    '--w3m-accent': gameAccent,
    '--w3m-bg-color': '#131315',
    '--w3m-color-mix-strength': 0.1,
    '--w3m-border-radius-master': '0.5rem',
    '--w3m-font-family': '"Space Grotesk", system-ui, sans-serif',
  },
});

window.__appkit = modal;

// Sync accent color when it changes (e.g., game switch)
window.__updateWalletAccent = function() {
  const gameAccent = getComputedStyle(root).getPropertyValue('--game-accent').trim();
  if (window.__appkit) {
    window.__appkit.setThemeVariables({ '--w3m-accent': gameAccent });
  }
};

modal.subscribeAccount(({ address, isConnected }) => {
  if (window.__walletStateChange) window.__walletStateChange({ address, isConnected });
});
