import type { Config } from "vike/types";
import vikeVue from "vike-vue/config";

// Default config (can be overridden by pages)
// https://vike.dev/config

export default {
  // https://vike.dev/head-tags
  title: "Mealgro - Your food at your doorstep in minutes",
  description: "Your food at your doorstep in minutes",

  extends: [vikeVue],
} as Config;
