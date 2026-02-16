function pickPublicUser(userDoc) {
  const id = userDoc.id || userDoc._id;
  return {
    id,
    name: userDoc.name,
    email: userDoc.email,
    role: userDoc.role,
    createdAt: userDoc.createdAt
  };
}

module.exports = pickPublicUser;
