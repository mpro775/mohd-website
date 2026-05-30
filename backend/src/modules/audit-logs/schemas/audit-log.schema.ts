import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class AuditLog extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  actorId: MongooseSchema.Types.ObjectId;

  @Prop({ trim: true })
  actorEmail: string;

  @Prop({ required: true, index: true, trim: true })
  action: string;

  @Prop({ required: true, index: true, trim: true })
  resource: string;

  @Prop({ trim: true })
  resourceId: string;

  @Prop({ trim: true })
  ipAddress: string;

  @Prop({ trim: true })
  userAgent: string;

  @Prop({ type: Object })
  before: Record<string, any>;

  @Prop({ type: Object })
  after: Record<string, any>;

  @Prop({ type: Object })
  metadata: Record<string, any>;

  createdAt: Date;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ action: 1, resource: 1 });
AuditLogSchema.index({ actorId: 1 });
AuditLogSchema.index({ resourceId: 1 });
