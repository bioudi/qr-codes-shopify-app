/*
  The custom REST API to support the app frontend.
  Handlers combine application data from qr-codes-db.js with helpers to merge the Shopify GraphQL Admin API data.
  The Shop is the Shop that the current user belongs to. For example, the shop that is using the app.
  This information is retrieved from the Authorization header, which is decoded from the request.
  The authorization header is added by App Bridge in the frontend code.
*/

import express from "express";

import {
  formatRuleResponse,
  getQrCodeOr404,
  getShopUrlFromSession,
  parseRuleBody,
} from "../helpers/rules.js";
import { rulesDB } from "../rules-db.js";

export default function applyRuleApiEndpoints(app) {
  app.use(express.json());

  app.post("/api/rules", async (req, res) => {
    try {
      const id = await rulesDB.create({
        ...(await parseRuleBody(req)),

        /* Get the shop from the authorization header to prevent users from spoofing the data */
        shopDomain: await getShopUrlFromSession(req, res),
      });
      res.status(201).send(await rulesDB.read(id)[0]);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });

  app.patch("/api/rules/:id", async (req, res) => {
    const qrcode = await getQrCodeOr404(req, res);

    if (qrcode) {
      try {
        await QRCodesDB.update(req.params.id, await parseQrCodeBody(req));
        const response = await formatQrCodeResponse(req, res, [
          await QRCodesDB.read(req.params.id),
        ]);
        res.status(200).send(response[0]);
      } catch (error) {
        res.status(500).send(error.message);
      }
    }
  });

  app.get("/api/rules", async (req, res) => {
    try {
      const rawCodeData = await rulesDB.list(
        await getShopUrlFromSession(req, res)
      );

      const response = await formatRuleResponse(req, res, rawCodeData);
      res.status(200).send(response);
    } catch (error) {
      console.error(error);
      res.status(500).send(error.message);
    }
  });

  app.get("/api/rules/:id", async (req, res) => {
    const qrcode = await getQrCodeOr404(req, res);

    if (qrcode) {
      const formattedQrCode = await formatQrCodeResponse(req, res, [qrcode]);
      res.status(200).send(formattedQrCode[0]);
    }
  });

  app.delete("/api/rules/:id", async (req, res) => {
    const qrcode = await getQrCodeOr404(req, res);

    if (qrcode) {
      await QRCodesDB.delete(req.params.id);
      res.status(200).send();
    }
  });
}
