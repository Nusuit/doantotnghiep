import { createApp } from "./app";

const { app, env } = createApp();

app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend running on port ${env.PORT}`);
});
