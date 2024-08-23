import express, { Router } from "express";
import serverless from "serverless-http";

const server = express();
const router = Router();

server.set("view engine", "ejs");
router.get("/", (req, res) => res.render("index"));
server.use("/", router);

export const handler = serverless(server);
