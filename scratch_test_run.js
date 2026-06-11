try {
  const page = require("./.next/server/app/school/experience/demo/page.js");
  const userland = page.routeModule.userland;
  console.log("Userland keys:", Object.keys(userland));
  const pageComponent = userland.default;
  console.log("Default export type:", typeof pageComponent);
} catch (err) {
  console.error("Error:", err.stack || err);
}
