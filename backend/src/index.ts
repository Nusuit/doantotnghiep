import { createApp } from "./app";

const { app, env } = createApp();

app.listen(env.PORT, env.HOST, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend running on http://${env.HOST}:${env.PORT}`);
});
