import express from 'express';
import carRoutes from './routes/car.routes';
import adminRoutes from './routes/admin.routes';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/cars', carRoutes);
app.use('/api/admin', adminRoutes);

export { app };

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
} 