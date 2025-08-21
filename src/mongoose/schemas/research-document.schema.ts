import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
  collection: 'research_documents',
})
export class ResearchDocument {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ required: true })
  projectId: number;
}

export type ResearchDocumentDocument = ResearchDocument & Document;
export const ResearchDocumentSchema =
  SchemaFactory.createForClass(ResearchDocument);

ResearchDocumentSchema.index({
  title: 'text',
  content: 'text',
  tags: 'text',
});
