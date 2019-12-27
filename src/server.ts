import app from "./app";
import { PORT } from "./constants/westapi.contants";

// create an app and start to serve it on PORT
app.listen(PORT, () => console.info(`Listening on port ${PORT}`));