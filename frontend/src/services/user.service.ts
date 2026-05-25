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

export const userService = { updateProfile };
