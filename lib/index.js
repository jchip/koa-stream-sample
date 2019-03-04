"use strict";

const Koa = require("koa");
const kroute = require("koa-route");
const Munchy = require("munchy");
const { PassThrough } = require("stream");

const App = new Koa();

const getResponseOutput = (ctx, delay = 2000) => {
  const output = new PassThrough();
  const chunks = [
    `<h1>Hello</h1>`,
    `<h1>What's your name?</h1>`,
    `<h1>Nice to meet you, I am koa.</h1>`,
    `<h1>Kool to be streaming with you.</h1>`,
    `<h1>Bye, have a nice day.</h1>`
  ];

  let ix = 0;
  const interval = setInterval(() => output.write("."), 100);

  let fail = -1;

  if (ctx.query.fail) {
    fail = parseInt(ctx.query.fail);
  }

  const send = () => {
    console.log(`sending ${ix} ${chunks[ix]}`);
    output.write(chunks[ix++]);
    if (fail !== undefined && ix === fail) {
      clearInterval(interval);
      process.nextTick(() => output.emit("error"));
    } else {
      if (ix === chunks.length) {
        clearInterval(interval);
        output.end();
      } else {
        setTimeout(send, delay);
      }
    }
  };

  process.nextTick(() => send());

  return output;
};

App.use(
  kroute.get("/", ctx => {
    ctx.cookies.set("START_TIME", `${Date.now()}`);
    ctx.type = "text/html";
    ctx.body = new Munchy(
      {},
      `<html><head></head><body>`,
      getResponseOutput(ctx),
      `</body></html>\n`,
      null
    );
  })
);

App.use(
  kroute.get("/multi", ctx => {
    ctx.cookies.set("START_TIME", `${Date.now()}`);
    ctx.type = "text/html";
    ctx.body = new Munchy(
      {},
      `<html><head></head><body>`,
      getResponseOutput(ctx, 1000),
      getResponseOutput(ctx, 1000),
      `</body></html>\n`,
      null
    );
  })
);

App.listen(3000, err => {
  if (err) console.error("listen failed", err);
  else console.log("Listening at 3000");
});
