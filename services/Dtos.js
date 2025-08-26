function calculateTotalAmount(price, quantity) {
  return price * quantity;
}

export const userDTO = (user, hostAwayConnection) => {
  const { _id, fullName, email, role, clientId, clientSecret } = user;

  let maskedSecret = null;
  if (clientSecret) {
    const last4 = clientSecret.slice(-4); // get last 4 chars
    const masked = "*".repeat(clientSecret.length - 4) + last4;
    maskedSecret = masked;
  }

  return {
    _id,
    fullName,
    email,
    role,
    clientId,
    clientSecret: maskedSecret,
    hostAwayConnection: hostAwayConnection ? true : false,
  };
};
