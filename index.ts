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
import StudentRoutes from './src/routes/StudentRoutes';
import TeacherRoutes from './src/routes/TeacherRoutes';
import LessonRoutes from './src/routes/LessonRoutes';
import ChartsRoutes from './src/routes/ChartsRoutes';
import PaymentRoutes from './src/routes/PaymentRoutes';

app.use('/users', UserRoutes);
app.use('/students', StudentRoutes);
app.use('/teachers', TeacherRoutes);
app.use('/lessons', LessonRoutes);
app.use('/charts', ChartsRoutes);
app.use('/payments', PaymentRoutes);

app.listen(5001, () => {
  console.log('Server listening on port 5001');
});
