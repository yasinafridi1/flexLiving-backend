export const userDTO = (user, hostAwayConnection) => {
  const { _id, fullName, email, role } = user;

  let maskedSecret = null;
  if (hostAwayConnection?.clientSecret) {
    const last4 = hostAwayConnection.clientSecret.slice(-4); // get last 4 chars
    const masked =
      "*".repeat(hostAwayConnection.clientSecret.length - 4) + last4;
    maskedSecret = masked;
  }

  return {
    _id,
    fullName,
    email,
    role,
    clientId: hostAwayConnection?.clientId || null,
    clientSecret: hostAwayConnection?.clientSecret || null,
    hostAwayConnection: hostAwayConnection?.token ? true : false,
  };
};
