// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TCGInventory
 * @dev Manages card inventory for TCG Price Index games (Pokemon, MTG, Yu-Gi-Oh, etc.)
 *
 * Each card is tracked by: game, set slug, card number, and grading level.
 * Users can add/remove cards and view only their own inventory (owner-only).
 */

contract TCGInventory {
  // ── Grading Levels ───────────────────────────────────────────────────────
  uint8 public constant GRADING_UNGRADED = 0;
  uint8 public constant GRADING_GRADE_9 = 9;
  uint8 public constant GRADING_PSA_10 = 10;

  // ── Structs ──────────────────────────────────────────────────────────────
  struct InventoryItem {
    string game;          // e.g. "pokemon", "mtg", "yugioh"
    string setSlug;       // e.g. "pokemon-base-set"
    string cardNumber;    // e.g. "#1" or "#001"
    uint8 grading;        // 0 = ungraded, 9 = grade 9, 10 = psa10
    uint256 quantity;     // number of copies
  }

  // ── Storage ──────────────────────────────────────────────────────────────

  // owner → game → setSlug → cardNumber → grading → quantity
  mapping(address => mapping(string => mapping(string => mapping(string => mapping(uint8 => uint256)))))
    private inventories;

  // owner → list of inventory item snapshots (for enumeration)
  // NOTE: This is a snapshot list for UI convenience. The actual source of truth is the mapping above.
  // We store { game, setSlug, cardNumber, grading } to know which items to look up.
  mapping(address => InventoryItem[]) private inventorySnapshots;

  // ── Events ───────────────────────────────────────────────────────────────
  event CardAdded(
    address indexed owner,
    string game,
    string setSlug,
    string cardNumber,
    uint8 grading,
    uint256 quantity,
    uint256 newTotal
  );

  event CardRemoved(
    address indexed owner,
    string game,
    string setSlug,
    string cardNumber,
    uint8 grading,
    uint256 quantity,
    uint256 newTotal
  );

  event CardQuantitySet(
    address indexed owner,
    string game,
    string setSlug,
    string cardNumber,
    uint8 grading,
    uint256 newQuantity
  );

  // ── Add Card to Inventory ────────────────────────────────────────────────
  /**
   * @dev Adds or increments a card in the caller's inventory
   * @param _game Game key (e.g., "pokemon", "mtg")
   * @param _setSlug Set slug from the scraper (e.g., "pokemon-base-set")
   * @param _cardNumber Card number as string (e.g., "#1")
   * @param _grading Grading level (0=ungraded, 9=grade9, 10=psa10)
   * @param _quantity Number of copies to add
   */
  function addCard(
    string calldata _game,
    string calldata _setSlug,
    string calldata _cardNumber,
    uint8 _grading,
    uint256 _quantity
  ) external {
    require(_quantity > 0, "Quantity must be > 0");
    require(bytes(_game).length > 0, "Game cannot be empty");
    require(bytes(_setSlug).length > 0, "Set slug cannot be empty");
    require(bytes(_cardNumber).length > 0, "Card number cannot be empty");
    require(
      _grading == GRADING_UNGRADED || _grading == GRADING_GRADE_9 || _grading == GRADING_PSA_10,
      "Invalid grading level"
    );

    address owner = msg.sender;
    uint256 currentQuantity = inventories[owner][_game][_setSlug][_cardNumber][_grading];
    uint256 newQuantity = currentQuantity + _quantity;

    inventories[owner][_game][_setSlug][_cardNumber][_grading] = newQuantity;

    // Add to snapshot if this is the first time we're tracking this item
    if (currentQuantity == 0) {
      inventorySnapshots[owner].push(InventoryItem({
        game: _game,
        setSlug: _setSlug,
        cardNumber: _cardNumber,
        grading: _grading,
        quantity: newQuantity
      }));
    }

    emit CardAdded(owner, _game, _setSlug, _cardNumber, _grading, _quantity, newQuantity);
  }

  // ── Remove Card from Inventory ───────────────────────────────────────────
  /**
   * @dev Removes or decrements a card from the caller's inventory
   * @param _game Game key
   * @param _setSlug Set slug
   * @param _cardNumber Card number
   * @param _grading Grading level
   * @param _quantity Number of copies to remove
   */
  function removeCard(
    string calldata _game,
    string calldata _setSlug,
    string calldata _cardNumber,
    uint8 _grading,
    uint256 _quantity
  ) external {
    require(_quantity > 0, "Quantity must be > 0");

    address owner = msg.sender;
    uint256 currentQuantity = inventories[owner][_game][_setSlug][_cardNumber][_grading];

    require(currentQuantity >= _quantity, "Insufficient quantity to remove");

    uint256 newQuantity = currentQuantity - _quantity;
    inventories[owner][_game][_setSlug][_cardNumber][_grading] = newQuantity;

    emit CardRemoved(owner, _game, _setSlug, _cardNumber, _grading, _quantity, newQuantity);
  }

  // ── Set Card Quantity (replace) ──────────────────────────────────────────
  /**
   * @dev Sets the exact quantity of a card (replaces the current value)
   * @param _game Game key
   * @param _setSlug Set slug
   * @param _cardNumber Card number
   * @param _grading Grading level
   * @param _newQuantity New quantity
   */
  function setCardQuantity(
    string calldata _game,
    string calldata _setSlug,
    string calldata _cardNumber,
    uint8 _grading,
    uint256 _newQuantity
  ) external {
    require(bytes(_game).length > 0, "Game cannot be empty");
    require(bytes(_setSlug).length > 0, "Set slug cannot be empty");
    require(bytes(_cardNumber).length > 0, "Card number cannot be empty");

    address owner = msg.sender;
    uint256 currentQuantity = inventories[owner][_game][_setSlug][_cardNumber][_grading];

    inventories[owner][_game][_setSlug][_cardNumber][_grading] = _newQuantity;

    // Add to snapshot if this is the first time (and quantity > 0)
    if (currentQuantity == 0 && _newQuantity > 0) {
      inventorySnapshots[owner].push(InventoryItem({
        game: _game,
        setSlug: _setSlug,
        cardNumber: _cardNumber,
        grading: _grading,
        quantity: _newQuantity
      }));
    }

    emit CardQuantitySet(owner, _game, _setSlug, _cardNumber, _grading, _newQuantity);
  }

  // ── Query Inventory (Owner-Only) ─────────────────────────────────────────
  /**
   * @dev Returns the quantity of a specific card in the caller's inventory
   * @param _game Game key
   * @param _setSlug Set slug
   * @param _cardNumber Card number
   * @param _grading Grading level
   * @return Quantity owned
   */
  function getCardQuantity(
    string calldata _game,
    string calldata _setSlug,
    string calldata _cardNumber,
    uint8 _grading
  ) external view returns (uint256) {
    return inventories[msg.sender][_game][_setSlug][_cardNumber][_grading];
  }

  /**
   * @dev Returns all inventory items for the caller
   * @return Array of all items in inventory (including quantity from mapping)
   */
  function getInventory() external view returns (InventoryItem[] memory) {
    address owner = msg.sender;
    InventoryItem[] memory items = new InventoryItem[](inventorySnapshots[owner].length);

    for (uint256 i = 0; i < inventorySnapshots[owner].length; i++) {
      InventoryItem memory snapshot = inventorySnapshots[owner][i];
      uint256 currentQty = inventories[owner][snapshot.game][snapshot.setSlug][snapshot.cardNumber][snapshot.grading];

      items[i] = InventoryItem({
        game: snapshot.game,
        setSlug: snapshot.setSlug,
        cardNumber: snapshot.cardNumber,
        grading: snapshot.grading,
        quantity: currentQty
      });
    }

    return items;
  }

  /**
   * @dev Returns count of unique items (cards × grading levels) in inventory
   */
  function getInventoryCount() external view returns (uint256) {
    return inventorySnapshots[msg.sender].length;
  }

  /**
   * @dev Returns all inventory items for a given game
   * @param _game Game key
   */
  function getGameInventory(string calldata _game) external view returns (InventoryItem[] memory) {
    address owner = msg.sender;
    InventoryItem[] memory gameItems = new InventoryItem[](inventorySnapshots[owner].length);
    uint256 count = 0;

    for (uint256 i = 0; i < inventorySnapshots[owner].length; i++) {
      InventoryItem memory snapshot = inventorySnapshots[owner][i];

      if (keccak256(abi.encodePacked(snapshot.game)) == keccak256(abi.encodePacked(_game))) {
        uint256 currentQty = inventories[owner][snapshot.game][snapshot.setSlug][snapshot.cardNumber][snapshot.grading];
        gameItems[count] = InventoryItem({
          game: snapshot.game,
          setSlug: snapshot.setSlug,
          cardNumber: snapshot.cardNumber,
          grading: snapshot.grading,
          quantity: currentQty
        });
        count++;
      }
    }

    // Trim array to actual size
    InventoryItem[] memory result = new InventoryItem[](count);
    for (uint256 i = 0; i < count; i++) {
      result[i] = gameItems[i];
    }

    return result;
  }
}
