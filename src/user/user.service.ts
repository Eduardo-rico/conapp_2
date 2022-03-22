import { ConflictException, HttpException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SignupDto } from './dto/singup.dto';
import { SigninDto } from './dto/singin.dto';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async signup(body: SignupDto) {
    const userExist = await this.prismaService.user.findUnique({
      where: {
        email: body.email,
      },
    });
    if (userExist) {
      throw new ConflictException('Email ya en uso');
    }
    const hashPassword = await bcrypt.hash(body.password, 11);
    const user = await this.prismaService.user.create({
      data: {
        email: body.email,
        nombre: body.nombre,
        password: hashPassword,
      },
    });

    const token = await jwt.sign(
      {
        nombre: user.nombre,
        id: user.id,
      },
      process.env.JSON_TOKEN_KEY,
      {
        expiresIn: 360000,
      },
    );

    return { token };
  }

  async signin(body: SigninDto) {
    //find user by email
    const user = await this.prismaService.user.findUnique({
      where: { email: body.email },
    });
    if (!user) {
      throw new HttpException('Credenciales inválidas', 400);
    }
    //validate the password
    const hashedPassword = user.password;
    const isValidPassword = await bcrypt.compare(body.password, hashedPassword);
    if (!isValidPassword) {
      throw new HttpException('Credenciales inválidas 2', 400);
    }
    //return jwt
    const token = await jwt.sign(
      {
        nombre: user.nombre,
        id: user.id,
      },
      process.env.JSON_TOKEN_KEY,
      {
        expiresIn: 360000,
      },
    );

    return { token };
  }
}
