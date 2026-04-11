import { ethers } from 'https://esm.sh/ethers@6';

// Set this to your deployed TCGInventory contract address
export const CONTRACT_ADDRESS = null;

const ABI = [
  'function addCard(string _game, string _setSlug, string _cardNumber, uint8 _grading, uint256 _quantity) external',
  'function removeCard(string _game, string _setSlug, string _cardNumber, uint8 _grading, uint256 _quantity) external',
  'function setCardQuantity(string _game, string _setSlug, string _cardNumber, uint8 _grading, uint256 _newQuantity) external',
  'function getInventory() external view returns (tuple(string game, string setSlug, string cardNumber, uint8 grading, uint256 quantity)[])',
];

async function getProvider() {
  const wp = window.__appkit?.getWalletProvider?.();
  if (!wp) throw new Error('Wallet not connected');
  return new ethers.BrowserProvider(wp);
}

window.__inventory = {
  isAvailable() {
    return Boolean(CONTRACT_ADDRESS);
  },

  async load() {
    if (!CONTRACT_ADDRESS) return [];
    const p = await getProvider();
    return new ethers.Contract(CONTRACT_ADDRESS, ABI, p).getInventory();
  },

  async addCard(game, slug, cardId, grading, qty) {
    const s = await (await getProvider()).getSigner();
    const tx = await new ethers.Contract(CONTRACT_ADDRESS, ABI, s).addCard(
      game,
      slug,
      String(cardId),
      grading,
      qty
    );
    return tx.wait();
  },

  async removeCard(game, slug, cardId, grading, qty) {
    const s = await (await getProvider()).getSigner();
    const tx = await new ethers.Contract(CONTRACT_ADDRESS, ABI, s).removeCard(
      game,
      slug,
      String(cardId),
      grading,
      qty
    );
    return tx.wait();
  },

  async setCardQuantity(game, slug, cardId, grading, qty) {
    const s = await (await getProvider()).getSigner();
    const tx = await new ethers.Contract(CONTRACT_ADDRESS, ABI, s).setCardQuantity(
      game,
      slug,
      String(cardId),
      grading,
      qty
    );
    return tx.wait();
  },
};
