import Lesson from '../models/Lesson'
import Student from '../models/Student'
import Teacher from '../models/Teacher'
import bcrypt from 'bcrypt'
import getToken from '../helpers/get-token'
import getUserByToken from '../helpers/get-user-by-token'
import { Request, Response } from 'express';

export default class ChartsController {
  static async chart(req: Request, res: Response) {

  }
}