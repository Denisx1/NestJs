import { Model, Types } from 'mongoose';
import { ActionToken } from '../schema/action-token-model';
import { InjectModel } from '@nestjs/mongoose';
import { Auth } from '../schema/auth-model';
import { IActionToken } from '../interfaces/action-token-interface';

export class ActionTokenRepository {
  constructor(
    @InjectModel(ActionToken.name)
    private actionTokenModel: Model<ActionToken>,
    @InjectModel(Auth.name) private authModel: Model<Auth>,
  ) {}
  async deleteActionToken(token: string): Promise<boolean> {
    await this.actionTokenModel.deleteOne({ token });
    return true;
  }
  async deleteUserFromLogin(userId: Types.ObjectId): Promise<boolean> {
    await this.authModel.deleteMany({ userId });
    return true;
  }
  async getUserByActionToken(token: string): Promise<IActionToken> {
    const user = await this.actionTokenModel.findOne({ token }).populate({
      path: 'userId',
    });
    return user;
  }
  async createActionType(payload: IActionToken): Promise<IActionToken> {
    const actionToken = await this.actionTokenModel.create(payload);
    return actionToken;
  }
}
