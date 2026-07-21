import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { BulkActionDto } from '../../../common/dto/bulk-action.dto';
import { Public } from '../../../common/decorators/public.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { ParseObjectIdPipe } from '../../../common/pipes/parse-object-id.pipe';
import { UserRole } from '../../users/schemas/user.schema';
import { CreatePostDraftDto } from './dto/create-post.dto';
import { FilterPostDto } from './dto/filter-post.dto';
import { RestoreRevisionDto } from './dto/restore-revision.dto';
import { SchedulePostDto } from './dto/schedule-post.dto';
import { TaxonomyOptionsDto } from './dto/taxonomy-options.dto';
import { TrackPostViewDto } from './dto/track-post-view.dto';
import { AutosavePostDto, UpdatePostContentDto } from './dto/update-post.dto';
import {
  PermanentDeletePostDto,
  PublishPostDto,
  RequestChangesDto,
  SubmitReviewDto,
  WorkflowPostDto,
} from './dto/workflow-post.dto';
import { PostReadinessService } from './post-readiness.service';
import { PostRelatedService } from './post-related.service';
import { PostRevisionsService } from './post-revisions.service';
import { PostViewsService } from './post-views.service';
import { PostWorkflowService } from './post-workflow.service';
import { PostsCommandService } from './posts-command.service';
import { PostsQueryService } from './posts-query.service';

@Public()
@Controller('public/blog/posts')
export class PublicPostsController {
  constructor(
    private readonly queries: PostsQueryService,
    private readonly related: PostRelatedService,
    private readonly views: PostViewsService,
  ) {}

  @Get()
  async findAll(@Query() filter: FilterPostDto) {
    const result = await this.queries.findAllPublic(filter);
    return {
      message: 'تم تحميل المقالات بنجاح',
      data: result.data,
      meta: result.meta,
    };
  }

  @Get(':slug/related')
  async relatedPosts(@Param('slug') slug: string) {
    return {
      message: 'تم تحميل المقالات ذات الصلة',
      data: await this.related.related(slug),
    };
  }

  @Get(':slug/navigation')
  async navigation(@Param('slug') slug: string) {
    return {
      message: 'تم تحميل التنقل',
      data: await this.related.navigation(slug),
    };
  }

  @Post(':id/view')
  async trackView(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: TrackPostViewDto,
    @Request() req: any,
  ) {
    return {
      message: 'تمت معالجة المشاهدة',
      data: await this.views.track(id, dto, req),
    };
  }

  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    return {
      message: 'تم تحميل المقال بنجاح',
      data: await this.queries.findBySlugPublic(slug),
    };
  }
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.EDITOR)
@Controller('admin/blog/posts')
export class AdminPostsController {
  constructor(
    private readonly queries: PostsQueryService,
    private readonly commands: PostsCommandService,
    private readonly workflow: PostWorkflowService,
    private readonly readiness: PostReadinessService,
    private readonly revisions: PostRevisionsService,
  ) {}

  @Get()
  async findAll(@Query() filter: FilterPostDto) {
    const result = await this.queries.findAllAdmin(filter);
    return {
      message: 'تم تحميل المقالات بنجاح',
      data: result.data,
      meta: result.meta,
    };
  }

  @Post()
  async create(@Request() req: any, @Body() dto: CreatePostDraftDto) {
    const post = await this.commands.create(dto, req.user.userId, req);
    return {
      message: 'تم إنشاء المسودة',
      data: await this.queries.findOneAdmin(post._id.toString()),
    };
  }

  @Get(':id/readiness')
  async checkReadiness(
    @Param('id', ParseObjectIdPipe) id: string,
    @Query('expectedVersion') expectedVersion?: string,
  ) {
    return {
      message: 'تم فحص الجاهزية',
      data: await this.readiness.check(
        id,
        expectedVersion ? Number(expectedVersion) : undefined,
      ),
    };
  }

  @Get(':id/revisions')
  async listRevisions(@Param('id', ParseObjectIdPipe) id: string) {
    return {
      message: 'تم تحميل الإصدارات',
      data: await this.revisions.list(id),
    };
  }

  @Get(':id/revisions/:revisionId')
  async revision(
    @Param('id', ParseObjectIdPipe) id: string,
    @Param('revisionId', ParseObjectIdPipe) revisionId: string,
  ) {
    return {
      message: 'تم تحميل الإصدار',
      data: await this.revisions.findOne(id, revisionId),
    };
  }

  @Post(':id/revisions/:revisionId/restore')
  async restoreRevision(
    @Request() req: any,
    @Param('id', ParseObjectIdPipe) id: string,
    @Param('revisionId', ParseObjectIdPipe) revisionId: string,
    @Body() dto: RestoreRevisionDto,
  ) {
    const post = await this.commands.restoreRevision(id, revisionId, dto, req);
    return {
      message: 'تمت استعادة الإصدار',
      data: await this.queries.findOneAdmin(post._id.toString()),
    };
  }

  @Post('bulk')
  async bulk(@Request() req: any, @Body() dto: BulkActionDto) {
    const results: Array<{ id: string; success: boolean; error?: string }> = [];
    for (const id of dto.ids) {
      try {
        const post = await this.queries.findOneAdmin(id);
        if (dto.action === 'publish')
          await this.workflow.publish(id, post.version, req);
        else if (dto.action === 'unpublish')
          await this.workflow.unpublish(id, post.version, req);
        else if (dto.action === 'archive')
          await this.workflow.archive(id, post.version, req);
        else if (dto.action === 'delete') await this.commands.trash(id, req);
        else if (dto.action === 'submit-review')
          await this.workflow.submitReview(id, post.version, req);
        else if (dto.action === 'set-category' || dto.action === 'add-tag') {
          const candidate = dto.data?.categoryId ?? dto.data?.tagId;
          const valueId = typeof candidate === 'string' ? candidate : '';
          if (!valueId) throw new Error('Taxonomy value is required');
          await this.commands.bulkTaxonomy([id], dto.action, valueId, req);
        }
        results.push({ id, success: true });
      } catch (error) {
        results.push({
          id,
          success: false,
          error: error instanceof Error ? error.message : 'failed',
        });
      }
    }
    return { message: 'اكتمل الإجراء الجماعي', data: results };
  }

  @Get(':id')
  async findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return {
      message: 'تم تحميل المقال',
      data: await this.queries.findOneAdmin(id),
    };
  }

  @Put(':id')
  async update(
    @Request() req: any,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdatePostContentDto,
  ) {
    const post = await this.commands.update(id, dto, req);
    return {
      message: 'تم حفظ المقال',
      data: await this.queries.findOneAdmin(post._id.toString()),
    };
  }

  @Post(':id/autosave')
  async autosave(
    @Request() req: any,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: AutosavePostDto,
  ) {
    const post = await this.commands.update(
      id,
      { ...dto, saveReason: 'autosave' },
      req,
    );
    return {
      message: 'تم الحفظ التلقائي',
      data: await this.queries.findOneAdmin(post._id.toString()),
    };
  }

  @Post(':id/submit-review')
  workflowSubmit(
    @Request() req: any,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: SubmitReviewDto,
  ) {
    return this.respondWorkflow(
      id,
      this.workflow.submitReview(id, dto.expectedVersion, req),
      'تم إرسال المقال للمراجعة',
    );
  }

  @Post(':id/request-changes')
  workflowChanges(
    @Request() req: any,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: RequestChangesDto,
  ) {
    return this.respondWorkflow(
      id,
      this.workflow.requestChanges(id, dto.expectedVersion, req, dto.message),
      'تم طلب التعديلات',
    );
  }

  @Post(':id/approve')
  workflowApprove(
    @Request() req: any,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: WorkflowPostDto,
  ) {
    return this.respondWorkflow(
      id,
      this.workflow.approve(id, dto.expectedVersion, req),
      'تم اعتماد المقال',
    );
  }

  @Post(':id/publish')
  workflowPublish(
    @Request() req: any,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: PublishPostDto,
  ) {
    return this.respondWorkflow(
      id,
      this.workflow.publish(id, dto.expectedVersion, req),
      'تم نشر المقال',
    );
  }

  @Post(':id/unpublish')
  workflowUnpublish(
    @Request() req: any,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: WorkflowPostDto,
  ) {
    return this.respondWorkflow(
      id,
      this.workflow.unpublish(id, dto.expectedVersion, req),
      'تم إلغاء نشر المقال',
    );
  }

  @Post(':id/schedule')
  workflowSchedule(
    @Request() req: any,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: SchedulePostDto,
  ) {
    return this.respondWorkflow(
      id,
      this.workflow.schedule(id, dto, req),
      'تمت جدولة المقال',
    );
  }

  @Post(':id/cancel-schedule')
  workflowCancel(
    @Request() req: any,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: WorkflowPostDto,
  ) {
    return this.respondWorkflow(
      id,
      this.workflow.cancelSchedule(id, dto.expectedVersion, req),
      'تم إلغاء الجدولة',
    );
  }

  @Post(':id/archive')
  workflowArchive(
    @Request() req: any,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: WorkflowPostDto,
  ) {
    return this.respondWorkflow(
      id,
      this.workflow.archive(id, dto.expectedVersion, req),
      'تمت أرشفة المقال',
    );
  }

  @Post(':id/trash')
  async trash(@Request() req: any, @Param('id', ParseObjectIdPipe) id: string) {
    await this.commands.trash(id, req);
    return { message: 'تم نقل المقال إلى سلة المحذوفات', data: null };
  }

  @Post(':id/restore')
  async restore(
    @Request() req: any,
    @Param('id', ParseObjectIdPipe) id: string,
  ) {
    const post = await this.commands.restore(id, req);
    return {
      message: 'تمت استعادة المقال',
      data: await this.queries.findOneAdmin(post._id.toString()),
    };
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id/permanent')
  async permanent(
    @Request() req: any,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: PermanentDeletePostDto,
  ) {
    await this.commands.permanentDelete(id, dto, req);
    return { message: 'تم حذف المقال نهائيًا', data: null };
  }

  private async respondWorkflow(
    id: string,
    operation: Promise<any>,
    message: string,
  ) {
    await operation;
    return { message, data: await this.queries.findOneAdmin(id) };
  }
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.EDITOR)
@Controller('admin/blog')
export class AdminBlogController {
  constructor(private readonly queries: PostsQueryService) {}

  @Get('taxonomy/options')
  async taxonomy(@Query() dto: TaxonomyOptionsDto) {
    const result = await this.queries.taxonomyOptions(dto);
    return {
      message: 'تم تحميل الخيارات',
      data: result.data,
      meta: result.meta,
    };
  }

  @Get('overview')
  async overview() {
    return {
      message: 'تم تحميل ملخص المدونة',
      data: await this.queries.overview(),
    };
  }
}
