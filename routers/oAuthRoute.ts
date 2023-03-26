import passport from "passport";
import express, { Request, Response } from "express";
import "../controller/googleOAuth";
import "../controller/microsoftOAuth";
import { HTTP } from "../utils/constants/HTTP";

import jwt from "jsonwebtoken";
import { iUser } from "../utils/interfaces/userInterface";
const router = express.Router();

router.route("/success").get((req: Request, res: Response) => {
  const userData: iUser = req.user;
  const encrypt = jwt.sign(
    {
      id: userData?.id,
      email: userData?.email,
      role: userData?.role,
      schoolName: userData?.schoolName,
      userName: userData?.userName,
    },
    process.env.SIG_SECRET,
    { expiresIn: process.env.SIG_EXPIRES },
  );

  return res.status(HTTP.OK).json({
    message: `Welcome back ${userData.userName} `,
    data: { userData, encrypt },
  });
});

router.route("/failure").get((req, res) => {
  return res.status(200).json({
    message: "This is bad page",
  });
});

router
  .route("/api/with-google/google-auth")
  .get(passport.authenticate("google", { scope: ["profile", "email"] }));

router.route("/auth/google/callback").get(
  passport.authenticate("google", {
    successRedirect: "/success",
    failureRedirect: "/failure",
  }),
);

router.route("/auth/microsoft").get(
  passport.authenticate("microsoft", {
    // Optionally define any authentication parameters here
    // For example, the ones in https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow

    prompt: "select_account",
  }),
);

router
  .route("/auth/microsoft/callback")
  .get(
    passport.authenticate("microsoft", { failureRedirect: "/login" }),
    function (req, res) {
      // Successful authentication, redirect home.
      res.redirect("/");
    },
  );

export default router;
