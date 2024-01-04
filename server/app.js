const Koa = require('koa');
const koaRouter = require('koa-router'); // 路由引入
const cors = require('koa2-cors'); // 跨域处理
const views = require('koa-views');
const koaBody = require('koa-body');
const path = require('path');
const koaStatic = require('koa-static');
// const puppeteer = require('puppeteer');
const fetch = require('node-fetch');

const router = new koaRouter();
const app = new Koa();
const port = 3000;
const render = views(path.join(__dirname, '../examples/'));
app.use(koaBody());
app.use(koaStatic('.'));
app.use(render);
app.use(
  cors({
    // allowMethods: "GET,HEAD,PUT,POST,DELETE,PATCH"
  })
);

router.post('/api/reportUrl', async ctx => {
  ctx.body = 'sucess';
});

router.get('/api/404', async ctx => {
  ctx.status = 404;
});

router.get('/api/500', async ctx => {
  await sleep(150000);
  ctx.status = 500;
});

router.get('/api/timeout', async () => {
  await sleep(50000);
});

router.get('/api/success', async ctx => {
  ctx.body = {
    success: true,
    model: {
      id: 1,
    },
  };
});

router.post('/monitor/upload', async ctx => {
  ctx.body = {
    success: true,
    model: {
      id: 10010,
    },
  };
});

router.get('/', async ctx => {
  await ctx.render('index');
});

async function sleep(seconds) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, seconds);
  });
}

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(port);
