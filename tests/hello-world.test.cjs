"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const net = require("node:net");
const { server } = require("../src/hello-world-server.cjs");
test("Hello World sends banner and closes on Q", async () => {
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    const address = server.address();
    const output = await new Promise((resolve, reject) => {
      const socket = net.connect(address.port, "127.0.0.1");
      let text = "";
      socket.on("data", (buf) => {
        text += buf.toString("latin1");
        if (text.includes("Press Q")) socket.write("q");
      });
      socket.on("end", () => resolve(text));
      socket.on("error", reject);
    });
    assert.match(output, /Hello World from BBSDoorServer!/);
    assert.match(output, /Goodbye from Hello World!/);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
