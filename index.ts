import express from 'express';
import cors from 'cors';
import { Application } from 'express';

const app: Application = express();

// Config JSON response
app.use(express.json());

// Solve CORS
app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));

// Public folder for images
app.use(express.static('public'));

// Routes
import UserRoutes from './src/routes/UserRoutes';
import PetRoutes from './src/routes/PetRoutes';

app.use('/users', UserRoutes);
app.use('/pets', PetRoutes);

app.listen(5001, () => {
  console.log('Server listening on port 5001');
});
