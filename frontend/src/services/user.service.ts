import api from "../api/axios";

export interface UpdateProfileData {
  name?: string;
  phoneNumber?: string;
}

const updateProfile = async (data: UpdateProfileData | FormData) => {
  // Never set Content-Type manually for FormData — the browser must set it with the
  // multipart boundary or multer cannot parse the request body.
  const res = await api.patch("/users/updateMe", data);
  return res.data.data.updateUser;
};

const deleteAccount = async () => {
  await api.delete("/users/deleteMe");
};

const upgradeToLender = async () => {
  const res = await api.post("/users/upgrade-to-lender");
  return res.data.data.user;
};

const changePassword = async (currentPassword: string, newPassword: string) => {
  const res = await api.post("/users/change-password", { currentPassword, newPassword });
  return res.data;
};

const getMyReviews = async (page = 1, limit = 10) => {
  const res = await api.get("/users/me/reviews", { params: { page, limit } });
  return res.data.data;
};

const getPublicLenderProfile = async (lenderId: string) => {
  const res = await api.get(`/users/lender/${lenderId}`);
  return res.data.data.lender;
};

export const userService = { updateProfile, deleteAccount, upgradeToLender, changePassword, getMyReviews, getPublicLenderProfile };
