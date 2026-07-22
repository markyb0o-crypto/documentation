import "@fontsource/archivo-black/400.css";
import "@fontsource/outfit/300.css";
import "@fontsource/outfit/400.css";
import "@fontsource/outfit/500.css";
import "@fontsource/outfit/600.css";
import "@fontsource/outfit/700.css";
import "./styles/main.css";
import { mountApp } from "./ui/app.js";

const root = document.querySelector("#app");
if (root) mountApp(root);
