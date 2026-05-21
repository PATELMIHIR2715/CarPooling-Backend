export const buildQuery = (payload: any = {}) => {
  const page = Number(payload?.pagination?.page) || 1;

  const limit = Number(payload?.pagination?.limit) || 10;

  const skip = (page - 1) * limit;

  return {
    where: payload?.filter || {},

    skip,

    take: limit,

    orderBy: payload?.sort || {
      createdAt: "desc",
    },
  };
};
