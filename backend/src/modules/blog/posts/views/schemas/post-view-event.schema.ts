import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'post_view_events' })
export class PostViewEvent extends Document {
  @Prop({ required: true, unique: true })
  eventId: string;

  @Prop({ required: true, default: Date.now })
  createdAt: Date;
}

export const PostViewEventSchema = SchemaFactory.createForClass(PostViewEvent);
PostViewEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });
