import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { Observable, tap } from 'rxjs';
import { Request } from 'express';

const METHOD_ACTION_MAP: Record<string, string> = {
  POST: 'create',
  PATCH: 'update',
  PUT: 'update',
  DELETE: 'delete',
};

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const method = request.method;

    const action = METHOD_ACTION_MAP[method];
    if (!action) return next.handle();

    return next.handle().pipe(
      tap((responseBody) => {
        const entityType = this.extractEntityType(request.path);
        const entityId = this.extractEntityId(
          request.params as Record<string, string>,
          responseBody,
        );
        const user = (request as unknown as Record<string, unknown>)['user'] as
          | { id?: string; email?: string }
          | undefined;

        Sentry.captureMessage(`audit.${entityType}.${action}`, {
          level: 'info',
          extra: {
            entity_type: entityType,
            action,
            entity_id: entityId,
            user_id: user?.id ?? null,
            user_email: user?.email ?? null,
            path: request.path,
            method,
            timestamp: new Date().toISOString(),
          },
        });
      }),
    );
  }

  private extractEntityType(path: string): string {
    const segments = path.replace(/^\/api\//, '').split('/');
    return segments[0] || 'unknown';
  }

  private extractEntityId(
    params: Record<string, string>,
    responseBody: unknown,
  ): string | null {
    if (params?.id) return params.id;
    if (
      responseBody &&
      typeof responseBody === 'object' &&
      'id' in responseBody
    ) {
      return String((responseBody as Record<string, unknown>).id);
    }
    return null;
  }
}
