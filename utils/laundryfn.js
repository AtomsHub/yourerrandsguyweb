// utils/laundryfn.js

/**
 * Filter items that have all required services for selected service type
 * @param {Array} laundryItems - Array of laundry items
 * @param {Object} serviceType - Selected service type object
 * @returns {Array} - Filtered items that support all required services
 */
export const getAvailableItemsForService = (laundryItems, serviceType) => {
  if (!serviceType || !laundryItems) return [];

  return laundryItems.filter((item) => {
    // Check if item has all required services
    return serviceType.services.every(
      (service) => item.price && item.price.hasOwnProperty(service)
    );
  });
};

/**
 * Calculate total price for a service combination
 * @param {Object} item - Laundry item object
 * @param {Object} serviceType - Service type object
 * @returns {Number} - Total price for all services
 */
export const calculateServicePrice = (item, serviceType) => {
  if (!item.price || !serviceType) return 0;

  return serviceType.services.reduce((total, service) => {
    return total + (item.price[service] || 0);
  }, 0);
};

/**
 * Format service display name with prices
 * @param {Object} item - Laundry item object
 * @param {Object} serviceType - Service type object
 * @returns {String} - Formatted service display string
 */
export const formatServiceDisplay = (item, serviceType) => {
  if (!item.price || !serviceType) return "";

  const serviceDetails = serviceType.services
    .map((service) => {
      const price = item.price[service] || 0;
      return `${service.charAt(0).toUpperCase() + service.slice(1)}: ₦${price}`;
    })
    .join(", ");

  return serviceDetails;
};

/**
 * Get cart item quantity for specific item and service type
 * @param {Array} cartItems - Array of cart items
 * @param {String} itemId - Item ID
 * @param {String} serviceTypeId - Service type ID
 * @returns {Number} - Quantity of item in cart
 */
export const getCartItemQuantity = (cartItems, itemId, serviceTypeId) => {
  const cartItem = cartItems.find(
    (cartItem) =>
      cartItem.garmentId === itemId && cartItem.serviceType.id === serviceTypeId
  );
  return cartItem ? cartItem.quantity : 0;
};

/**
 * Add item to cart
 * @param {Object} item - Laundry item object
 * @param {Object} selectedServiceType - Selected service type
 * @param {Number} quantity - Quantity to add
 * @returns {Object} - New cart item object
 */
export const createCartItem = (item, selectedServiceType, quantity = 1) => {
  if (!selectedServiceType || quantity <= 0) return null;

  const pricePerItem = calculateServicePrice(item, selectedServiceType);
  const serviceDisplay = formatServiceDisplay(item, selectedServiceType);

  return {
    id: `${item.id}_${selectedServiceType.id}_${Date.now()}`,
    garmentId: item.id,
    name: item.name,
    serviceName: serviceDisplay,
    serviceType: selectedServiceType,
    pricePerItem: pricePerItem,
    quantity: quantity,
    total: pricePerItem * quantity,
    image: item.image,
  };
};

/**
 * Update cart item quantity
 * @param {Array} cartItems - Current cart items
 * @param {String} cartItemId - Cart item ID to update
 * @param {Number} quantity - New quantity
 * @returns {Array} - Updated cart items array
 */
export const updateCartItemQuantity = (cartItems, cartItemId, quantity) => {
  if (quantity <= 0) {
    return cartItems.filter((item) => item.id !== cartItemId);
  }

  return cartItems.map((item) =>
    item.id === cartItemId
      ? { ...item, quantity, total: item.pricePerItem * quantity }
      : item
  );
};

/**
 * Remove item from cart
 * @param {Array} cartItems - Current cart items
 * @param {String} cartItemId - Cart item ID to remove
 * @returns {Array} - Updated cart items array
 */
export const removeFromCart = (cartItems, cartItemId) => {
  return cartItems.filter((item) => item.id !== cartItemId);
};

/**
 * Handle item quantity update (add, update, or remove)
 * @param {Array} cartItems - Current cart items
 * @param {Object} item - Laundry item
 * @param {Object} selectedServiceType - Selected service type
 * @param {Number} newQuantity - New quantity
 * @param {Function} addItemCallback - Callback for adding new item
 * @param {Function} updateQuantityCallback - Callback for updating quantity
 * @param {Function} removeItemCallback - Callback for removing item
 */
export const handleItemQuantityUpdate = (
  cartItems,
  item,
  selectedServiceType,
  newQuantity,
  addItemCallback,
  updateQuantityCallback,
  removeItemCallback
) => {
  const existingCartItem = cartItems.find(
    (cartItem) =>
      cartItem.garmentId === item.id &&
      cartItem.serviceType.id === selectedServiceType.id
  );

  if (existingCartItem) {
    if (newQuantity <= 0) {
      // Remove item from cart
      removeItemCallback(existingCartItem.id);
    } else {
      // Update quantity
      updateQuantityCallback(existingCartItem.id, newQuantity);
    }
  } else if (newQuantity > 0) {
    // Add new item to cart
    addItemCallback(item, newQuantity);
  }
};

/**
 * Create global cart item structure
 * @param {Object} params - Parameters object
 * @param {String} params.laundryName - Laundry name
 * @param {String} params.laundryId - Laundry ID
 * @param {String} params.laundryAddress - Laundry address
 * @param {String} params.laundryImage - Laundry image
 * @param {Array} params.cartItems - Cart items array
 * @returns {Object} - Global cart item object
 */
export const createGlobalCartItem = ({
  laundryName,
  laundryId,
  laundryAddress,
  laundryImage,
  cartItems,
  deliveryFee = 0,
  formData = null,
  selectedDelivery = null,
}) => {
  const itemAmount = cartItems.reduce((sum, item) => sum + item.total, 0);
  const totalAmount = itemAmount + deliveryFee;

  return {
    services: "Laundry",
    laundry: laundryName,
    laundry_id: laundryId,
    location: laundryAddress,
    items: cartItems,
    itemAmount: itemAmount,
    deliveryFee: deliveryFee,
    totalAmount: totalAmount,
    imageSource: laundryImage,
    // Form details/receiver information
    formDetails: formData
      ? {
          receiverName: formData.receiverName,
          receiverPhone: formData.receiverPhone,
          receiverEmail: formData.receiverEmail,
        }
      : null,
    // Delivery area information
    deliveryFee: selectedDelivery
      ? {
          landmark: selectedDelivery.landmark,
          price: parseFloat(selectedDelivery.price),
          id: selectedDelivery.id,
          vendor_id: selectedDelivery.vendor_id,
        }
      : null,
  };
};

/**
 * Generate dynamic cart snap points based on cart length
 * @param {Number} cartLength - Number of items in cart
 * @returns {Array} - Array of snap point percentages
 */
export const generateCartSnapPoints = (cartLength) => {
  if (cartLength <= 2) {
    return ["40%", "55%", "95%"];
  } else if (cartLength === 3) {
    return ["55%", "70%", "95%"];
  } else {
    return ["65%", "75%", "95%"];
  }
};
