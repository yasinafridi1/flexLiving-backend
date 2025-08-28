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
    profilePicture: user?.profilePicture || null,
    clientId: hostAwayConnection?.clientId || null,
    clientSecret: maskedSecret,
    hostAwayConnection: hostAwayConnection?.token ? true : false,
  };
};

export const reviewDto = (data) => {
  const {
    _id,
    type,
    status,
    rating,
    comment,
    listingName,
    channel,
    guestName,
    submittedAt,
    arrivedAt,
    departureDate,
    categories,
    approved,
    source,
  } = data;
  return {
    _id,
    type,
    status,
    rating,
    comment,
    listingName,
    channel,
    guestName,
    submittedAt,
    arrivedAt,
    departureDate,
    categories,
    approved,
    source,
  };
};
