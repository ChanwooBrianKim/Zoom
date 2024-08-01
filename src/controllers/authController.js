import User from "../models/User";

export const signup = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = new User({ username, password });
    await user.save();
    res.redirect("/auth/login");
  } catch (err) {
    res.redirect("/auth/signup");
  }
};
