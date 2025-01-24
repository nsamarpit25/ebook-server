module.exports = {
 apps: [
  {
   name: "bookstore",
   script: "./dist/index.js",
   instances: 1,
   exec_mode: "cluster",
   max_memory_restart: "500M",
   env: {
    NODE_ENV: "production",
    NODE_OPTIONS: "--max-old-space-size=512",
   },
  },
 ],
};
