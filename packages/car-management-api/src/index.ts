import express from "express";
import adminRoutes from "./routes/admin.route";
// import appRoutes from './routes/app.route';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use("/api/v1/admin", adminRoutes);
// app.use('/api/v1/app', appRoutes);

export { app };

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}
